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


        [HttpPut("{teamid}/add-points")]
        public async Task<IActionResult> AddPointsToTeamAsync(int id, int pointsToAdd)
        {
            var team = dbContext.ScoreboardTeams.FirstOrDefault(t => t.ScoreboardTeamID == id);

            if (team == null)
            {
                return NotFound(new { message = "Team not found" });
            }

            team.Points = (team.Points ?? 0) + pointsToAdd;
            team.LastUpdated = DateTime.UtcNow; 

            dbContext.SaveChanges();

            await _hubContext.Clients.All.SendAsync("ReceiveScoreUpdate", id, team.Points);

            return Ok(team);
        }
    }
}