using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TheRoutineWeb.Data;
using TheRoutineWeb.Models;

namespace TheRoutineWeb.Controllers.Api
{
    [Route("api/[controller]")]
    [ApiController]
    public class WorkoutPlanApiController : ControllerBase
    {
        private readonly AppDbContext _context;

        public WorkoutPlanApiController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("active-plan")]
        public IActionResult GetActivePlan([FromQuery] int userId)
        {
            var plan = _context.WorkoutPlans
                .Include(p => p.WorkoutDays.OrderBy(d => d.Order))
                    .ThenInclude(d => d.Exercises.OrderBy(e => e.Order))
                .FirstOrDefault(p => p.UserId == userId && p.IsActive);

            if (plan == null)
                return NotFound(new { message = "No active workout plan found." });

            var result = new WorkoutPlanDto
            {
                Id = plan.Id,
                UserId = plan.UserId,
                PlanGroupId = plan.PlanGroupId,
                Version = plan.Version,
                Name = plan.Name,
                SplitType = plan.SplitType,
                CycleLength = plan.CycleLength,
                IsActive = plan.IsActive,
                CreatedAt = plan.CreatedAt,
                EndedAt = plan.EndedAt,
                WorkoutDays = plan.WorkoutDays
                    .OrderBy(d => d.Order)
                    .Select(d => new WorkoutDayDto
                    {
                        Label = d.Label,
                        Order = d.Order,
                        Exercises = d.Exercises
                            .OrderBy(e => e.Order)
                            .Select(e => new WorkoutExerciseDto
                            {
                                Name = e.Name,
                                Muscles = e.Muscles,
                                IsOptional = e.IsOptional,
                                Order = e.Order
                            }).ToList()
                    }).ToList()
            };

            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> CreateWorkoutPlan([FromBody] WorkoutPlanCreateRequest request)
        {
            var existingPlan = await _context.WorkoutPlans
                .Where(p => p.UserId == request.UserId && p.IsActive)
                .FirstOrDefaultAsync();

            int planGroupId;
            int version;

            if (existingPlan != null)
            {
                existingPlan.IsActive = false;
                existingPlan.EndedAt = DateTime.UtcNow;
                planGroupId = existingPlan.PlanGroupId;
                version = existingPlan.Version + 1;
            }
            else
            {
                planGroupId = 0; // Temp value, will use new ID
                version = 0;
            }

            var plan = new WorkoutPlan
            {
                UserId = request.UserId,
                Name = request.Name,
                SplitType = request.SplitType,
                CycleLength = request.CycleLength,
                CreatedAt = DateTime.UtcNow,
                IsActive = true,
                PlanGroupId = planGroupId,
                Version = version,
                WorkoutDays = request.WorkoutDays.Select(day => new WorkoutDay
                {
                    Label = day.Label,
                    Order = day.Order,
                    Exercises = day.Exercises.Select(ex => new WorkoutExercise
                    {
                        Name = ex.Name,
                        Muscles = ex.Muscles,
                        IsOptional = ex.IsOptional,
                        Order = ex.Order
                    }).ToList()
                }).ToList()
            };

            _context.WorkoutPlans.Add(plan);
            await _context.SaveChangesAsync();

            // Update PlanGroupId to match Id if it was the first one
            if (planGroupId == 0)
            {
                plan.PlanGroupId = plan.Id;
                await _context.SaveChangesAsync();
            }

            return Ok(new
            {
                message = "Workout plan created",
                planId = plan.Id,
                planGroupId = plan.PlanGroupId,
                version = plan.Version
            });
        }

        [HttpDelete("deactivate")]
        public async Task<IActionResult> DeactivateActivePlan([FromQuery] int userId)
        {
            var existingPlan = await _context.WorkoutPlans
                .Where(p => p.UserId == userId && p.IsActive)
                .FirstOrDefaultAsync();

            if (existingPlan == null)
            {
                return NotFound(new { message = "No active workout plan to delete." });
            }

            existingPlan.IsActive = false;
            existingPlan.EndedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Active workout plan deactivated." });
        }


    }

    public class WorkoutPlanCreateRequest
    {
        public int UserId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string SplitType { get; set; } = string.Empty;
        public int CycleLength { get; set; }
        public List<WorkoutDayCreateRequest> WorkoutDays { get; set; } = new();
    }

    public class WorkoutDayCreateRequest
    {
        public string Label { get; set; } = string.Empty;
        public int Order { get; set; }
        public List<WorkoutExerciseCreateRequest> Exercises { get; set; } = new();
    }

    public class WorkoutExerciseCreateRequest
    {
        public string Name { get; set; } = string.Empty;
        public List<string> Muscles { get; set; } = new();
        public bool IsOptional { get; set; }
        public int Order { get; set; }
    }

    public class WorkoutPlanDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int PlanGroupId { get; set; }
        public int Version { get; set; }
        public string Name { get; set; } = string.Empty;
        public string SplitType { get; set; } = string.Empty;
        public int CycleLength { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? EndedAt { get; set; }
        public List<WorkoutDayDto> WorkoutDays { get; set; } = new();
    }

    public class WorkoutDayDto
    {
        public string Label { get; set; } = string.Empty;
        public int Order { get; set; }
        public List<WorkoutExerciseDto> Exercises { get; set; } = new();
    }

    public class WorkoutSessionDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int WorkoutCycleId { get; set; }
        public int CycleDayIndex { get; set; }
        public DateTime Date { get; set; }
        public List<WorkoutExerciseDto> Exercises { get; set; } = new();
    }


    public class WorkoutExerciseDto
    {
        public string Name { get; set; } = string.Empty;
        public List<string> Muscles { get; set; } = new();
        public bool IsOptional { get; set; }
        public int Order { get; set; }
    }

    public class WorkoutSessionExerciseDto
    {
        public int WorkoutSessionId { get; set; }
        public string Name { get; set; } = string.Empty;
        public List<string> Muscles { get; set; } = new();
        public int Order { get; set; }
        public float? Weight { get; set; }
        public bool IsOptional { get; set; }
        public bool IsCompleted { get; set; }
        public bool IsSkipped { get; set; }
        public bool IsDeleted { get; set; }
    }


}
