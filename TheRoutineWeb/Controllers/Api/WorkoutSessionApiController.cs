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
                .FirstOrDefaultAsync(s =>
                    s.UserId == userId &&
                    s.Date >= date.Date &&
                    s.Date < date.Date.AddDays(1));

            if (session == null)
                return NotFound(new { message = "No session found for that date." });

            var dto = new WorkoutSessionDto
            {
                Id = session.Id,
                UserId = session.UserId,
                WorkoutCycleId = session.WorkoutCycleId,
                Date = session.Date,
                IsCompleted = session.IsCompleted,
                Exercises = session.Exercises.Select(e =>
                {
                    return new WorkoutSessionExerciseDto
                    {
                        WorkoutSessionId = e.WorkoutSessionId,
                        Name = e.Name,
                        Muscles = e.Muscles,
                        IsOptional = e.IsOptional,
                        Order = e.Order,
                        Weight = e.Weight,
                        IsCompleted = e.IsCompleted,
                        IsSkipped = e.IsSkipped,
                        IsDeleted = e.IsDeleted,
                        BaseExerciseId = e.BaseExerciseId
                    };
                }).ToList()
            };

            return Ok(dto);
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
                IsCompleted = matchingDay.Exercises.Count == 0,
                Exercises = matchingDay.Exercises.Select(e => new WorkoutSessionExercise
                {
                    Name = e.Name,
                    Muscles = e.Muscles,
                    Order = e.Order,
                    IsOptional = e.IsOptional,
                    BaseExerciseId = e.BaseExerciseId,
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

        [HttpPatch("{id}/mark-complete")]
        public async Task<IActionResult> MarkComplete(int id)
        {
            var session = await _context.WorkoutSessions.FindAsync(id);
            if (session == null) return NotFound();

            session.IsCompleted = true;
            await _context.SaveChangesAsync();
            return Ok();
        }

        [HttpGet("all")]
        public IActionResult GetAllSessions(int userId)
        {
            if (userId <= 0)
            {
                return BadRequest("Invalid userId.");
            }

            try
            {
                var sessions = _context.WorkoutSessions
                    .Include(s => s.Exercises)
                    .Where(s => s.UserId == userId)
                    .ToList();

                var sessionDtos = sessions.Select(s => new WorkoutSessionDto
                {
                    Id = s.Id,
                    UserId = s.UserId,
                    WorkoutCycleId = s.WorkoutCycleId,
                    CycleDayIndex = s.DayIndex,
                    Label = s.Label,
                    IsCompleted = s.IsCompleted,
                    Date = s.Date,
                    Exercises = s.Exercises.Select(e => new WorkoutSessionExerciseDto
                    {
                        WorkoutSessionId = e.WorkoutSessionId,
                        Name = e.Name,
                        Muscles = e.Muscles,
                        Order = e.Order,
                        Weight = e.Weight,
                        IsOptional = e.IsOptional,
                        IsCompleted = e.IsCompleted,
                        IsSkipped = e.IsSkipped,
                        IsDeleted = e.IsDeleted,
                        BaseExerciseId = e.BaseExerciseId
                    }).ToList()
                }).ToList();

                return Ok(sessionDtos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Internal server error.");
            }
        }

        [HttpGet("by-id")]
        public IActionResult GetSessionById(int sessionId)
        {
            if (sessionId <= 0)
            {
                return BadRequest("Invalid sessionId.");
            }

            try
            {
                var session = _context.WorkoutSessions
                    .Include(s => s.Exercises)
                    .FirstOrDefault(s => s.Id == sessionId);

                if (session == null)
                {
                    return NotFound();
                }

                var dto = new WorkoutSessionDto
                {
                    Id = session.Id,
                    UserId = session.UserId,
                    WorkoutCycleId = session.WorkoutCycleId,
                    CycleDayIndex = session.DayIndex,
                    Label = session.Label,
                    IsCompleted = session.IsCompleted,
                    Date = session.Date,
                    Exercises = session.Exercises.Select(e => new WorkoutSessionExerciseDto
                    {
                        WorkoutSessionId = e.WorkoutSessionId,
                        Name = e.Name,
                        Muscles = e.Muscles,
                        Order = e.Order,
                        Weight = e.Weight,
                        IsOptional = e.IsOptional,
                        IsCompleted = e.IsCompleted,
                        IsSkipped = e.IsSkipped,
                        IsDeleted = e.IsDeleted,
                        BaseExerciseId = e.BaseExerciseId
                    }).ToList()
                };

                return Ok(dto);
            }
            catch (Exception)
            {
                return StatusCode(500, "Internal server error.");
            }
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
