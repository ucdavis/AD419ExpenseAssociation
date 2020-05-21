using System.Collections.Generic;
using System.Data;
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
        private static readonly Expense[] Expenses = new[]
        {
            new Expense { Chart = "3", Code = "AAKH", Description = "Startup Funds", Spent = 11872.23m, FTE = 0.75m, Num = 12, IsAssociated = false },
            new Expense { Chart = "3", Code = "ABCD", Description = "Project Funds", Spent = 22334.23m, FTE = 0.37m,  Num = 5, IsAssociated = true },
        };


        [HttpGet]
        public IEnumerable<Expense> Get(string org, string grouping = "Organization", bool showAssociated = false, bool showUnassociated = true)
        {
            using (var conn = _dbService.GetConnection()) {
                return conn.Query<Expense>("usp_getExpenseRecordGrouping", 
                new { Grouping = "Organization", OrgR = "AANS", Associated = true, Unassociated = true },
                commandType: CommandType.StoredProcedure);
            }
            
            // return Expenses;
        }
    }

    public class Expense
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
