using Microsoft.AspNetCore.Mvc;
using server.Data;
using server.Entities;


namespace server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SearchController : ControllerBase
    {
        private readonly ServerDbContext _dbContext;

        public SearchController(ServerDbContext dbContext)
        {
            this._dbContext = dbContext;
        }

        [HttpGet]
        public IActionResult Search([FromQuery] string query)
        {
            var scoreboards = _dbContext.ScoreBoards
                .Where(sb => sb.Name.Contains(query) || sb.Description.Contains(query))
                .ToList();

            var teams = _dbContext.Teams
                .Where(t => t.TeamName.Contains(query))
                .ToList();

            var users = _dbContext.Users
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
            var scoreboards = _dbContext.ScoreBoards.ToList();
            var teams = _dbContext.Teams.ToList();
            var users = _dbContext.Users.ToList();

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
