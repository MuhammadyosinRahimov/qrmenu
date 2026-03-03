using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace QrMenu.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddPaymentLink : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Products_Menus_MenuId",
                table: "Products");

            migrationBuilder.AddColumn<bool>(
                name: "AcceptingOrders",
                table: "Restaurants",
                type: "boolean",
                nullable: false,
                defaultValue: false);

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

            // Use conditional SQL for columns that might already exist
            migrationBuilder.Sql(@"
                DO $$
                BEGIN
                    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Restaurants' AND column_name='DcArticul') THEN
                        ALTER TABLE ""Restaurants"" ADD ""DcArticul"" text NULL;
                    END IF;
                    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Restaurants' AND column_name='DcMerchantId') THEN
                        ALTER TABLE ""Restaurants"" ADD ""DcMerchantId"" text NULL;
                    END IF;
                    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Restaurants' AND column_name='DcSecretKey') THEN
                        ALTER TABLE ""Restaurants"" ADD ""DcSecretKey"" text NULL;
                    END IF;
                    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Restaurants' AND column_name='PauseMessage') THEN
                        ALTER TABLE ""Restaurants"" ADD ""PauseMessage"" character varying(500) NULL;
                    END IF;
                    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Restaurants' AND column_name='PaymentLink') THEN
                        ALTER TABLE ""Restaurants"" ADD ""PaymentLink"" text NULL;
                    END IF;
                    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Orders' AND column_name='IsPaid') THEN
                        ALTER TABLE ""Orders"" ADD ""IsPaid"" boolean NOT NULL DEFAULT FALSE;
                    END IF;
                    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Orders' AND column_name='PaidAt') THEN
                        ALTER TABLE ""Orders"" ADD ""PaidAt"" timestamp with time zone NULL;
                    END IF;
                    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Orders' AND column_name='PaymentId') THEN
                        ALTER TABLE ""Orders"" ADD ""PaymentId"" text NULL;
                    END IF;
                    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Orders' AND column_name='PaymentLink') THEN
                        ALTER TABLE ""Orders"" ADD ""PaymentLink"" text NULL;
                    END IF;
                    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Orders' AND column_name='PaymentMethod') THEN
                        ALTER TABLE ""Orders"" ADD ""PaymentMethod"" text NOT NULL DEFAULT 'cash';
                    END IF;
                    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Orders' AND column_name='PaymentStatus') THEN
                        ALTER TABLE ""Orders"" ADD ""PaymentStatus"" integer NULL;
                    END IF;
                    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='OrderItems' AND column_name='CancelReason') THEN
                        ALTER TABLE ""OrderItems"" ADD ""CancelReason"" character varying(500) NULL;
                    END IF;
                    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='OrderItems' AND column_name='CreatedAt') THEN
                        ALTER TABLE ""OrderItems"" ADD ""CreatedAt"" timestamp with time zone NOT NULL DEFAULT '0001-01-01 00:00:00+00';
                    END IF;
                    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='OrderItems' AND column_name='Status') THEN
                        ALTER TABLE ""OrderItems"" ADD ""Status"" integer NOT NULL DEFAULT 0;
                    END IF;
                    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Categories' AND column_name='AvailableFrom') THEN
                        ALTER TABLE ""Categories"" ADD ""AvailableFrom"" interval NULL;
                    END IF;
                    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Categories' AND column_name='AvailableTo') THEN
                        ALTER TABLE ""Categories"" ADD ""AvailableTo"" interval NULL;
                    END IF;
                    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Categories' AND column_name='IsTemporarilyDisabled') THEN
                        ALTER TABLE ""Categories"" ADD ""IsTemporarilyDisabled"" boolean NOT NULL DEFAULT FALSE;
                    END IF;
                END $$;
            ");

            migrationBuilder.CreateTable(
                name: "RestaurantAdmins",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Email = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    PasswordHash = table.Column<string>(type: "text", nullable: false),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    RestaurantId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    LastLoginAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RestaurantAdmins", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RestaurantAdmins_Restaurants_RestaurantId",
                        column: x => x.RestaurantId,
                        principalTable: "Restaurants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

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
                columns: new[] { "AvailableFrom", "AvailableTo", "CreatedAt", "IsTemporarilyDisabled" },
                values: new object[] { null, null, new DateTime(2026, 2, 24, 9, 57, 57, 18, DateTimeKind.Utc).AddTicks(1402), false });

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"),
                columns: new[] { "AvailableFrom", "AvailableTo", "CreatedAt", "IsTemporarilyDisabled" },
                values: new object[] { null, null, new DateTime(2026, 2, 24, 9, 57, 57, 18, DateTimeKind.Utc).AddTicks(1454), false });

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("cccccccc-cccc-cccc-cccc-cccccccccccc"),
                columns: new[] { "AvailableFrom", "AvailableTo", "CreatedAt", "IsTemporarilyDisabled" },
                values: new object[] { null, null, new DateTime(2026, 2, 24, 9, 57, 57, 18, DateTimeKind.Utc).AddTicks(1460), false });

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("dddddddd-dddd-dddd-dddd-dddddddddddd"),
                columns: new[] { "AvailableFrom", "AvailableTo", "CreatedAt", "IsTemporarilyDisabled" },
                values: new object[] { null, null, new DateTime(2026, 2, 24, 9, 57, 57, 18, DateTimeKind.Utc).AddTicks(1464), false });

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee"),
                columns: new[] { "AvailableFrom", "AvailableTo", "CreatedAt", "IsTemporarilyDisabled" },
                values: new object[] { null, null, new DateTime(2026, 2, 24, 9, 57, 57, 18, DateTimeKind.Utc).AddTicks(1469), false });

            migrationBuilder.UpdateData(
                table: "OrderItems",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-5555-5555-555555555555"),
                columns: new[] { "CancelReason", "CreatedAt", "Status" },
                values: new object[] { null, new DateTime(2026, 2, 24, 9, 57, 57, 18, DateTimeKind.Utc).AddTicks(3056), 1 });

            migrationBuilder.UpdateData(
                table: "OrderItems",
                keyColumn: "Id",
                keyValue: new Guid("11111111-2222-5555-5555-555555555555"),
                columns: new[] { "CancelReason", "CreatedAt", "Status" },
                values: new object[] { null, new DateTime(2026, 2, 24, 9, 57, 57, 18, DateTimeKind.Utc).AddTicks(3082), 1 });

            migrationBuilder.UpdateData(
                table: "OrderItems",
                keyColumn: "Id",
                keyValue: new Guid("22222222-1111-5555-5555-555555555555"),
                columns: new[] { "CancelReason", "CreatedAt", "Status" },
                values: new object[] { null, new DateTime(2026, 2, 24, 9, 57, 57, 18, DateTimeKind.Utc).AddTicks(3067), 1 });

            migrationBuilder.UpdateData(
                table: "OrderItems",
                keyColumn: "Id",
                keyValue: new Guid("33333333-1111-5555-5555-555555555555"),
                columns: new[] { "CancelReason", "CreatedAt", "Status" },
                values: new object[] { null, new DateTime(2026, 2, 24, 9, 57, 57, 18, DateTimeKind.Utc).AddTicks(3075), 1 });

            migrationBuilder.UpdateData(
                table: "Orders",
                keyColumn: "Id",
                keyValue: new Guid("11111111-5555-5555-5555-555555555555"),
                columns: new[] { "IsPaid", "PaidAt", "PaymentId", "PaymentLink", "PaymentMethod", "PaymentStatus", "Status" },
                values: new object[] { false, null, null, null, "cash", null, 2 });

            migrationBuilder.UpdateData(
                table: "Orders",
                keyColumn: "Id",
                keyValue: new Guid("22222222-5555-5555-5555-555555555555"),
                columns: new[] { "IsPaid", "PaidAt", "PaymentId", "PaymentLink", "PaymentMethod", "PaymentStatus", "Status" },
                values: new object[] { false, null, null, null, "cash", null, 1 });

            migrationBuilder.InsertData(
                table: "RestaurantAdmins",
                columns: new[] { "Id", "CreatedAt", "Email", "LastLoginAt", "Name", "PasswordHash", "RestaurantId" },
                values: new object[] { new Guid("66666666-6666-6666-6666-666666666666"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "yalla@qrmenu.com", null, "Yalla Manager", "$2a$11$Thh.HqMglp.WHyPmw353tucW4uCPg0yTWxkZdFqXjf.J/oY66niH2", new Guid("22222222-2222-2222-2222-222222222222") });

            migrationBuilder.UpdateData(
                table: "Restaurants",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222222"),
                columns: new[] { "AcceptingOrders", "AlifGate", "AlifKey", "AlifPassword", "DcArticul", "DcMerchantId", "DcSecretKey", "PauseMessage", "PaymentLink" },
                values: new object[] { true, null, null, null, null, null, null, null, null });

            migrationBuilder.CreateIndex(
                name: "IX_RestaurantAdmins_Email",
                table: "RestaurantAdmins",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_RestaurantAdmins_RestaurantId",
                table: "RestaurantAdmins",
                column: "RestaurantId");

            migrationBuilder.AddForeignKey(
                name: "FK_Products_Menus_MenuId",
                table: "Products",
                column: "MenuId",
                principalTable: "Menus",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Products_Menus_MenuId",
                table: "Products");

            migrationBuilder.DropTable(
                name: "RestaurantAdmins");

            migrationBuilder.DropColumn(
                name: "AcceptingOrders",
                table: "Restaurants");

            migrationBuilder.DropColumn(
                name: "AlifGate",
                table: "Restaurants");

            migrationBuilder.DropColumn(
                name: "AlifKey",
                table: "Restaurants");

            migrationBuilder.DropColumn(
                name: "AlifPassword",
                table: "Restaurants");

            migrationBuilder.DropColumn(
                name: "DcArticul",
                table: "Restaurants");

            migrationBuilder.DropColumn(
                name: "DcMerchantId",
                table: "Restaurants");

            migrationBuilder.DropColumn(
                name: "DcSecretKey",
                table: "Restaurants");

            migrationBuilder.DropColumn(
                name: "PauseMessage",
                table: "Restaurants");

            migrationBuilder.DropColumn(
                name: "PaymentLink",
                table: "Restaurants");

            migrationBuilder.DropColumn(
                name: "IsPaid",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "PaidAt",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "PaymentId",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "PaymentLink",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "PaymentMethod",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "PaymentStatus",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "CancelReason",
                table: "OrderItems");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "OrderItems");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "OrderItems");

            migrationBuilder.DropColumn(
                name: "AvailableFrom",
                table: "Categories");

            migrationBuilder.DropColumn(
                name: "AvailableTo",
                table: "Categories");

            migrationBuilder.DropColumn(
                name: "IsTemporarilyDisabled",
                table: "Categories");

            migrationBuilder.UpdateData(
                table: "Admins",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                column: "PasswordHash",
                value: "$2a$11$8fS.GTW/sOVXpYnUhUy7lOTzojlH77KW/dJN1.vESubgatDeHY0B.");

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"),
                column: "CreatedAt",
                value: new DateTime(2026, 2, 22, 5, 49, 50, 400, DateTimeKind.Utc).AddTicks(5993));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"),
                column: "CreatedAt",
                value: new DateTime(2026, 2, 22, 5, 49, 50, 400, DateTimeKind.Utc).AddTicks(6003));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("cccccccc-cccc-cccc-cccc-cccccccccccc"),
                column: "CreatedAt",
                value: new DateTime(2026, 2, 22, 5, 49, 50, 400, DateTimeKind.Utc).AddTicks(6007));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("dddddddd-dddd-dddd-dddd-dddddddddddd"),
                column: "CreatedAt",
                value: new DateTime(2026, 2, 22, 5, 49, 50, 400, DateTimeKind.Utc).AddTicks(6011));

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee"),
                column: "CreatedAt",
                value: new DateTime(2026, 2, 22, 5, 49, 50, 400, DateTimeKind.Utc).AddTicks(6014));

            migrationBuilder.UpdateData(
                table: "Orders",
                keyColumn: "Id",
                keyValue: new Guid("11111111-5555-5555-5555-555555555555"),
                column: "Status",
                value: 5);

            migrationBuilder.UpdateData(
                table: "Orders",
                keyColumn: "Id",
                keyValue: new Guid("22222222-5555-5555-5555-555555555555"),
                column: "Status",
                value: 2);

            migrationBuilder.AddForeignKey(
                name: "FK_Products_Menus_MenuId",
                table: "Products",
                column: "MenuId",
                principalTable: "Menus",
                principalColumn: "Id");
        }
    }
}
