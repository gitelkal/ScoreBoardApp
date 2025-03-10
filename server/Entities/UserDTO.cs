namespace server.Entities
{
    public class UserDTO
    {
        public string? Email { get; set; } // Gör icke-nullable senare
        public string Firstname { get; set; }
        public string Lastname { get; set; }
        public string Username { get; set; }
        public string Password { get; set; }
    }
}
