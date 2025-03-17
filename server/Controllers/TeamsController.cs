using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using server.Data;

namespace server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TeamsController : ControllerBase
    {
        private readonly ServerDbContext _dbContext;

        public TeamsController(ServerDbContext dbContext)
        {
            this._dbContext = dbContext;
        }

        [HttpGet]
        public IActionResult GetAllTeams()
        {
            var teams = _dbContext.Teams.ToList();
            return Ok(teams);
        }
        [HttpGet]
        [Route("{id}")]
        public IActionResult GetOneTeam(int id)
        {
            var team = _dbContext.Teams.Find(id);
            if (team == null)
            {
                return NotFound();
            }
            return Ok(team);
        }
        [HttpPost]
        public IActionResult CreateTeam([FromBody] Team team)
        {
            _dbContext.Teams.Add(team);
            _dbContext.SaveChanges();
            return StatusCode(StatusCodes.Status201Created);
        }
        [HttpDelete]
        [Route("{id}")]
        public IActionResult DeleteTeam(int id)
        {
            var team = _dbContext.Teams.Find(id);
            if (team == null)
            {
                return NotFound();
            }
            _dbContext.Teams.Remove(team);
            _dbContext.SaveChanges();
            return Ok();
        }
        [HttpPut("{id}")]
        public IActionResult UpdateTeam(int id, [FromBody] Team updatedTeam)
        {
            var team = _dbContext.Teams.Find(id);
            if (team == null)
            {
                return NotFound();
            }

            team.TeamName = updatedTeam.TeamName;

            _dbContext.SaveChanges();
            return Ok(team);
        }

    }
}