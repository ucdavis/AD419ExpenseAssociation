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
    public class SummaryController : ControllerBase
    {
        private readonly IDbService _dbService;
        private readonly IPermissionService _permissionService;

        public SummaryController(IDbService dbService, IPermissionService permissionService)
        {
            this._dbService = dbService;
            this._permissionService = permissionService;
        }

        [HttpGet("ExpensesByDepartment/{code}")]
        public async Task<IActionResult> GetExpensesByDepartment(string code)
        {
            if (!await _permissionService.CanAccessDepartment(User.Identity.Name, code))
            {
                return Forbid();
            }

            using (var conn = _dbService.GetConnection())
            {
                return Ok(await conn.QueryAsync<ExpenseSummary>("usp_getTotalExpensesByDepartmentAE",
                    new { OrgR = code },
                    commandType: CommandType.StoredProcedure));
            }
        }

        [HttpGet("ExpensesBySFN/{code}")]
        public async Task<IActionResult> GetExpensesBySFN(string code, string accession, int associationStatus)
        {
            if (!await _permissionService.CanAccessDepartment(User.Identity.Name, code))
            {
                return Forbid();
            }

            using (var conn = _dbService.GetConnection())
            {
                return Ok(await conn.QueryAsync<SFNSummary>("usp_GetExpensesBySFNAE",
                    new { OrgR = code, Accession = accession, IntAssociationStatus = associationStatus },
                    commandType: CommandType.StoredProcedure, commandTimeout: 120));
            }
        }

        [HttpGet("CurrentFiscalYear")]
        public async Task<IActionResult> GetCurrentFiscalYear()
        {
            using (var conn = _dbService.GetConnection())
            {
                var objParams = new DynamicParameters();
                objParams.Add("@CurrentFiscalYear", dbType: DbType.Int32, direction: ParameterDirection.Output);
                await conn.ExecuteAsync("usp_GetCurrentFiscalYear", objParams, commandType: CommandType.StoredProcedure);
                return Ok(objParams.Get<int>("@CurrentFiscalYear"));
            }
        }
    }

    public class ExpenseSummary
    {
        public string Name { get; set; }
        public decimal Spent { get; set; }
        public decimal FTE { get; set; }
        public int Recs { get; set; }
    }

    public class SFNSummary
    {
        public int GroupDisplayOrder { get; set; }
        public int LineDisplayOrder { get; set; }
        public string LineTypeCode { get; set; }
        public string LineDisplayDescriptor { get; set; }
        public string Sfn { get; set; }
        public decimal Total { get; set; }
    }
}