using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using server.Data;
using server.Entities;
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



[HttpPost]
public IActionResult CreateScoreboard([FromBody] ScoreboardDTO scoreboardDTO)
{
    Console.WriteLine("📥 Mottagen ScoreboardDTO:");


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
        Console.WriteLine("✅ Scoreboard skapad med ID: " + scoreboard.ScoreboardId);

        return StatusCode(StatusCodes.Status201Created, scoreboard);
    }
    catch (Exception ex)
    {
        Console.WriteLine("❌ FEL vid databasinsättning: " + ex.Message);
        return StatusCode(500, "Internt serverfel: " + ex.Message);
    }
}


// ------------------------------------
[HttpPut("{scoreboardId}")] // Uppdaterad route
    public IActionResult UpdateScoreboard(int scoreboardId, [FromBody] ScoreboardDTO scoreboardDTO)
    {
        Console.WriteLine($"🔹 PUT-request mottagen för scoreboardId={scoreboardId}");

        if (scoreboardDTO == null)
        {
            Console.WriteLine("⚠️ Ingen scoreboard-data mottagen!");
            return BadRequest(new { message = "Invalid scoreboard data." });
        }

        var scoreboard = dbContext.ScoreBoards.FirstOrDefault(s => s.ScoreboardId == scoreboardId);
        if (scoreboard == null)
        {
            Console.WriteLine("⚠️ Scoreboard hittades inte!");
            return NotFound(new { message = "Scoreboard not found." });
        }

        scoreboard.Name = scoreboardDTO.Name;
        scoreboard.StartedAt = scoreboardDTO.StartedAt ?? DateTime.UtcNow;
        scoreboard.EndedAt = scoreboardDTO.EndedAt;
        scoreboard.Description = scoreboardDTO.Description;
        scoreboard.Active = scoreboardDTO.Active;

        dbContext.SaveChanges();
        Console.WriteLine("✅ Scoreboard uppdaterad!");

        return Ok(new { message = "Scoreboard updated successfully!" });
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

            // Fetch teams and users related to the scoreboard
            var teamsWithUsers = (from sbt in dbContext.ScoreboardTeams
                                  join t in dbContext.Teams on sbt.TeamID equals t.TeamID
                                  join tu in dbContext.TeamUsers on t.TeamID equals tu.TeamID
                                  join u in dbContext.Users on tu.UserId equals u.UserId
                                  where sbt.ScoreboardID == scoreboardId
                                  group new { u } by new
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
                                      Users = teamGroup.Select(x => new
                                      {
                                          x.u.UserId,
                                          x.u.Username
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
