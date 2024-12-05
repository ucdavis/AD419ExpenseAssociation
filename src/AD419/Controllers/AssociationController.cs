using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading.Tasks;
using AD419.Services;
using Dapper;
using Microsoft.AspNetCore.Mvc;

namespace AD419.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class AssociationController : ControllerBase
    {
        private readonly IDbService _dbService;
        private readonly IPermissionService _permissionService;

        public AssociationController(IDbService dbService, IPermissionService permissionService)
        {
            this._dbService = dbService;
            this._permissionService = permissionService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAsync(string org)
        {
            if (!await _permissionService.CanAccessDepartment(User.Identity.Name, org))
            {
                return Forbid();
            }

            using (var conn = _dbService.GetConnection())
            {
                return Ok(await conn.QueryAsync<ProjectModel>("usp_getProjectsByDept",
                new { OrgR = org },
                commandType: CommandType.StoredProcedure));
            }
        }

        // POST /association/bygrouping
        // return all association expenses for the given grouping the expenses
        [HttpPost("ByGrouping")]
        public async Task<IActionResult> PostByGrouping([FromBody] AssociationsModel model)
        {
            if (!await _permissionService.CanAccessDepartment(User.Identity.Name, model.ExpenseGrouping.Org))
            {
                return Forbid();
            }

            var associations = new List<AssociationModel>();

            // for each expense we need ot get back the association records and then join them together
            using (var conn = _dbService.GetConnection())
            {
                foreach (var expense in model.Expenses)
                {
                    // TODO: NOTE: need to use the new version of this SPROC
                    var expenseAssociations = await conn.QueryAsync<AssociationModel>("usp_getAssociationsByGroupingAE",
                        new { 
                            OrgR = model.ExpenseGrouping.Org, 
                            Grouping = model.ExpenseGrouping.Grouping, 
                            Entity = expense.Entity, 
                            Criterion = expense.Code, 
                            Criterion2 = expense.Code2,
                            isAssociated = expense.IsAssociated 
                        },
                        commandType: CommandType.StoredProcedure);

                    associations.AddRange(expenseAssociations);
                }
            }

            // need to group/sum by project in case we have multiple associations against the same project
            return Ok(associations.GroupBy(g => new { g.Project, g.Accession }).Select(r => new AssociationModel
            {
                Project = r.Key.Project,
                Accession = r.Key.Accession,
                Spent = r.Sum(s => s.Spent),
                FTE = r.Sum(s => s.FTE)
            }));
        }

        [HttpPut]
        public async Task<IActionResult> Assign([FromBody] AssignmentModel model)
        {
            if (!await _permissionService.CanAccessDepartment(User.Identity.Name, model.ExpenseGrouping.Org))
            {
                return Forbid();
            }

            // Nested loop through each expense grouping
            // each one contains multiple expenses (expenseId)
            // for each, delete their existing associations and create new ones according to distribution percentages
            using (var conn = _dbService.GetConnection())
            {
                await conn.OpenAsync();

                using (var txn = await conn.BeginTransactionAsync())
                {
                    try
                    {
                        // get the expenses which exist inside each expense grouping
                        foreach (var expense in model.Expenses)
                        {
                            var expenseDetails = await conn.QueryAsync<ExpenseDetail>("usp_getExpensesByRecordGroupingAE",
                                new
                                {
                                    OrgR = model.ExpenseGrouping.Org,
                                    Grouping = model.ExpenseGrouping.Grouping,
                                    Entity = expense.Entity,
                                    Criterion = expense.Code,
                                    Criterion2 = expense.Code2,
                                    isAssociated = expense.IsAssociated
                                },
                                commandType: CommandType.StoredProcedure, transaction: txn);


                            // Delete all existing association for this expense
                            foreach (var expenseDetail in expenseDetails)
                            {
                                await conn.QueryAsync<ExpenseDetail>("usp_deleteAssociationAE",
                                   new
                                   {
                                       OrgR = model.ExpenseGrouping.Org,
                                       ExpenseID = expenseDetail.ExpenseId
                                   },
                                   commandType: CommandType.StoredProcedure, transaction: txn);

                                var currentSpentSum = 0.0M;
                                var currentFTESum = 0.0M;

                                var associationsToInsert = new List<AssociationModel>();

                                // create the needed number of new associations with expenses distributed
                                for (int i = 0; i < model.Associations.Length; i++)
                                {
                                    var association = model.Associations[i];

                                    // if this is the last association in the list, just distribute what's left
                                    if (i == model.Associations.Length - 1)
                                    {
                                        associationsToInsert.Add(new AssociationModel
                                        {
                                            Project = association.Project,
                                            Accession = association.Accession,
                                            Spent = expenseDetail.Expenses - currentSpentSum,
                                            FTE = expenseDetail.FTE - currentFTESum
                                        });
                                    }
                                    else
                                    {
                                        // otherwise, distribute based on percentages
                                        var percentage = association.Percent / 100.0M;
                                        var spent = Math.Round(percentage * expenseDetail.Expenses, 2);
                                        var fte = Math.Round(percentage * expenseDetail.FTE, 4); // FTE accurate to 4 decimals

                                        associationsToInsert.Add(new AssociationModel
                                        {
                                            Project = association.Project,
                                            Accession = association.Accession,
                                            Spent = spent,
                                            FTE = fte
                                        });

                                        currentSpentSum += spent;
                                        currentFTESum += fte;
                                    }
                                }

                                // create the needed number of new associations with expenses distributed
                                foreach (var association in associationsToInsert)
                                {
                                    await conn.QueryAsync<ExpenseDetail>("usp_insertAssociationAE",
                                        new
                                        {
                                            OrgR = model.ExpenseGrouping.Org,
                                            ExpenseID = expenseDetail.ExpenseId,
                                            Accession = association.Accession,
                                            Expenses = association.Spent,
                                            FTE = association.FTE
                                        },
                                        commandType: CommandType.StoredProcedure, transaction: txn);
                                }
                            }
                        }

                        await txn.CommitAsync();
                    }
                    catch
                    {
                        await txn.RollbackAsync();
                        throw;
                    }
                }
            }

            return Ok();
        }

        [HttpDelete]
        public async Task<IActionResult> Unassign([FromBody] UnassignmentModel model)
        {
            if (!await _permissionService.CanAccessDepartment(User.Identity.Name, model.ExpenseGrouping.Org))
            {
                return Forbid();
            }

            // calls usp_deleteAssociationsByGrouping for each expense group to be unassociated
            using (var conn = _dbService.GetConnection())
            {
                await conn.OpenAsync();

                using (var txn = await conn.BeginTransactionAsync())
                {
                    try
                    {
                        // for each of our expense groupings, we need to pull back a list of expenseIDs
                        // for each of those, we then unassociate
                        foreach (var expense in model.Expenses)
                        {
                            var expenseIdentifiers = await conn.QueryAsync<ExpenseDetail>("usp_getExpensesByRecordGroupingAE",
                                new { 
                                    OrgR = model.ExpenseGrouping.Org, 
                                    Grouping = model.ExpenseGrouping.Grouping, 
                                    Entity = expense.Entity, 
                                    Criterion = expense.Code, 
                                    Criterion2 = expense.Code2, 
                                    isAssociated = expense.IsAssociated 
                                },
                                commandType: CommandType.StoredProcedure, transaction: txn);

                            foreach (var expenseIdentifier in expenseIdentifiers)
                            {
                                // now unassign each of these ids
                                await conn.ExecuteAsync("usp_deleteAssociationAE",
                                  new { OrgR = model.ExpenseGrouping.Org, ExpenseId = expenseIdentifier.ExpenseId },
                                  commandType: CommandType.StoredProcedure, transaction: txn);
                            }
                        }

                        // once everything is good, commit
                        await txn.CommitAsync();

                        return Ok();
                    }
                    catch
                    {
                        await txn.RollbackAsync();

                        throw;
                    }
                }
            }
        }
    }

    public class ExpenseDetail
    {
        public int ExpenseId { get; set; }
        public decimal Expenses { get; set; }
        public decimal FTE { get; set; }
    }

    public class ExpenseGroupingModel
    {
        public string Org { get; set; }
        public string Grouping { get; set; }
    }

    // TODO: maybe grouping + expenses can be a base class others will inherit from?
    public class AssociationsModel
    {
        public ExpenseGroupingModel ExpenseGrouping { get; set; }
        public ExpenseModel[] Expenses { get; set; }
    }

    public class UnassignmentModel
    {
        public ExpenseGroupingModel ExpenseGrouping { get; set; }
        public ExpenseModel[] Expenses { get; set; }
    }

    public class AssignmentModel
    {
        public AssociationModel[] Associations { get; set; }
        public ExpenseGroupingModel ExpenseGrouping { get; set; }
        public ExpenseModel[] Expenses { get; set; }
    }

    public class AssociationModel
    {
        public string Project { get; set; }
        public string Accession { get; set; }
        public decimal Percent { get; set; }
        public decimal Spent { get; set; }
        public decimal FTE { get; set; }
    }

    public class ProjectModel
    {
        public string Project { get; set; }
        public string Accession { get; set; }
        public string PI { get; set; }
    }
}
