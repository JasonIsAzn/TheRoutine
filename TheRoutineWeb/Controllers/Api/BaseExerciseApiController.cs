using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TheRoutineWeb.Data;
using TheRoutineWeb.Models;
using System.Net.Http.Json;

namespace TheRoutineWeb.Controllers.Api
{
    [Route("api/[controller]")]
    [ApiController]
    public class BaseExerciseApiController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly HttpClient _http;

        public BaseExerciseApiController(AppDbContext context)
        {
            _context = context;
            _http = new HttpClient();
        }

        [HttpPost("refresh")]
        public async Task<IActionResult> RefreshBaseExercises()
        {
            const string apiUrl = "https://wger.de/api/v2/exerciseinfo/?language=2&limit=1000";

            try
            {
                var httpResponse = await _http.GetAsync(apiUrl);

                if (!httpResponse.IsSuccessStatusCode)
                    return StatusCode((int)httpResponse.StatusCode, new { message = "Failed to reach Wger API." });

                var rawJson = await httpResponse.Content.ReadAsStringAsync();

                var response = System.Text.Json.JsonSerializer.Deserialize<WgerExerciseResponse>(rawJson,
                    new System.Text.Json.JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true
                    });

                if (response?.Results == null)
                    return BadRequest(new { message = "Failed to deserialize exercise data." });

                var newExercises = response.Results
                    .Select(e =>
                    {
                        var translation = e.Translations.FirstOrDefault(t => t.Language == 2);
                        return new BaseExercise
                        {
                            Name = translation?.Name ?? "Unnamed Exercise",
                            Muscles = e.Muscles.Select(m => m.Name).ToList(),
                            Equipment = e.Equipment.FirstOrDefault()?.Name
                        };
                    })
                    .Where(ex => !string.IsNullOrWhiteSpace(ex.Name))
                    .ToList();

                _context.BaseExercises.RemoveRange(_context.BaseExercises);
                _context.BaseExercises.AddRange(newExercises);
                await _context.SaveChangesAsync();

                return Ok(new { message = $"Seeded {newExercises.Count} exercises." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to refresh exercises.", error = ex.Message });
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetAllBaseExercises()
        {
            var exercises = await _context.BaseExercises.ToListAsync();
            return Ok(exercises);
        }

    }

    public class WgerExerciseResponse
    {
        public List<WgerExercise> Results { get; set; } = new();
    }

    public class WgerExercise
    {
        public List<WgerTranslation> Translations { get; set; } = new();
        public List<WgerMuscle> Muscles { get; set; } = new();
        public List<WgerEquipment> Equipment { get; set; } = new();
    }

    public class WgerTranslation
    {
        public int Language { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
    }

    public class WgerMuscle
    {
        public string Name { get; set; } = string.Empty;
    }

    public class WgerEquipment
    {
        public string Name { get; set; } = string.Empty;
    }
}
