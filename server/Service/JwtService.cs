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
        private readonly TokenService _tokenService;

        public JwtService(ServerDbContext dbContext, IConfiguration configuration, TokenService tokenService)
        {
            _dbContext = dbContext;
            _configuration = configuration;
            _tokenService = tokenService;
        }

        public async Task<(LoginResponseModel? loginResponse, string? errorMessage)> Authenticate(LoginDTO request)
        {
            var account = await _dbContext.Users.FirstOrDefaultAsync(x => x.Username == request.Username);
            var isAdmin = await _dbContext.Admins.FirstOrDefaultAsync(x => x.Username == request.Username);
            Boolean admin = false;

            if (!(account is not null && PasswordHashHandler.VerifyPassword(request.Password, account.PasswordHash)))
            if (account == null)
            {
                return (null, "Fel användarnamn");
            }
            if (!PasswordHashHandler.VerifyPassword(request.Password, account.PasswordHash))
            {
                return (null, "Fel lösenord");
            }
            if (isAdmin!=null)
            {
                admin = true;
            }

            var tokenValidity = _configuration["JwtConfig:TokenExpirationInMinutes"];
            var tokenExpiryTimeStamp = DateTime.Now.AddMinutes(Convert.ToDouble(tokenValidity));

            var accessToken = _tokenService.GenerateToken(request.Username);

            return (new LoginResponseModel
            {
                ID = account.UserId,
                Firstname = account.Firstname,
                Lastname = account.Lastname,
                Username = request.Username,
                Token = accessToken,
                TokenExpiration = (int)tokenExpiryTimeStamp.Subtract(DateTime.Now).TotalSeconds,
                admin = admin
            }, null);
        }
    }
    }
