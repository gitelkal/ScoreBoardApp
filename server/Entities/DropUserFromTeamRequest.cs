namespace server.Entities
{
    public class DropUserFromTeamRequest
    {
        public int TeamID { get; set; }
        public int UserID { get; set; }
    }
}
