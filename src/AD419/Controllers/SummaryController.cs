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

        public SummaryController(IDbService dbService)
        {
            this._dbService = dbService;
        }

        [HttpGet("ExpensesByDepartment/{code}")]
        public async Task<IEnumerable<ExpenseSummary>> GetExpensesByDepartment(string code)
        {
            // TODO: make sure they have acess to that dept
            using (var conn = _dbService.GetConnection())
            {
                return await conn.QueryAsync<ExpenseSummary>("usp_getTotalExpensesByDept",
                    new { OrgR = code },
                    commandType: CommandType.StoredProcedure);
            }
        }
    }

    public class ExpenseSummary {
        public string Name { get; set; }
        public decimal Spent { get; set; }
        public decimal FTE { get; set; }
        public int Recs { get; set; }
    }
}