using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;

namespace AD419.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class OrganizationController : ControllerBase
    {
        private static readonly Organization[] Orgs = new[]
        {
            new Organization { OrgR = "AANS", OrgR_Dept = "AANS" },
            new Organization { OrgR = "ABAE", OrgR_Dept = "ABAE" },
        };

        [HttpGet]
        public IEnumerable<Organization> Get()
        {
            return Orgs;
        }
    }

    public class Organization {
        public string OrgR { get; set; }
        public string OrgR_Dept { get; set; }
    }
}
