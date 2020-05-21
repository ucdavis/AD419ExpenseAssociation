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
            new Organization { Code = "AANS", Name = "AANS" },
            new Organization { Code = "ABAE", Name = "ABAE" },
        };

        [HttpGet]
        public IEnumerable<Organization> Get()
        {
            return Orgs;
        }
    }

    public class Organization {
        public string Code { get; set; }
        public string Name { get; set; }
    }
}
