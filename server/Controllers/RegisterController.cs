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
        public IActionResult CreateAdmin(Entities.AdminDTO adminDTO)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var objAdmin = dbContext.Admins.FirstOrDefault(x => x.Username == adminDTO.Username);
            if (objAdmin == null)
            {
                dbContext.Admins.Add(new Admin
                {
                    Firstname = adminDTO.Firstname,
                    Lastname = adminDTO.Lastname,
                    Username = adminDTO.Username,
                    Password = PasswordHashHandler.HashPassword(adminDTO.Password)
                });
                dbContext.SaveChanges();
                return StatusCode(StatusCodes.Status201Created);
            }
            else
                return BadRequest("Username already exists");
        }
    }
}