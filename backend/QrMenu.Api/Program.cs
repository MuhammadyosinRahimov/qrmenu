using System.Text;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using QrMenu.Api.Hubs;
using QrMenu.Infrastructure.Data;
using QrMenu.Infrastructure.Services;
var builder = WebApplication.CreateBuilder(args);
// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "QR Menu API", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// Database
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// JWT Authentication
var jwtKey = builder.Configuration["Jwt:SecretKey"] ?? "QrMenuSecretKey12345678901234567890";
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "QrMenu";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "QrMenuApp";
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
            ValidateIssuer = true,
            ValidIssuer = jwtIssuer,
            ValidateAudience = true,
            ValidAudience = jwtAudience,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero
        };

        // SignalR JWT support
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var accessToken = context.Request.Query["access_token"];
                var path = context.HttpContext.Request.Path;
                if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/hubs"))
                {
                    context.Token = accessToken;
                }
                return Task.CompletedTask;
            }
        };
    });

// CORS
var defaultOrigins = new[] {
    "http://localhost:3000",
    "http://localhost:3001",
    "https://qr-yalla-lunch.vercel.app",
    "https://qradmin-puce.vercel.app"
};
var configuredOrigins = builder.Configuration.GetSection("App:BaseUrl").Get<string[]>();
var allowedOrigins = configuredOrigins != null
    ? defaultOrigins.Union(configuredOrigins).ToArray()
    : defaultOrigins;

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.WithOrigins(allowedOrigins)
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

// SignalR
builder.Services.AddSignalR();

// Custom Services
builder.Services.AddScoped<IJwtService, JwtService>();

// HttpClient for external API calls (DC Payment, etc.)
builder.Services.AddHttpClient();

// SMS Service - use OsonSmsService if configured, otherwise MockSmsService
var osonSmsToken = builder.Configuration["OsonSms:Token"];
var osonSmsLogin = builder.Configuration["OsonSms:Login"];
if (!string.IsNullOrEmpty(osonSmsToken) && !string.IsNullOrEmpty(osonSmsLogin))
{
    builder.Services.AddHttpClient<ISmsService, OsonSmsService>();
}
else
{
    builder.Services.AddScoped<ISmsService, MockSmsService>();
}

builder.Services.AddScoped<IQrCodeService, QrCodeService>();

// Health checks
builder.Services.AddHealthChecks();

// Rate Limiting
builder.Services.AddRateLimiter(options =>
{
    options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(context =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 100,
                Window = TimeSpan.FromMinutes(1),
                QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                QueueLimit = 10
            }));

    options.OnRejected = async (context, token) =>
    {
        context.HttpContext.Response.StatusCode = 429;
        await context.HttpContext.Response.WriteAsJsonAsync(
            new { message = "Слишком много запросов. Попробуйте позже )" });
    };
});

var app = builder.Build();


app.UseExceptionHandler(errorApp =>
{
    errorApp.Run(async context =>
    {
        context.Response.StatusCode = 500;
        context.Response.ContentType = "application/json";

        var exceptionHandlerPathFeature = context.Features.Get<Microsoft.AspNetCore.Diagnostics.IExceptionHandlerPathFeature>();
        var exception = exceptionHandlerPathFeature?.Error;

        var logger = context.RequestServices.GetRequiredService<ILogger<Program>>();
        logger.LogError(exception, "Unhandled exception at {Path}", context.Request.Path);

        var response = new {
            error = "Internal server error",
            message = exception?.Message ?? "An error occurred",
            stackTrace = app.Environment.IsDevelopment() ? exception?.StackTrace : null,
            path = context.Request.Path.Value
        };

        await context.Response.WriteAsJsonAsync(response);
    });
});

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowAll");

app.UseRateLimiter();

app.UseStaticFiles();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHub<OrdersHub>("/hubs/orders");
app.MapHealthChecks("/health");

