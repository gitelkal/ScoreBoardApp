using Microsoft.AspNetCore.Mvc;
using server.Data;
using server.Entities;


namespace server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SearchController : ControllerBase
    {
        private readonly ServerDbContext dbContext;

        public SearchController(ServerDbContext dbContext)
        {
            this.dbContext = dbContext;
        }

        [HttpGet]
        public IActionResult Search([FromQuery] string query)
        {
            var scoreboards = dbContext.ScoreBoards
                .Where(sb => sb.Name.Contains(query))
                .ToList();

            var teams = dbContext.Teams
                .Where(t => t.TeamName.Contains(query))
                .ToList();

            var users = dbContext.Users
                .Where(u => u.Username.Contains(query) || u.Firstname.Contains(query) || u.Lastname.Contains(query))
                .ToList();

            var searchResults = new
            {
                Scoreboards = scoreboards.Any() ? scoreboards : null,
                Teams = teams.Any() ? teams : null,
                Users = users.Any() ? users : null
            };

            if (searchResults.Scoreboards == null && searchResults.Teams == null && searchResults.Users == null)
            {
                return NotFound();
            }

            return Ok(searchResults);
        }

        [HttpGet]
        [Route("all")]
        public IActionResult GetAll()
        {
            var scoreboards = dbContext.ScoreBoards.ToList();
            var teams = dbContext.Teams.ToList();
            var users = dbContext.Users.ToList();

            var searchResults = new
            {
                Scoreboards = scoreboards.Any() ? scoreboards : null,
                Teams = teams.Any() ? teams : null,
                Users = users.Any() ? users : null
            };

            return Ok(searchResults);
        }
    }
}
