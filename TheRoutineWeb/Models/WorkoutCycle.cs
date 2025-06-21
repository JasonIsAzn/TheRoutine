using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TheRoutineWeb.Models
{
    public class WorkoutCycle
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int WorkoutPlanId { get; set; }

        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public List<int> DayOrderMap { get; set; } = new();
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public User User { get; set; } = default!;
        public WorkoutPlan WorkoutPlan { get; set; } = default!;
    }

}
