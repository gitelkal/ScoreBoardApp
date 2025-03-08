using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using server.Data;
using server.Handlers;
using server.Service;

namespace server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RegisterController : ControllerBase
    {
        private readonly ServerDbContext dbContext;
        private readonly JwtService _jwtService;

        public RegisterController(ServerDbContext dbContext, JwtService jwtService)
        {
            this.dbContext = dbContext;
            _jwtService = jwtService;
        }
        [HttpPost]
        public IActionResult CreateUser(Entities.UserDTO userDTO)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var objUser = dbContext.Users.FirstOrDefault(x => x.Username == userDTO.Username);
            var objEmail = dbContext.Users.FirstOrDefault(x => x.Email == userDTO.Email);

            if (objEmail != null)
            {
                return BadRequest("Email already exists");
            }
            if (objUser != null)
            {
                return BadRequest("Username already exists");
               
            }
            else
                dbContext.Users.Add(new User
                {
                    Email = userDTO.Email,
                    Firstname = userDTO.Firstname,
                    Lastname = userDTO.Lastname,
                    Username = userDTO.Username,
                    PasswordHash = PasswordHashHandler.HashPassword(userDTO.Password)
                });
            dbContext.SaveChanges();
            return StatusCode(StatusCodes.Status201Created);

        }
    }
}