﻿using Microsoft.AspNetCore.Mvc;
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
                .Select(st => st.ScoreboardID)
                .Distinct()
                .ToList();

            if (!scoreboards.Any())
            {
                return NotFound(new { message = "No scoreboards found for this team" });
            }

            var scoreboardDetails = dbContext.ScoreBoards
                .Where(sb => scoreboards.Contains(sb.ScoreboardId))
                .ToList();

            return Ok(scoreboardDetails);
        }


        [HttpPut("{scoreboardId}/{teamId}/add-points")]
        public async Task<IActionResult> AddPointsToTeamAsync(int scoreboardId, int teamId, int pointsToAdd)
        {
            // Find the scoreboard team based on scoreboardId and teamId
            var scoreboardTeam = dbContext.ScoreboardTeams
                .FirstOrDefault(st => st.ScoreboardID == scoreboardId && st.TeamID == teamId);

            if (scoreboardTeam == null)
            {
                return NotFound(new { message = "Team not found in the scoreboard" });
            }

            // Add the points to the team
            scoreboardTeam.Points = (scoreboardTeam.Points ?? 0) + pointsToAdd;
            scoreboardTeam.LastUpdated = DateTime.UtcNow;

            // Save changes to the database
            dbContext.SaveChanges();

            // Send the updated points to all connected clients
            await _hubContext.Clients.All.SendAsync("ReceiveScoreUpdate", scoreboardTeam.ScoreboardID, scoreboardTeam.TeamID, scoreboardTeam.Points);

            return Ok(scoreboardTeam);
        }

        [HttpPost]
        public IActionResult AddTeamToScoreboard(int teamId, int scoreboardId)
        {
            var scoreboardTeam = new ScoreBoardTeams
            {
                ScoreboardID = scoreboardId,
                TeamID = teamId
            };

            dbContext.ScoreboardTeams.Add(scoreboardTeam);
            dbContext.SaveChanges();
            return StatusCode(StatusCodes.Status201Created);
        }
    }
}