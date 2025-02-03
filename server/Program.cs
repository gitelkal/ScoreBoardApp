using Microsoft.Data.SqlClient;
using Microsoft.OpenApi.Models;

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

app.MapGet("/Users/{id}", (int id) =>
{
    using var conn = new SqlConnection(connectionString);
    conn.Open();
    var command = new SqlCommand("SELECT * FROM Users WHERE UserID = @id", conn);
    command.Parameters.AddWithValue("@id", id);
    using SqlDataReader reader = command.ExecuteReader();
    if (reader.HasRows)
    {
        reader.Read();
        return $"{reader.GetInt32(0)}, {reader.GetString(1)}, {reader.GetString(2)}";
    }
    return "User not found";
});

app.MapGet("/Teamusers/{id}", (int id) =>
{
    using var conn = new SqlConnection(connectionString);
    conn.Open();

    var command = new SqlCommand(
        "SELECT T.Teamname, U.Username FROM Users U " +
        "JOIN TeamUsers TU ON U.UserID = TU.UserID " +
        "JOIN Teams T ON TU.TeamID = T.TeamID " +
        "WHERE TU.TeamID = @teamId", conn);

    command.Parameters.AddWithValue("@teamId", id);

    using SqlDataReader reader = command.ExecuteReader();
    List<string> usersInTeam = new List<string>();

    while (reader.Read())
    {
        string teamName = reader.GetString(0);
        string username = reader.GetString(1);
        usersInTeam.Add($"Team: {teamName}, {username}");
    }

    return usersInTeam.Count > 0 ? string.Join(", ", usersInTeam) : "Team users not found";
});

app.Run();
