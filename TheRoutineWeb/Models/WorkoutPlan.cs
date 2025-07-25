namespace TheRoutineWeb.Models
{
    public class WorkoutPlan
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int PlanGroupId { get; set; }
        public int Version { get; set; }
        public string Name { get; set; } = string.Empty;
        public int CycleLength { get; set; }
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? EndedAt { get; set; }

        public string SplitType { get; set; } = string.Empty;

        public ICollection<WorkoutDay> WorkoutDays { get; set; } = new List<WorkoutDay>();
    }
}
