using Microsoft.AspNetCore.Mvc;
using TheRoutineWeb.Data;
using TheRoutineWeb.Models;
using Microsoft.EntityFrameworkCore;

namespace TheRoutineWeb.Controllers.Api
{
    [Route("api/[controller]")]
    [ApiController]
    public class WorkoutCycleApiController : ControllerBase
    {
        private readonly AppDbContext _context;

        public WorkoutCycleApiController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("active")]
        public IActionResult GetActiveCycle([FromQuery] int userId)
        {
            var cycle = _context.WorkoutCycles
                .FirstOrDefault(c => c.UserId == userId && c.IsActive);

            if (cycle == null)
                return NotFound(new { message = "No active workout cycle found." });

            return Ok(cycle);
        }

        [HttpPost]
        public async Task<IActionResult> CreateCycle([FromBody] CreateCycleRequest request)
        {
            var plan = await _context.WorkoutPlans
                .Include(p => p.WorkoutDays.OrderBy(d => d.Order))
                .FirstOrDefaultAsync(p => p.Id == request.WorkoutPlanId && p.UserId == request.UserId && p.IsActive);


            if (plan == null)
                return BadRequest(new { message = "Active workout plan not found." });

            int today = (int)request.StartDate.DayOfWeek;
            var map = Enumerable.Range(today, 7 - today).ToList();

            var cycle = new WorkoutCycle
            {
                UserId = request.UserId,
                WorkoutPlanId = plan.Id,
                StartDate = request.StartDate,
                DayOrderMap = map,
                CreatedAt = DateTime.UtcNow,
                IsActive = true
            };

            var oldCycles = _context.WorkoutCycles.Where(c => c.UserId == request.UserId && c.IsActive);
            foreach (var old in oldCycles)
                old.IsActive = false;

            _context.WorkoutCycles.Add(cycle);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Workout cycle created.", cycleId = cycle.Id });
        }
    }

    public class CreateCycleRequest
    {
        public int UserId { get; set; }
        public int WorkoutPlanId { get; set; }
        public DateTime StartDate { get; set; }
    }

    public class SwapDayOrderRequest
    {
        public List<int> DayOrderMap { get; set; } = new();
    }
}