// Apply pending migrations
try
{
    using var scope = app.Services.CreateScope();
    var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();

    // ВАЖНО: Добавляем колонки ПЕРЕД миграциями, чтобы EF Core мог работать с ними
    // Ensure all required columns exist BEFORE migrations
    try
    {
        dbContext.Database.ExecuteSqlRaw(@"
            DO $$
            BEGIN
                -- ==================== RESTAURANT COLUMNS ====================

                -- DC Payment fields
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_name = 'Restaurants' AND column_name = 'DcMerchantId'
                ) THEN
                    ALTER TABLE ""Restaurants"" ADD COLUMN ""DcMerchantId"" text NULL;
                    RAISE NOTICE 'DcMerchantId column added';
                END IF;

                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_name = 'Restaurants' AND column_name = 'DcSecretKey'
                ) THEN
                    ALTER TABLE ""Restaurants"" ADD COLUMN ""DcSecretKey"" text NULL;
                    RAISE NOTICE 'DcSecretKey column added';
                END IF;

                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_name = 'Restaurants' AND column_name = 'DcArticul'
                ) THEN
                    ALTER TABLE ""Restaurants"" ADD COLUMN ""DcArticul"" text NULL;
                    RAISE NOTICE 'DcArticul column added';
                END IF;

                -- AcceptingOrders field
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_name = 'Restaurants' AND column_name = 'AcceptingOrders'
                ) THEN
                    ALTER TABLE ""Restaurants"" ADD COLUMN ""AcceptingOrders"" boolean NOT NULL DEFAULT true;
                    RAISE NOTICE 'AcceptingOrders column added';
                END IF;

                -- PauseMessage field
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_name = 'Restaurants' AND column_name = 'PauseMessage'
                ) THEN
                    ALTER TABLE ""Restaurants"" ADD COLUMN ""PauseMessage"" text NULL;
                    RAISE NOTICE 'PauseMessage column added';
                END IF;

                -- PaymentLink field
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_name = 'Restaurants' AND column_name = 'PaymentLink'
                ) THEN
                    ALTER TABLE ""Restaurants"" ADD COLUMN ""PaymentLink"" text NULL;
                    RAISE NOTICE 'PaymentLink column added';
                END IF;

                -- ServiceFeePercent field
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_name = 'Restaurants' AND column_name = 'ServiceFeePercent'
                ) THEN
                    ALTER TABLE ""Restaurants"" ADD COLUMN ""ServiceFeePercent"" decimal(10,2) NOT NULL DEFAULT 10;
                    RAISE NOTICE 'ServiceFeePercent column added';
                END IF;

                -- ==================== TABLE SESSIONS COLUMNS ====================

                -- ServiceFeePercent field
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_name = 'TableSessions' AND column_name = 'ServiceFeePercent'
                ) THEN
                    ALTER TABLE ""TableSessions"" ADD COLUMN ""ServiceFeePercent"" decimal(10,2) NOT NULL DEFAULT 0;
                    RAISE NOTICE 'TableSessions.ServiceFeePercent column added';
                END IF;

                -- SessionSubtotal field
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_name = 'TableSessions' AND column_name = 'SessionSubtotal'
                ) THEN
                    ALTER TABLE ""TableSessions"" ADD COLUMN ""SessionSubtotal"" decimal(10,2) NOT NULL DEFAULT 0;
                    RAISE NOTICE 'SessionSubtotal column added';
                END IF;

                -- SessionServiceFee field
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_name = 'TableSessions' AND column_name = 'SessionServiceFee'
                ) THEN
                    ALTER TABLE ""TableSessions"" ADD COLUMN ""SessionServiceFee"" decimal(10,2) NOT NULL DEFAULT 0;
                    RAISE NOTICE 'SessionServiceFee column added';
                END IF;

                -- SessionTotal field
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_name = 'TableSessions' AND column_name = 'SessionTotal'
                ) THEN
                    ALTER TABLE ""TableSessions"" ADD COLUMN ""SessionTotal"" decimal(10,2) NOT NULL DEFAULT 0;
                    RAISE NOTICE 'SessionTotal column added';
                END IF;

                -- ==================== ORDER COLUMNS ====================

                -- Order payment fields
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_name = 'Orders' AND column_name = 'PaymentMethod'
                ) THEN
                    ALTER TABLE ""Orders"" ADD COLUMN ""PaymentMethod"" text NOT NULL DEFAULT 'cash';
                    RAISE NOTICE 'PaymentMethod column added';
                END IF;

                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_name = 'Orders' AND column_name = 'IsPaid'
                ) THEN
                    ALTER TABLE ""Orders"" ADD COLUMN ""IsPaid"" boolean NOT NULL DEFAULT false;
                    RAISE NOTICE 'IsPaid column added';
                END IF;

                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_name = 'Orders' AND column_name = 'PaymentId'
                ) THEN
                    ALTER TABLE ""Orders"" ADD COLUMN ""PaymentId"" text NULL;
                    RAISE NOTICE 'PaymentId column added';
                END IF;

                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_name = 'Orders' AND column_name = 'PaymentStatus'
                ) THEN
                    ALTER TABLE ""Orders"" ADD COLUMN ""PaymentStatus"" integer NULL;
                    RAISE NOTICE 'PaymentStatus column added';
                END IF;

                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_name = 'Orders' AND column_name = 'PaidAt'
                ) THEN
                    ALTER TABLE ""Orders"" ADD COLUMN ""PaidAt"" timestamp with time zone NULL;
                    RAISE NOTICE 'PaidAt column added';
                END IF;

                -- Order.PaymentLink
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_name = 'Orders' AND column_name = 'PaymentLink'
                ) THEN
                    ALTER TABLE ""Orders"" ADD COLUMN ""PaymentLink"" text NULL;
                    RAISE NOTICE 'Orders.PaymentLink column added';
                END IF;

                -- Order.CompletedAt
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_name = 'Orders' AND column_name = 'CompletedAt'
                ) THEN
                    ALTER TABLE ""Orders"" ADD COLUMN ""CompletedAt"" timestamp with time zone NULL;
                    RAISE NOTICE 'CompletedAt column added';
                END IF;

                -- Order.TableSessionId
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_name = 'Orders' AND column_name = 'TableSessionId'
                ) THEN
                    ALTER TABLE ""Orders"" ADD COLUMN ""TableSessionId"" uuid NULL;
                    RAISE NOTICE 'TableSessionId column added';
                END IF;

                -- ==================== ORDER ITEM COLUMNS ====================

                -- OrderItem.Status
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_name = 'OrderItems' AND column_name = 'Status'
                ) THEN
                    ALTER TABLE ""OrderItems"" ADD COLUMN ""Status"" integer NOT NULL DEFAULT 1;
                    RAISE NOTICE 'OrderItems.Status column added';
                END IF;

                -- OrderItem.CreatedAt
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_name = 'OrderItems' AND column_name = 'CreatedAt'
                ) THEN
                    ALTER TABLE ""OrderItems"" ADD COLUMN ""CreatedAt"" timestamp with time zone NOT NULL DEFAULT NOW();
                    RAISE NOTICE 'OrderItems.CreatedAt column added';
                END IF;

                -- OrderItem.CancelReason
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_name = 'OrderItems' AND column_name = 'CancelReason'
                ) THEN
                    ALTER TABLE ""OrderItems"" ADD COLUMN ""CancelReason"" text NULL;
                    RAISE NOTICE 'OrderItems.CancelReason column added';
                END IF;

                -- OrderItem.Note (комментарий к блюду)
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_name = 'OrderItems' AND column_name = 'Note'
                ) THEN
                    ALTER TABLE ""OrderItems"" ADD COLUMN ""Note"" text NULL;
                    RAISE NOTICE 'OrderItems.Note column added';
                END IF;
            END $$;
        ");
        Console.WriteLine("All required columns added successfully");
    }
    catch (Exception sqlEx)
    {
        Console.WriteLine($"DC payment columns error: {sqlEx.Message}");
    }

    // Apply migrations
    dbContext.Database.Migrate();
    Console.WriteLine("Migrations applied successfully");

    // ALWAYS ensure MenuId column exists (migration might have been marked as applied without creating column)
    try
    {
        dbContext.Database.ExecuteSqlRaw(@"
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_name = 'Products' AND column_name = 'MenuId'
                ) THEN
                    ALTER TABLE ""Products"" ADD COLUMN ""MenuId"" uuid NULL;
                    RAISE NOTICE 'MenuId column added';
                END IF;

                IF NOT EXISTS (
                    SELECT 1 FROM pg_indexes WHERE indexname = 'IX_Products_MenuId'
                ) THEN
                    CREATE INDEX ""IX_Products_MenuId"" ON ""Products"" (""MenuId"");
                    RAISE NOTICE 'MenuId index created';
                END IF;

                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.table_constraints
                    WHERE constraint_name = 'FK_Products_Menus_MenuId'
                ) THEN
                    ALTER TABLE ""Products"" ADD CONSTRAINT ""FK_Products_Menus_MenuId""
                        FOREIGN KEY (""MenuId"") REFERENCES ""Menus"" (""Id"") ON DELETE SET NULL;
                    RAISE NOTICE 'MenuId foreign key added';
                END IF;
            END $$;
        ");
        Console.WriteLine("MenuId column check completed");
    }
    catch (Exception sqlEx)
    {
        Console.WriteLine($"MenuId column check error: {sqlEx.Message}");
    }

    // Ensure IsDeleted column exists for Products (soft delete support)
    try
    {
        dbContext.Database.ExecuteSqlRaw(@"
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_name = 'Products' AND column_name = 'IsDeleted'
                ) THEN
                    ALTER TABLE ""Products"" ADD COLUMN ""IsDeleted"" boolean NOT NULL DEFAULT false;
                    RAISE NOTICE 'IsDeleted column added';
                END IF;
            END $$;
        ");
        Console.WriteLine("IsDeleted column check completed");
    }
    catch (Exception sqlEx)
    {
        Console.WriteLine($"IsDeleted column check error: {sqlEx.Message}");
    }
}
catch (Exception ex)
{
    Console.WriteLine($"Database error: {ex.Message}");
}

app.Run();
