using Microsoft.AspNetCore.Mvc;
using server.Data;
using server.Entities;

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
        [HttpGet]
        [Route("{id}")]
        public IActionResult GetAdmin(int id)
        {
            var admin = dbContext.Admins.Find(id);
            if (admin == null)
            {
                return NotFound();
            }
            return Ok(admin);
        }
        [HttpDelete]
        [Route("{id}")]
        public IActionResult DeleteAdmin(int id)
        {
            var admin = dbContext.Admins.Find(id);
            if (admin == null)
            {
                return NotFound();
            }
            dbContext.Admins.Remove(admin);
            dbContext.SaveChanges();
            return Ok();
        }

        [HttpPost]
        [Route("check")]
        public IActionResult AdminCheck(Entities.AdminCheckDTO adminCheckDTO)
        {
            var admin = dbContext.Admins.FirstOrDefault(x => x.Username == adminCheckDTO.Username);
            if (admin == null)
            {
                return NotFound();
            }
            return Ok(new { Success = true });
        }

        [HttpPost]
        public IActionResult CreateAdmin([FromBody]CreateAdminDTO admin)
        {
            var objAdmin = dbContext.Admins.FirstOrDefault(x => x.Username == admin.Username);
            if (objAdmin == null) {
                dbContext.Admins.Add(new Admin { Username = admin.Username });
                dbContext.SaveChanges();
                return StatusCode(StatusCodes.Status201Created);
            } else
            return BadRequest("Username already exists");
        }  
    }
}

