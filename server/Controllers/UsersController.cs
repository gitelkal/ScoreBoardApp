using System.Diagnostics.SymbolStore;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using server.Data;

namespace server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly ServerDbContext dbContext;

        public UsersController(ServerDbContext dbContext)
        {
            this.dbContext = dbContext;
        }

        [HttpGet]
        public IActionResult GetAllUsers()
        {
            var users = dbContext.Users.ToList();
            return Ok(users);
        }

        [HttpGet]
        [Route("{id}")]
        public IActionResult GetOneUser(int id)
        {
            var user = dbContext.Users.Find(id);
            if (user == null)
            {
                return NotFound();
            }
            return Ok(user);
        }

        [HttpPost]
        public IActionResult CreateUser([FromBody] User user)
        {
            dbContext.Users.Add(user);
            dbContext.SaveChanges();
            return StatusCode(StatusCodes.Status201Created);
        }


        [HttpDelete]
        [Route("{id}")]
        public IActionResult DeleteUser(int id)
        {
            var user = dbContext.Users.Find(id);
            if (user == null)
            {
                return NotFound(new { message = "Användaren hittades inte." });
            }

            var admin = dbContext.Admins.FirstOrDefault(a => a.Username == user.        Username);
            if (admin != null)
            {
                dbContext.Admins.Remove(admin); // Ta bort användaren från      admin-tabellen
            }

            dbContext.Users.Remove(user); // Ta bort användaren
            dbContext.SaveChanges();

            return Ok(new { message = "Användaren och dess admin-roll har tagits bort." });
        }

    }
}
