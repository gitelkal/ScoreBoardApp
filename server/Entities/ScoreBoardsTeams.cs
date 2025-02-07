namespace server;
public class ScoreboardTeam
{
    
    public int ScoreboardTeamID { get; set; }
    public int TeamID { get; set; }
    public int ScoreboardID { get; set; }

    
    // Additional fields
    public int? Points { get; set; } 
    public DateTime? LastUpdated { get; set; } 

}
