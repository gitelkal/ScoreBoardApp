using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

public class ScoreboardHub : Hub
{
    public async Task SendScoreUpdate(int ScoreboardId, int teamId, int newPoints)
    {
        await Clients.All.SendAsync("ReceiveScoreUpdate", ScoreboardId, newPoints);
    }
    public async Task NotifyUserJoinedTeam(int teamId, int userId)
    {
        await Clients.All.SendAsync("UserJoinedTeam", teamId, userId);
    }
    public async Task NotifyScoreboardCreated(int scoreboardId)
    {
        await Clients.All.SendAsync("ScoreboardCreated", scoreboardId);
    }
}
