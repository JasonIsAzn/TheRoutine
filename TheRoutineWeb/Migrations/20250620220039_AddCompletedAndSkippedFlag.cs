using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TheRoutineWeb.Migrations
{
    /// <inheritdoc />
    public partial class AddCompletedAndSkippedFlag : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsCompleted",
                table: "WorkoutSessionExercises",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsSkipped",
                table: "WorkoutSessionExercises",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsCompleted",
                table: "WorkoutSessionExercises");

            migrationBuilder.DropColumn(
                name: "IsSkipped",
                table: "WorkoutSessionExercises");
        }
    }
}
