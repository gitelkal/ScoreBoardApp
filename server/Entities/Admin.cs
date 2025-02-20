using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace server
{
    public class Admin
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int AdminID { get;set; }
        public string? Firstname { get; set; }
        public string? Lastname { get; set; }
        public string Username { get; set; }
        public string? Password { get; set; }

        // public User PrivilegedUser {get;set;}

    }
}