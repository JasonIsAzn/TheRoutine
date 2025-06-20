using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TheRoutineWeb.Data;
using TheRoutineWeb.Models;

namespace TheRoutineWeb.Controllers.Api
{
    [Route("api/[controller]")]
    [ApiController]
    public class WorkoutSessionExerciseApiController : ControllerBase
    {
        private readonly AppDbContext _context;

        public WorkoutSessionExerciseApiController(AppDbContext context)
        {
            _context = context;
        }

        // GET all non-deleted exercises for a session
        [HttpGet("by-session")]
        public async Task<IActionResult> GetBySession([FromQuery] int sessionId)
        {
            var exercises = await _context.WorkoutSessionExercises
                .Where(e => e.WorkoutSessionId == sessionId && !e.IsDeleted)
                .OrderBy(e => e.Order)
                .ToListAsync();

            return Ok(exercises);
        }

        // POST a new custom exercise to a session
        [HttpPost]
        public async Task<IActionResult> AddExercise([FromBody] WorkoutSessionExercise exercise)
        {
            _context.WorkoutSessionExercises.Add(exercise);
            await _context.SaveChangesAsync();
            return Ok(exercise);
        }

        // PUT toggle completion
        [HttpPut("{id}/toggle-complete")]
        public async Task<IActionResult> ToggleComplete(int id)
        {
            var exercise = await _context.WorkoutSessionExercises.FindAsync(id);
            if (exercise == null) return NotFound();

            exercise.IsCompleted = !exercise.IsCompleted;
            await _context.SaveChangesAsync();
            return Ok(exercise);
        }

        // PUT toggle skipped
        [HttpPut("{id}/toggle-skip")]
        public async Task<IActionResult> ToggleSkip(int id)
        {
            var exercise = await _context.WorkoutSessionExercises.FindAsync(id);
            if (exercise == null) return NotFound();

            exercise.IsSkipped = !exercise.IsSkipped;
            await _context.SaveChangesAsync();
            return Ok(exercise);
        }

        // PUT update order
        [HttpPut("{id}/order")]
        public async Task<IActionResult> UpdateOrder(int id, [FromBody] int newOrder)
        {
            var exercise = await _context.WorkoutSessionExercises.FindAsync(id);
            if (exercise == null) return NotFound();

            exercise.Order = newOrder;
            await _context.SaveChangesAsync();
            return Ok(exercise);
        }

        // PUT soft delete
        [HttpPut("{id}/soft-delete")]
        public async Task<IActionResult> SoftDelete(int id)
        {
            var exercise = await _context.WorkoutSessionExercises.FindAsync(id);
            if (exercise == null) return NotFound();

            exercise.IsDeleted = true;
            await _context.SaveChangesAsync();
            return Ok(new { message = "Exercise soft-deleted." });
        }

        // PUT update name / weight (optional)
        [HttpPut("{id}/update")]
        public async Task<IActionResult> UpdateDetails(int id, [FromBody] WorkoutSessionExercise updates)
        {
            var exercise = await _context.WorkoutSessionExercises.FindAsync(id);
            if (exercise == null) return NotFound();

            exercise.Name = updates.Name;
            exercise.Muscles = updates.Muscles;
            exercise.Weight = updates.Weight;
            await _context.SaveChangesAsync();

            return Ok(exercise);
        }
    }
}
