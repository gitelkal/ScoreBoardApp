using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using server.Data;
using server.Entities;
namespace server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ScoreboardsController : ControllerBase
    {
        private readonly ServerDbContext dbContext;
        private readonly IHubContext<ScoreboardHub> _hubContext;

        public ScoreboardsController(ServerDbContext dbContext, IHubContext<ScoreboardHub> hubContext)
        {
            this.dbContext = dbContext;
            _hubContext = hubContext;
        }

        [HttpGet]
        public IActionResult GetAllScoreboards()
        {
            var scoreBoards = dbContext.ScoreBoards.ToList();
            return Ok(scoreBoards);
        }



        [HttpPost]
        public async Task <IActionResult> CreateScoreboard([FromBody] ScoreboardDTO scoreboardDTO)
        {

            if (scoreboardDTO == null)
            {
                return BadRequest("Scoreboard-data saknas.");
            }

            try
            {
                var scoreboard = new Scoreboard
                {
                    Name = scoreboardDTO.Name,
                    StartedAt = scoreboardDTO.StartedAt ?? DateTime.UtcNow,
                    EndedAt = scoreboardDTO.EndedAt,
                    Description = scoreboardDTO.Description,
                    Active = scoreboardDTO.Active
                };

                dbContext.ScoreBoards.Add(scoreboard);
                dbContext.SaveChanges();

                await _hubContext.Clients.All.SendAsync("ReceiveScoreboardCreation", scoreboard.ScoreboardId);

                return StatusCode(StatusCodes.Status201Created, scoreboard);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Internt serverfel: " + ex.Message);
            }
        }


        [HttpPut("{scoreboardId}")] 
            public IActionResult UpdateScoreboard(int scoreboardId, [FromBody] ScoreboardDTO scoreboardDTO)
            {
                if (scoreboardDTO == null)
                {
                    return BadRequest(new { message = "Invalid scoreboard data." });
                }

                var scoreboard = dbContext.ScoreBoards.FirstOrDefault(s => s.ScoreboardId == scoreboardId);
                if (scoreboard == null)
                {
                    return NotFound(new { message = "Scoreboard not found." });
                }

                scoreboard.Name = scoreboardDTO.Name;
                scoreboard.StartedAt = scoreboardDTO.StartedAt ?? DateTime.UtcNow;
                scoreboard.EndedAt = scoreboardDTO.EndedAt;
                scoreboard.Description = scoreboardDTO.Description;
                scoreboard.Active = scoreboardDTO.Active;

                dbContext.SaveChanges();

                return Ok(new { message = "Scoreboard updated successfully!" });
            }

        [HttpDelete("{scoreboardId}")]
        public IActionResult DeleteScoreboard(int scoreboardId)
        {
            var scoreboard = dbContext.ScoreBoards.Find(scoreboardId);
            if (scoreboard == null)
            {
                return NotFound(new { message = "Scoreboard not found." });
            }

            dbContext.ScoreBoards.Remove(scoreboard);
            dbContext.SaveChanges();
    
            return Ok(new { message = "Scoreboard deleted successfully!" });
        }


// --------------------------------------

        [HttpGet("{scoreboardId}")]
        public IActionResult GetScoreboardById(int scoreboardId)
        {
            var scoreboard = dbContext.ScoreBoards.Find(scoreboardId);
            if (scoreboard == null)
                return NotFound();
            return Ok(scoreboard);
        }

        [HttpGet("rich/{scoreboardId}")]
        public IActionResult GetRichScoreboardById(int scoreboardId)
        {
            // Fetch the scoreboard details
            var scoreboard = dbContext.ScoreBoards
                .Where(sb => sb.ScoreboardId == scoreboardId)
                .Select(sb => new
                {
                    sb.ScoreboardId,
                    sb.Name,
                    sb.StartedAt,
                    sb.Active
                })
                .FirstOrDefault();

            if (scoreboard == null)
            {
                return NotFound("Scoreboard not found.");
            }

            var teamsWithUsers = (from sbt in dbContext.ScoreboardTeams
                                  join t in dbContext.Teams on sbt.TeamID equals t.TeamID
                                  join tu in dbContext.TeamUsers on t.TeamID equals tu.TeamID into teamUsersGroup // Left Join
                                  from tu in teamUsersGroup.DefaultIfEmpty()
                                  join u in dbContext.Users on tu.UserId equals u.UserId into usersGroup // Left Join
                                  from u in usersGroup.DefaultIfEmpty()
                                  where sbt.ScoreboardID == scoreboardId
                                  group u by new
                                  {
                                      t.TeamID,
                                      t.TeamName,
                                      sbt.Points,
                                      sbt.LastUpdated
                                  } into teamGroup
                                  orderby teamGroup.Key.Points descending
                                  select new
                                  {
                                      teamGroup.Key.TeamID,
                                      teamGroup.Key.TeamName,
                                      teamGroup.Key.Points,
                                      teamGroup.Key.LastUpdated,
                                      Users = teamGroup
                                          .Where(x => x != null) // Ensure no null values
                                          .Select(x => new
                                          {
                                              x.UserId,
                                              x.Username
                                          }).ToList()
                                  }).ToList();



            // Return the structured JSON response
            return Ok(new
            {
                Scoreboard = new
                {
                    scoreboard.ScoreboardId,
                    scoreboard.Name,
                    scoreboard.StartedAt,
                    scoreboard.Active,
                    Teams = teamsWithUsers
                }
            });
        }


    }
}
