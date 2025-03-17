using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using server.Data;
using server.Entities;
using System.Net;
using RestSharp;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using server.Handlers;
using server.Service;

namespace server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AccountController : Controller
    {
        private readonly ServerDbContext _dbContext;
        private readonly IConfiguration _configuration;
        private readonly TokenService _tokenService;
        private readonly JwtService _jwtService;
        private readonly FormattingHandler _format;

        public AccountController(ServerDbContext dbContext, IConfiguration configuration, TokenService tokenService, JwtService jwtService, FormattingHandler format)
        {
            _dbContext = dbContext;
            _configuration = configuration;
            _tokenService = tokenService;
            _jwtService = jwtService;
            _format = format;
        }

        [AllowAnonymous]
        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDTO forgotPasswordDTO)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest();
            }

            var user = await _dbContext.Users.FirstOrDefaultAsync(x => x.Email == forgotPasswordDTO.Email);

            if (user == null)
            {
                return BadRequest("Ingen användare hittades med e-posten du angav");
            }

            var claims = new List<Claim>
                    {
                        new Claim(ClaimTypes.Email, user.Email ?? string.Empty)
                    };

            var TokenExpiryTimeStamp = DateTime.UtcNow.AddHours(1);
            var accessToken = _tokenService.GenerateToken(user.Username);

            var resetLink = $"http://localhost:4200/reset-password?email={user.Email}&token={WebUtility.UrlEncode(accessToken)}&expires={TokenExpiryTimeStamp:o}";

            var client = new RestClient("https://send.api.mailtrap.io/api/send");
            var request = new RestRequest
            {
                Method = Method.Post,
                RequestFormat = DataFormat.Json,
            };

            var authToken = _configuration["Mailtrap:ApiToken"];
            request.AddHeader("Authorization", $"Bearer {authToken}");
            request.AddHeader("Content-Type", "application/json");

            var requestBody = new
            {
                from = new { email = _configuration["Mailtrap:E-Mail"] },
                to = new[] { new { email = user.Email.ToLower() } },
                template_uuid = _configuration["Mailtrap:UUID"],
                template_variables = new { user_email = user.Email.ToLower(), pass_reset_link = resetLink }
            };

            request.AddJsonBody(requestBody);

            var response = client.Execute(request);

            if (response.IsSuccessful)
            {
                return Ok();
            }
            else
            {
                return BadRequest(response.Content?.ToString());
            }
        }

        [AllowAnonymous]
        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDTO resetPasswordDTO)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest();
            }

            var user = await _dbContext.Users.FirstOrDefaultAsync(x => x.Email == resetPasswordDTO.Email);
            if (user == null)
            {
                return BadRequest("Ingen användare hittades med e-posten du angav");
            }

            var validatedUsername = _tokenService.ValidateToken(resetPasswordDTO.Token);

            if (validatedUsername == null)
            {
                return BadRequest("Ogiltig eller utgången token");
            }
            
            user.PasswordHash = PasswordHashHandler.HashPassword(resetPasswordDTO.NewPassword);
            _dbContext.Users.Update(user);
            await _dbContext.SaveChangesAsync();
            return Ok();
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(Entities.LoginDTO loginDTO)
        {
            var (loginResponse, errorMessage) = await _jwtService.Authenticate(loginDTO);

            if (loginResponse == null)
            {
                return Unauthorized(new ErrorResponseModel { Message = errorMessage ?? "Inloggningen misslyckades." });
            }

            return Ok(loginResponse);
        }

        [HttpPost("register")]
        public IActionResult CreateUser(Entities.UserDTO userDTO)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var objUser = _dbContext.Users.FirstOrDefault(x => x.Username == userDTO.Username);
            var objEmail = _dbContext.Users.FirstOrDefault(x => x.Email == userDTO.Email);

            if (objEmail != null)
            {
                return Conflict(new { message = "Email already exists" });
            }
            if (objUser != null)
            {
                return Conflict(new { message = "Username already exists" });
            }

            else
                _dbContext.Users.Add(new User
                {
                    Email = userDTO.Email.ToLower(),
                    Firstname = _format.CapitalCase(userDTO.Firstname),
                    Lastname = _format.CapitalCase(userDTO.Lastname),
                    Username = userDTO.Username.ToLower(),
                    PasswordHash = PasswordHashHandler.HashPassword(userDTO.Password)
                });
            _dbContext.SaveChanges();
            return StatusCode(StatusCodes.Status201Created);

        }
    }
}
