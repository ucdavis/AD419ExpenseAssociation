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
        public async Task<IActionResult> Get(bool includeAll = false)
        {
            var currentUser = User.Identity.Name;

            using (var conn = _dbService.GetConnection())
            {
                var roles = await conn.QueryAsync<string>("usp_GetRolesByLoginID",
                    new { LoginID = currentUser, ApplicationName = "AD419" },
                    commandType: CommandType.StoredProcedure);

                if (roles.Any(r => r == "Admin"))
                {
                    // all orgs
                    var orgs = (await conn.QueryAsync<Org>("usp_getReportingOrgs",
                        commandType: CommandType.StoredProcedure)).ToList();

                    if (includeAll)
                    {
                        // admins can include a special "all" department if desired
                        orgs.Insert(0, new Org { OrgR = "All", Name = "-- All Departments --" });
                    }

                    return Ok(orgs);
                }
                else
                {
                    // not an admin, return just the user's orgs
                    return Ok(await conn.QueryAsync<Org>("usp_GetReportingOrgsByUser",
                        new { LoginID = currentUser, ApplicationName = "AD419" },
                        commandType: CommandType.StoredProcedure));
                }
            }
        }
    }

    public class Org
    {
        public string OrgR { get; set; }
        public string Name { get; set; }
    }
}
