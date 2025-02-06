using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using server.Data;

namespace server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AdminsController : ControllerBase
    {
        private readonly ServerDbContext dbContext;

        public AdminsController(ServerDbContext dbContext)
        {
            this.dbContext = dbContext;
        }

        [HttpGet]
        public IActionResult GetAllAdmins()
        {
            var admins = dbContext.Admins.ToList();

            return Ok(admins);
        }
        [HttpPost]
        public IActionResult CreateAdmin([FromBody] Admin admin)
        {
            dbContext.Admins.Add(admin);
            dbContext.SaveChanges();
            return StatusCode(StatusCodes.Status201Created);
        }
    }
}