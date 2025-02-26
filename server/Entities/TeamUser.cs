using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace server
{
public class TeamUser
{
    [Key]
    [JsonIgnore]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int TeamUserId { get; set; }  
    public int TeamID { get; set; }  
    public int UserId { get; set; }  
    public Team Team { get; set; }
    public User User { get; set; }
}
}
