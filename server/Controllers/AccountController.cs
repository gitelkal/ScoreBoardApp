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
        private readonly ServerDbContext dbContext;
        private readonly IConfiguration configuration;
        private readonly TokenService tokenService;

        public AccountController(ServerDbContext dbContext, IConfiguration configuration, TokenService tokenService)
        {
            this.dbContext = dbContext;
            this.configuration = configuration;
            this.tokenService = tokenService;
        }

        [AllowAnonymous]
        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDTO forgotPasswordDTO)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest();
            }

            var user = await dbContext.Users.FirstOrDefaultAsync(x => x.Email == forgotPasswordDTO.Email);

            if (user == null)
            {
                return BadRequest("Ingen användare hittades med e-posten du angav");
            }

            var claims = new List<Claim>
                    {
                        new Claim(ClaimTypes.Email, user.Email ?? string.Empty)
                    };

            //var TokenExpiryTimeStamp = DateTime.UtcNow.AddHours(1);
            var accessToken = tokenService.GenerateToken(user.Username);
            var resetLink = $"http://localhost:4200/reset-password?email={user.Email}&token={WebUtility.UrlEncode(accessToken)}";

            var client = new RestClient("https://send.api.mailtrap.io/api/send");
            var request = new RestRequest
            {
                Method = Method.Post,
                RequestFormat = DataFormat.Json,
            };

            var authToken = configuration["Mailtrap:ApiToken"];
            request.AddHeader("Authorization", $"Bearer {authToken}");
            request.AddHeader("Content-Type", "application/json");

            var requestBody = new
            {
                from = new { email = "hello@demomailtrap.co" },
                to = new[] { new { email = user.Email.ToLower() } },
                template_uuid = configuration["Mailtrap:UUID"],
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

            var user = await dbContext.Users.FirstOrDefaultAsync(x => x.Email == resetPasswordDTO.Email);
            if (user == null)
            {
                return BadRequest("Ingen användare hittades med e-posten du angav");
            }

            resetPasswordDTO.Token = WebUtility.UrlDecode(resetPasswordDTO.Token); // Försök att fixa något faktiskt kontroll om det finns tid

            user.PasswordHash = PasswordHashHandler.HashPassword(resetPasswordDTO.NewPassword);
            dbContext.Users.Update(user);
            await dbContext.SaveChangesAsync();
            return Ok();
        }
    }
}
