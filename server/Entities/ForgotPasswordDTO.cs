using System.ComponentModel.DataAnnotations;

namespace server.Entities
{
    public class ForgotPasswordDTO
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; }

    }
}
