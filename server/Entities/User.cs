﻿
namespace server
{
    public class User
    {
        public int UserId { get; set; }
        public string UserName { get; set; }
        public string PasswordHash { get; set; }
        // can add user creation date, etc.  
    }
}
