using Microsoft.AspNetCore.Mvc;
using server.Data;

namespace server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserScoreboardsController : ControllerBase
    {
        private readonly ServerDbContext dbContext;

        public UserScoreboardsController(ServerDbContext dbContext)
        {
            this.dbContext = dbContext;
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
                (st, sb) => new { sb.ScoreboardId, sb.Name, sb.Active })
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
