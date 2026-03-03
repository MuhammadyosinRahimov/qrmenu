using Microsoft.EntityFrameworkCore;
using QrMenu.Core.Entities;
using QrMenu.Core.Enums;

namespace QrMenu.Infrastructure.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Admin> Admins => Set<Admin>();
    public DbSet<RestaurantAdmin> RestaurantAdmins => Set<RestaurantAdmin>();
    public DbSet<Restaurant> Restaurants => Set<Restaurant>();
    public DbSet<Menu> Menus => Set<Menu>();
    public DbSet<MenuCategory> MenuCategories => Set<MenuCategory>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<ProductSize> ProductSizes => Set<ProductSize>();
    public DbSet<ProductAddon> ProductAddons => Set<ProductAddon>();
    public DbSet<Table> Tables => Set<Table>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<OtpCode> OtpCodes => Set<OtpCode>();
    public DbSet<TableSession> TableSessions => Set<TableSession>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Phone).IsUnique();
            entity.Property(e => e.Phone).HasMaxLength(20).IsRequired();
            entity.Property(e => e.Name).HasMaxLength(100);
        });

        // Admin
        modelBuilder.Entity<Admin>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Email).IsUnique();
            entity.Property(e => e.Email).HasMaxLength(255).IsRequired();
            entity.Property(e => e.PasswordHash).IsRequired();
            entity.Property(e => e.Name).HasMaxLength(100).IsRequired();
        });

        // RestaurantAdmin
        modelBuilder.Entity<RestaurantAdmin>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Email).IsUnique();
            entity.Property(e => e.Email).HasMaxLength(255).IsRequired();
            entity.Property(e => e.PasswordHash).IsRequired();
            entity.Property(e => e.Name).HasMaxLength(100).IsRequired();

            entity.HasOne(e => e.Restaurant)
                  .WithMany(r => r.RestaurantAdmins)
                  .HasForeignKey(e => e.RestaurantId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // Restaurant
        modelBuilder.Entity<Restaurant>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).HasMaxLength(200).IsRequired();
            entity.Property(e => e.Description).HasMaxLength(1000);
            entity.Property(e => e.Address).HasMaxLength(500);
            entity.Property(e => e.Phone).HasMaxLength(20);
            entity.Property(e => e.LogoUrl).HasMaxLength(500);
            entity.Property(e => e.PauseMessage).HasMaxLength(500);
            entity.Property(e => e.DeliveryFee).HasPrecision(10, 2);
        });

        // Menu
        modelBuilder.Entity<Menu>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).HasMaxLength(200).IsRequired();
            entity.Property(e => e.Description).HasMaxLength(1000);

            entity.HasOne(e => e.Restaurant)
                  .WithMany(r => r.Menus)
                  .HasForeignKey(e => e.RestaurantId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // MenuCategory
        modelBuilder.Entity<MenuCategory>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => new { e.MenuId, e.CategoryId }).IsUnique();

            entity.HasOne(e => e.Menu)
                  .WithMany(m => m.MenuCategories)
                  .HasForeignKey(e => e.MenuId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Category)
                  .WithMany()
                  .HasForeignKey(e => e.CategoryId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // Category
        modelBuilder.Entity<Category>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).HasMaxLength(100).IsRequired();
            entity.Property(e => e.Icon).HasMaxLength(50);

            // Self-referencing relationship for subcategories
            entity.HasOne(e => e.ParentCategory)
                  .WithMany(e => e.SubCategories)
                  .HasForeignKey(e => e.ParentCategoryId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // Product
        modelBuilder.Entity<Product>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).HasMaxLength(200).IsRequired();
            entity.Property(e => e.Description).HasMaxLength(1000);
            entity.Property(e => e.BasePrice).HasPrecision(10, 2);
            entity.Property(e => e.Rating).HasPrecision(3, 2);
            entity.Property(e => e.ImageUrl).HasMaxLength(500);

            entity.HasOne(e => e.Category)
                  .WithMany(c => c.Products)
                  .HasForeignKey(e => e.CategoryId)
                  .OnDelete(DeleteBehavior.Cascade);

            // Связь с Menu
            entity.HasOne(e => e.Menu)
                  .WithMany()
                  .HasForeignKey(e => e.MenuId)
                  .OnDelete(DeleteBehavior.SetNull);
        });

        // ProductSize
        modelBuilder.Entity<ProductSize>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).HasMaxLength(50).IsRequired();
            entity.Property(e => e.PriceModifier).HasPrecision(10, 2);

            entity.HasOne(e => e.Product)
                  .WithMany(p => p.Sizes)
                  .HasForeignKey(e => e.ProductId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // ProductAddon
        modelBuilder.Entity<ProductAddon>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).HasMaxLength(100).IsRequired();
            entity.Property(e => e.Price).HasPrecision(10, 2);

            entity.HasOne(e => e.Product)
                  .WithMany(p => p.Addons)
                  .HasForeignKey(e => e.ProductId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // Table
        modelBuilder.Entity<Table>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => new { e.RestaurantId, e.Number }).IsUnique();
            entity.Property(e => e.Name).HasMaxLength(100);
            entity.Property(e => e.QrCode).HasMaxLength(500);

            entity.HasOne(e => e.Restaurant)
                  .WithMany(r => r.Tables)
                  .HasForeignKey(e => e.RestaurantId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Menu)
                  .WithMany()
                  .HasForeignKey(e => e.MenuId)
                  .OnDelete(DeleteBehavior.SetNull);
        });

        // Order
        modelBuilder.Entity<Order>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Subtotal).HasPrecision(10, 2);
            entity.Property(e => e.Tax).HasPrecision(10, 2);
            entity.Property(e => e.Total).HasPrecision(10, 2);
            entity.Property(e => e.DeliveryFee).HasPrecision(10, 2);
            entity.Property(e => e.SpecialInstructions).HasMaxLength(500);
            entity.Property(e => e.DeliveryAddress).HasMaxLength(500);
            entity.Property(e => e.CustomerName).HasMaxLength(100);
            entity.Property(e => e.CustomerPhone).HasMaxLength(20);

            entity.HasOne(e => e.User)
                  .WithMany(u => u.Orders)
                  .HasForeignKey(e => e.UserId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Table)
                  .WithMany(t => t.Orders)
                  .HasForeignKey(e => e.TableId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.TableSession)
                  .WithMany(s => s.Orders)
                  .HasForeignKey(e => e.TableSessionId)
                  .OnDelete(DeleteBehavior.SetNull);

            entity.HasOne(e => e.Restaurant)
                  .WithMany(r => r.Orders)
                  .HasForeignKey(e => e.RestaurantId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // OrderItem
        modelBuilder.Entity<OrderItem>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.ProductName).HasMaxLength(200).IsRequired();
            entity.Property(e => e.SizeName).HasMaxLength(50);
            entity.Property(e => e.UnitPrice).HasPrecision(10, 2);
            entity.Property(e => e.TotalPrice).HasPrecision(10, 2);
            entity.Property(e => e.SelectedAddons).HasMaxLength(1000);
            entity.Property(e => e.CancelReason).HasMaxLength(500);

            entity.HasOne(e => e.Order)
                  .WithMany(o => o.Items)
                  .HasForeignKey(e => e.OrderId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Product)
                  .WithMany()
                  .HasForeignKey(e => e.ProductId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // OtpCode
        modelBuilder.Entity<OtpCode>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => new { e.Phone, e.Code });
            entity.Property(e => e.Phone).HasMaxLength(20).IsRequired();
            entity.Property(e => e.Code).HasMaxLength(6).IsRequired();
        });

        // TableSession
        modelBuilder.Entity<TableSession>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => new { e.TableId, e.Status });

            entity.HasOne(e => e.Table)
                  .WithMany()
                  .HasForeignKey(e => e.TableId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Restaurant)
                  .WithMany()
                  .HasForeignKey(e => e.RestaurantId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // Seed data
        SeedData(modelBuilder);
    }

    private void SeedData(ModelBuilder modelBuilder)
    {
        // Fixed IDs for seeding
        var adminId = Guid.Parse("11111111-1111-1111-1111-111111111111");
        var restaurantId = Guid.Parse("22222222-2222-2222-2222-222222222222");
        var menuId = Guid.Parse("33333333-3333-3333-3333-333333333333");
        var userId = Guid.Parse("44444444-4444-4444-4444-444444444444");
        var tableId = Guid.Parse("55555555-5555-5555-5555-555555555555");

        // Category IDs
        var catPizzaId = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa");
        var catBurgersId = Guid.Parse("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb");
        var catDrinksId = Guid.Parse("cccccccc-cccc-cccc-cccc-cccccccccccc");
        var catDessertsId = Guid.Parse("dddddddd-dddd-dddd-dddd-dddddddddddd");
        var catSaladsId = Guid.Parse("eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee");

        // Product IDs
        var prodMargheritaId = Guid.Parse("11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa");
        var prodPepperoniId = Guid.Parse("22222222-aaaa-aaaa-aaaa-aaaaaaaaaaaa");
        var prodHawaiianId = Guid.Parse("33333333-aaaa-aaaa-aaaa-aaaaaaaaaaaa");
        var prodClassicBurgerId = Guid.Parse("11111111-bbbb-bbbb-bbbb-bbbbbbbbbbbb");
        var prodCheeseBurgerId = Guid.Parse("22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb");
        var prodColaId = Guid.Parse("11111111-cccc-cccc-cccc-cccccccccccc");
        var prodJuiceId = Guid.Parse("22222222-cccc-cccc-cccc-cccccccccccc");
        var prodCoffeeId = Guid.Parse("33333333-cccc-cccc-cccc-cccccccccccc");
        var prodTiramisuId = Guid.Parse("11111111-dddd-dddd-dddd-dddddddddddd");
        var prodCheesecakeId = Guid.Parse("22222222-dddd-dddd-dddd-dddddddddddd");
        var prodCaesarId = Guid.Parse("11111111-eeee-eeee-eeee-eeeeeeeeeeee");
        var prodGreekId = Guid.Parse("22222222-eeee-eeee-eeee-eeeeeeeeeeee");

        // Order IDs
        var orderId1 = Guid.Parse("11111111-5555-5555-5555-555555555555");
        var orderId2 = Guid.Parse("22222222-5555-5555-5555-555555555555");

        var seedDate = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc);

        // Seed Admin
        modelBuilder.Entity<Admin>().HasData(new Admin
        {
            Id = adminId,
            Email = "admin@qrmenu.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123"),
            Name = "Администратор",
            CreatedAt = seedDate
        });

        // Seed Restaurant
        modelBuilder.Entity<Restaurant>().HasData(new Restaurant
        {
            Id = restaurantId,
            Name = "Yalla Cafe",
            Description = "Уютное кафе с разнообразным меню",
            Address = "ул. Примерная, 123",
            Phone = "+992901234567",
            IsActive = true,
            AcceptingOrders = true,
            CreatedAt = seedDate
        });

        // Seed RestaurantAdmin
        var restaurantAdminId = Guid.Parse("66666666-6666-6666-6666-666666666666");
        modelBuilder.Entity<RestaurantAdmin>().HasData(new RestaurantAdmin
        {
            Id = restaurantAdminId,
            Email = "yalla@qrmenu.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("yalla123"),
            Name = "Yalla Manager",
            RestaurantId = restaurantId,
            CreatedAt = seedDate
        });

        // Seed Menu
        modelBuilder.Entity<Menu>().HasData(new Menu
        {
            Id = menuId,
            Name = "Основное меню",
            Description = "Полное меню нашего ресторана",
            IsActive = true,
            RestaurantId = restaurantId,
            CreatedAt = seedDate
        });

        // Seed Categories
        modelBuilder.Entity<Category>().HasData(
            new Category { Id = catPizzaId, Name = "Пицца", Icon = "local_pizza", SortOrder = 1, IsActive = true },
            new Category { Id = catBurgersId, Name = "Бургеры", Icon = "lunch_dining", SortOrder = 2, IsActive = true },
            new Category { Id = catDrinksId, Name = "Напитки", Icon = "local_cafe", SortOrder = 3, IsActive = true },
            new Category { Id = catDessertsId, Name = "Десерты", Icon = "cake", SortOrder = 4, IsActive = true },
            new Category { Id = catSaladsId, Name = "Салаты", Icon = "eco", SortOrder = 5, IsActive = true }
        );

        // Seed MenuCategories (link categories to menu)
        modelBuilder.Entity<MenuCategory>().HasData(
            new MenuCategory { Id = Guid.Parse("11111111-3333-3333-3333-333333333333"), MenuId = menuId, CategoryId = catPizzaId, SortOrder = 1 },
            new MenuCategory { Id = Guid.Parse("22222222-3333-3333-3333-333333333333"), MenuId = menuId, CategoryId = catBurgersId, SortOrder = 2 },
            new MenuCategory { Id = Guid.Parse("33333333-3333-3333-3333-333333333333"), MenuId = menuId, CategoryId = catDrinksId, SortOrder = 3 },
            new MenuCategory { Id = Guid.Parse("44444444-3333-3333-3333-333333333333"), MenuId = menuId, CategoryId = catDessertsId, SortOrder = 4 },
            new MenuCategory { Id = Guid.Parse("55555555-3333-3333-3333-333333333333"), MenuId = menuId, CategoryId = catSaladsId, SortOrder = 5 }
        );

        // Seed Products - Pizza
        modelBuilder.Entity<Product>().HasData(
            new Product
            {
                Id = prodMargheritaId,
                Name = "Маргарита",
                Description = "Классическая пицца с томатным соусом, моцареллой и базиликом",
                BasePrice = 450,
                CategoryId = catPizzaId,
                IsAvailable = true,
                Rating = 4.8m,
                Calories = 850,
                PrepTimeMinutes = 20,
                CreatedAt = seedDate
            },
            new Product
            {
                Id = prodPepperoniId,
                Name = "Пепперони",
                Description = "Пицца с острой колбасой пепперони и сыром моцарелла",
                BasePrice = 520,
                CategoryId = catPizzaId,
                IsAvailable = true,
                Rating = 4.9m,
                Calories = 950,
                PrepTimeMinutes = 20,
                CreatedAt = seedDate
            },
            new Product
            {
                Id = prodHawaiianId,
                Name = "Гавайская",
                Description = "Пицца с ветчиной, ананасами и сыром",
                BasePrice = 480,
                CategoryId = catPizzaId,
                IsAvailable = true,
                Rating = 4.5m,
                Calories = 880,
                PrepTimeMinutes = 20,
                CreatedAt = seedDate
            }
        );

        // Seed Products - Burgers
        modelBuilder.Entity<Product>().HasData(
            new Product
            {
                Id = prodClassicBurgerId,
                Name = "Классический бургер",
                Description = "Сочная говяжья котлета с салатом, томатами и соусом",
                BasePrice = 350,
                CategoryId = catBurgersId,
                IsAvailable = true,
                Rating = 4.7m,
                Calories = 650,
                PrepTimeMinutes = 15,
                CreatedAt = seedDate
            },
            new Product
            {
                Id = prodCheeseBurgerId,
                Name = "Чизбургер",
                Description = "Бургер с двойным сыром чеддер и фирменным соусом",
                BasePrice = 390,
                CategoryId = catBurgersId,
                IsAvailable = true,
                Rating = 4.8m,
                Calories = 750,
                PrepTimeMinutes = 15,
                CreatedAt = seedDate
            }
        );

        // Seed Products - Drinks
        modelBuilder.Entity<Product>().HasData(
            new Product
            {
                Id = prodColaId,
                Name = "Кола",
                Description = "Освежающий газированный напиток",
                BasePrice = 80,
                CategoryId = catDrinksId,
                IsAvailable = true,
                Rating = 4.5m,
                Calories = 140,
                PrepTimeMinutes = 2,
                CreatedAt = seedDate
            },
            new Product
            {
                Id = prodJuiceId,
                Name = "Апельсиновый сок",
                Description = "Свежевыжатый апельсиновый сок",
                BasePrice = 120,
                CategoryId = catDrinksId,
                IsAvailable = true,
                Rating = 4.9m,
                Calories = 110,
                PrepTimeMinutes = 5,
                CreatedAt = seedDate
            },
            new Product
            {
                Id = prodCoffeeId,
                Name = "Капучино",
                Description = "Ароматный кофе с молочной пенкой",
                BasePrice = 150,
                CategoryId = catDrinksId,
                IsAvailable = true,
                Rating = 4.8m,
                Calories = 120,
                PrepTimeMinutes = 5,
                CreatedAt = seedDate
            }
        );

        // Seed Products - Desserts
        modelBuilder.Entity<Product>().HasData(
            new Product
            {
                Id = prodTiramisuId,
                Name = "Тирамису",
                Description = "Классический итальянский десерт с кофейным вкусом",
                BasePrice = 280,
                CategoryId = catDessertsId,
                IsAvailable = true,
                Rating = 4.9m,
                Calories = 450,
                PrepTimeMinutes = 5,
                CreatedAt = seedDate
            },
            new Product
            {
                Id = prodCheesecakeId,
                Name = "Чизкейк",
                Description = "Нежный чизкейк с ягодным соусом",
                BasePrice = 250,
                CategoryId = catDessertsId,
                IsAvailable = true,
                Rating = 4.7m,
                Calories = 380,
                PrepTimeMinutes = 5,
                CreatedAt = seedDate
            }
        );

        // Seed Products - Salads
        modelBuilder.Entity<Product>().HasData(
            new Product
            {
                Id = prodCaesarId,
                Name = "Цезарь с курицей",
                Description = "Салат с куриной грудкой, сухариками и соусом цезарь",
                BasePrice = 320,
                CategoryId = catSaladsId,
                IsAvailable = true,
                Rating = 4.8m,
                Calories = 350,
                PrepTimeMinutes = 10,
                CreatedAt = seedDate
            },
            new Product
            {
                Id = prodGreekId,
                Name = "Греческий",
                Description = "Свежие овощи с сыром фета и оливками",
                BasePrice = 280,
                CategoryId = catSaladsId,
                IsAvailable = true,
                Rating = 4.6m,
                Calories = 280,
                PrepTimeMinutes = 10,
                CreatedAt = seedDate
            }
        );

        // Seed Product Sizes for Pizza
        modelBuilder.Entity<ProductSize>().HasData(
            new ProductSize { Id = Guid.Parse("11111111-1111-aaaa-aaaa-aaaaaaaaaaaa"), ProductId = prodMargheritaId, Name = "Маленькая (25 см)", PriceModifier = 0, IsDefault = true },
            new ProductSize { Id = Guid.Parse("22222222-1111-aaaa-aaaa-aaaaaaaaaaaa"), ProductId = prodMargheritaId, Name = "Средняя (30 см)", PriceModifier = 100, IsDefault = false },
            new ProductSize { Id = Guid.Parse("33333333-1111-aaaa-aaaa-aaaaaaaaaaaa"), ProductId = prodMargheritaId, Name = "Большая (35 см)", PriceModifier = 200, IsDefault = false },
            new ProductSize { Id = Guid.Parse("11111111-2222-aaaa-aaaa-aaaaaaaaaaaa"), ProductId = prodPepperoniId, Name = "Маленькая (25 см)", PriceModifier = 0, IsDefault = true },
            new ProductSize { Id = Guid.Parse("22222222-2222-aaaa-aaaa-aaaaaaaaaaaa"), ProductId = prodPepperoniId, Name = "Средняя (30 см)", PriceModifier = 100, IsDefault = false },
            new ProductSize { Id = Guid.Parse("33333333-2222-aaaa-aaaa-aaaaaaaaaaaa"), ProductId = prodPepperoniId, Name = "Большая (35 см)", PriceModifier = 200, IsDefault = false }
        );

        // Seed Product Sizes for Drinks
        modelBuilder.Entity<ProductSize>().HasData(
            new ProductSize { Id = Guid.Parse("11111111-1111-cccc-cccc-cccccccccccc"), ProductId = prodColaId, Name = "0.33л", PriceModifier = 0, IsDefault = true },
            new ProductSize { Id = Guid.Parse("22222222-1111-cccc-cccc-cccccccccccc"), ProductId = prodColaId, Name = "0.5л", PriceModifier = 30, IsDefault = false },
            new ProductSize { Id = Guid.Parse("33333333-1111-cccc-cccc-cccccccccccc"), ProductId = prodColaId, Name = "1л", PriceModifier = 60, IsDefault = false },
            new ProductSize { Id = Guid.Parse("11111111-3333-cccc-cccc-cccccccccccc"), ProductId = prodCoffeeId, Name = "Маленький", PriceModifier = 0, IsDefault = true },
            new ProductSize { Id = Guid.Parse("22222222-3333-cccc-cccc-cccccccccccc"), ProductId = prodCoffeeId, Name = "Средний", PriceModifier = 40, IsDefault = false },
            new ProductSize { Id = Guid.Parse("33333333-3333-cccc-cccc-cccccccccccc"), ProductId = prodCoffeeId, Name = "Большой", PriceModifier = 70, IsDefault = false }
        );

        // Seed Product Addons for Pizza
        modelBuilder.Entity<ProductAddon>().HasData(
            new ProductAddon { Id = Guid.Parse("11111111-1111-1111-aaaa-aaaaaaaaaaaa"), ProductId = prodMargheritaId, Name = "Дополнительный сыр", Price = 50, IsAvailable = true },
            new ProductAddon { Id = Guid.Parse("22222222-1111-1111-aaaa-aaaaaaaaaaaa"), ProductId = prodMargheritaId, Name = "Грибы", Price = 40, IsAvailable = true },
            new ProductAddon { Id = Guid.Parse("33333333-1111-1111-aaaa-aaaaaaaaaaaa"), ProductId = prodMargheritaId, Name = "Оливки", Price = 35, IsAvailable = true },
            new ProductAddon { Id = Guid.Parse("11111111-2222-1111-aaaa-aaaaaaaaaaaa"), ProductId = prodPepperoniId, Name = "Дополнительный сыр", Price = 50, IsAvailable = true },
            new ProductAddon { Id = Guid.Parse("22222222-2222-1111-aaaa-aaaaaaaaaaaa"), ProductId = prodPepperoniId, Name = "Халапеньо", Price = 30, IsAvailable = true }
        );

        // Seed Product Addons for Burgers
        modelBuilder.Entity<ProductAddon>().HasData(
            new ProductAddon { Id = Guid.Parse("11111111-1111-1111-bbbb-bbbbbbbbbbbb"), ProductId = prodClassicBurgerId, Name = "Бекон", Price = 60, IsAvailable = true },
            new ProductAddon { Id = Guid.Parse("22222222-1111-1111-bbbb-bbbbbbbbbbbb"), ProductId = prodClassicBurgerId, Name = "Яйцо", Price = 40, IsAvailable = true },
            new ProductAddon { Id = Guid.Parse("33333333-1111-1111-bbbb-bbbbbbbbbbbb"), ProductId = prodClassicBurgerId, Name = "Дополнительная котлета", Price = 120, IsAvailable = true },
            new ProductAddon { Id = Guid.Parse("11111111-2222-1111-bbbb-bbbbbbbbbbbb"), ProductId = prodCheeseBurgerId, Name = "Бекон", Price = 60, IsAvailable = true },
            new ProductAddon { Id = Guid.Parse("22222222-2222-1111-bbbb-bbbbbbbbbbbb"), ProductId = prodCheeseBurgerId, Name = "Дополнительный сыр", Price = 40, IsAvailable = true }
        );

        // Seed Table
        modelBuilder.Entity<Table>().HasData(new Table
        {
            Id = tableId,
            RestaurantId = restaurantId,
            MenuId = menuId,
            Number = 1,
            Name = "Столик у окна",
            Type = TableType.Стандартный,
            Capacity = 4,
            IsActive = true,
            CreatedAt = seedDate
        });

        // Seed User
        modelBuilder.Entity<User>().HasData(new User
        {
            Id = userId,
            Phone = "+992901234567",
            Name = "Тестовый пользователь",
            CreatedAt = seedDate,
            LastLoginAt = seedDate
        });

        // Seed Orders
        modelBuilder.Entity<Order>().HasData(
            new Order
            {
                Id = orderId1,
                UserId = userId,
                TableId = tableId,
                Status = OrderStatus.Completed,
                Subtotal = 970,
                Tax = 97,
                Total = 1067,
                SpecialInstructions = "Без лука",
                CreatedAt = seedDate
            },
            new Order
            {
                Id = orderId2,
                UserId = userId,
                TableId = tableId,
                Status = OrderStatus.Confirmed,
                Subtotal = 520,
                Tax = 52,
                Total = 572,
                CreatedAt = seedDate.AddHours(2)
            }
        );

        // Seed Order Items
        modelBuilder.Entity<OrderItem>().HasData(
            new OrderItem
            {
                Id = Guid.Parse("11111111-1111-5555-5555-555555555555"),
                OrderId = orderId1,
                ProductId = prodMargheritaId,
                ProductName = "Маргарита",
                SizeName = "Средняя (30 см)",
                UnitPrice = 550,
                Quantity = 1,
                TotalPrice = 550,
                SelectedAddons = "Дополнительный сыр"
            },
            new OrderItem
            {
                Id = Guid.Parse("22222222-1111-5555-5555-555555555555"),
                OrderId = orderId1,
                ProductId = prodClassicBurgerId,
                ProductName = "Классический бургер",
                UnitPrice = 350,
                Quantity = 1,
                TotalPrice = 350,
                SelectedAddons = ""
            },
            new OrderItem
            {
                Id = Guid.Parse("33333333-1111-5555-5555-555555555555"),
                OrderId = orderId1,
                ProductId = prodColaId,
                ProductName = "Кола",
                SizeName = "0.5л",
                UnitPrice = 110,
                Quantity = 1,
                TotalPrice = 110,
                SelectedAddons = ""
            },
            new OrderItem
            {
                Id = Guid.Parse("11111111-2222-5555-5555-555555555555"),
                OrderId = orderId2,
                ProductId = prodPepperoniId,
                ProductName = "Пепперони",
                SizeName = "Маленькая (25 см)",
                UnitPrice = 520,
                Quantity = 1,
                TotalPrice = 520,
                SelectedAddons = ""
            }
        );
    }
}
