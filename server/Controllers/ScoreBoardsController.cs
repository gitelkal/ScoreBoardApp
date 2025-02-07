using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using server.Data;

namespace server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ScoreboardsController : ControllerBase
    {
        private readonly ServerDbContext dbContext;

        public ScoreboardsController(ServerDbContext dbContext)
        {
            this.dbContext = dbContext;
        }

        [HttpGet]
        public IActionResult GetAllScoreboards()
{
        var scoreBoards = dbContext.ScoreBoards.ToList();
        

        return Ok(scoreBoards);
    }
    }
}