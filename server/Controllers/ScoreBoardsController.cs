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
        private readonly ServerDbContext _dbContext;
        private readonly IHubContext<ScoreboardHub> _hubContext;

        public ScoreboardsController(ServerDbContext dbContext, IHubContext<ScoreboardHub> hubContext)
        {
            _dbContext = dbContext;
            _hubContext = hubContext;
        }

        [HttpGet]
        public IActionResult GetAllScoreboards()
        {
            var scoreBoards = _dbContext.ScoreBoards.ToList();
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
                    Active = scoreboardDTO.Active,
                    NumberOfTasks = scoreboardDTO.NumberOfTasks
                };

                _dbContext.ScoreBoards.Add(scoreboard);
                _dbContext.SaveChanges();

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

                var scoreboard = _dbContext.ScoreBoards.FirstOrDefault(s => s.ScoreboardId == scoreboardId);
                if (scoreboard == null)
                {
                    return NotFound(new { message = "Scoreboard not found." });
                }

                scoreboard.Name = scoreboardDTO.Name;
                scoreboard.StartedAt = scoreboardDTO.StartedAt ?? DateTime.UtcNow;
                scoreboard.EndedAt = scoreboardDTO.EndedAt;
                scoreboard.Description = scoreboardDTO.Description;
                scoreboard.Active = scoreboardDTO.Active;
                scoreboard.NumberOfTasks = scoreboardDTO.NumberOfTasks;

                _dbContext.SaveChanges();

                return Ok(new { message = "Scoreboard updated successfully!" });
            }

        [HttpDelete("{scoreboardId}")]
        public IActionResult DeleteScoreboard(int scoreboardId)
        {
            var scoreboard = _dbContext.ScoreBoards.Find(scoreboardId);
            if (scoreboard == null)
            {
                return NotFound(new { message = "Scoreboard not found." });
            }

            _dbContext.ScoreBoards.Remove(scoreboard);
            _dbContext.SaveChanges();
    
            return Ok(new { message = "Scoreboard deleted successfully!" });
        }


// --------------------------------------

        [HttpGet("{scoreboardId}")]
        public IActionResult GetScoreboardById(int scoreboardId)
        {
            var scoreboard = _dbContext.ScoreBoards.Find(scoreboardId);
            if (scoreboard == null)
                return NotFound();
            return Ok(scoreboard);
        }

        [HttpGet("rich/{scoreboardId}")]
        public IActionResult GetRichScoreboardById(int scoreboardId)
        {
            // Fetch the scoreboard details
            var scoreboard = _dbContext.ScoreBoards
                .Where(sb => sb.ScoreboardId == scoreboardId)
                .Select(sb => new
                {
                    sb.ScoreboardId,
                    sb.Name,
                    sb.StartedAt,
                    sb.EndedAt,
                    sb.Active,
                    sb.NumberOfTasks
                })
                .FirstOrDefault();

            if (scoreboard == null)
            {
                return NotFound("Scoreboard not found.");
            }

            var teamsWithUsers = (from sbt in _dbContext.ScoreboardTeams
                                  join t in _dbContext.Teams on sbt.TeamID equals t.TeamID
                                  join tu in _dbContext.TeamUsers on t.TeamID equals tu.TeamID into teamUsersGroup // Left Join
                                  from tu in teamUsersGroup.DefaultIfEmpty()
                                  join u in _dbContext.Users on tu.UserId equals u.UserId into usersGroup // Left Join
                                  from u in usersGroup.DefaultIfEmpty()
                                  where sbt.ScoreboardID == scoreboardId
                                  group u by new
                                  {
                                      t.TeamID,
                                      t.TeamName,
                                      sbt.Points,
                                      sbt.LastUpdated,
                                      sbt.TasksCount
                                  } into teamGroup
                                  orderby teamGroup.Key.Points descending
                                  select new
                                  {
                                      teamGroup.Key.TeamID,
                                      teamGroup.Key.TeamName,
                                      teamGroup.Key.Points,
                                      teamGroup.Key.LastUpdated,
                                      teamGroup.Key.TasksCount,
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
                    scoreboard.EndedAt,
                    scoreboard.Active,
                    scoreboard.NumberOfTasks,
                    Teams = teamsWithUsers
                }
            });
        }

        [HttpPut("{scoreboardId}/numberOfTasks")]
        public async Task<IActionResult> UpdateNumberOfTasks(int scoreboardId, [FromBody] UpdateNumberOfTasksDTO dto)
        {

            var scoreboard = _dbContext.ScoreBoards.FirstOrDefault(s => s.ScoreboardId == scoreboardId);
            if (scoreboard == null)
            {
                return NotFound(new { message = "Scoreboard not found." });
            }

            scoreboard.NumberOfTasks = dto.NumberOfTasks;
            _dbContext.SaveChanges();

            await _hubContext.Clients.All.SendAsync("TaskCountUpdated", scoreboardId, dto.NumberOfTasks);
            return Ok(new { message = "Number of tasks updated successfully!" });
        }

        [HttpGet("{scoreboardId}/numberOfTasks")]
        public IActionResult GetNumberOfTasks(int scoreboardId)
        {
            var scoreboard = _dbContext.ScoreBoards.FirstOrDefault(s => s.ScoreboardId == scoreboardId);
            if (scoreboard == null)
            {
                return NotFound(new { message = "Scoreboard not found." });
            }

            if (scoreboard.NumberOfTasks == null)
            {
                Console.WriteLine("NumberOfTasks �r NULL!");
            }

            return Ok(scoreboard.NumberOfTasks);
        }



    }
}
