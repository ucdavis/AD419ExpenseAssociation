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
        public async Task<IEnumerable<AssociationModel>> GetByGrouping(string org, string criterion, string grouping = "Organization") {
            // return all associations for a given grouping identified by criterion
            using (var conn = _dbService.GetConnection())
            {
                return await conn.QueryAsync<AssociationModel>("usp_getAssociationsByGrouping",
                new { OrgR = org, Grouping = grouping, Chart = "3", Criterion = "AACD", isAssociated = true },
                commandType: CommandType.StoredProcedure);
            }
        }
    }

    public class AssociationModel {
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
