using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace server
{
    public class Scoreboard
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ScoreboardId { get; set; }
        public string Name { get; set; }
        public string? Description { get; set; }
        public DateTime? EndedAt { get; set; }     
        public DateTime StartedAt { get; set; }  
        public Boolean Active {  get; set; }
    }
}