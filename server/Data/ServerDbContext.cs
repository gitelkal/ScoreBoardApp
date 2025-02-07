using Microsoft.EntityFrameworkCore;


namespace server.Data
{
    public class ServerDbContext : DbContext
    {
        public ServerDbContext(DbContextOptions options) : base(options)
        {

        }
        public DbSet<User> Users { get; set; }
        public DbSet<Team> Teams { get; set; }
        public DbSet<Admin> Admins { get; set; }
        public DbSet<TeamUser> TeamUsers {get;set;}
        public DbSet<Scoreboard> ScoreBoards {get;set;}
        public DbSet<ScoreBoardTeams> ScoreboardTeams {get;set;}

    }
}