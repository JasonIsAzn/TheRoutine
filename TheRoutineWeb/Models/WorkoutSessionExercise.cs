namespace TheRoutineWeb.Models
{
    public class WorkoutSessionExercise
    {
        public int Id { get; set; }
        public int WorkoutSessionId { get; set; }
        public string Name { get; set; } = string.Empty;
        public List<string> Muscles { get; set; } = new();
        public int Order { get; set; }
        public int Sets { get; set; }
        public int Reps { get; set; }
        public float? Weight { get; set; }
        public bool IsOptional { get; set; }
        public bool IsCompleted { get; set; } = false;
        public bool IsSkipped { get; set; } = false;
        public bool IsDeleted { get; set; } = false;

        public WorkoutSession WorkoutSession { get; set; } = default!;
    }
}
