using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading.Tasks;
using Dapper;

namespace AD419.Services
{
    public interface IPermissionService
    {
        Task<bool> CanAccessDepartment(string username, string orgR);
        Task<string[]> GetDepartments(string username);
        Task<bool> IsAdmin(string username);
    }

    public class PermissionService : IPermissionService
    {
        private readonly IDbService _dbService;

        public PermissionService(IDbService dbService)
        {
            this._dbService = dbService;
        }

        public async Task<bool> IsAdmin(string username)
        {
            using (var conn = _dbService.GetConnection())
            {
                var roles = await conn.QueryAsync<string>("usp_GetRolesByLoginID",
                    new { LoginID = username, ApplicationName = "AD419" },
                    commandType: CommandType.StoredProcedure);

                return roles.Any(r => r == "Admin");
            }
        }

        public async Task<bool> CanAccessDepartment(string username, string orgR)
        {
            var accessibleOrgs = await GetDepartments(username);

            return accessibleOrgs.Contains(orgR);
        }

        public async Task<string[]> GetDepartments(string username)
        {
            using (var conn = _dbService.GetConnection())
            {
                var roles = await conn.QueryAsync<string>("usp_GetRolesByLoginID",
                    new { LoginID = username, ApplicationName = "AD419" },
                    commandType: CommandType.StoredProcedure);

                IEnumerable<ReportingOrg> orgs;

                if (roles.Any(r => r == "Admin"))
                {
                    // return all orgs
                    orgs = await conn.QueryAsync<ReportingOrg>("usp_getReportingOrg",
                        commandType: CommandType.StoredProcedure);
                }
                else
                {
                    // not an admin, return just the user's orgs
                    orgs = await conn.QueryAsync<ReportingOrg>("usp_GetReportingOrgByUser",
                        new { LoginID = username, ApplicationName = "AD419" },
                        commandType: CommandType.StoredProcedure);
                }

                return orgs.Select(o => o.OrgR).ToArray();
            }
        }

        private class ReportingOrg
        {
            public string OrgR { get; set; }
        }
    }
}