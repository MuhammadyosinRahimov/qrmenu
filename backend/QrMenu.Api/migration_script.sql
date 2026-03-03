CREATE TABLE IF NOT EXISTS "__EFMigrationsHistory" (
    "MigrationId" character varying(150) NOT NULL,
    "ProductVersion" character varying(32) NOT NULL,
    CONSTRAINT "PK___EFMigrationsHistory" PRIMARY KEY ("MigrationId")
);

START TRANSACTION;


DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260219120541_InitialCreate') THEN
    CREATE TABLE "Admins" (
        "Id" uuid NOT NULL,
        "Email" character varying(255) NOT NULL,
        "PasswordHash" text NOT NULL,
        "Name" character varying(100) NOT NULL,
        "CreatedAt" timestamp with time zone NOT NULL,
        "LastLoginAt" timestamp with time zone NULL,
        CONSTRAINT "PK_Admins" PRIMARY KEY ("Id")
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260219120541_InitialCreate') THEN
    CREATE TABLE "Categories" (
        "Id" uuid NOT NULL,
        "Name" character varying(100) NOT NULL,
        "Icon" character varying(50) NOT NULL,
        "SortOrder" integer NOT NULL,
        "IsActive" boolean NOT NULL,
        "CreatedAt" timestamp with time zone NOT NULL,
        CONSTRAINT "PK_Categories" PRIMARY KEY ("Id")
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260219120541_InitialCreate') THEN
    CREATE TABLE "OtpCodes" (
        "Id" uuid NOT NULL,
        "Phone" character varying(20) NOT NULL,
        "Code" character varying(6) NOT NULL,
        "CreatedAt" timestamp with time zone NOT NULL,
        "ExpiresAt" timestamp with time zone NOT NULL,
        "IsUsed" boolean NOT NULL,
        CONSTRAINT "PK_OtpCodes" PRIMARY KEY ("Id")
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260219120541_InitialCreate') THEN
    CREATE TABLE "Restaurants" (
        "Id" uuid NOT NULL,
        "Name" character varying(200) NOT NULL,
        "Description" character varying(1000) NULL,
        "Address" character varying(500) NULL,
        "Phone" character varying(20) NULL,
        "LogoUrl" character varying(500) NULL,
        "IsActive" boolean NOT NULL,
        "CreatedAt" timestamp with time zone NOT NULL,
        CONSTRAINT "PK_Restaurants" PRIMARY KEY ("Id")
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260219120541_InitialCreate') THEN
    CREATE TABLE "Users" (
        "Id" uuid NOT NULL,
        "Phone" character varying(20) NOT NULL,
        "Name" character varying(100) NULL,
        "CreatedAt" timestamp with time zone NOT NULL,
        "LastLoginAt" timestamp with time zone NULL,
        CONSTRAINT "PK_Users" PRIMARY KEY ("Id")
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260219120541_InitialCreate') THEN
    CREATE TABLE "Products" (
        "Id" uuid NOT NULL,
        "Name" character varying(200) NOT NULL,
        "Description" character varying(1000) NOT NULL,
        "BasePrice" numeric(10,2) NOT NULL,
        "ImageUrl" character varying(500) NOT NULL,
        "Rating" numeric(3,2) NOT NULL,
        "Calories" integer NOT NULL,
        "PrepTimeMinutes" integer NOT NULL,
        "IsAvailable" boolean NOT NULL,
        "CreatedAt" timestamp with time zone NOT NULL,
        "CategoryId" uuid NOT NULL,
        CONSTRAINT "PK_Products" PRIMARY KEY ("Id"),
        CONSTRAINT "FK_Products_Categories_CategoryId" FOREIGN KEY ("CategoryId") REFERENCES "Categories" ("Id") ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260219120541_InitialCreate') THEN
    CREATE TABLE "Menus" (
        "Id" uuid NOT NULL,
        "Name" character varying(200) NOT NULL,
        "Description" character varying(1000) NULL,
        "IsActive" boolean NOT NULL,
        "CreatedAt" timestamp with time zone NOT NULL,
        "RestaurantId" uuid NOT NULL,
        CONSTRAINT "PK_Menus" PRIMARY KEY ("Id"),
        CONSTRAINT "FK_Menus_Restaurants_RestaurantId" FOREIGN KEY ("RestaurantId") REFERENCES "Restaurants" ("Id") ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260219120541_InitialCreate') THEN
    CREATE TABLE "ProductAddons" (
        "Id" uuid NOT NULL,
        "Name" character varying(100) NOT NULL,
        "Price" numeric(10,2) NOT NULL,
        "IsAvailable" boolean NOT NULL,
        "ProductId" uuid NOT NULL,
        CONSTRAINT "PK_ProductAddons" PRIMARY KEY ("Id"),
        CONSTRAINT "FK_ProductAddons_Products_ProductId" FOREIGN KEY ("ProductId") REFERENCES "Products" ("Id") ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260219120541_InitialCreate') THEN
    CREATE TABLE "ProductSizes" (
        "Id" uuid NOT NULL,
        "Name" character varying(50) NOT NULL,
        "PriceModifier" numeric(10,2) NOT NULL,
        "IsDefault" boolean NOT NULL,
        "ProductId" uuid NOT NULL,
        CONSTRAINT "PK_ProductSizes" PRIMARY KEY ("Id"),
        CONSTRAINT "FK_ProductSizes_Products_ProductId" FOREIGN KEY ("ProductId") REFERENCES "Products" ("Id") ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260219120541_InitialCreate') THEN
    CREATE TABLE "MenuCategories" (
        "Id" uuid NOT NULL,
        "MenuId" uuid NOT NULL,
        "CategoryId" uuid NOT NULL,
        "SortOrder" integer NOT NULL,
        CONSTRAINT "PK_MenuCategories" PRIMARY KEY ("Id"),
        CONSTRAINT "FK_MenuCategories_Categories_CategoryId" FOREIGN KEY ("CategoryId") REFERENCES "Categories" ("Id") ON DELETE CASCADE,
        CONSTRAINT "FK_MenuCategories_Menus_MenuId" FOREIGN KEY ("MenuId") REFERENCES "Menus" ("Id") ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260219120541_InitialCreate') THEN
    CREATE TABLE "Tables" (
        "Id" uuid NOT NULL,
        "Number" integer NOT NULL,
        "Name" character varying(100) NULL,
        "Type" integer NOT NULL,
        "Capacity" integer NOT NULL,
        "QrCode" character varying(500) NOT NULL,
        "IsActive" boolean NOT NULL,
        "CreatedAt" timestamp with time zone NOT NULL,
        "RestaurantId" uuid NOT NULL,
        "MenuId" uuid NULL,
        CONSTRAINT "PK_Tables" PRIMARY KEY ("Id"),
        CONSTRAINT "FK_Tables_Menus_MenuId" FOREIGN KEY ("MenuId") REFERENCES "Menus" ("Id") ON DELETE SET NULL,
        CONSTRAINT "FK_Tables_Restaurants_RestaurantId" FOREIGN KEY ("RestaurantId") REFERENCES "Restaurants" ("Id") ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260219120541_InitialCreate') THEN
    CREATE TABLE "Orders" (
        "Id" uuid NOT NULL,
        "UserId" uuid NOT NULL,
        "TableId" uuid NOT NULL,
        "TableNumber" integer NOT NULL,
        "CreatedAt" timestamp with time zone NOT NULL,
        "Status" integer NOT NULL,
        "Subtotal" numeric(10,2) NOT NULL,
        "Tax" numeric(10,2) NOT NULL,
        "Total" numeric(10,2) NOT NULL,
        "SpecialInstructions" character varying(500) NULL,
        CONSTRAINT "PK_Orders" PRIMARY KEY ("Id"),
        CONSTRAINT "FK_Orders_Tables_TableId" FOREIGN KEY ("TableId") REFERENCES "Tables" ("Id") ON DELETE RESTRICT,
        CONSTRAINT "FK_Orders_Users_UserId" FOREIGN KEY ("UserId") REFERENCES "Users" ("Id") ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260219120541_InitialCreate') THEN
    CREATE TABLE "OrderItems" (
        "Id" uuid NOT NULL,
        "OrderId" uuid NOT NULL,
        "ProductId" uuid NOT NULL,
        "ProductName" character varying(200) NOT NULL,
        "SizeName" character varying(50) NULL,
        "UnitPrice" numeric(10,2) NOT NULL,
        "Quantity" integer NOT NULL,
        "TotalPrice" numeric(10,2) NOT NULL,
        "SelectedAddons" character varying(1000) NULL,
        CONSTRAINT "PK_OrderItems" PRIMARY KEY ("Id"),
        CONSTRAINT "FK_OrderItems_Orders_OrderId" FOREIGN KEY ("OrderId") REFERENCES "Orders" ("Id") ON DELETE CASCADE,
        CONSTRAINT "FK_OrderItems_Products_ProductId" FOREIGN KEY ("ProductId") REFERENCES "Products" ("Id") ON DELETE RESTRICT
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260219120541_InitialCreate') THEN
    INSERT INTO "Admins" ("Id", "CreatedAt", "Email", "LastLoginAt", "Name", "PasswordHash")
    VALUES ('11111111-1111-1111-1111-111111111111', TIMESTAMPTZ '2024-01-01 00:00:00Z', 'admin@qrmenu.com', NULL, 'Администратор', '$2a$11$j3T89IyjcY6md8XI.cnht.ZzVOZX5tRkTM4n3rJ66szeImQx98Iu.');
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260219120541_InitialCreate') THEN
    CREATE UNIQUE INDEX "IX_Admins_Email" ON "Admins" ("Email");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260219120541_InitialCreate') THEN
    CREATE INDEX "IX_MenuCategories_CategoryId" ON "MenuCategories" ("CategoryId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260219120541_InitialCreate') THEN
    CREATE UNIQUE INDEX "IX_MenuCategories_MenuId_CategoryId" ON "MenuCategories" ("MenuId", "CategoryId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260219120541_InitialCreate') THEN
    CREATE INDEX "IX_Menus_RestaurantId" ON "Menus" ("RestaurantId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260219120541_InitialCreate') THEN
    CREATE INDEX "IX_OrderItems_OrderId" ON "OrderItems" ("OrderId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260219120541_InitialCreate') THEN
    CREATE INDEX "IX_OrderItems_ProductId" ON "OrderItems" ("ProductId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260219120541_InitialCreate') THEN
    CREATE INDEX "IX_Orders_TableId" ON "Orders" ("TableId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260219120541_InitialCreate') THEN
    CREATE INDEX "IX_Orders_UserId" ON "Orders" ("UserId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260219120541_InitialCreate') THEN
    CREATE INDEX "IX_OtpCodes_Phone_Code" ON "OtpCodes" ("Phone", "Code");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260219120541_InitialCreate') THEN
    CREATE INDEX "IX_ProductAddons_ProductId" ON "ProductAddons" ("ProductId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260219120541_InitialCreate') THEN
    CREATE INDEX "IX_Products_CategoryId" ON "Products" ("CategoryId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260219120541_InitialCreate') THEN
    CREATE INDEX "IX_ProductSizes_ProductId" ON "ProductSizes" ("ProductId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260219120541_InitialCreate') THEN
    CREATE INDEX "IX_Tables_MenuId" ON "Tables" ("MenuId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260219120541_InitialCreate') THEN
    CREATE UNIQUE INDEX "IX_Tables_RestaurantId_Number" ON "Tables" ("RestaurantId", "Number");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260219120541_InitialCreate') THEN
    CREATE UNIQUE INDEX "IX_Users_Phone" ON "Users" ("Phone");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260219120541_InitialCreate') THEN
    INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
    VALUES ('20260219120541_InitialCreate', '7.0.20');
    END IF;
END $EF$;
COMMIT;

START TRANSACTION;


DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260220115504_AddMockData') THEN
    ALTER TABLE "Categories" ADD "ParentCategoryId" uuid NULL;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260220115504_AddMockData') THEN
    UPDATE "Admins" SET "PasswordHash" = '$2a$11$uqwBlyxYU1YmaJrfd6fS9OhlMzYZRo/zCfGyWmGT39U9jo/GzJUua'
    WHERE "Id" = '11111111-1111-1111-1111-111111111111';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260220115504_AddMockData') THEN
    INSERT INTO "Categories" ("Id", "CreatedAt", "Icon", "IsActive", "Name", "ParentCategoryId", "SortOrder")
    VALUES ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', TIMESTAMPTZ '2026-02-20 11:55:04.054407Z', 'local_pizza', TRUE, 'Пицца', NULL, 1);
    INSERT INTO "Categories" ("Id", "CreatedAt", "Icon", "IsActive", "Name", "ParentCategoryId", "SortOrder")
    VALUES ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', TIMESTAMPTZ '2026-02-20 11:55:04.05441Z', 'lunch_dining', TRUE, 'Бургеры', NULL, 2);
    INSERT INTO "Categories" ("Id", "CreatedAt", "Icon", "IsActive", "Name", "ParentCategoryId", "SortOrder")
    VALUES ('cccccccc-cccc-cccc-cccc-cccccccccccc', TIMESTAMPTZ '2026-02-20 11:55:04.054411Z', 'local_cafe', TRUE, 'Напитки', NULL, 3);
    INSERT INTO "Categories" ("Id", "CreatedAt", "Icon", "IsActive", "Name", "ParentCategoryId", "SortOrder")
    VALUES ('dddddddd-dddd-dddd-dddd-dddddddddddd', TIMESTAMPTZ '2026-02-20 11:55:04.054411Z', 'cake', TRUE, 'Десерты', NULL, 4);
    INSERT INTO "Categories" ("Id", "CreatedAt", "Icon", "IsActive", "Name", "ParentCategoryId", "SortOrder")
    VALUES ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', TIMESTAMPTZ '2026-02-20 11:55:04.054411Z', 'eco', TRUE, 'Салаты', NULL, 5);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260220115504_AddMockData') THEN
    INSERT INTO "Restaurants" ("Id", "Address", "CreatedAt", "Description", "IsActive", "LogoUrl", "Name", "Phone")
    VALUES ('22222222-2222-2222-2222-222222222222', 'ул. Примерная, 123', TIMESTAMPTZ '2024-01-01 00:00:00Z', 'Уютное кафе с разнообразным меню', TRUE, NULL, 'Yalla Cafe', '+992901234567');
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260220115504_AddMockData') THEN
    INSERT INTO "Users" ("Id", "CreatedAt", "LastLoginAt", "Name", "Phone")
    VALUES ('44444444-4444-4444-4444-444444444444', TIMESTAMPTZ '2024-01-01 00:00:00Z', TIMESTAMPTZ '2024-01-01 00:00:00Z', 'Тестовый пользователь', '+992901234567');
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260220115504_AddMockData') THEN
    INSERT INTO "Menus" ("Id", "CreatedAt", "Description", "IsActive", "Name", "RestaurantId")
    VALUES ('33333333-3333-3333-3333-333333333333', TIMESTAMPTZ '2024-01-01 00:00:00Z', 'Полное меню нашего ресторана', TRUE, 'Основное меню', '22222222-2222-2222-2222-222222222222');
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260220115504_AddMockData') THEN
    INSERT INTO "Products" ("Id", "BasePrice", "Calories", "CategoryId", "CreatedAt", "Description", "ImageUrl", "IsAvailable", "Name", "PrepTimeMinutes", "Rating")
    VALUES ('11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 450.0, 850, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', TIMESTAMPTZ '2024-01-01 00:00:00Z', 'Классическая пицца с томатным соусом, моцареллой и базиликом', '', TRUE, 'Маргарита', 20, 4.8);
    INSERT INTO "Products" ("Id", "BasePrice", "Calories", "CategoryId", "CreatedAt", "Description", "ImageUrl", "IsAvailable", "Name", "PrepTimeMinutes", "Rating")
    VALUES ('11111111-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 350.0, 650, 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', TIMESTAMPTZ '2024-01-01 00:00:00Z', 'Сочная говяжья котлета с салатом, томатами и соусом', '', TRUE, 'Классический бургер', 15, 4.7);
    INSERT INTO "Products" ("Id", "BasePrice", "Calories", "CategoryId", "CreatedAt", "Description", "ImageUrl", "IsAvailable", "Name", "PrepTimeMinutes", "Rating")
    VALUES ('11111111-cccc-cccc-cccc-cccccccccccc', 80.0, 140, 'cccccccc-cccc-cccc-cccc-cccccccccccc', TIMESTAMPTZ '2024-01-01 00:00:00Z', 'Освежающий газированный напиток', '', TRUE, 'Кола', 2, 4.5);
    INSERT INTO "Products" ("Id", "BasePrice", "Calories", "CategoryId", "CreatedAt", "Description", "ImageUrl", "IsAvailable", "Name", "PrepTimeMinutes", "Rating")
    VALUES ('11111111-dddd-dddd-dddd-dddddddddddd', 280.0, 450, 'dddddddd-dddd-dddd-dddd-dddddddddddd', TIMESTAMPTZ '2024-01-01 00:00:00Z', 'Классический итальянский десерт с кофейным вкусом', '', TRUE, 'Тирамису', 5, 4.9);
    INSERT INTO "Products" ("Id", "BasePrice", "Calories", "CategoryId", "CreatedAt", "Description", "ImageUrl", "IsAvailable", "Name", "PrepTimeMinutes", "Rating")
    VALUES ('11111111-eeee-eeee-eeee-eeeeeeeeeeee', 320.0, 350, 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', TIMESTAMPTZ '2024-01-01 00:00:00Z', 'Салат с куриной грудкой, сухариками и соусом цезарь', '', TRUE, 'Цезарь с курицей', 10, 4.8);
    INSERT INTO "Products" ("Id", "BasePrice", "Calories", "CategoryId", "CreatedAt", "Description", "ImageUrl", "IsAvailable", "Name", "PrepTimeMinutes", "Rating")
    VALUES ('22222222-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 520.0, 950, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', TIMESTAMPTZ '2024-01-01 00:00:00Z', 'Пицца с острой колбасой пепперони и сыром моцарелла', '', TRUE, 'Пепперони', 20, 4.9);
    INSERT INTO "Products" ("Id", "BasePrice", "Calories", "CategoryId", "CreatedAt", "Description", "ImageUrl", "IsAvailable", "Name", "PrepTimeMinutes", "Rating")
    VALUES ('22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 390.0, 750, 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', TIMESTAMPTZ '2024-01-01 00:00:00Z', 'Бургер с двойным сыром чеддер и фирменным соусом', '', TRUE, 'Чизбургер', 15, 4.8);
    INSERT INTO "Products" ("Id", "BasePrice", "Calories", "CategoryId", "CreatedAt", "Description", "ImageUrl", "IsAvailable", "Name", "PrepTimeMinutes", "Rating")
    VALUES ('22222222-cccc-cccc-cccc-cccccccccccc', 120.0, 110, 'cccccccc-cccc-cccc-cccc-cccccccccccc', TIMESTAMPTZ '2024-01-01 00:00:00Z', 'Свежевыжатый апельсиновый сок', '', TRUE, 'Апельсиновый сок', 5, 4.9);
    INSERT INTO "Products" ("Id", "BasePrice", "Calories", "CategoryId", "CreatedAt", "Description", "ImageUrl", "IsAvailable", "Name", "PrepTimeMinutes", "Rating")
    VALUES ('22222222-dddd-dddd-dddd-dddddddddddd', 250.0, 380, 'dddddddd-dddd-dddd-dddd-dddddddddddd', TIMESTAMPTZ '2024-01-01 00:00:00Z', 'Нежный чизкейк с ягодным соусом', '', TRUE, 'Чизкейк', 5, 4.7);
    INSERT INTO "Products" ("Id", "BasePrice", "Calories", "CategoryId", "CreatedAt", "Description", "ImageUrl", "IsAvailable", "Name", "PrepTimeMinutes", "Rating")
    VALUES ('22222222-eeee-eeee-eeee-eeeeeeeeeeee', 280.0, 280, 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', TIMESTAMPTZ '2024-01-01 00:00:00Z', 'Свежие овощи с сыром фета и оливками', '', TRUE, 'Греческий', 10, 4.6);
    INSERT INTO "Products" ("Id", "BasePrice", "Calories", "CategoryId", "CreatedAt", "Description", "ImageUrl", "IsAvailable", "Name", "PrepTimeMinutes", "Rating")
    VALUES ('33333333-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 480.0, 880, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', TIMESTAMPTZ '2024-01-01 00:00:00Z', 'Пицца с ветчиной, ананасами и сыром', '', TRUE, 'Гавайская', 20, 4.5);
    INSERT INTO "Products" ("Id", "BasePrice", "Calories", "CategoryId", "CreatedAt", "Description", "ImageUrl", "IsAvailable", "Name", "PrepTimeMinutes", "Rating")
    VALUES ('33333333-cccc-cccc-cccc-cccccccccccc', 150.0, 120, 'cccccccc-cccc-cccc-cccc-cccccccccccc', TIMESTAMPTZ '2024-01-01 00:00:00Z', 'Ароматный кофе с молочной пенкой', '', TRUE, 'Капучино', 5, 4.8);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260220115504_AddMockData') THEN
    INSERT INTO "MenuCategories" ("Id", "CategoryId", "MenuId", "SortOrder")
    VALUES ('11111111-3333-3333-3333-333333333333', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '33333333-3333-3333-3333-333333333333', 1);
    INSERT INTO "MenuCategories" ("Id", "CategoryId", "MenuId", "SortOrder")
    VALUES ('22222222-3333-3333-3333-333333333333', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '33333333-3333-3333-3333-333333333333', 2);
    INSERT INTO "MenuCategories" ("Id", "CategoryId", "MenuId", "SortOrder")
    VALUES ('33333333-3333-3333-3333-333333333333', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '33333333-3333-3333-3333-333333333333', 3);
    INSERT INTO "MenuCategories" ("Id", "CategoryId", "MenuId", "SortOrder")
    VALUES ('44444444-3333-3333-3333-333333333333', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '33333333-3333-3333-3333-333333333333', 4);
    INSERT INTO "MenuCategories" ("Id", "CategoryId", "MenuId", "SortOrder")
    VALUES ('55555555-3333-3333-3333-333333333333', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '33333333-3333-3333-3333-333333333333', 5);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260220115504_AddMockData') THEN
    INSERT INTO "ProductAddons" ("Id", "IsAvailable", "Name", "Price", "ProductId")
    VALUES ('11111111-1111-1111-aaaa-aaaaaaaaaaaa', TRUE, 'Дополнительный сыр', 50.0, '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa');
    INSERT INTO "ProductAddons" ("Id", "IsAvailable", "Name", "Price", "ProductId")
    VALUES ('11111111-1111-1111-bbbb-bbbbbbbbbbbb', TRUE, 'Бекон', 60.0, '11111111-bbbb-bbbb-bbbb-bbbbbbbbbbbb');
    INSERT INTO "ProductAddons" ("Id", "IsAvailable", "Name", "Price", "ProductId")
    VALUES ('11111111-2222-1111-aaaa-aaaaaaaaaaaa', TRUE, 'Дополнительный сыр', 50.0, '22222222-aaaa-aaaa-aaaa-aaaaaaaaaaaa');
    INSERT INTO "ProductAddons" ("Id", "IsAvailable", "Name", "Price", "ProductId")
    VALUES ('11111111-2222-1111-bbbb-bbbbbbbbbbbb', TRUE, 'Бекон', 60.0, '22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb');
    INSERT INTO "ProductAddons" ("Id", "IsAvailable", "Name", "Price", "ProductId")
    VALUES ('22222222-1111-1111-aaaa-aaaaaaaaaaaa', TRUE, 'Грибы', 40.0, '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa');
    INSERT INTO "ProductAddons" ("Id", "IsAvailable", "Name", "Price", "ProductId")
    VALUES ('22222222-1111-1111-bbbb-bbbbbbbbbbbb', TRUE, 'Яйцо', 40.0, '11111111-bbbb-bbbb-bbbb-bbbbbbbbbbbb');
    INSERT INTO "ProductAddons" ("Id", "IsAvailable", "Name", "Price", "ProductId")
    VALUES ('22222222-2222-1111-aaaa-aaaaaaaaaaaa', TRUE, 'Халапеньо', 30.0, '22222222-aaaa-aaaa-aaaa-aaaaaaaaaaaa');
    INSERT INTO "ProductAddons" ("Id", "IsAvailable", "Name", "Price", "ProductId")
    VALUES ('22222222-2222-1111-bbbb-bbbbbbbbbbbb', TRUE, 'Дополнительный сыр', 40.0, '22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb');
    INSERT INTO "ProductAddons" ("Id", "IsAvailable", "Name", "Price", "ProductId")
    VALUES ('33333333-1111-1111-aaaa-aaaaaaaaaaaa', TRUE, 'Оливки', 35.0, '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa');
    INSERT INTO "ProductAddons" ("Id", "IsAvailable", "Name", "Price", "ProductId")
    VALUES ('33333333-1111-1111-bbbb-bbbbbbbbbbbb', TRUE, 'Дополнительная котлета', 120.0, '11111111-bbbb-bbbb-bbbb-bbbbbbbbbbbb');
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260220115504_AddMockData') THEN
    INSERT INTO "ProductSizes" ("Id", "IsDefault", "Name", "PriceModifier", "ProductId")
    VALUES ('11111111-1111-aaaa-aaaa-aaaaaaaaaaaa', TRUE, 'Маленькая (25 см)', 0.0, '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa');
    INSERT INTO "ProductSizes" ("Id", "IsDefault", "Name", "PriceModifier", "ProductId")
    VALUES ('11111111-1111-cccc-cccc-cccccccccccc', TRUE, '0.33л', 0.0, '11111111-cccc-cccc-cccc-cccccccccccc');
    INSERT INTO "ProductSizes" ("Id", "IsDefault", "Name", "PriceModifier", "ProductId")
    VALUES ('11111111-2222-aaaa-aaaa-aaaaaaaaaaaa', TRUE, 'Маленькая (25 см)', 0.0, '22222222-aaaa-aaaa-aaaa-aaaaaaaaaaaa');
    INSERT INTO "ProductSizes" ("Id", "IsDefault", "Name", "PriceModifier", "ProductId")
    VALUES ('11111111-3333-cccc-cccc-cccccccccccc', TRUE, 'Маленький', 0.0, '33333333-cccc-cccc-cccc-cccccccccccc');
    INSERT INTO "ProductSizes" ("Id", "IsDefault", "Name", "PriceModifier", "ProductId")
    VALUES ('22222222-1111-aaaa-aaaa-aaaaaaaaaaaa', FALSE, 'Средняя (30 см)', 100.0, '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa');
    INSERT INTO "ProductSizes" ("Id", "IsDefault", "Name", "PriceModifier", "ProductId")
    VALUES ('22222222-1111-cccc-cccc-cccccccccccc', FALSE, '0.5л', 30.0, '11111111-cccc-cccc-cccc-cccccccccccc');
    INSERT INTO "ProductSizes" ("Id", "IsDefault", "Name", "PriceModifier", "ProductId")
    VALUES ('22222222-2222-aaaa-aaaa-aaaaaaaaaaaa', FALSE, 'Средняя (30 см)', 100.0, '22222222-aaaa-aaaa-aaaa-aaaaaaaaaaaa');
    INSERT INTO "ProductSizes" ("Id", "IsDefault", "Name", "PriceModifier", "ProductId")
    VALUES ('22222222-3333-cccc-cccc-cccccccccccc', FALSE, 'Средний', 40.0, '33333333-cccc-cccc-cccc-cccccccccccc');
    INSERT INTO "ProductSizes" ("Id", "IsDefault", "Name", "PriceModifier", "ProductId")
    VALUES ('33333333-1111-aaaa-aaaa-aaaaaaaaaaaa', FALSE, 'Большая (35 см)', 200.0, '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa');
    INSERT INTO "ProductSizes" ("Id", "IsDefault", "Name", "PriceModifier", "ProductId")
    VALUES ('33333333-1111-cccc-cccc-cccccccccccc', FALSE, '1л', 60.0, '11111111-cccc-cccc-cccc-cccccccccccc');
    INSERT INTO "ProductSizes" ("Id", "IsDefault", "Name", "PriceModifier", "ProductId")
    VALUES ('33333333-2222-aaaa-aaaa-aaaaaaaaaaaa', FALSE, 'Большая (35 см)', 200.0, '22222222-aaaa-aaaa-aaaa-aaaaaaaaaaaa');
    INSERT INTO "ProductSizes" ("Id", "IsDefault", "Name", "PriceModifier", "ProductId")
    VALUES ('33333333-3333-cccc-cccc-cccccccccccc', FALSE, 'Большой', 70.0, '33333333-cccc-cccc-cccc-cccccccccccc');
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260220115504_AddMockData') THEN
    INSERT INTO "Tables" ("Id", "Capacity", "CreatedAt", "IsActive", "MenuId", "Name", "Number", "QrCode", "RestaurantId", "Type")
    VALUES ('55555555-5555-5555-5555-555555555555', 4, TIMESTAMPTZ '2024-01-01 00:00:00Z', TRUE, '33333333-3333-3333-3333-333333333333', 'Столик у окна', 1, '', '22222222-2222-2222-2222-222222222222', 0);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260220115504_AddMockData') THEN
    INSERT INTO "Orders" ("Id", "CreatedAt", "SpecialInstructions", "Status", "Subtotal", "TableId", "TableNumber", "Tax", "Total", "UserId")
    VALUES ('11111111-5555-5555-5555-555555555555', TIMESTAMPTZ '2024-01-01 00:00:00Z', 'Без лука', 5, 970.0, '55555555-5555-5555-5555-555555555555', 0, 97.0, 1067.0, '44444444-4444-4444-4444-444444444444');
    INSERT INTO "Orders" ("Id", "CreatedAt", "SpecialInstructions", "Status", "Subtotal", "TableId", "TableNumber", "Tax", "Total", "UserId")
    VALUES ('22222222-5555-5555-5555-555555555555', TIMESTAMPTZ '2024-01-01 02:00:00Z', NULL, 2, 520.0, '55555555-5555-5555-5555-555555555555', 0, 52.0, 572.0, '44444444-4444-4444-4444-444444444444');
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260220115504_AddMockData') THEN
    INSERT INTO "OrderItems" ("Id", "OrderId", "ProductId", "ProductName", "Quantity", "SelectedAddons", "SizeName", "TotalPrice", "UnitPrice")
    VALUES ('11111111-1111-5555-5555-555555555555', '11111111-5555-5555-5555-555555555555', '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Маргарита', 1, 'Дополнительный сыр', 'Средняя (30 см)', 550.0, 550.0);
    INSERT INTO "OrderItems" ("Id", "OrderId", "ProductId", "ProductName", "Quantity", "SelectedAddons", "SizeName", "TotalPrice", "UnitPrice")
    VALUES ('11111111-2222-5555-5555-555555555555', '22222222-5555-5555-5555-555555555555', '22222222-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Пепперони', 1, '', 'Маленькая (25 см)', 520.0, 520.0);
    INSERT INTO "OrderItems" ("Id", "OrderId", "ProductId", "ProductName", "Quantity", "SelectedAddons", "SizeName", "TotalPrice", "UnitPrice")
    VALUES ('22222222-1111-5555-5555-555555555555', '11111111-5555-5555-5555-555555555555', '11111111-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Классический бургер', 1, '', NULL, 350.0, 350.0);
    INSERT INTO "OrderItems" ("Id", "OrderId", "ProductId", "ProductName", "Quantity", "SelectedAddons", "SizeName", "TotalPrice", "UnitPrice")
    VALUES ('33333333-1111-5555-5555-555555555555', '11111111-5555-5555-5555-555555555555', '11111111-cccc-cccc-cccc-cccccccccccc', 'Кола', 1, '', '0.5л', 110.0, 110.0);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260220115504_AddMockData') THEN
    CREATE INDEX "IX_Categories_ParentCategoryId" ON "Categories" ("ParentCategoryId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260220115504_AddMockData') THEN
    ALTER TABLE "Categories" ADD CONSTRAINT "FK_Categories_Categories_ParentCategoryId" FOREIGN KEY ("ParentCategoryId") REFERENCES "Categories" ("Id") ON DELETE RESTRICT;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260220115504_AddMockData') THEN
    INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
    VALUES ('20260220115504_AddMockData', '7.0.20');
    END IF;
END $EF$;
COMMIT;

START TRANSACTION;


DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260222054951_AddMenuIdToProduct') THEN
    ALTER TABLE "Products" ADD "MenuId" uuid NULL;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260222054951_AddMenuIdToProduct') THEN
    UPDATE "Admins" SET "PasswordHash" = '$2a$11$8fS.GTW/sOVXpYnUhUy7lOTzojlH77KW/dJN1.vESubgatDeHY0B.'
    WHERE "Id" = '11111111-1111-1111-1111-111111111111';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260222054951_AddMenuIdToProduct') THEN
    UPDATE "Categories" SET "CreatedAt" = TIMESTAMPTZ '2026-02-22 05:49:50.400599Z'
    WHERE "Id" = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260222054951_AddMenuIdToProduct') THEN
    UPDATE "Categories" SET "CreatedAt" = TIMESTAMPTZ '2026-02-22 05:49:50.4006Z'
    WHERE "Id" = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260222054951_AddMenuIdToProduct') THEN
    UPDATE "Categories" SET "CreatedAt" = TIMESTAMPTZ '2026-02-22 05:49:50.4006Z'
    WHERE "Id" = 'cccccccc-cccc-cccc-cccc-cccccccccccc';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260222054951_AddMenuIdToProduct') THEN
    UPDATE "Categories" SET "CreatedAt" = TIMESTAMPTZ '2026-02-22 05:49:50.400601Z'
    WHERE "Id" = 'dddddddd-dddd-dddd-dddd-dddddddddddd';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260222054951_AddMenuIdToProduct') THEN
    UPDATE "Categories" SET "CreatedAt" = TIMESTAMPTZ '2026-02-22 05:49:50.400601Z'
    WHERE "Id" = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260222054951_AddMenuIdToProduct') THEN
    UPDATE "Products" SET "MenuId" = NULL
    WHERE "Id" = '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260222054951_AddMenuIdToProduct') THEN
    UPDATE "Products" SET "MenuId" = NULL
    WHERE "Id" = '11111111-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260222054951_AddMenuIdToProduct') THEN
    UPDATE "Products" SET "MenuId" = NULL
    WHERE "Id" = '11111111-cccc-cccc-cccc-cccccccccccc';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260222054951_AddMenuIdToProduct') THEN
    UPDATE "Products" SET "MenuId" = NULL
    WHERE "Id" = '11111111-dddd-dddd-dddd-dddddddddddd';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260222054951_AddMenuIdToProduct') THEN
    UPDATE "Products" SET "MenuId" = NULL
    WHERE "Id" = '11111111-eeee-eeee-eeee-eeeeeeeeeeee';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260222054951_AddMenuIdToProduct') THEN
    UPDATE "Products" SET "MenuId" = NULL
    WHERE "Id" = '22222222-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260222054951_AddMenuIdToProduct') THEN
    UPDATE "Products" SET "MenuId" = NULL
    WHERE "Id" = '22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260222054951_AddMenuIdToProduct') THEN
    UPDATE "Products" SET "MenuId" = NULL
    WHERE "Id" = '22222222-cccc-cccc-cccc-cccccccccccc';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260222054951_AddMenuIdToProduct') THEN
    UPDATE "Products" SET "MenuId" = NULL
    WHERE "Id" = '22222222-dddd-dddd-dddd-dddddddddddd';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260222054951_AddMenuIdToProduct') THEN
    UPDATE "Products" SET "MenuId" = NULL
    WHERE "Id" = '22222222-eeee-eeee-eeee-eeeeeeeeeeee';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260222054951_AddMenuIdToProduct') THEN
    UPDATE "Products" SET "MenuId" = NULL
    WHERE "Id" = '33333333-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260222054951_AddMenuIdToProduct') THEN
    UPDATE "Products" SET "MenuId" = NULL
    WHERE "Id" = '33333333-cccc-cccc-cccc-cccccccccccc';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260222054951_AddMenuIdToProduct') THEN
    CREATE INDEX "IX_Products_MenuId" ON "Products" ("MenuId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260222054951_AddMenuIdToProduct') THEN
    ALTER TABLE "Products" ADD CONSTRAINT "FK_Products_Menus_MenuId" FOREIGN KEY ("MenuId") REFERENCES "Menus" ("Id");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260222054951_AddMenuIdToProduct') THEN
    INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
    VALUES ('20260222054951_AddMenuIdToProduct', '7.0.20');
    END IF;
END $EF$;
COMMIT;

START TRANSACTION;


DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260223100000_SimplifyOrderStatuses') THEN
    UPDATE "Orders" SET "Status" = 3 WHERE "Status" = 6
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260223100000_SimplifyOrderStatuses') THEN
    UPDATE "Orders" SET "Status" = 2 WHERE "Status" = 5
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260223100000_SimplifyOrderStatuses') THEN
    UPDATE "Orders" SET "Status" = 1 WHERE "Status" IN (2, 3, 4)
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260223100000_SimplifyOrderStatuses') THEN
    INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
    VALUES ('20260223100000_SimplifyOrderStatuses', '7.0.20');
    END IF;
END $EF$;
COMMIT;

START TRANSACTION;


DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260224095757_AddPaymentLink') THEN
    ALTER TABLE "Products" DROP CONSTRAINT "FK_Products_Menus_MenuId";
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260224095757_AddPaymentLink') THEN
    ALTER TABLE "Restaurants" ADD "AcceptingOrders" boolean NOT NULL DEFAULT FALSE;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260224095757_AddPaymentLink') THEN
    ALTER TABLE "Restaurants" ADD "AlifGate" text NULL;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260224095757_AddPaymentLink') THEN
    ALTER TABLE "Restaurants" ADD "AlifKey" text NULL;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260224095757_AddPaymentLink') THEN
    ALTER TABLE "Restaurants" ADD "AlifPassword" text NULL;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260224095757_AddPaymentLink') THEN

                    DO $$
                    BEGIN
                        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Restaurants' AND column_name='DcArticul') THEN
                            ALTER TABLE "Restaurants" ADD "DcArticul" text NULL;
                        END IF;
                        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Restaurants' AND column_name='DcMerchantId') THEN
                            ALTER TABLE "Restaurants" ADD "DcMerchantId" text NULL;
                        END IF;
                        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Restaurants' AND column_name='DcSecretKey') THEN
                            ALTER TABLE "Restaurants" ADD "DcSecretKey" text NULL;
                        END IF;
                        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Restaurants' AND column_name='PauseMessage') THEN
                            ALTER TABLE "Restaurants" ADD "PauseMessage" character varying(500) NULL;
                        END IF;
                        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Restaurants' AND column_name='PaymentLink') THEN
                            ALTER TABLE "Restaurants" ADD "PaymentLink" text NULL;
                        END IF;
                        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Orders' AND column_name='IsPaid') THEN
                            ALTER TABLE "Orders" ADD "IsPaid" boolean NOT NULL DEFAULT FALSE;
                        END IF;
                        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Orders' AND column_name='PaidAt') THEN
                            ALTER TABLE "Orders" ADD "PaidAt" timestamp with time zone NULL;
                        END IF;
                        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Orders' AND column_name='PaymentId') THEN
                            ALTER TABLE "Orders" ADD "PaymentId" text NULL;
                        END IF;
                        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Orders' AND column_name='PaymentLink') THEN
                            ALTER TABLE "Orders" ADD "PaymentLink" text NULL;
                        END IF;
                        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Orders' AND column_name='PaymentMethod') THEN
                            ALTER TABLE "Orders" ADD "PaymentMethod" text NOT NULL DEFAULT 'cash';
                        END IF;
                        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Orders' AND column_name='PaymentStatus') THEN
                            ALTER TABLE "Orders" ADD "PaymentStatus" integer NULL;
                        END IF;
                        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='OrderItems' AND column_name='CancelReason') THEN
                            ALTER TABLE "OrderItems" ADD "CancelReason" character varying(500) NULL;
                        END IF;
                        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='OrderItems' AND column_name='CreatedAt') THEN
                            ALTER TABLE "OrderItems" ADD "CreatedAt" timestamp with time zone NOT NULL DEFAULT '0001-01-01 00:00:00+00';
                        END IF;
                        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='OrderItems' AND column_name='Status') THEN
                            ALTER TABLE "OrderItems" ADD "Status" integer NOT NULL DEFAULT 0;
                        END IF;
                        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Categories' AND column_name='AvailableFrom') THEN
                            ALTER TABLE "Categories" ADD "AvailableFrom" interval NULL;
                        END IF;
                        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Categories' AND column_name='AvailableTo') THEN
                            ALTER TABLE "Categories" ADD "AvailableTo" interval NULL;
                        END IF;
                        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Categories' AND column_name='IsTemporarilyDisabled') THEN
                            ALTER TABLE "Categories" ADD "IsTemporarilyDisabled" boolean NOT NULL DEFAULT FALSE;
                        END IF;
                    END $$;
                
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260224095757_AddPaymentLink') THEN
    CREATE TABLE "RestaurantAdmins" (
        "Id" uuid NOT NULL,
        "Email" character varying(255) NOT NULL,
        "PasswordHash" text NOT NULL,
        "Name" character varying(100) NOT NULL,
        "RestaurantId" uuid NOT NULL,
        "CreatedAt" timestamp with time zone NOT NULL,
        "LastLoginAt" timestamp with time zone NULL,
        CONSTRAINT "PK_RestaurantAdmins" PRIMARY KEY ("Id"),
        CONSTRAINT "FK_RestaurantAdmins_Restaurants_RestaurantId" FOREIGN KEY ("RestaurantId") REFERENCES "Restaurants" ("Id") ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260224095757_AddPaymentLink') THEN
    UPDATE "Admins" SET "PasswordHash" = '$2a$11$MNdhehrSFFENRCQ079MwY.iY.mQTrMLWum0fap.IbW2ndl2qceyCK'
    WHERE "Id" = '11111111-1111-1111-1111-111111111111';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260224095757_AddPaymentLink') THEN
    UPDATE "Categories" SET "AvailableFrom" = NULL, "AvailableTo" = NULL, "CreatedAt" = TIMESTAMPTZ '2026-02-24 09:57:57.01814Z', "IsTemporarilyDisabled" = FALSE
    WHERE "Id" = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260224095757_AddPaymentLink') THEN
    UPDATE "Categories" SET "AvailableFrom" = NULL, "AvailableTo" = NULL, "CreatedAt" = TIMESTAMPTZ '2026-02-24 09:57:57.018145Z', "IsTemporarilyDisabled" = FALSE
    WHERE "Id" = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260224095757_AddPaymentLink') THEN
    UPDATE "Categories" SET "AvailableFrom" = NULL, "AvailableTo" = NULL, "CreatedAt" = TIMESTAMPTZ '2026-02-24 09:57:57.018146Z', "IsTemporarilyDisabled" = FALSE
    WHERE "Id" = 'cccccccc-cccc-cccc-cccc-cccccccccccc';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260224095757_AddPaymentLink') THEN
    UPDATE "Categories" SET "AvailableFrom" = NULL, "AvailableTo" = NULL, "CreatedAt" = TIMESTAMPTZ '2026-02-24 09:57:57.018146Z', "IsTemporarilyDisabled" = FALSE
    WHERE "Id" = 'dddddddd-dddd-dddd-dddd-dddddddddddd';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260224095757_AddPaymentLink') THEN
    UPDATE "Categories" SET "AvailableFrom" = NULL, "AvailableTo" = NULL, "CreatedAt" = TIMESTAMPTZ '2026-02-24 09:57:57.018146Z', "IsTemporarilyDisabled" = FALSE
    WHERE "Id" = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260224095757_AddPaymentLink') THEN
    UPDATE "OrderItems" SET "CancelReason" = NULL, "CreatedAt" = TIMESTAMPTZ '2026-02-24 09:57:57.018305Z', "Status" = 1
    WHERE "Id" = '11111111-1111-5555-5555-555555555555';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260224095757_AddPaymentLink') THEN
    UPDATE "OrderItems" SET "CancelReason" = NULL, "CreatedAt" = TIMESTAMPTZ '2026-02-24 09:57:57.018308Z', "Status" = 1
    WHERE "Id" = '11111111-2222-5555-5555-555555555555';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260224095757_AddPaymentLink') THEN
    UPDATE "OrderItems" SET "CancelReason" = NULL, "CreatedAt" = TIMESTAMPTZ '2026-02-24 09:57:57.018306Z', "Status" = 1
    WHERE "Id" = '22222222-1111-5555-5555-555555555555';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260224095757_AddPaymentLink') THEN
    UPDATE "OrderItems" SET "CancelReason" = NULL, "CreatedAt" = TIMESTAMPTZ '2026-02-24 09:57:57.018307Z', "Status" = 1
    WHERE "Id" = '33333333-1111-5555-5555-555555555555';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260224095757_AddPaymentLink') THEN
    UPDATE "Orders" SET "IsPaid" = FALSE, "PaidAt" = NULL, "PaymentId" = NULL, "PaymentLink" = NULL, "PaymentMethod" = 'cash', "PaymentStatus" = NULL, "Status" = 2
    WHERE "Id" = '11111111-5555-5555-5555-555555555555';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260224095757_AddPaymentLink') THEN
    UPDATE "Orders" SET "IsPaid" = FALSE, "PaidAt" = NULL, "PaymentId" = NULL, "PaymentLink" = NULL, "PaymentMethod" = 'cash', "PaymentStatus" = NULL, "Status" = 1
    WHERE "Id" = '22222222-5555-5555-5555-555555555555';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260224095757_AddPaymentLink') THEN
    INSERT INTO "RestaurantAdmins" ("Id", "CreatedAt", "Email", "LastLoginAt", "Name", "PasswordHash", "RestaurantId")
    VALUES ('66666666-6666-6666-6666-666666666666', TIMESTAMPTZ '2024-01-01 00:00:00Z', 'yalla@qrmenu.com', NULL, 'Yalla Manager', '$2a$11$Thh.HqMglp.WHyPmw353tucW4uCPg0yTWxkZdFqXjf.J/oY66niH2', '22222222-2222-2222-2222-222222222222');
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260224095757_AddPaymentLink') THEN
    UPDATE "Restaurants" SET "AcceptingOrders" = TRUE, "AlifGate" = NULL, "AlifKey" = NULL, "AlifPassword" = NULL, "DcArticul" = NULL, "DcMerchantId" = NULL, "DcSecretKey" = NULL, "PauseMessage" = NULL, "PaymentLink" = NULL
    WHERE "Id" = '22222222-2222-2222-2222-222222222222';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260224095757_AddPaymentLink') THEN
    CREATE UNIQUE INDEX "IX_RestaurantAdmins_Email" ON "RestaurantAdmins" ("Email");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260224095757_AddPaymentLink') THEN
    CREATE INDEX "IX_RestaurantAdmins_RestaurantId" ON "RestaurantAdmins" ("RestaurantId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260224095757_AddPaymentLink') THEN
    ALTER TABLE "Products" ADD CONSTRAINT "FK_Products_Menus_MenuId" FOREIGN KEY ("MenuId") REFERENCES "Menus" ("Id") ON DELETE SET NULL;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260224095757_AddPaymentLink') THEN
    INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
    VALUES ('20260224095757_AddPaymentLink', '7.0.20');
    END IF;
END $EF$;
COMMIT;

START TRANSACTION;


DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260225090341_AddTableSession') THEN
    ALTER TABLE "Restaurants" DROP COLUMN "AlifGate";
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260225090341_AddTableSession') THEN
    ALTER TABLE "Restaurants" DROP COLUMN "AlifKey";
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260225090341_AddTableSession') THEN
    ALTER TABLE "Restaurants" DROP COLUMN "AlifPassword";
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260225090341_AddTableSession') THEN
    ALTER TABLE "Orders" ADD "TableSessionId" uuid NULL;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260225090341_AddTableSession') THEN
    CREATE TABLE "TableSessions" (
        "Id" uuid NOT NULL,
        "TableId" uuid NOT NULL,
        "RestaurantId" uuid NOT NULL,
        "TableNumber" integer NOT NULL,
        "StartedAt" timestamp with time zone NOT NULL,
        "ClosedAt" timestamp with time zone NULL,
        "Status" integer NOT NULL,
        CONSTRAINT "PK_TableSessions" PRIMARY KEY ("Id"),
        CONSTRAINT "FK_TableSessions_Restaurants_RestaurantId" FOREIGN KEY ("RestaurantId") REFERENCES "Restaurants" ("Id") ON DELETE RESTRICT,
        CONSTRAINT "FK_TableSessions_Tables_TableId" FOREIGN KEY ("TableId") REFERENCES "Tables" ("Id") ON DELETE RESTRICT
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260225090341_AddTableSession') THEN
    UPDATE "Admins" SET "PasswordHash" = '$2a$11$3oC5tOd6B9ebO28Wk5m8SORgvGvxR5nmK6A8x2iLZ4ob6ZLHb9u2.'
    WHERE "Id" = '11111111-1111-1111-1111-111111111111';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260225090341_AddTableSession') THEN
    UPDATE "Categories" SET "CreatedAt" = TIMESTAMPTZ '2026-02-25 09:03:40.46668Z'
    WHERE "Id" = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260225090341_AddTableSession') THEN
    UPDATE "Categories" SET "CreatedAt" = TIMESTAMPTZ '2026-02-25 09:03:40.466688Z'
    WHERE "Id" = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260225090341_AddTableSession') THEN
    UPDATE "Categories" SET "CreatedAt" = TIMESTAMPTZ '2026-02-25 09:03:40.466688Z'
    WHERE "Id" = 'cccccccc-cccc-cccc-cccc-cccccccccccc';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260225090341_AddTableSession') THEN
    UPDATE "Categories" SET "CreatedAt" = TIMESTAMPTZ '2026-02-25 09:03:40.466689Z'
    WHERE "Id" = 'dddddddd-dddd-dddd-dddd-dddddddddddd';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260225090341_AddTableSession') THEN
    UPDATE "Categories" SET "CreatedAt" = TIMESTAMPTZ '2026-02-25 09:03:40.466689Z'
    WHERE "Id" = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260225090341_AddTableSession') THEN
    UPDATE "OrderItems" SET "CreatedAt" = TIMESTAMPTZ '2026-02-25 09:03:40.466866Z'
    WHERE "Id" = '11111111-1111-5555-5555-555555555555';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260225090341_AddTableSession') THEN
    UPDATE "OrderItems" SET "CreatedAt" = TIMESTAMPTZ '2026-02-25 09:03:40.466868Z'
    WHERE "Id" = '11111111-2222-5555-5555-555555555555';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260225090341_AddTableSession') THEN
    UPDATE "OrderItems" SET "CreatedAt" = TIMESTAMPTZ '2026-02-25 09:03:40.466867Z'
    WHERE "Id" = '22222222-1111-5555-5555-555555555555';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260225090341_AddTableSession') THEN
    UPDATE "OrderItems" SET "CreatedAt" = TIMESTAMPTZ '2026-02-25 09:03:40.466868Z'
    WHERE "Id" = '33333333-1111-5555-5555-555555555555';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260225090341_AddTableSession') THEN
    UPDATE "Orders" SET "TableSessionId" = NULL
    WHERE "Id" = '11111111-5555-5555-5555-555555555555';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260225090341_AddTableSession') THEN
    UPDATE "Orders" SET "TableSessionId" = NULL
    WHERE "Id" = '22222222-5555-5555-5555-555555555555';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260225090341_AddTableSession') THEN
    UPDATE "RestaurantAdmins" SET "PasswordHash" = '$2a$11$BP8VrrCJfOrVTgir14fAl.WucQ.L7fGc8tT3PlYzVGcDxu6X2Zv9G'
    WHERE "Id" = '66666666-6666-6666-6666-666666666666';
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260225090341_AddTableSession') THEN
    CREATE INDEX "IX_Orders_TableSessionId" ON "Orders" ("TableSessionId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260225090341_AddTableSession') THEN
    CREATE INDEX "IX_TableSessions_RestaurantId" ON "TableSessions" ("RestaurantId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260225090341_AddTableSession') THEN
    CREATE INDEX "IX_TableSessions_TableId_Status" ON "TableSessions" ("TableId", "Status");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260225090341_AddTableSession') THEN
    ALTER TABLE "Orders" ADD CONSTRAINT "FK_Orders_TableSessions_TableSessionId" FOREIGN KEY ("TableSessionId") REFERENCES "TableSessions" ("Id") ON DELETE SET NULL;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260225090341_AddTableSession') THEN
    INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
    VALUES ('20260225090341_AddTableSession', '7.0.20');
    END IF;
END $EF$;
COMMIT;

