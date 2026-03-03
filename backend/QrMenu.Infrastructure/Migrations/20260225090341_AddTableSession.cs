using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace QrMenu.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddTableSession : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AlifGate",
                table: "Restaurants");

            migrationBuilder.DropColumn(
                name: "AlifKey",
                table: "Restaurants");

            migrationBuilder.DropColumn(
                name: "AlifPassword",
                table: "Restaurants");

            migrationBuilder.AddColumn<Guid>(
                name: "TableSessionId",
                table: "Orders",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "TableSessions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TableId = table.Column<Guid>(type: "uuid", nullable: false),
                    RestaurantId = table.Column<Guid>(type: "uuid", nullable: false),
                    TableNumber = table.Column<int>(type: "integer", nullable: false),
                    StartedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ClosedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Status = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TableSessions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TableSessions_Restaurants_RestaurantId",
                        column: x => x.RestaurantId,
                        principalTable: "Restaurants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TableSessions_Tables_TableId",
                        column: x => x.TableId,
                        principalTable: "Tables",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

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
                table: "Orders",
                keyColumn: "Id",
                keyValue: new Guid("11111111-5555-5555-5555-555555555555"),
                column: "TableSessionId",
                value: null);

            migrationBuilder.UpdateData(
                table: "Orders",
                keyColumn: "Id",
                keyValue: new Guid("22222222-5555-5555-5555-555555555555"),
                column: "TableSessionId",
                value: null);

            migrationBuilder.UpdateData(
                table: "RestaurantAdmins",
                keyColumn: "Id",
                keyValue: new Guid("66666666-6666-6666-6666-666666666666"),
                column: "PasswordHash",
                value: "$2a$11$BP8VrrCJfOrVTgir14fAl.WucQ.L7fGc8tT3PlYzVGcDxu6X2Zv9G");

            migrationBuilder.CreateIndex(
                name: "IX_Orders_TableSessionId",
                table: "Orders",
                column: "TableSessionId");

            migrationBuilder.CreateIndex(
                name: "IX_TableSessions_RestaurantId",
                table: "TableSessions",
                column: "RestaurantId");

            migrationBuilder.CreateIndex(
                name: "IX_TableSessions_TableId_Status",
                table: "TableSessions",
                columns: new[] { "TableId", "Status" });

            migrationBuilder.AddForeignKey(
                name: "FK_Orders_TableSessions_TableSessionId",
                table: "Orders",
                column: "TableSessionId",
                principalTable: "TableSessions",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Orders_TableSessions_TableSessionId",
                table: "Orders");

            migrationBuilder.DropTable(
                name: "TableSessions");

            migrationBuilder.DropIndex(
                name: "IX_Orders_TableSessionId",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "TableSessionId",
                table: "Orders");

            migrationBuilder.AddColumn<string>(
                name: "AlifGate",
                table: "Restaurants",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AlifKey",
                table: "Restaurants",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AlifPassword",
                table: "Restaurants",
                type: "text",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "Admins",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                column: "PasswordHash",
                value: "$2a$11$MNdhehrSFFENRCQ079MwY.iY.mQTrMLWum0fap.IbW2ndl2qceyCK");

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"),
                column: "CreatedAt",
                value: new DateTime(2026, 2, 24, 9, 57, 57, 18, DateTimeKind.Utc).AddTicks(1402));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"),
                column: "CreatedAt",
                value: new DateTime(2026, 2, 24, 9, 57, 57, 18, DateTimeKind.Utc).AddTicks(1454));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("cccccccc-cccc-cccc-cccc-cccccccccccc"),
                column: "CreatedAt",
                value: new DateTime(2026, 2, 24, 9, 57, 57, 18, DateTimeKind.Utc).AddTicks(1460));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("dddddddd-dddd-dddd-dddd-dddddddddddd"),
                column: "CreatedAt",
                value: new DateTime(2026, 2, 24, 9, 57, 57, 18, DateTimeKind.Utc).AddTicks(1464));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee"),
                column: "CreatedAt",
                value: new DateTime(2026, 2, 24, 9, 57, 57, 18, DateTimeKind.Utc).AddTicks(1469));

            migrationBuilder.UpdateData(
                table: "OrderItems",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-5555-5555-555555555555"),
                column: "CreatedAt",
                value: new DateTime(2026, 2, 24, 9, 57, 57, 18, DateTimeKind.Utc).AddTicks(3056));

            migrationBuilder.UpdateData(
                table: "OrderItems",
                keyColumn: "Id",
                keyValue: new Guid("11111111-2222-5555-5555-555555555555"),
                column: "CreatedAt",
                value: new DateTime(2026, 2, 24, 9, 57, 57, 18, DateTimeKind.Utc).AddTicks(3082));

            migrationBuilder.UpdateData(
                table: "OrderItems",
                keyColumn: "Id",
                keyValue: new Guid("22222222-1111-5555-5555-555555555555"),
                column: "CreatedAt",
                value: new DateTime(2026, 2, 24, 9, 57, 57, 18, DateTimeKind.Utc).AddTicks(3067));

            migrationBuilder.UpdateData(
                table: "OrderItems",
                keyColumn: "Id",
                keyValue: new Guid("33333333-1111-5555-5555-555555555555"),
                column: "CreatedAt",
                value: new DateTime(2026, 2, 24, 9, 57, 57, 18, DateTimeKind.Utc).AddTicks(3075));

            migrationBuilder.UpdateData(
                table: "RestaurantAdmins",
                keyColumn: "Id",
                keyValue: new Guid("66666666-6666-6666-6666-666666666666"),
                column: "PasswordHash",
                value: "$2a$11$Thh.HqMglp.WHyPmw353tucW4uCPg0yTWxkZdFqXjf.J/oY66niH2");

            migrationBuilder.UpdateData(
                table: "Restaurants",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222222"),
                columns: new[] { "AlifGate", "AlifKey", "AlifPassword" },
                values: new object[] { null, null, null });
        }
    }
}
