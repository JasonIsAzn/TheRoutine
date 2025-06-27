namespace TheRoutineWeb.Models
{
    public class WorkoutExercise
    {
        public int Id { get; set; }
        public int DayId { get; set; }
        public string Name { get; set; } = string.Empty;
        public List<string> Muscles { get; set; } = new();
        public bool IsOptional { get; set; }
        public int Order { get; set; }

        public int? BaseExerciseId { get; set; }
        public BaseExercise? BaseExercise { get; set; }

        public WorkoutDay Day { get; set; } = default!;
    }

}
