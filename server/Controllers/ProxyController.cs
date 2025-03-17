using Microsoft.AspNetCore.Mvc;
using System.Net.Http.Headers;

[ApiController]
[Route("api/[controller]")]
public class ProxyController : ControllerBase
{
    private readonly HttpClient _httpClient;

    public ProxyController(HttpClient httpClient)
    {
        _httpClient = httpClient;
        _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", "M45GC5wH84s2n0TEFrhOdmfSxuLq4et4DohWSkFBQHBwlfHkh31rwSfutDmWCler");
        _httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
    }

    [HttpGet("user-image")]
    public async Task<IActionResult> GetUserImage()
    {
        var response = await _httpClient.GetAsync("https://api.iconfinder.com/v4/icons/549764");
        if (response.IsSuccessStatusCode)
        {
            var data = await response.Content.ReadAsStringAsync();
            return Ok(data);
        }
        return StatusCode((int)response.StatusCode, "Error fetching data");
    }

    [HttpGet("team-image")]
    public async Task<IActionResult> GetTeamImage()
    {
        var response = await _httpClient.GetAsync("https://api.iconfinder.com/v4/icons/4629458");
        if (response.IsSuccessStatusCode)
        {
            var data = await response.Content.ReadAsStringAsync();
            return Ok(data);
        }
        return StatusCode((int)response.StatusCode, "Error fetching data");
    }

    [HttpGet("scoreboard-image")]
    public async Task<IActionResult> GetScoreboardImage()
    {
        var response = await _httpClient.GetAsync("https://api.iconfinder.com/v4/icons/6843056");
        if (response.IsSuccessStatusCode)
        {
            var data = await response.Content.ReadAsStringAsync();
            return Ok(data);
        }
        return StatusCode((int)response.StatusCode, "Error fetching data");
    }
}
