using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TheRoutineWeb.Migrations
{
    /// <inheritdoc />
    public partial class AddEndDateToWorkoutCycle : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "EndDate",
                table: "WorkoutCycles",
                type: "datetime2",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "EndDate",
                table: "WorkoutCycles");
        }
    }
}
