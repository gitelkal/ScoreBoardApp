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
        [HttpPost]
        public IActionResult CreateTeam([FromBody] Team team)
        {
            dbContext.Teams.Add(team);
            dbContext.SaveChanges();
            return StatusCode(StatusCodes.Status201Created);
        }
        [HttpDelete]
        [Route("{id}")]
        public IActionResult DeleteTeam(int id)
        {
            var team = dbContext.Teams.Find(id);
            if (team == null)
            {
                return NotFound();
            }
            dbContext.Teams.Remove(team);
            dbContext.SaveChanges();
            return Ok();
        }
    }
}