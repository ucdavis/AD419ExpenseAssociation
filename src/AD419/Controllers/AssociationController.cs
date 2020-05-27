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

        public AssociationController(IDbService dbService)
        {
            this._dbService = dbService;
        }

        [HttpGet]
        public async Task<IEnumerable<ProjectModel>> GetAsync(string org)
        {
            using (var conn = _dbService.GetConnection())
            {
                return await conn.QueryAsync<ProjectModel>("usp_getProjectsByDept",
                new { OrgR = org },
                commandType: CommandType.StoredProcedure);
            }
        }

        // POST /association/bygrouping
        // return all association expenses for the given grouping the expenses
        [HttpPost("ByGrouping")]
        public async Task<IEnumerable<AssociationModel>> PostByGrouping([FromBody] ExpenseGroupingModel model)
        {
            var associations = new List<AssociationModel>();

            // for each expense we need ot get back the association records and then join them together
            using (var conn = _dbService.GetConnection())
            {
                foreach (var expense in model.Expenses)
                {
                    // TODO: NOTE: need to use the new version of this SPROC
                    var expenseAssociations = await conn.QueryAsync<AssociationModel>("usp_getAssociationsByGrouping",
                        new { OrgR = model.Org, Grouping = model.Grouping, Chart = expense.Chart, Criterion = expense.Code, isAssociated = expense.IsAssociated },
                        commandType: CommandType.StoredProcedure);

                    associations.AddRange(expenseAssociations);
                }
            }

            // need to group/sum by project in case we have multiple associations against the same project
            return associations.GroupBy(g => new { g.Project, g.Accession }).Select(r => new AssociationModel
            {
                Project = r.Key.Project,
                Accession = r.Key.Accession,
                Spent = r.Sum(s => s.Spent),
                FTE = r.Sum(s => s.FTE)
            });
        }

        [HttpPut]
        public async Task<bool> Assign([FromBody] AssignmentModel model)
        {
            // 1. First we need to get all of the expenses which we want to associate (expenseIds)
            // 2. Remove all of their existing associations
            // 3. For each expenseId, associate all assignments selected

            // TODO: instead of doing everything serially we can do a lot of these queries in parallel
            using (var conn = _dbService.GetConnection())
            {
                await conn.OpenAsync();

                using (var txn = await conn.BeginTransactionAsync())
                {
                    try
                    {
                        var expenseIds = new List<int>();

                        // 1. Get all expenseIds we want
                        foreach (var expense in model.ExpenseGrouping.Expenses)
                        {
                            var expenseIdentifiers = await conn.QueryAsync<ExpenseIdentifier>("usp_getExpensesByRecordGrouping",
                                new
                                {
                                    OrgR = model.ExpenseGrouping.Org,
                                    Grouping = model.ExpenseGrouping.Grouping,
                                    Chart = expense.Chart,
                                    Criterion = expense.Code,
                                    isAssociated = expense.IsAssociated
                                },
                                commandType: CommandType.StoredProcedure, transaction: txn);

                            expenseIds.AddRange(expenseIdentifiers.Select(ei => ei.ExpenseId));
                        }

                        // 2. Delete their existing expenses
                        foreach (var expenseId in expenseIds)
                        {
                            await conn.QueryAsync<ExpenseIdentifier>("usp_deleteAssociation",
                               new
                               {
                                   OrgR = model.ExpenseGrouping.Org,
                                   ExpenseID = expenseId
                               },
                               commandType: CommandType.StoredProcedure, transaction: txn);

                            foreach (var association in model.Associations)
                            {
                                // TODO: need to verify calculations and distribute all remaining money if any
                                await conn.QueryAsync<ExpenseIdentifier>("usp_deleteAssociation",
                                    new
                                    {
                                        OrgR = model.ExpenseGrouping.Org,
                                        ExpenseID = expenseId,
                                        Accession = association.Accession,
                                        Expenses = association.Spent,
                                        FTE = association.FTE
                                    },
                                    commandType: CommandType.StoredProcedure, transaction: txn);
                            }
                        }
                    }
                    catch
                    {

                    }
                }
            }

            return true;
        }

        [HttpDelete]
        public async Task<bool> Unassign([FromBody] ExpenseGroupingModel model)
        {
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
                            var expenseIdentifiers = await conn.QueryAsync<ExpenseIdentifier>("usp_getExpensesByRecordGrouping",
                                new { OrgR = model.Org, Grouping = model.Grouping, Chart = expense.Chart, Criterion = expense.Code, isAssociated = expense.IsAssociated },
                                commandType: CommandType.StoredProcedure, transaction: txn);

                            foreach (var expenseIdentifier in expenseIdentifiers)
                            {
                                // now unassign each of these ids
                                await conn.ExecuteAsync("usp_deleteAssociation",
                                  new { OrgR = model.Org, ExpenseId = expenseIdentifier.ExpenseId },
                                  commandType: CommandType.StoredProcedure, transaction: txn);
                            }
                        }

                        // once everything is good, commit
                        await txn.CommitAsync();

                        return true;
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

    public class ExpenseIdentifier
    {
        public int ExpenseId { get; set; }
    }

    public class ExpenseGroupingModel
    {
        public string Org { get; set; }
        public string Grouping { get; set; }
        public ExpenseModel[] Expenses { get; set; }
    }

    public class AssignmentModel
    {
        public AssociationModel[] Associations { get; set; }
        public ExpenseGroupingModel ExpenseGrouping { get; set; }
    }

    public class AssociationModel
    {
        public string Project { get; set; }
        public string Accession { get; set; }
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
