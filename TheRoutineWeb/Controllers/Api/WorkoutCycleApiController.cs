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
        public IActionResult GetActiveCycle([FromQuery] int userId, [FromQuery] int timezoneOffsetMinutes = 0)
        {
            var todayLocal = DateTime.UtcNow.AddMinutes(-timezoneOffsetMinutes).Date;
            var cycle = _context.WorkoutCycles
                .FirstOrDefault(c =>
                    c.UserId == userId &&
                    c.IsActive &&
                    c.StartDate.Date <= todayLocal &&
                    c.EndDate.HasValue &&
                    c.EndDate.Value.Date >= todayLocal);

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

            var localStart = request.StartDate;
            var utcStartDate = localStart.AddMinutes(-request.TimezoneOffsetMinutes);


            int startDayOfWeek = (int)localStart.DayOfWeek;
            var dayOrderMap = Enumerable.Range(startDayOfWeek, 7 - startDayOfWeek).ToList();

            var utcEndDate = utcStartDate
                .AddDays(6 - startDayOfWeek)
                .Date.AddHours(23).AddMinutes(59).AddSeconds(59);

            var cycle = new WorkoutCycle
            {
                UserId = request.UserId,
                WorkoutPlanId = plan.Id,
                StartDate = utcStartDate,
                EndDate = utcEndDate,
                DayOrderMap = dayOrderMap,
                CreatedAt = DateTime.UtcNow,
                IsActive = true
            };

            var oldCycles = _context.WorkoutCycles.Where(c => c.UserId == request.UserId && c.IsActive);
            foreach (var old in oldCycles)
            {
                old.IsActive = false;
                old.EndDate = DateTime.UtcNow;
            }

            _context.WorkoutCycles.Add(cycle);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Workout cycle created.", cycleId = cycle.Id });
        }


        [HttpPost("deactivate")]
        public async Task<IActionResult> DeactivateCycle([FromQuery] int userId)
        {
            var cycle = await _context.WorkoutCycles.FirstOrDefaultAsync(c => c.UserId == userId && c.IsActive);
            if (cycle == null)
                return NotFound(new { message = "No active workout cycle to deactivate." });

            cycle.IsActive = false;
            cycle.EndDate = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Workout cycle deactivated." });
        }

        [HttpPost("update-plan-id")]
        public async Task<IActionResult> UpdatePlanId([FromBody] UpdateCyclePlanRequest request)
        {
            var cycle = await _context.WorkoutCycles
                .FirstOrDefaultAsync(c => c.UserId == request.UserId && c.IsActive);

            if (cycle == null)
                return NotFound(new { message = "Active cycle not found for user." });

            cycle.WorkoutPlanId = request.NewWorkoutPlanId;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Cycle updated with new plan ID." });
        }



    }

    public class CreateCycleRequest
    {
        public int UserId { get; set; }
        public int WorkoutPlanId { get; set; }
        public DateTime StartDate { get; set; }
        public int TimezoneOffsetMinutes { get; set; }
    }

    public class SwapDayOrderRequest
    {
        public List<int> DayOrderMap { get; set; } = new();
    }

    public class UpdateCyclePlanRequest
    {
        public int UserId { get; set; }
        public int NewWorkoutPlanId { get; set; }
    }

}
