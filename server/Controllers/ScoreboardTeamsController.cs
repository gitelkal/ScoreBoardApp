using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using server.Data;

namespace server.Controllers
{
[ApiController]
[Route("api/[controller]")]
    public class ScoreboardTeamsController : ControllerBase
    {
        private readonly ServerDbContext dbContext;
        private readonly IHubContext<ScoreboardHub> _hubContext;

        public ScoreboardTeamsController(ServerDbContext context, IHubContext<ScoreboardHub> hubContext)
        {
            dbContext = context;
            _hubContext = hubContext;
        }
        [HttpGet]
        public IActionResult GetAllScoreboardTeams()
        {
            var scoreboardTeams = dbContext.ScoreboardTeams.ToList();
            return Ok(scoreboardTeams);
        }

        [HttpGet]
        [Route("{teamId}")]
        public IActionResult GetScoreboardsForTeam(int teamId)
        {
            var scoreboards = dbContext.ScoreboardTeams
                .Where(st => st.TeamID == teamId)
                .Select(st => new { st.ScoreboardID, st.Points })
                .Distinct()
                .ToList();

            if (!scoreboards.Any())
            {
                return NotFound(new { message = "No scoreboards found for this team" });
            }

            var scoreboardDetails = dbContext.ScoreBoards
                .Where(sb => scoreboards.Select(s => s.ScoreboardID).Contains(sb.ScoreboardId))
                .ToList();

            var result = scoreboardDetails.Select(sb => new
            {
                sb.ScoreboardId,
                sb.Name,
                sb.Description,
                sb.StartedAt,
                sb.EndedAt,
                sb.Active,
                Points = scoreboards.First(s => s.ScoreboardID == sb.ScoreboardId).Points
            });

            return Ok(result);
        }


        [HttpPut("{scoreboardId}/{teamId}/addPoints")]
        public async Task<IActionResult> AddPointsToTeamAsync(int scoreboardId, int teamId, int points)
        {
            var scoreboardTeam = dbContext.ScoreboardTeams
                .FirstOrDefault(st => st.ScoreboardID == scoreboardId && st.TeamID == teamId);

            if (scoreboardTeam == null)
            {
                return NotFound(new { message = "Team not found in the scoreboard" });
            }

            scoreboardTeam.Points = (scoreboardTeam.Points ?? 0) + points;
            scoreboardTeam.LastUpdated = DateTime.UtcNow;

            dbContext.SaveChanges();

            // Send the updated points to all connected clients
            await _hubContext.Clients.All.SendAsync("ReceiveScoreUpdate", scoreboardTeam.ScoreboardID, scoreboardTeam.TeamID, scoreboardTeam.Points);

            return Ok(scoreboardTeam);
        }

        [HttpPut("{scoreboardId}/{teamId}/points")]
        public async Task<IActionResult> SetPointsToTeamAsync(int scoreboardId, int teamId, int points)
        {
            var scoreboardTeam = dbContext.ScoreboardTeams
                .FirstOrDefault(st => st.ScoreboardID == scoreboardId && st.TeamID == teamId);

            if (scoreboardTeam == null)
            {
                return NotFound(new { message = "Team not found in the scoreboard" });
            }

            scoreboardTeam.Points = points;
            scoreboardTeam.LastUpdated = DateTime.UtcNow;

            dbContext.SaveChanges();

            // Send the updated points to all connected clients
            await _hubContext.Clients.All.SendAsync("ReceiveScoreUpdate", scoreboardTeam.ScoreboardID, scoreboardTeam.TeamID, scoreboardTeam.Points);

            return Ok(scoreboardTeam);
        }


        [HttpPost]
        public async Task <IActionResult> AddTeamToScoreboardAsync(int scoreboardId,int teamId)
        {
            var scoreboardTeam = new ScoreBoardTeams
            {
                ScoreboardID = scoreboardId,
                TeamID = teamId
            };

            dbContext.ScoreboardTeams.Add(scoreboardTeam);
            dbContext.SaveChanges();

            await _hubContext.Clients.All.SendAsync("TeamJoinedScoreboard", scoreboardId, teamId);

            return StatusCode(StatusCodes.Status201Created);
        }

        [HttpPost("{scoreboardId}/teamName")]
        public IActionResult CreateAndAddEmptyTeamToScoreboard(int scoreboardId,string teamName)
        {
            var team = new Team
            {
                TeamName = teamName
            };

            dbContext.Teams.Add(team);
            dbContext.SaveChanges();

            var scoreboardTeam = new ScoreBoardTeams
            {
                ScoreboardID = scoreboardId,
                TeamID = team.TeamID 
            };

            dbContext.ScoreboardTeams.Add(scoreboardTeam);
            dbContext.SaveChanges();

            return StatusCode(StatusCodes.Status201Created, new { teamId = team.TeamID, scoreboardId = scoreboardId });
        }

        [HttpGet("{scoreboardId}/userId")]
        public IActionResult GetTeamsNotInScoreboard(int scoreboardId, int userId)
        {

            var userTeams = dbContext.TeamUsers
                .Where(ut => ut.UserId == userId)
                .Select(ut => ut.TeamID)
                .ToList();

            var scoreboardTeams = dbContext.ScoreboardTeams
                .Where(st => st.ScoreboardID == scoreboardId)
                .Select(st => st.TeamID)
                .ToList();

            var availableTeams = dbContext.Teams
                .Where(t => userTeams.Contains(t.TeamID) && !scoreboardTeams.Contains(t.TeamID))
                .ToList();

            return Ok(availableTeams);
        }

        [HttpDelete("{scoreboardId}/teamId")]
        public IActionResult DeleteScoreboardTeam(int scoreboardId, int teamId)
        {
            var scoreboardTeams = dbContext.ScoreboardTeams.Where(
                st => st.ScoreboardID == scoreboardId && st.TeamID ==  teamId);

            if (scoreboardTeams == null)
                return NotFound();

            dbContext.ScoreboardTeams.Remove(scoreboardTeams.First());
            dbContext.SaveChanges();
            dbContext.SaveChanges();
            return Ok();
        }
    }
}