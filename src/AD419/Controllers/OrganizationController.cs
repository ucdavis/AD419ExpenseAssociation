using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;

namespace AD419.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class OrganizationController : ControllerBase
    {
        private static readonly OrganizationModel[] Orgs = new[]
        {
            new OrganizationModel { Code = "AARE", Name = "AARE" },
            new OrganizationModel { Code = "AANS", Name = "AANS" },  
        };

        [HttpGet]
        public IEnumerable<OrganizationModel> Get()
        {
            return Orgs;
        }
    }

    public class OrganizationModel {
        public string Code { get; set; }
        public string Name { get; set; }
    }
}
