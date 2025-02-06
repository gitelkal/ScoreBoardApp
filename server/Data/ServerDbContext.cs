using Microsoft.EntityFrameworkCore;


namespace server.Data
{
    public class ServerDbContext : DbContext
    {
        public ServerDbContext(DbContextOptions options) : base(options)
        {

        }

        public DbSet<Team> Teams { get; set; }
        public DbSet<Admin> Admins { get; set; }
    }
}