using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TheRoutineWeb.Migrations
{
    /// <inheritdoc />
    public partial class AddCompletedFlagToWorkoutSession : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsCompleted",
                table: "WorkoutSessions",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsCompleted",
                table: "WorkoutSessions");
        }
    }
}
