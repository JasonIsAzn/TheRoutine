
namespace TheRoutineWeb.Models
{
    public class BaseExercise
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public List<string> Muscles { get; set; } = new();
        public string? Equipment { get; set; }
    }

}