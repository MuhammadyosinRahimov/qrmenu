using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace QrMenu.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddCompletedAt : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "CompletedAt",
                table: "Orders",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "Admins",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                column: "PasswordHash",
                value: "$2a$11$GtCL7GIw7eHZQBsQu3fptemvBPSBY.Lroqj/rn9aqKpoBGobSK.4y");

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"),
                column: "CreatedAt",
                value: new DateTime(2026, 2, 25, 10, 46, 53, 610, DateTimeKind.Utc).AddTicks(5130));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"),
                column: "CreatedAt",
                value: new DateTime(2026, 2, 25, 10, 46, 53, 610, DateTimeKind.Utc).AddTicks(5170));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("cccccccc-cccc-cccc-cccc-cccccccccccc"),
                column: "CreatedAt",
                value: new DateTime(2026, 2, 25, 10, 46, 53, 610, DateTimeKind.Utc).AddTicks(5173));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("dddddddd-dddd-dddd-dddd-dddddddddddd"),
                column: "CreatedAt",
                value: new DateTime(2026, 2, 25, 10, 46, 53, 610, DateTimeKind.Utc).AddTicks(5175));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee"),
                column: "CreatedAt",
                value: new DateTime(2026, 2, 25, 10, 46, 53, 610, DateTimeKind.Utc).AddTicks(5177));

            migrationBuilder.UpdateData(
                table: "OrderItems",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-5555-5555-555555555555"),
                column: "CreatedAt",
                value: new DateTime(2026, 2, 25, 10, 46, 53, 610, DateTimeKind.Utc).AddTicks(5977));

            migrationBuilder.UpdateData(
                table: "OrderItems",
                keyColumn: "Id",
                keyValue: new Guid("11111111-2222-5555-5555-555555555555"),
                column: "CreatedAt",
                value: new DateTime(2026, 2, 25, 10, 46, 53, 610, DateTimeKind.Utc).AddTicks(5989));

            migrationBuilder.UpdateData(
                table: "OrderItems",
                keyColumn: "Id",
                keyValue: new Guid("22222222-1111-5555-5555-555555555555"),
                column: "CreatedAt",
                value: new DateTime(2026, 2, 25, 10, 46, 53, 610, DateTimeKind.Utc).AddTicks(5982));

            migrationBuilder.UpdateData(
                table: "OrderItems",
                keyColumn: "Id",
                keyValue: new Guid("33333333-1111-5555-5555-555555555555"),
                column: "CreatedAt",
                value: new DateTime(2026, 2, 25, 10, 46, 53, 610, DateTimeKind.Utc).AddTicks(5985));

            migrationBuilder.UpdateData(
                table: "Orders",
                keyColumn: "Id",
                keyValue: new Guid("11111111-5555-5555-5555-555555555555"),
                column: "CompletedAt",
                value: null);

            migrationBuilder.UpdateData(
                table: "Orders",
                keyColumn: "Id",
                keyValue: new Guid("22222222-5555-5555-5555-555555555555"),
                column: "CompletedAt",
                value: null);

            migrationBuilder.UpdateData(
                table: "RestaurantAdmins",
                keyColumn: "Id",
                keyValue: new Guid("66666666-6666-6666-6666-666666666666"),
                column: "PasswordHash",
                value: "$2a$11$n0rsVm7slX5sK6/EBCyrUeH80LXitR443l3TyXKocxLPyvNZvCFT.");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CompletedAt",
                table: "Orders");

            migrationBuilder.UpdateData(
                table: "Admins",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                column: "PasswordHash",
                value: "$2a$11$hnmBVcCef0Hj6mjHv454Gubl0BDoH0A0qG1XUaXIHOlT3s85g5FyW");

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"),
                column: "CreatedAt",
                value: new DateTime(2026, 2, 25, 10, 8, 26, 836, DateTimeKind.Utc).AddTicks(1728));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"),
                column: "CreatedAt",
                value: new DateTime(2026, 2, 25, 10, 8, 26, 836, DateTimeKind.Utc).AddTicks(1780));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("cccccccc-cccc-cccc-cccc-cccccccccccc"),
                column: "CreatedAt",
                value: new DateTime(2026, 2, 25, 10, 8, 26, 836, DateTimeKind.Utc).AddTicks(1785));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("dddddddd-dddd-dddd-dddd-dddddddddddd"),
                column: "CreatedAt",
                value: new DateTime(2026, 2, 25, 10, 8, 26, 836, DateTimeKind.Utc).AddTicks(1789));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee"),
                column: "CreatedAt",
                value: new DateTime(2026, 2, 25, 10, 8, 26, 836, DateTimeKind.Utc).AddTicks(1794));

            migrationBuilder.UpdateData(
                table: "OrderItems",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-5555-5555-555555555555"),
                column: "CreatedAt",
                value: new DateTime(2026, 2, 25, 10, 8, 26, 836, DateTimeKind.Utc).AddTicks(3091));

            migrationBuilder.UpdateData(
                table: "OrderItems",
                keyColumn: "Id",
                keyValue: new Guid("11111111-2222-5555-5555-555555555555"),
                column: "CreatedAt",
                value: new DateTime(2026, 2, 25, 10, 8, 26, 836, DateTimeKind.Utc).AddTicks(3129));

            migrationBuilder.UpdateData(
                table: "OrderItems",
                keyColumn: "Id",
                keyValue: new Guid("22222222-1111-5555-5555-555555555555"),
                column: "CreatedAt",
                value: new DateTime(2026, 2, 25, 10, 8, 26, 836, DateTimeKind.Utc).AddTicks(3106));

            migrationBuilder.UpdateData(
                table: "OrderItems",
                keyColumn: "Id",
                keyValue: new Guid("33333333-1111-5555-5555-555555555555"),
                column: "CreatedAt",
                value: new DateTime(2026, 2, 25, 10, 8, 26, 836, DateTimeKind.Utc).AddTicks(3120));

            migrationBuilder.UpdateData(
                table: "RestaurantAdmins",
                keyColumn: "Id",
                keyValue: new Guid("66666666-6666-6666-6666-666666666666"),
                column: "PasswordHash",
                value: "$2a$11$ks4QOTYsL0waXruEgn3Ode1Fpt30xNONMrR6oXvkIMLVE.OlANp.u");
        }
    }
}
