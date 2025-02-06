namespace server
{
    public class Team
    {
        public int TeamId { get; set; } //this is the primary key
        public string TeamName { get; set; }
        public List<User> TeamMembers { get; set; }

    }
}
