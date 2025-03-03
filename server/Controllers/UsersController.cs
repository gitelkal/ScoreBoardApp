using System.Diagnostics.SymbolStore;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using server.Data;

namespace server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly ServerDbContext dbContext;

        public UsersController(ServerDbContext dbContext)
        {
            this.dbContext = dbContext;
        }

        [HttpGet]
        public IActionResult GetAllUsers()
        {
            var users = dbContext.Users.ToList();
            return Ok(users);
        }

        [HttpGet]
        [Route("{id}")]
        public IActionResult GetOneUser(int id)
        {
            var user = dbContext.Users.Find(id);
            if (user == null)
            {
                return NotFound();
            }
            return Ok(user);
        }

        [HttpPost]
        public IActionResult CreateUser([FromBody] User user)
        {
            dbContext.Users.Add(user);
            dbContext.SaveChanges();
            return StatusCode(StatusCodes.Status201Created);
        }

        [HttpDelete]
        [Route("{id}")]
        public IActionResult DeleteUser(int id)
        {
            var user = dbContext.Users.Find(id);
            if (user == null)
            {
                return NotFound();
            }
            dbContext.Users.Remove(user);
            dbContext.SaveChanges();
            return Ok();
        }

        [HttpGet("{id}/scoreboards")]
        public IActionResult GetUserScoreboards(int id)
        {
            var scoreboards = dbContext.ScoreboardTeams
                .Where(st => dbContext.TeamUsers
                    .Where(tu => tu.UserId == id)
                    .Select(tu => tu.TeamID)
                    .Contains(st.TeamID))
                .Join(dbContext.ScoreBoards,
                st => st.ScoreboardID,
                sb => sb.ScoreboardId,
                (st, sb) => new { sb.ScoreboardId, sb.Name })
                .Distinct()
                .ToList();
            if (!scoreboards.Any())
            {
                return NotFound(new { message = "Användaren har inte deltagit i några poängtavlor" });
            }

            return Ok(scoreboards);
        }
    }
}
