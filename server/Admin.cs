

namespace server
{
    public class Admin
    {
        public int AdminId {get;set;}
        public User PrivilegedUser {get;set;}

    public Admin(User user)
    {
        PrivilegedUser = user;
    }
    }
}