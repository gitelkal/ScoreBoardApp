namespace server
{
public class TeamUser
{
    public int TeamUserId { get; set; }  
    public int TeamId { get; set; }  
    public int UserId { get; set; }  
    public Team Team { get; set; }
    public User User { get; set; }
}
}
