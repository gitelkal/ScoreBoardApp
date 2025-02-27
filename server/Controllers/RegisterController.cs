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
        public IActionResult CreateAdmin(Entities.UserDTO userDTO)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var objAdmin = dbContext.Users.FirstOrDefault(x => x.Username == userDTO.Username);
            if (objAdmin == null)
            {
                dbContext.Users.Add(new User
                {
                    Firstname = userDTO.Firstname,
                    Lastname = userDTO.Lastname,
                    Username = userDTO.Username,
                    PasswordHash = PasswordHashHandler.HashPassword(userDTO.Password)
                });
                dbContext.SaveChanges();
                return StatusCode(StatusCodes.Status201Created);
            }
            else
                return BadRequest("Username already exists");
        }
    }
}