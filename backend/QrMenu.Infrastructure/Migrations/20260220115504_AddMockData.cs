using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace QrMenu.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddMockData : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "ParentCategoryId",
                table: "Categories",
                type: "uuid",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "Admins",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                column: "PasswordHash",
                value: "$2a$11$uqwBlyxYU1YmaJrfd6fS9OhlMzYZRo/zCfGyWmGT39U9jo/GzJUua");

            migrationBuilder.InsertData(
                table: "Categories",
                columns: new[] { "Id", "CreatedAt", "Icon", "IsActive", "Name", "ParentCategoryId", "SortOrder" },
                values: new object[,]
                {
                    { new Guid("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"), new DateTime(2026, 2, 20, 11, 55, 4, 54, DateTimeKind.Utc).AddTicks(4079), "local_pizza", true, "Пицца", null, 1 },
                    { new Guid("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"), new DateTime(2026, 2, 20, 11, 55, 4, 54, DateTimeKind.Utc).AddTicks(4109), "lunch_dining", true, "Бургеры", null, 2 },
                    { new Guid("cccccccc-cccc-cccc-cccc-cccccccccccc"), new DateTime(2026, 2, 20, 11, 55, 4, 54, DateTimeKind.Utc).AddTicks(4113), "local_cafe", true, "Напитки", null, 3 },
                    { new Guid("dddddddd-dddd-dddd-dddd-dddddddddddd"), new DateTime(2026, 2, 20, 11, 55, 4, 54, DateTimeKind.Utc).AddTicks(4115), "cake", true, "Десерты", null, 4 },
                    { new Guid("eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee"), new DateTime(2026, 2, 20, 11, 55, 4, 54, DateTimeKind.Utc).AddTicks(4118), "eco", true, "Салаты", null, 5 }
                });

            migrationBuilder.InsertData(
                table: "Restaurants",
                columns: new[] { "Id", "Address", "CreatedAt", "Description", "IsActive", "LogoUrl", "Name", "Phone" },
                values: new object[] { new Guid("22222222-2222-2222-2222-222222222222"), "ул. Примерная, 123", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Уютное кафе с разнообразным меню", true, null, "Yalla Cafe", "+992901234567" });

            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "Id", "CreatedAt", "LastLoginAt", "Name", "Phone" },
                values: new object[] { new Guid("44444444-4444-4444-4444-444444444444"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Тестовый пользователь", "+992901234567" });

            migrationBuilder.InsertData(
                table: "Menus",
                columns: new[] { "Id", "CreatedAt", "Description", "IsActive", "Name", "RestaurantId" },
                values: new object[] { new Guid("33333333-3333-3333-3333-333333333333"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Полное меню нашего ресторана", true, "Основное меню", new Guid("22222222-2222-2222-2222-222222222222") });

            migrationBuilder.InsertData(
                table: "Products",
                columns: new[] { "Id", "BasePrice", "Calories", "CategoryId", "CreatedAt", "Description", "ImageUrl", "IsAvailable", "Name", "PrepTimeMinutes", "Rating" },
                values: new object[,]
                {
                    { new Guid("11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa"), 450m, 850, new Guid("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Классическая пицца с томатным соусом, моцареллой и базиликом", "", true, "Маргарита", 20, 4.8m },
                    { new Guid("11111111-bbbb-bbbb-bbbb-bbbbbbbbbbbb"), 350m, 650, new Guid("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Сочная говяжья котлета с салатом, томатами и соусом", "", true, "Классический бургер", 15, 4.7m },
                    { new Guid("11111111-cccc-cccc-cccc-cccccccccccc"), 80m, 140, new Guid("cccccccc-cccc-cccc-cccc-cccccccccccc"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Освежающий газированный напиток", "", true, "Кола", 2, 4.5m },
                    { new Guid("11111111-dddd-dddd-dddd-dddddddddddd"), 280m, 450, new Guid("dddddddd-dddd-dddd-dddd-dddddddddddd"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Классический итальянский десерт с кофейным вкусом", "", true, "Тирамису", 5, 4.9m },
                    { new Guid("11111111-eeee-eeee-eeee-eeeeeeeeeeee"), 320m, 350, new Guid("eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Салат с куриной грудкой, сухариками и соусом цезарь", "", true, "Цезарь с курицей", 10, 4.8m },
                    { new Guid("22222222-aaaa-aaaa-aaaa-aaaaaaaaaaaa"), 520m, 950, new Guid("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Пицца с острой колбасой пепперони и сыром моцарелла", "", true, "Пепперони", 20, 4.9m },
                    { new Guid("22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb"), 390m, 750, new Guid("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Бургер с двойным сыром чеддер и фирменным соусом", "", true, "Чизбургер", 15, 4.8m },
                    { new Guid("22222222-cccc-cccc-cccc-cccccccccccc"), 120m, 110, new Guid("cccccccc-cccc-cccc-cccc-cccccccccccc"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Свежевыжатый апельсиновый сок", "", true, "Апельсиновый сок", 5, 4.9m },
                    { new Guid("22222222-dddd-dddd-dddd-dddddddddddd"), 250m, 380, new Guid("dddddddd-dddd-dddd-dddd-dddddddddddd"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Нежный чизкейк с ягодным соусом", "", true, "Чизкейк", 5, 4.7m },
                    { new Guid("22222222-eeee-eeee-eeee-eeeeeeeeeeee"), 280m, 280, new Guid("eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Свежие овощи с сыром фета и оливками", "", true, "Греческий", 10, 4.6m },
                    { new Guid("33333333-aaaa-aaaa-aaaa-aaaaaaaaaaaa"), 480m, 880, new Guid("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Пицца с ветчиной, ананасами и сыром", "", true, "Гавайская", 20, 4.5m },
                    { new Guid("33333333-cccc-cccc-cccc-cccccccccccc"), 150m, 120, new Guid("cccccccc-cccc-cccc-cccc-cccccccccccc"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Ароматный кофе с молочной пенкой", "", true, "Капучино", 5, 4.8m }
                });

            migrationBuilder.InsertData(
                table: "MenuCategories",
                columns: new[] { "Id", "CategoryId", "MenuId", "SortOrder" },
                values: new object[,]
                {
                    { new Guid("11111111-3333-3333-3333-333333333333"), new Guid("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"), new Guid("33333333-3333-3333-3333-333333333333"), 1 },
                    { new Guid("22222222-3333-3333-3333-333333333333"), new Guid("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"), new Guid("33333333-3333-3333-3333-333333333333"), 2 },
                    { new Guid("33333333-3333-3333-3333-333333333333"), new Guid("cccccccc-cccc-cccc-cccc-cccccccccccc"), new Guid("33333333-3333-3333-3333-333333333333"), 3 },
                    { new Guid("44444444-3333-3333-3333-333333333333"), new Guid("dddddddd-dddd-dddd-dddd-dddddddddddd"), new Guid("33333333-3333-3333-3333-333333333333"), 4 },
                    { new Guid("55555555-3333-3333-3333-333333333333"), new Guid("eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee"), new Guid("33333333-3333-3333-3333-333333333333"), 5 }
                });

            migrationBuilder.InsertData(
                table: "ProductAddons",
                columns: new[] { "Id", "IsAvailable", "Name", "Price", "ProductId" },
                values: new object[,]
                {
                    { new Guid("11111111-1111-1111-aaaa-aaaaaaaaaaaa"), true, "Дополнительный сыр", 50m, new Guid("11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa") },
                    { new Guid("11111111-1111-1111-bbbb-bbbbbbbbbbbb"), true, "Бекон", 60m, new Guid("11111111-bbbb-bbbb-bbbb-bbbbbbbbbbbb") },
                    { new Guid("11111111-2222-1111-aaaa-aaaaaaaaaaaa"), true, "Дополнительный сыр", 50m, new Guid("22222222-aaaa-aaaa-aaaa-aaaaaaaaaaaa") },
                    { new Guid("11111111-2222-1111-bbbb-bbbbbbbbbbbb"), true, "Бекон", 60m, new Guid("22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb") },
                    { new Guid("22222222-1111-1111-aaaa-aaaaaaaaaaaa"), true, "Грибы", 40m, new Guid("11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa") },
                    { new Guid("22222222-1111-1111-bbbb-bbbbbbbbbbbb"), true, "Яйцо", 40m, new Guid("11111111-bbbb-bbbb-bbbb-bbbbbbbbbbbb") },
                    { new Guid("22222222-2222-1111-aaaa-aaaaaaaaaaaa"), true, "Халапеньо", 30m, new Guid("22222222-aaaa-aaaa-aaaa-aaaaaaaaaaaa") },
                    { new Guid("22222222-2222-1111-bbbb-bbbbbbbbbbbb"), true, "Дополнительный сыр", 40m, new Guid("22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb") },
                    { new Guid("33333333-1111-1111-aaaa-aaaaaaaaaaaa"), true, "Оливки", 35m, new Guid("11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa") },
                    { new Guid("33333333-1111-1111-bbbb-bbbbbbbbbbbb"), true, "Дополнительная котлета", 120m, new Guid("11111111-bbbb-bbbb-bbbb-bbbbbbbbbbbb") }
                });

            migrationBuilder.InsertData(
                table: "ProductSizes",
                columns: new[] { "Id", "IsDefault", "Name", "PriceModifier", "ProductId" },
                values: new object[,]
                {
                    { new Guid("11111111-1111-aaaa-aaaa-aaaaaaaaaaaa"), true, "Маленькая (25 см)", 0m, new Guid("11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa") },
                    { new Guid("11111111-1111-cccc-cccc-cccccccccccc"), true, "0.33л", 0m, new Guid("11111111-cccc-cccc-cccc-cccccccccccc") },
                    { new Guid("11111111-2222-aaaa-aaaa-aaaaaaaaaaaa"), true, "Маленькая (25 см)", 0m, new Guid("22222222-aaaa-aaaa-aaaa-aaaaaaaaaaaa") },
                    { new Guid("11111111-3333-cccc-cccc-cccccccccccc"), true, "Маленький", 0m, new Guid("33333333-cccc-cccc-cccc-cccccccccccc") },
                    { new Guid("22222222-1111-aaaa-aaaa-aaaaaaaaaaaa"), false, "Средняя (30 см)", 100m, new Guid("11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa") },
                    { new Guid("22222222-1111-cccc-cccc-cccccccccccc"), false, "0.5л", 30m, new Guid("11111111-cccc-cccc-cccc-cccccccccccc") },
                    { new Guid("22222222-2222-aaaa-aaaa-aaaaaaaaaaaa"), false, "Средняя (30 см)", 100m, new Guid("22222222-aaaa-aaaa-aaaa-aaaaaaaaaaaa") },
                    { new Guid("22222222-3333-cccc-cccc-cccccccccccc"), false, "Средний", 40m, new Guid("33333333-cccc-cccc-cccc-cccccccccccc") },
                    { new Guid("33333333-1111-aaaa-aaaa-aaaaaaaaaaaa"), false, "Большая (35 см)", 200m, new Guid("11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa") },
                    { new Guid("33333333-1111-cccc-cccc-cccccccccccc"), false, "1л", 60m, new Guid("11111111-cccc-cccc-cccc-cccccccccccc") },
                    { new Guid("33333333-2222-aaaa-aaaa-aaaaaaaaaaaa"), false, "Большая (35 см)", 200m, new Guid("22222222-aaaa-aaaa-aaaa-aaaaaaaaaaaa") },
                    { new Guid("33333333-3333-cccc-cccc-cccccccccccc"), false, "Большой", 70m, new Guid("33333333-cccc-cccc-cccc-cccccccccccc") }
                });

            migrationBuilder.InsertData(
                table: "Tables",
                columns: new[] { "Id", "Capacity", "CreatedAt", "IsActive", "MenuId", "Name", "Number", "QrCode", "RestaurantId", "Type" },
                values: new object[] { new Guid("55555555-5555-5555-5555-555555555555"), 4, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), true, new Guid("33333333-3333-3333-3333-333333333333"), "Столик у окна", 1, "", new Guid("22222222-2222-2222-2222-222222222222"), 0 });

            migrationBuilder.InsertData(
                table: "Orders",
                columns: new[] { "Id", "CreatedAt", "SpecialInstructions", "Status", "Subtotal", "TableId", "TableNumber", "Tax", "Total", "UserId" },
                values: new object[,]
                {
                    { new Guid("11111111-5555-5555-5555-555555555555"), new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Без лука", 5, 970m, new Guid("55555555-5555-5555-5555-555555555555"), 0, 97m, 1067m, new Guid("44444444-4444-4444-4444-444444444444") },
                    { new Guid("22222222-5555-5555-5555-555555555555"), new DateTime(2024, 1, 1, 2, 0, 0, 0, DateTimeKind.Utc), null, 2, 520m, new Guid("55555555-5555-5555-5555-555555555555"), 0, 52m, 572m, new Guid("44444444-4444-4444-4444-444444444444") }
                });

            migrationBuilder.InsertData(
                table: "OrderItems",
                columns: new[] { "Id", "OrderId", "ProductId", "ProductName", "Quantity", "SelectedAddons", "SizeName", "TotalPrice", "UnitPrice" },
                values: new object[,]
                {
                    { new Guid("11111111-1111-5555-5555-555555555555"), new Guid("11111111-5555-5555-5555-555555555555"), new Guid("11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa"), "Маргарита", 1, "Дополнительный сыр", "Средняя (30 см)", 550m, 550m },
                    { new Guid("11111111-2222-5555-5555-555555555555"), new Guid("22222222-5555-5555-5555-555555555555"), new Guid("22222222-aaaa-aaaa-aaaa-aaaaaaaaaaaa"), "Пепперони", 1, "", "Маленькая (25 см)", 520m, 520m },
                    { new Guid("22222222-1111-5555-5555-555555555555"), new Guid("11111111-5555-5555-5555-555555555555"), new Guid("11111111-bbbb-bbbb-bbbb-bbbbbbbbbbbb"), "Классический бургер", 1, "", null, 350m, 350m },
                    { new Guid("33333333-1111-5555-5555-555555555555"), new Guid("11111111-5555-5555-5555-555555555555"), new Guid("11111111-cccc-cccc-cccc-cccccccccccc"), "Кола", 1, "", "0.5л", 110m, 110m }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Categories_ParentCategoryId",
                table: "Categories",
                column: "ParentCategoryId");

            migrationBuilder.AddForeignKey(
                name: "FK_Categories_Categories_ParentCategoryId",
                table: "Categories",
                column: "ParentCategoryId",
                principalTable: "Categories",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Categories_Categories_ParentCategoryId",
                table: "Categories");

            migrationBuilder.DropIndex(
                name: "IX_Categories_ParentCategoryId",
                table: "Categories");

            migrationBuilder.DeleteData(
                table: "MenuCategories",
                keyColumn: "Id",
                keyValue: new Guid("11111111-3333-3333-3333-333333333333"));

            migrationBuilder.DeleteData(
                table: "MenuCategories",
                keyColumn: "Id",
                keyValue: new Guid("22222222-3333-3333-3333-333333333333"));

            migrationBuilder.DeleteData(
                table: "MenuCategories",
                keyColumn: "Id",
                keyValue: new Guid("33333333-3333-3333-3333-333333333333"));

            migrationBuilder.DeleteData(
                table: "MenuCategories",
                keyColumn: "Id",
                keyValue: new Guid("44444444-3333-3333-3333-333333333333"));

            migrationBuilder.DeleteData(
                table: "MenuCategories",
                keyColumn: "Id",
                keyValue: new Guid("55555555-3333-3333-3333-333333333333"));

            migrationBuilder.DeleteData(
                table: "OrderItems",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-5555-5555-555555555555"));

            migrationBuilder.DeleteData(
                table: "OrderItems",
                keyColumn: "Id",
                keyValue: new Guid("11111111-2222-5555-5555-555555555555"));

            migrationBuilder.DeleteData(
                table: "OrderItems",
                keyColumn: "Id",
                keyValue: new Guid("22222222-1111-5555-5555-555555555555"));

            migrationBuilder.DeleteData(
                table: "OrderItems",
                keyColumn: "Id",
                keyValue: new Guid("33333333-1111-5555-5555-555555555555"));

            migrationBuilder.DeleteData(
                table: "ProductAddons",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-aaaa-aaaaaaaaaaaa"));

            migrationBuilder.DeleteData(
                table: "ProductAddons",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-bbbb-bbbbbbbbbbbb"));

            migrationBuilder.DeleteData(
                table: "ProductAddons",
                keyColumn: "Id",
                keyValue: new Guid("11111111-2222-1111-aaaa-aaaaaaaaaaaa"));

            migrationBuilder.DeleteData(
                table: "ProductAddons",
                keyColumn: "Id",
                keyValue: new Guid("11111111-2222-1111-bbbb-bbbbbbbbbbbb"));

            migrationBuilder.DeleteData(
                table: "ProductAddons",
                keyColumn: "Id",
                keyValue: new Guid("22222222-1111-1111-aaaa-aaaaaaaaaaaa"));

            migrationBuilder.DeleteData(
                table: "ProductAddons",
                keyColumn: "Id",
                keyValue: new Guid("22222222-1111-1111-bbbb-bbbbbbbbbbbb"));

            migrationBuilder.DeleteData(
                table: "ProductAddons",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-1111-aaaa-aaaaaaaaaaaa"));

            migrationBuilder.DeleteData(
                table: "ProductAddons",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-1111-bbbb-bbbbbbbbbbbb"));

            migrationBuilder.DeleteData(
                table: "ProductAddons",
                keyColumn: "Id",
                keyValue: new Guid("33333333-1111-1111-aaaa-aaaaaaaaaaaa"));

            migrationBuilder.DeleteData(
                table: "ProductAddons",
                keyColumn: "Id",
                keyValue: new Guid("33333333-1111-1111-bbbb-bbbbbbbbbbbb"));

            migrationBuilder.DeleteData(
                table: "ProductSizes",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-aaaa-aaaa-aaaaaaaaaaaa"));

            migrationBuilder.DeleteData(
                table: "ProductSizes",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-cccc-cccc-cccccccccccc"));

            migrationBuilder.DeleteData(
                table: "ProductSizes",
                keyColumn: "Id",
                keyValue: new Guid("11111111-2222-aaaa-aaaa-aaaaaaaaaaaa"));

            migrationBuilder.DeleteData(
                table: "ProductSizes",
                keyColumn: "Id",
                keyValue: new Guid("11111111-3333-cccc-cccc-cccccccccccc"));

            migrationBuilder.DeleteData(
                table: "ProductSizes",
                keyColumn: "Id",
                keyValue: new Guid("22222222-1111-aaaa-aaaa-aaaaaaaaaaaa"));

            migrationBuilder.DeleteData(
                table: "ProductSizes",
                keyColumn: "Id",
                keyValue: new Guid("22222222-1111-cccc-cccc-cccccccccccc"));

            migrationBuilder.DeleteData(
                table: "ProductSizes",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-aaaa-aaaa-aaaaaaaaaaaa"));

            migrationBuilder.DeleteData(
                table: "ProductSizes",
                keyColumn: "Id",
                keyValue: new Guid("22222222-3333-cccc-cccc-cccccccccccc"));

            migrationBuilder.DeleteData(
                table: "ProductSizes",
                keyColumn: "Id",
                keyValue: new Guid("33333333-1111-aaaa-aaaa-aaaaaaaaaaaa"));

            migrationBuilder.DeleteData(
                table: "ProductSizes",
                keyColumn: "Id",
                keyValue: new Guid("33333333-1111-cccc-cccc-cccccccccccc"));

            migrationBuilder.DeleteData(
                table: "ProductSizes",
                keyColumn: "Id",
                keyValue: new Guid("33333333-2222-aaaa-aaaa-aaaaaaaaaaaa"));

            migrationBuilder.DeleteData(
                table: "ProductSizes",
                keyColumn: "Id",
                keyValue: new Guid("33333333-3333-cccc-cccc-cccccccccccc"));

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("11111111-dddd-dddd-dddd-dddddddddddd"));

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("11111111-eeee-eeee-eeee-eeeeeeeeeeee"));

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("22222222-cccc-cccc-cccc-cccccccccccc"));

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("22222222-dddd-dddd-dddd-dddddddddddd"));

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("22222222-eeee-eeee-eeee-eeeeeeeeeeee"));

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("33333333-aaaa-aaaa-aaaa-aaaaaaaaaaaa"));

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("dddddddd-dddd-dddd-dddd-dddddddddddd"));

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee"));

            migrationBuilder.DeleteData(
                table: "Orders",
                keyColumn: "Id",
                keyValue: new Guid("11111111-5555-5555-5555-555555555555"));

            migrationBuilder.DeleteData(
                table: "Orders",
                keyColumn: "Id",
                keyValue: new Guid("22222222-5555-5555-5555-555555555555"));

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa"));

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("11111111-bbbb-bbbb-bbbb-bbbbbbbbbbbb"));

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("11111111-cccc-cccc-cccc-cccccccccccc"));

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("22222222-aaaa-aaaa-aaaa-aaaaaaaaaaaa"));

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb"));

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("33333333-cccc-cccc-cccc-cccccccccccc"));

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"));

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"));

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("cccccccc-cccc-cccc-cccc-cccccccccccc"));

            migrationBuilder.DeleteData(
                table: "Tables",
                keyColumn: "Id",
                keyValue: new Guid("55555555-5555-5555-5555-555555555555"));

            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("44444444-4444-4444-4444-444444444444"));

            migrationBuilder.DeleteData(
                table: "Menus",
                keyColumn: "Id",
                keyValue: new Guid("33333333-3333-3333-3333-333333333333"));

            migrationBuilder.DeleteData(
                table: "Restaurants",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222222"));

            migrationBuilder.DropColumn(
                name: "ParentCategoryId",
                table: "Categories");

            migrationBuilder.UpdateData(
                table: "Admins",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                column: "PasswordHash",
                value: "$2a$11$j3T89IyjcY6md8XI.cnht.ZzVOZX5tRkTM4n3rJ66szeImQx98Iu.");
        }
    }
}
