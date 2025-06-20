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

        [HttpPatch("{cycleId}/swap-days")]
        public async Task<IActionResult> SwapDayOrder(int cycleId, [FromBody] SwapDayOrderRequest request)
        {
            var cycle = await _context.WorkoutCycles.FindAsync(cycleId);
            if (cycle == null || !cycle.IsActive)
                return NotFound(new { message = "Active cycle not found." });

            if (request.DayOrderMap.Count != cycle.DayOrderMap.Count || request.DayOrderMap.Distinct().Count() != cycle.DayOrderMap.Count)
                return BadRequest(new { message = "Invalid DayOrderMap." });

            cycle.DayOrderMap = request.DayOrderMap;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Day order updated." });
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
