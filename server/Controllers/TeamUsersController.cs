﻿using Microsoft.AspNetCore.Mvc;
using server.Data;

namespace server.Controllers

{
    [Route("api/[controller]")]
    [ApiController]
    public class TeamUsersController : ControllerBase
    {
        private readonly ServerDbContext dbContext;

        public TeamUsersController(ServerDbContext dbContext)
        {
            this.dbContext = dbContext;
        }

        [HttpGet]
        public IActionResult GetAllTeamUsers()
        {
            var teamsUsers = dbContext.Teams
                .Select(team => new
                {
                    Team = team,
                    Users = dbContext.TeamUsers
                        .Where(tu => tu.TeamId == team.TeamID)
                        .Join(dbContext.Users, tu => tu.UserId, user => user.UserId, (tu, user) => user)
                        .ToList()
                })
                .ToList();

            return Ok(teamsUsers);
        }

        [HttpGet]
        [Route("{teamid}")]
        public IActionResult GetTeamUsers(int id)
        {
            var teamUsers = dbContext.Teams
                .Where(team => team.TeamID == id) 
                .Select(team => new
                {
                    Team = team,
                    Users = dbContext.TeamUsers
                        .Where(tu => tu.TeamId == team.TeamID) 
                        .Join(dbContext.Users, tu => tu.UserId, user => user.UserId, (tu, user) => user)
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
        public IActionResult AddUserToTeam(int userId, int teamId)
        {
            var teamUser = new TeamUser
            {
                UserId = userId,
                TeamId = teamId
            };

            dbContext.TeamUsers.Add(teamUser);
            dbContext.SaveChanges();
            return StatusCode(StatusCodes.Status201Created);
        }
    }
}
