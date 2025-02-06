using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using server.Data;

namespace server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TeamsController : ControllerBase
    {
        private readonly ServerDbContext dbContext;

        public TeamsController(ServerDbContext dbContext)
        {
            this.dbContext = dbContext;
        }

        [HttpGet]
        public IActionResult GetAllTeams()
        {
            var teams = dbContext.Teams.ToList();
            return Ok(teams);
        }
    }
}