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

        public ExpenseController(IDbService dbService)
        {
            this._dbService = dbService;
        }

        [HttpGet]
        public async Task<IEnumerable<ExpenseModel>> Get(string org, string grouping = "Organization", bool showAssociated = true, bool showUnassociated = true)
        {
            using (var conn = _dbService.GetConnection()) {
                return await conn.QueryAsync<ExpenseModel>("usp_getExpenseRecordGrouping", 
                new { Grouping = "Organization", OrgR = org, Associated = showAssociated, Unassociated = showUnassociated },
                commandType: CommandType.StoredProcedure);
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
