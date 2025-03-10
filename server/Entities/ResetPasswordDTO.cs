using System.ComponentModel.DataAnnotations;

namespace server.Entities
{
    public class ResetPasswordDTO
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; }
        public string Token { get; set; }
        [Required]
        [MinLength(6)]
        public string NewPassword { get; set; }
    }
}
