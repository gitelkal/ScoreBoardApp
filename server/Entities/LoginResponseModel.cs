namespace server.Entities
{
    public class LoginResponseModel
    {
        public string Username { get; set; }
        public string Firstname { get; set; }
        public string Lastname { get; set; }
        public string Token { get; set; }
        public int TokenExpiration { get; set; }
    }
}
