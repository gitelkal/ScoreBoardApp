

namespace server
{
    public class ScoreBoard
    {
        public int ScoreBoardId {get;set;}
        public string? ScoreBoardName {get;set;} // kanske kolla non-nullable
        public List<Team> ScoreBoardTeams {get;set;}
        public DateTime StartedAt {get;set;}
        public DateTime EndedAt {get;set;}

    }
}