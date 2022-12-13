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

        [HttpGet("Ungrouped")]
        public async Task<IActionResult> Ungrouped(string org, string sfn)
        {
            if (!await _permissionService.CanAccessDepartment(User.Identity.Name, org))
            {
                return Forbid();
            }

            using (var conn = _dbService.GetConnection())
            {
                return Ok(await conn.QueryAsync<UngroupedExpenseModel>(@"
                    SELECT
                        Expenses.Exp_SFN SFN,
                        Expenses.FTE,
                        Expenses.Chart,
                        Expenses.isAssociated,
                        Associations.OrgR,
                        Project.Project,
                        Project.Accession,
                        Project.inv1 PI,
                        Associations.Expenses Spent
                    FROM
                        Expenses INNER JOIN
                        ReportingOrg ON Expenses.OrgR = ReportingOrg.OrgR INNER JOIN
                        Associations ON Expenses.ExpenseID = Associations.ExpenseID INNER JOIN
                        Project ON Associations.Accession = Project.Accession INNER JOIN
                        SFN ON Expenses.Exp_SFN = SFN.SFN
                    WHERE
                        Associations.OrgR LIKE @OrgR AND
                        (@SFN LIKE 'ALL' OR Expenses.Exp_SFN LIKE @SFN)
                    ORDER BY SFN, Project, Associations.OrgR, [inv1]                
                ",
                new { OrgR = org, SFN = sfn }));
            }
        }

        [HttpGet("SFNs")]
        public async Task<IActionResult> SFNs()
        {
            using (var conn = _dbService.GetConnection())
            {
                // not using usp_getSFN because it filters out 204
                return Ok(await conn.QueryAsync<SFNModel>(@"
                    SELECT SFN, SFN + '  (' + Description + ')' AS Description
                    FROM SFN
                    ORDER BY SFN"));
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

    public class UngroupedExpenseModel
    {
        public string SFN { get; set; }
        public decimal FTE { get; set; }
        public string Chart { get; set; }
        public bool IsAssociated { get; set; }
        public string OrgR { get; set; }
        public string Project { get; set; }
        public string Accession { get; set; }
        public string PI { get; set; }
        public decimal Spent { get; set; }
    }

    public class SFNModel
    {
        public string SFN { get; set; }
        public string Description { get; set; }
    }
}
