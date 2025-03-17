using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using server.Data;
using server.Entities;

namespace server.Controllers

{
    [Route("api/[controller]")]
    [ApiController]
    public class TeamUsersController : ControllerBase
    {
        private readonly ServerDbContext _dbContext;
        private readonly IHubContext<ScoreboardHub> _hubContext;

        public TeamUsersController(ServerDbContext dbContext, IHubContext<ScoreboardHub> hubContext)
        {
            this._dbContext = dbContext;
            _hubContext = hubContext;
        }

        [HttpGet]
        public IActionResult GetAllTeamUsers()
        {
            var teamsUsers = _dbContext.Teams
                .Select(team => new
                {
                    Team = team,
                    Users = _dbContext.TeamUsers
                        .Where(tu => tu.TeamID == team.TeamID)
                        .Join(_dbContext.Users, tu => tu.UserId, user => user.UserId, (tu, user) => user)
                        .ToList()
                })
                .ToList();

            return Ok(teamsUsers);
        }

        [HttpGet]
        [Route("{teamId}")]
        public IActionResult GetTeamUsers(int teamId)
        {
            var teamUsers = _dbContext.Teams
                .Where(team => team.TeamID == teamId)
                .Select(team => new
                {
                    Team = team,
                    Users = _dbContext.TeamUsers
                        .Where(tu => tu.TeamID == team.TeamID)
                        .Join(_dbContext.Users, tu => tu.UserId, user => user.UserId, (tu, user) => new
                        {
                            user.UserId,
                            user.Username,
                            user.Firstname,
                            user.Lastname
                        })
                        .ToList()
                })
                .FirstOrDefault();
            if (teamUsers == null)
            {
                return NotFound();
            }

            return Ok(teamUsers);

        }

        [HttpGet("{userId}/teams")]
        public IActionResult GetUserTeams(int userId)
        {
            var teams = _dbContext.TeamUsers
                .Where(tu => tu.UserId == userId)
                .Join(_dbContext.Teams,
                tu => tu.TeamID,
                t => t.TeamID,
                (tu, t) => new
                {
                    t.TeamID,
                    t.TeamName
                })
                .ToList();
            if (!teams.Any())
            {
                return NotFound(new { message = "Användaren tillhör inte något lag." });
            }
            return Ok(teams);
        }
        
        [HttpPost]
        public async Task <IActionResult> AddUserToTeam([FromBody] AddUserToTeamRequest request)
        {
            var teamUser = new TeamUser
            {
                UserId = request.UserId,
                TeamID = request.TeamId
            };

            _dbContext.TeamUsers.Add(teamUser);
            _dbContext.SaveChanges();

            await _hubContext.Clients.All.SendAsync("ReceiveUserJoinedTeam", teamUser.TeamID, teamUser.UserId);

            return StatusCode(StatusCodes.Status201Created);
        }

 

        [HttpDelete]
        public async Task <IActionResult> RemoveUserFromTeam(DropUserFromTeamRequest request)
        {
            var teamUser = _dbContext.TeamUsers
                .FirstOrDefault(tu => tu.TeamID == request.TeamID && tu.UserId == request.UserID);

            if (teamUser == null)
            {
                return NotFound(new { message = "Användaren finns inte i laget." });
            }

            _dbContext.TeamUsers.Remove(teamUser);
            _dbContext.SaveChanges();

            await _hubContext.Clients.All.SendAsync("ReceiveUserLeftTeam", teamUser.TeamID, teamUser.UserId);

            return Ok(new { message = "Användaren har tagits bort från laget." });
        }
    }
}
