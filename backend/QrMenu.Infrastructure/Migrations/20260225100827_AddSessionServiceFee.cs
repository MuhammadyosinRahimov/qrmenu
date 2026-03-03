using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace QrMenu.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddSessionServiceFee : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "ServiceFeePercent",
                table: "TableSessions",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "SessionServiceFee",
                table: "TableSessions",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "SessionSubtotal",
                table: "TableSessions",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "SessionTotal",
                table: "TableSessions",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "ServiceFeePercent",
                table: "Restaurants",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

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

            migrationBuilder.UpdateData(
                table: "Restaurants",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222222"),
                column: "ServiceFeePercent",
                value: 10m);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ServiceFeePercent",
                table: "TableSessions");

            migrationBuilder.DropColumn(
                name: "SessionServiceFee",
                table: "TableSessions");

            migrationBuilder.DropColumn(
                name: "SessionSubtotal",
                table: "TableSessions");

            migrationBuilder.DropColumn(
                name: "SessionTotal",
                table: "TableSessions");

            migrationBuilder.DropColumn(
                name: "ServiceFeePercent",
                table: "Restaurants");

            migrationBuilder.UpdateData(
                table: "Admins",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                column: "PasswordHash",
                value: "$2a$11$3oC5tOd6B9ebO28Wk5m8SORgvGvxR5nmK6A8x2iLZ4ob6ZLHb9u2.");

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"),
                column: "CreatedAt",
                value: new DateTime(2026, 2, 25, 9, 3, 40, 466, DateTimeKind.Utc).AddTicks(6808));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"),
                column: "CreatedAt",
                value: new DateTime(2026, 2, 25, 9, 3, 40, 466, DateTimeKind.Utc).AddTicks(6882));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("cccccccc-cccc-cccc-cccc-cccccccccccc"),
                column: "CreatedAt",
                value: new DateTime(2026, 2, 25, 9, 3, 40, 466, DateTimeKind.Utc).AddTicks(6888));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("dddddddd-dddd-dddd-dddd-dddddddddddd"),
                column: "CreatedAt",
                value: new DateTime(2026, 2, 25, 9, 3, 40, 466, DateTimeKind.Utc).AddTicks(6893));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee"),
                column: "CreatedAt",
                value: new DateTime(2026, 2, 25, 9, 3, 40, 466, DateTimeKind.Utc).AddTicks(6897));

            migrationBuilder.UpdateData(
                table: "OrderItems",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-5555-5555-555555555555"),
                column: "CreatedAt",
                value: new DateTime(2026, 2, 25, 9, 3, 40, 466, DateTimeKind.Utc).AddTicks(8660));

            migrationBuilder.UpdateData(
                table: "OrderItems",
                keyColumn: "Id",
                keyValue: new Guid("11111111-2222-5555-5555-555555555555"),
                column: "CreatedAt",
                value: new DateTime(2026, 2, 25, 9, 3, 40, 466, DateTimeKind.Utc).AddTicks(8688));

            migrationBuilder.UpdateData(
                table: "OrderItems",
                keyColumn: "Id",
                keyValue: new Guid("22222222-1111-5555-5555-555555555555"),
                column: "CreatedAt",
                value: new DateTime(2026, 2, 25, 9, 3, 40, 466, DateTimeKind.Utc).AddTicks(8672));

            migrationBuilder.UpdateData(
                table: "OrderItems",
                keyColumn: "Id",
                keyValue: new Guid("33333333-1111-5555-5555-555555555555"),
                column: "CreatedAt",
                value: new DateTime(2026, 2, 25, 9, 3, 40, 466, DateTimeKind.Utc).AddTicks(8680));

            migrationBuilder.UpdateData(
                table: "RestaurantAdmins",
                keyColumn: "Id",
                keyValue: new Guid("66666666-6666-6666-6666-666666666666"),
                column: "PasswordHash",
                value: "$2a$11$BP8VrrCJfOrVTgir14fAl.WucQ.L7fGc8tT3PlYzVGcDxu6X2Zv9G");
        }
    }
}
