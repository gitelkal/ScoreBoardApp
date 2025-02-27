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
        private readonly ServerDbContext dbContext;
        private readonly IHubContext<ScoreboardHub> _hubContext;

        public TeamUsersController(ServerDbContext dbContext, IHubContext<ScoreboardHub> hubContext)
        {
            this.dbContext = dbContext;
            _hubContext = hubContext;
        }

        [HttpGet]
        public IActionResult GetAllTeamUsers()
        {
            var teamsUsers = dbContext.Teams
                .Select(team => new
                {
                    Team = team,
                    Users = dbContext.TeamUsers
                        .Where(tu => tu.TeamID == team.TeamID)
                        .Join(dbContext.Users, tu => tu.UserId, user => user.UserId, (tu, user) => user)
                        .ToList()
                })
                .ToList();

            return Ok(teamsUsers);
        }

        [HttpGet]
        [Route("{teamId}")]
        public IActionResult GetTeamUsers(int teamId)
        {
            var teamUsers = dbContext.Teams
                .Where(team => team.TeamID == teamId)
                .Select(team => new
                {
                    Team = team,
                    Users = dbContext.TeamUsers
                        .Where(tu => tu.TeamID == team.TeamID)
                        .Join(dbContext.Users, tu => tu.UserId, user => user.UserId, (tu, user) => new
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
        [HttpPost]
        public async Task <IActionResult> AddUserToTeam([FromBody] AddUserToTeamRequest request)
        {
            var teamUser = new TeamUser
            {
                UserId = request.UserId,
                TeamID = request.TeamId
            };

            dbContext.TeamUsers.Add(teamUser);
            dbContext.SaveChanges();

            await _hubContext.Clients.All.SendAsync("ReceiveUserJoinedTeam", teamUser.TeamID, teamUser.UserId);

            return StatusCode(StatusCodes.Status201Created);
        }
    }
}
