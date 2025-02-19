using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using server.Data;
using server.Service;

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
        [HttpPost, Route("Register")]
        public IActionResult CreateAdmin(Entities.AdminDTO adminDTO)
        {   if(!ModelState.IsValid) return BadRequest(ModelState);
            
            var objAdmin = dbContext.Admins.FirstOrDefault(x => x.Username == adminDTO.Username);
            if(objAdmin == null)
            {
            dbContext.Admins.Add(new Admin
            {
                Firstname = adminDTO.Firstname,
                Lastname = adminDTO.Lastname,
                Username = adminDTO.Username,
                Password = adminDTO.Password
            });
            dbContext.SaveChanges();
            return StatusCode(StatusCodes.Status201Created);
            } else
                return BadRequest("Username already exists");
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
        
    }
}