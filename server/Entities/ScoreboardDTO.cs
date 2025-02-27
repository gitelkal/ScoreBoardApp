namespace server.Entities
{

public class ScoreboardDTO
{
    public string Name { get; set; }
    public DateTime? StartedAt { get; set; }
    public DateTime? EndedAt { get; set; }
    public string Description { get; set; }
    public bool Active { get; set; }
}



}