using Microsoft.AspNetCore.Mvc;
using TheRoutineWeb.Models;
using TheRoutineWeb.Data;
using Microsoft.EntityFrameworkCore;

namespace TheRoutineWeb.Controllers.Api
{
    [Route("api/[controller]")]
    [ApiController]
    public class WorkoutSessionApiController : ControllerBase
    {
        private readonly AppDbContext _context;

        public WorkoutSessionApiController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("by-date")]
        public async Task<IActionResult> GetByDate([FromQuery] int userId, [FromQuery] DateTime date)
        {
            var session = await _context.WorkoutSessions
                .Include(s => s.Exercises.Where(e => !e.IsDeleted))
                .FirstOrDefaultAsync(s => s.UserId == userId && s.Date.Date == date.Date);

            if (session == null)
                return NotFound(new { message = "No session found for this date." });

            return Ok(session);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateWorkoutSessionRequest request)
        {
            var cycle = await _context.WorkoutCycles
                .Include(c => c.WorkoutPlan)
                    .ThenInclude(p => p.WorkoutDays)
                        .ThenInclude(d => d.Exercises)
                .FirstOrDefaultAsync(c => c.Id == request.WorkoutCycleId && c.UserId == request.UserId);

            if (cycle == null)
                return BadRequest(new { message = "Workout cycle not found." });

            var dayOrderMap = cycle.DayOrderMap;
            if (request.CycleDayIndex < 0 || request.CycleDayIndex >= dayOrderMap.Count)
                return BadRequest(new { message = "Invalid cycle day index." });

            int mappedDayOrder = dayOrderMap[request.CycleDayIndex];

            var matchingDay = cycle.WorkoutPlan.WorkoutDays.FirstOrDefault(d => d.Order == mappedDayOrder);
            if (matchingDay == null)
                return BadRequest(new { message = "No matching day in plan." });

            var session = new WorkoutSession
            {
                UserId = request.UserId,
                WorkoutCycleId = request.WorkoutCycleId,
                Date = request.Date.Date,
                DayIndex = mappedDayOrder,
                Label = matchingDay.Label,
                Exercises = matchingDay.Exercises.Select(e => new WorkoutSessionExercise
                {
                    Name = e.Name,
                    Muscles = e.Muscles,
                    Order = e.Order,
                    IsOptional = e.IsOptional,
                    IsCompleted = false,
                    IsSkipped = false,
                    IsDeleted = false,
                    Weight = null
                }).ToList()
            };

            _context.WorkoutSessions.Add(session);
            await _context.SaveChangesAsync();

            return Ok(new { sessionId = session.Id });
        }


        [HttpDelete("{sessionId}")]
        public async Task<IActionResult> Delete(int sessionId)
        {
            var session = await _context.WorkoutSessions.FindAsync(sessionId);
            if (session == null)
                return NotFound();

            _context.WorkoutSessions.Remove(session);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Workout session deleted." });
        }
    }
    public class CreateWorkoutSessionRequest
    {
        public int UserId { get; set; }
        public int WorkoutCycleId { get; set; }
        public int CycleDayIndex { get; set; }
        public DateTime Date { get; set; }
    }


}
