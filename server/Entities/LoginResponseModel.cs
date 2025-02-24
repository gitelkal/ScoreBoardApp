namespace server.Entities
{
    public class LoginResponseModel
    {
        public int ID { get; set; }
        public string Username { get; set; }
        public string Firstname { get; set; }
        public string Lastname { get; set; }
        public string Token { get; set; }
        public int TokenExpiration { get; set; }
    }
}
