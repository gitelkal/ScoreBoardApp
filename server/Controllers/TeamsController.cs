using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using server.Data;

namespace server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TeamsController : ControllerBase
    {
        private readonly ServerDbContext dbContext;

        public TeamsController(ServerDbContext dbContext)
        {
            this.dbContext = dbContext;
        }

        [HttpGet]
        public IActionResult GetAllTeams()
        {
            var teams = dbContext.Teams.ToList();
            var teamUsers = dbContext.TeamUsers.ToList();
            var users = dbContext.Users.ToList();

            var teamsWithUsers = teams
                .Select(team => new 
                {
                    Team = team,
                    Users = teamUsers
                        .Where(tu => tu.TeamId == team.TeamID)
                        .Join(users, tu => tu.UserId, user => user.UserId, (tu, user) => user)
                        .ToList()
                })
                .ToList();
            return Ok(teamsWithUsers);
        }
    }
}