

namespace server
{
    public class Scoreboard
    {
        public int ScoreboardId { get; set; }    
        public DateTime? EndedAt { get; set; }     
        public string Name { get; set; }         
        public DateTime StartedAt { get; set; } 
        public Boolean Active { get; set; }

    }
}