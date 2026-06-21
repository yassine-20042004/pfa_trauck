using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TrAuck.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdateRegistration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "LicenseNumber",
                table: "AccessRequests",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PasswordHash",
                table: "AccessRequests",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "PreferredVehicle",
                table: "AccessRequests",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "YearsOfExperience",
                table: "AccessRequests",
                type: "integer",
                nullable: true);

            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "Id", "CreatedAt", "Email", "FirstName", "IsActive", "LastName", "PasswordHash", "Role" },
                values: new object[] { new Guid("00000000-0000-0000-0000-000000000001"), new DateTime(2026, 5, 17, 21, 22, 58, 144, DateTimeKind.Utc).AddTicks(6527), "admin@admin.com", "System", true, "Admin", "$2a$11$MBvBDcsnarpRDGQOoFrukurFZjBWkn464n8rFrop0gyhWPpQgfNdm", "Admin" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("00000000-0000-0000-0000-000000000001"));

            migrationBuilder.DropColumn(
                name: "LicenseNumber",
                table: "AccessRequests");

            migrationBuilder.DropColumn(
                name: "PasswordHash",
                table: "AccessRequests");

            migrationBuilder.DropColumn(
                name: "PreferredVehicle",
                table: "AccessRequests");

            migrationBuilder.DropColumn(
                name: "YearsOfExperience",
                table: "AccessRequests");
        }
    }
}
