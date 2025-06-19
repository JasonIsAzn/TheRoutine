namespace TheRoutineWeb.Models
{
    public class WorkoutDay
    {
        public int Id { get; set; }
        public int PlanId { get; set; }
        public string Label { get; set; } = string.Empty;
        public int Order { get; set; }

        public WorkoutPlan Plan { get; set; } = default!;
        public ICollection<WorkoutExercise> Exercises { get; set; } = new List<WorkoutExercise>();
    }
}
