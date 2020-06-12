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
                return Ok(await conn.QueryAsync<ExpenseModel>("usp_getExpenseRecordGrouping",
                new { Grouping = grouping, OrgR = org, Associated = showAssociated, Unassociated = showUnassociated },
                commandType: CommandType.StoredProcedure));
            }
        }
    }

    public class ExpenseModel
    {
        public string Chart { get; set; }
        public string Code { get; set; }
        public string Description { get; set; }
        public decimal Spent { get; set; }
        public decimal FTE { get; set; }
        public int Num { get; set; }
        public bool IsAssociated { get; set; }
    }
}
