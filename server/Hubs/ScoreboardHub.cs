using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

public class ScoreboardHub : Hub
{
    public async Task SendScoreUpdate(int teamId, int newPoints)
    {
        await Clients.All.SendAsync("ReceiveScoreUpdate", teamId, newPoints);
    }
}
