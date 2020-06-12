using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
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
        private readonly IPermissionService _permissionService;

        public ProjectController(IDbService dbService, IPermissionService permissionService)
        {
            this._dbService = dbService;
            this._permissionService = permissionService;
        }

        [HttpGet("ByDepartment/{code}")]
        public async Task<IActionResult> GetByDepartment(string code)
        {
            if (!await _permissionService.CanAccessDepartment(User.Identity.Name, code))
            {
                return Forbid();
            }

            using (var conn = _dbService.GetConnection())
            {
                return Ok(await conn.QueryAsync<ProjectModel>("usp_getProjectsByDept",
                    new { OrgR = code },
                    commandType: CommandType.StoredProcedure));
            }
        }

        [HttpGet("{id}")]
        public async Task<ProjectInfo> GetByProject(string id)
        {
            // TODO: make sure they have acess to that project
            using (var conn = _dbService.GetConnection())
            {
                var projects = await conn.QueryAsync<ProjectInfo>("usp_getProjectInfoByID",
                    new { ProjectId = id },
                    commandType: CommandType.StoredProcedure);

                return projects.FirstOrDefault();
            }
        }
    }

    public class ProjectInfo
    {
        public string Accession { get; set; }
        public string Inv1 { get; set; }
        public string Inv2 { get; set; }
        public string Inv3 { get; set; }
        public string Inv4 { get; set; }
        public string Inv5 { get; set; }
        public string Inv6 { get; set; }
        public string ProjTypeCd { get; set; }
        public string RegionalProjNum { get; set; }
        public string StatusCd { get; set; }
        public string Title { get; set; }
        public DateTime BeginDate { get; set; }
        public DateTime TermDate { get; set; }
    }
}