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
    public class OrganizationController : ControllerBase
    {
        private readonly IDbService _dbService;

        public OrganizationController(IDbService dbService)
        {
            this._dbService = dbService;
        }

        [HttpGet]
        public async Task<IActionResult> Get()
        {
            var currentUser = User.Identity.Name;

            using (var conn = _dbService.GetConnection())
            {
                var roles = await conn.QueryAsync<string>("usp_GetRolesByLoginID",
                    new { LoginID = currentUser, ApplicationName = "AD419" },
                    commandType: CommandType.StoredProcedure);

                if (roles.Any(r => r == "Admin"))
                {
                    // return all orgs
                    return Ok(await conn.QueryAsync("usp_getReportingOrg",
                        commandType: CommandType.StoredProcedure));
                }
                else
                {
                    // not an admin, return just the user's orgs
                    return Ok(await conn.QueryAsync("usp_GetReportingOrgByUser",
                        new { LoginID = currentUser, ApplicationName = "AD419" },
                        commandType: CommandType.StoredProcedure));
                }
            }
        }
    }
}
