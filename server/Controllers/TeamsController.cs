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
        [HttpGet]
        [Route("{id}")]
        public IActionResult GetOneTeam(int id)
        {
            var team = dbContext.Teams.Find(id);
            if (team == null)
            {
                return NotFound();
            }
            return Ok(team);
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
[HttpPut("{id}")]
public IActionResult UpdateTeam(int id, [FromBody] Team updatedTeam)
{
    var team = dbContext.Teams.Find(id);
    if (team == null)
    {
        return NotFound();
    }

    // Uppdatera endast namnet (eller fler fält om nödvändigt)
    team.TeamName = updatedTeam.TeamName;

    dbContext.SaveChanges();
    return Ok(team);
}



    }
}