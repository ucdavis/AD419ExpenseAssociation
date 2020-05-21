using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;

namespace AD419.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class AssociationController : ControllerBase
    {
        private static readonly Project[] Projects = new[]
        {
            new Project { Number = "CA-D-ASC-2522-CG", Accession = "1234567", PI = "Dobalina, Bob" },
            new Project { Number = "CA-D-ASC-1234-AB", Accession = "9876543", PI = "Logan, Theodore" },
        };

        [HttpGet]
        public IEnumerable<Project> Get(string org)
        {
            return Projects;
        }
    }

    public class Project
    {
        public string Number { get; set; }
        public string Accession { get; set; }
        public string PI { get; set; }
    }
}
