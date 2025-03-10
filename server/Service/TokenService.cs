using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace server.Service
{
    public class TokenService
    {
        private readonly IConfiguration _configuration;

        public TokenService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public string GenerateToken(string username)
        {
            var issuer = _configuration["JwtConfig:Issuer"];
            var audience = _configuration["JwtConfig:Audience"];
            var key = _configuration["JwtConfig:Key"];
            var tokenValidity = _configuration["JwtConfig:TokenExpirationInMinutes"];
            var tokenExpiryTimeStamp = DateTime.Now.AddMinutes(Convert.ToDouble(tokenValidity));

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(
                new[]
                {
                    new Claim(JwtRegisteredClaimNames.Name, username),
                }),
                Expires = tokenExpiryTimeStamp,
                Issuer = issuer,
                Audience = audience,
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var securityToken = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(securityToken);
        }
    }
}