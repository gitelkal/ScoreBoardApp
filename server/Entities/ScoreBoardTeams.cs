using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace server;
public class ScoreBoardTeams
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int ScoreboardTeamID { get; set; }

    public int TeamID { get; set; }
    public int ScoreboardID { get; set; }

    // Additional fields
    public int? Points { get; set; }
    public DateTime? LastUpdated { get; set; }
}
