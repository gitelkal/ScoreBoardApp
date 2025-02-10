using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using server.Data;

namespace server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ScoreboardsController : ControllerBase
    {
        private readonly ServerDbContext dbContext;

        public ScoreboardsController(ServerDbContext dbContext)
        {
            this.dbContext = dbContext;
        }

        [HttpGet]
        public IActionResult GetAllScoreboards()
        {
        var scoreBoards = dbContext.ScoreBoards.ToList();

        return Ok(scoreBoards);
    }

       [HttpGet("/rich/{scoreboardId}")]
        public IActionResult GetRichScoreboardById(int scoreboardId)
        {
            var teamsWithUsers = (from sbt in dbContext.ScoreboardTeams
                                join t in dbContext.Teams on sbt.TeamID equals t.TeamID
                                join tu in dbContext.TeamUsers on t.TeamID equals tu.TeamId
                                join u in dbContext.Users on tu.UserId equals u.UserId
                                where sbt.ScoreboardID == scoreboardId
                                group new { u } by new
                                {
                                    t.TeamID,
                                    t.TeamName,
                                    sbt.Points,
                                    sbt.LastUpdated
                                } into teamGroup
                                select new
                                {
                                    teamGroup.Key.TeamID,
                                    teamGroup.Key.TeamName,
                                    teamGroup.Key.Points,
                                    teamGroup.Key.LastUpdated,
                                    Users = teamGroup.Select(x => new
                                    {
                                        x.u.UserId,
                                        x.u.UserName
                                    }).ToList()
                                }).ToList();

            if (!teamsWithUsers.Any())
            {
                return NotFound("No teams found for this scoreboard.");
            }

            return Ok(teamsWithUsers);
        }

    }
}