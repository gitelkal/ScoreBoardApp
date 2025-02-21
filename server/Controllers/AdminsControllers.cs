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