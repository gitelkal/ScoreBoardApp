using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using server.Data;
using server.Entities;
using server.Handlers;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace server.Service
{
    public class JwtService
    {
        private readonly ServerDbContext _dbContext;
        private readonly IConfiguration _configuration;

        public JwtService(ServerDbContext dbContext, IConfiguration configuration)
        {
            _dbContext = dbContext;
            _configuration = configuration;
        }

        public async Task<LoginResponseModel?> Authenticate(LoginDTO request)
        {
            if (string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Password))
            {
                return null;
            }

            var adminAccount = await _dbContext.Admins.FirstOrDefaultAsync(x => x.Username == request.Username);
            if (!(adminAccount is not null && PasswordHashHandler.VerifyPassword(request.Password, adminAccount.Password)))
            {
                return null;
            }
            var issuer = _configuration["JwtConfig:Issuer"];
            var audience = _configuration["JwtConfig:Audience"];
            var key = _configuration["JwtConfig:Key"];
            var tokenValidity = _configuration["JwtConfig:TokenExpirationInMinutes"];
            var tokenExpiryTimeStamp = DateTime.Now.AddMinutes(Convert.ToDouble(tokenValidity));

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(
                [
                    new Claim(JwtRegisteredClaimNames.Name, request.Username),
                ]),
                Expires = tokenExpiryTimeStamp,
                Issuer = issuer,
                Audience = audience,
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var securityToken = tokenHandler.CreateToken(tokenDescriptor);
            var accessToken = tokenHandler.WriteToken(securityToken);
            return new LoginResponseModel
            {
                Firstname = adminAccount.Firstname,
                Lastname = adminAccount.Lastname,
                Username = request.Username,
                Token = accessToken,
                TokenExpiration = (int)tokenExpiryTimeStamp.Subtract(DateTime.Now).TotalSeconds
            };
        }
        }
    }
