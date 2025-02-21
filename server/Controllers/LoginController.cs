using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using server.Data;
using server.Entities;
using server.Service;

namespace server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LoginController : ControllerBase
    {
        private readonly ServerDbContext dbContext;
        private readonly JwtService _jwtService;

        public LoginController(ServerDbContext dbContext, JwtService jwtService)
        {
            this.dbContext = dbContext;
            _jwtService = jwtService;
        }

       
        [HttpPost]
        public async Task<IActionResult> Login(Entities.LoginDTO loginDTO)
        {
            var (loginResponse, errorMessage) = await _jwtService.Authenticate(loginDTO);

            if (loginResponse == null)
            {
                return Unauthorized(new ErrorResponseModel { Message = errorMessage ?? "Inloggningen misslyckades." });
            }

            return Ok(loginResponse);
        }
    }
}