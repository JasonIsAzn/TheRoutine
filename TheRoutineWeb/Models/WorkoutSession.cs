namespace TheRoutineWeb.Models
{
    public class WorkoutSession
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int WorkoutCycleId { get; set; }
        public DateTime Date { get; set; }
        public int DayIndex { get; set; }
        public string Label { get; set; } = string.Empty;
        public bool IsCompleted { get; set; } = false;

        public WorkoutCycle WorkoutCycle { get; set; } = default!;
        public List<WorkoutSessionExercise> Exercises { get; set; } = new();
    }

}
