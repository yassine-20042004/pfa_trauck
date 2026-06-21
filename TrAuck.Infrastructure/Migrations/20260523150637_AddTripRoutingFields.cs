using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TrAuck.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddTripRoutingFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CustomCoordsJson",
                table: "Trips",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<double>(
                name: "Distance",
                table: "Trips",
                type: "double precision",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<double>(
                name: "Duration",
                table: "Trips",
                type: "double precision",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<string>(
                name: "Winner",
                table: "Trips",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ZonesJson",
                table: "Trips",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("00000000-0000-0000-0000-000000000001"),
                columns: new[] { "CreatedAt", "PasswordHash" },
                values: new object[] { new DateTime(2026, 5, 23, 15, 6, 37, 48, DateTimeKind.Utc).AddTicks(5252), "$2a$11$9nbYodxZczNRBnN8jSh7FuYCM6iGeUToi3yDe2H6TYtefafoap6jK" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CustomCoordsJson",
                table: "Trips");

            migrationBuilder.DropColumn(
                name: "Distance",
                table: "Trips");

            migrationBuilder.DropColumn(
                name: "Duration",
                table: "Trips");

            migrationBuilder.DropColumn(
                name: "Winner",
                table: "Trips");

            migrationBuilder.DropColumn(
                name: "ZonesJson",
                table: "Trips");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("00000000-0000-0000-0000-000000000001"),
                columns: new[] { "CreatedAt", "PasswordHash" },
                values: new object[] { new DateTime(2026, 5, 20, 19, 8, 48, 419, DateTimeKind.Utc).AddTicks(2970), "$2a$11$y4aSdXgEFFN62EOM/9g5LegdjXQx2ohi8m54yXt82OxHLUyl3EKpq" });
        }
    }
}
