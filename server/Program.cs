using Microsoft.Data.SqlClient;
using Microsoft.OpenApi.Models;
using Dapper;

var builder = WebApplication.CreateBuilder(args);
builder.Configuration.AddUserSecrets<Program>();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "My API", Version = "v1" });
});

string? connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

if (string.IsNullOrEmpty(connectionString))
{
    throw new InvalidOperationException("Databasanslutningen saknas! Se till att User Secrets är korrekt konfigurerade.");
}

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "My API V1");
});

app.UseHttpsRedirection();

app.MapGet("/Teams", async () =>
{
    using var conn = new SqlConnection(connectionString);
    await conn.OpenAsync();
    var command = new SqlCommand("SELECT * FROM Teams", conn);
    using SqlDataReader reader = await command.ExecuteReaderAsync();
    List<string> teams = new List<string>();
    while (await reader.ReadAsync())
    {
        teams.Add($"{reader.GetInt32(0)}, {reader.GetString(1)}");
    }
    return string.Join("\n", teams);
});

app.MapGet("/Teams/{id}", (int id) =>
{
    using var conn = new SqlConnection(connectionString);
    conn.Open();
    var command = new SqlCommand("SELECT * FROM Teams WHERE TeamID = @id", conn);
    command.Parameters.AddWithValue("@id", id);
    using SqlDataReader reader = command.ExecuteReader();
    if (reader.HasRows)
    {
        reader.Read();
        return $"{reader.GetInt32(0)}, {reader.GetString(1)}";
    }
    return "Team not found";
});


app.MapGet("/ScoreboardTeams/{id}", (int id) =>
{
    using var conn = new SqlConnection(connectionString);
    conn.Open();

    var command = new SqlCommand(
        "SELECT T.Teamname, ST.Points, ST.LastUpdated " +
        "FROM Scoreboard_Teams ST " +
        "JOIN Teams T ON ST.TeamID = T.TeamID " +
        "WHERE ST.ScoreboardID = @scoreboardId", conn);

    command.Parameters.AddWithValue("@scoreboardId", id);

    using SqlDataReader reader = command.ExecuteReader();
    List<string> teamsInScoreboard = new List<string>();

    while (reader.Read())
    {
        string teamName = reader.GetString(0);
        int points = reader.GetInt32(1);
        DateTime lastUpdated = reader.GetDateTime(2);

        teamsInScoreboard.Add($"Team: {teamName}, Points: {points}, Last Updated: {lastUpdated}");
    }

    return teamsInScoreboard.Count > 0 ? string.Join("\n", teamsInScoreboard) : "No teams found for this scoreboard";
});

app.MapGet("/Scoreboards", async () =>
{
    using var conn = new SqlConnection(connectionString);
    await conn.OpenAsync();

    var scoreboards = await conn.QueryAsync("SELECT * FROM Scoreboards");

    return scoreboards.Any() ? Results.Json(scoreboards) : Results.Json(new { Message = "No scoreboards found" });
});


app.Run();
