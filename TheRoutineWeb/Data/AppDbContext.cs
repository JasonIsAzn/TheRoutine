using Microsoft.EntityFrameworkCore;
using TheRoutineWeb.Models;

namespace TheRoutineWeb.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<WorkoutPlan> WorkoutPlans { get; set; }
        public DbSet<WorkoutDay> WorkoutDays { get; set; }
        public DbSet<WorkoutExercise> WorkoutExercises { get; set; }
        public DbSet<WorkoutCycle> WorkoutCycles { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<WorkoutExercise>()
                .Property(e => e.Muscles)
                .HasConversion(
                    v => string.Join(",", v),
                    v => v.Split(",", StringSplitOptions.RemoveEmptyEntries).ToList()
                );

            modelBuilder.Entity<WorkoutCycle>()
                .Property(c => c.DayOrderMap)
                .HasConversion(
                    v => string.Join(",", v),
                    v => v.Split(",", StringSplitOptions.RemoveEmptyEntries).Select(int.Parse).ToList()
                );

            base.OnModelCreating(modelBuilder);
        }
    }
}
