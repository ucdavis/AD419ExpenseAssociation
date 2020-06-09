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
    public class ProjectController : ControllerBase
    {
        private readonly IDbService _dbService;

        public ProjectController(IDbService dbService)
        {
            this._dbService = dbService;
        }

        [HttpGet("{code}")]
        public async Task<IEnumerable<ProjectModel>> GetByDepartment(string code)
        {
            // TODO: make sure they have acess to that dept
            using (var conn = _dbService.GetConnection())
            {
                return await conn.QueryAsync<ProjectModel>("usp_getProjectsByDept",
                    new { OrgR = code },
                    commandType: CommandType.StoredProcedure);
            }
        }
    }
}