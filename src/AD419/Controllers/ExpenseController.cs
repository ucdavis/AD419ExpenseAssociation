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
    public class ExpenseController : ControllerBase
    {
        private readonly IDbService _dbService;
        private readonly IPermissionService _permissionService;

        public ExpenseController(IDbService dbService, IPermissionService permissionService)
        {
            this._dbService = dbService;
            this._permissionService = permissionService;
        }

        [HttpGet]
        public async Task<IActionResult> Get(string org, string grouping, bool showAssociated = true, bool showUnassociated = true)
        {
            if (!await _permissionService.CanAccessDepartment(User.Identity.Name, org))
            {
                return Forbid();
            }

            using (var conn = _dbService.GetConnection())
            {
                return Ok(await conn.QueryAsync<ExpenseModel>("usp_getExpenseRecordGroupingAE",
                new { Grouping = grouping, OrgR = org, Associated = showAssociated, Unassociated = showUnassociated },
                commandType: CommandType.StoredProcedure));
            }
        }

        [HttpGet("Ungrouped")]
        public async Task<IActionResult> Ungrouped(string org, string sfn)
        {
            if (!await _permissionService.IsAdmin(User.Identity.Name))
            {
                return Forbid();
            }

            using (var conn = _dbService.GetConnection())
            {
                return Ok(await conn.QueryAsync<UngroupedExpenseModel>("usp_getProjectExpenses",
                new { OrgR = org, SFN = sfn }, commandType: CommandType.StoredProcedure));
            }
        }

        [HttpGet("SFNs")]
        public async Task<IActionResult> SFNs()
        {
            using (var conn = _dbService.GetConnection())
            {
                return Ok(await conn.QueryAsync<SFNModel>("usp_getSFN", commandType: CommandType.StoredProcedure));
            }
        }
    }

    public class ExpenseModel
    {
        public int Entity { get; set; }
        public string Code { get; set; }
        public string Description { get; set; }
        public decimal Spent { get; set; }
        public decimal FTE { get; set; }
        public int Num { get; set; }
        public bool IsAssociated { get; set; }
    }

    public class UngroupedExpenseModel
    {
        public int ExpenseId { get; set; }
        public string SFN { get; set; }
        public string Project { get; set; }
        public decimal Expenses { get; set; }
        public string OrgR { get; set; }
        public string PI { get; set; }
    }

    public class SFNModel
    {
        public string SFN { get; set; }
        public string Description { get; set; }
    }
}
