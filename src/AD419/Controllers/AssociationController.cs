using System.Collections.Generic;
using System.Data;
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

        // GET /association/bygrouping
        [HttpGet("ByGrouping")]
        public async Task<IEnumerable<AssociationModel>> GetByGrouping(string org, string chart, string criterion, string grouping = "Organization")
        {
            // return all associations for a given grouping identified by criterion
            // TODO: what does isAssociated mean when querying assoications? will it ever return something if false?
            using (var conn = _dbService.GetConnection())
            {
                return await conn.QueryAsync<AssociationModel>("usp_getAssociationsByGrouping",
                new { OrgR = org, Grouping = grouping, Chart = chart, Criterion = criterion, isAssociated = true },
                commandType: CommandType.StoredProcedure);
            }
        }

        [HttpDelete]
        public async Task<bool> Unassign([FromBody] UnassignModel model)
        {
            // calls usp_deleteAssociationsByGrouping for each expense group to be unassociated
            using (var conn = _dbService.GetConnection())
            {
                await conn.OpenAsync();
                
                using (var txn = await conn.BeginTransactionAsync())
                {
                    try
                    {
                        foreach (var expense in model.Expenses)
                        {
                            await conn.ExecuteAsync("usp_deleteAssociationsByGrouping",
                                new { OrgR = model.Org, Grouping = model.Grouping, Chart = expense.Chart, Criterion = expense.Code },
                                commandType: CommandType.StoredProcedure, transaction: txn);
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

    public class UnassignModel
    {
        public string Org { get; set; }
        public string Grouping { get; set; }
        public ExpenseModel[] Expenses { get; set; }
    }

    public class AssociationModel
    {
        public string Project { get; set; }
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
