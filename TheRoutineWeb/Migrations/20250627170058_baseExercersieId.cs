using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TheRoutineWeb.Migrations
{
    /// <inheritdoc />
    public partial class baseExercersieId : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "BaseExerciseId",
                table: "WorkoutSessionExercises",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_WorkoutSessionExercises_BaseExerciseId",
                table: "WorkoutSessionExercises",
                column: "BaseExerciseId");

            migrationBuilder.AddForeignKey(
                name: "FK_WorkoutSessionExercises_BaseExercises_BaseExerciseId",
                table: "WorkoutSessionExercises",
                column: "BaseExerciseId",
                principalTable: "BaseExercises",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_WorkoutSessionExercises_BaseExercises_BaseExerciseId",
                table: "WorkoutSessionExercises");

            migrationBuilder.DropIndex(
                name: "IX_WorkoutSessionExercises_BaseExerciseId",
                table: "WorkoutSessionExercises");

            migrationBuilder.DropColumn(
                name: "BaseExerciseId",
                table: "WorkoutSessionExercises");
        }
    }
}
