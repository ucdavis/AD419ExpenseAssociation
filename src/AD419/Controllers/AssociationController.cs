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
    }

    public class ProjectModel
    {
        public string Project { get; set; }
        public string Accession { get; set; }
        public string PI { get; set; }
    }
}
