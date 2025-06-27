using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TheRoutineWeb.Migrations
{
    /// <inheritdoc />
    public partial class AddBaseExerciseAndRefactorWorkoutExercise : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "BaseExerciseId",
                table: "WorkoutExercises",
                type: "int",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "BaseExercises",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Muscles = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Equipment = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BaseExercises", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_WorkoutExercises_BaseExerciseId",
                table: "WorkoutExercises",
                column: "BaseExerciseId");

            migrationBuilder.AddForeignKey(
                name: "FK_WorkoutExercises_BaseExercises_BaseExerciseId",
                table: "WorkoutExercises",
                column: "BaseExerciseId",
                principalTable: "BaseExercises",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_WorkoutExercises_BaseExercises_BaseExerciseId",
                table: "WorkoutExercises");

            migrationBuilder.DropTable(
                name: "BaseExercises");

            migrationBuilder.DropIndex(
                name: "IX_WorkoutExercises_BaseExerciseId",
                table: "WorkoutExercises");

            migrationBuilder.DropColumn(
                name: "BaseExerciseId",
                table: "WorkoutExercises");
        }
    }
}
