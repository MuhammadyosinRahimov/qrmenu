using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QrMenu.Api.DTOs;
using QrMenu.Core.Entities;
using QrMenu.Infrastructure.Data;

namespace QrMenu.Api.Controllers;

[ApiController]
[Route("api/admin/restaurants")]
[Authorize(Roles = "Admin,RestaurantAdmin")]
public class AdminRestaurantsController : ControllerBase
{
    private readonly AppDbContext _context;

    public AdminRestaurantsController(AppDbContext context)
    {
        _context = context;
    }

    private Guid? GetRestaurantId()
    {
        var restaurantIdClaim = User.FindFirst("restaurantId")?.Value;
        return restaurantIdClaim != null ? Guid.Parse(restaurantIdClaim) : null;
    }

    private bool IsSuperAdmin()
    {
        return User.IsInRole("Admin") && !User.IsInRole("RestaurantAdmin");
    }

    private static bool IsOnlinePaymentAvailable(Restaurant r) =>
        (!string.IsNullOrEmpty(r.DcMerchantId) && !string.IsNullOrEmpty(r.DcSecretKey)) ||
        !string.IsNullOrEmpty(r.PaymentLink);

    [HttpGet]
    public async Task<ActionResult<List<RestaurantDto>>> GetRestaurants()
    {
        try
        {
            var query = _context.Restaurants
                .Include(r => r.Menus)
                .Include(r => r.Tables)
                .AsQueryable();

            var userRestaurantId = GetRestaurantId();
            if (userRestaurantId.HasValue)
            {
                query = query.Where(r => r.Id == userRestaurantId.Value);
            }

            var restaurants = await query
                .OrderByDescending(r => r.CreatedAt)
                .Select(r => new RestaurantDto(
                    r.Id,
                    r.Name,
                    r.Description,
                    r.Address,
                    r.Phone,
                    r.LogoUrl,
                    r.IsActive,
                    r.AcceptingOrders,
                    r.PauseMessage,
                    r.CreatedAt,
                    r.Menus != null ? r.Menus.Count : 0,
                    r.Tables != null ? r.Tables.Count : 0,
                    r.DcMerchantId,
                    r.DcSecretKey,
                    r.DcArticul,
                    (!string.IsNullOrEmpty(r.DcMerchantId) && !string.IsNullOrEmpty(r.DcSecretKey)) || !string.IsNullOrEmpty(r.PaymentLink),
                    r.PaymentLink,
                    r.ServiceFeePercent,
                    r.DeliveryEnabled,
                    r.DeliveryFee,
                    r.TakeawayEnabled
                ))
                .ToListAsync();

            return Ok(restaurants);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new {
                error = "Database error",
                message = ex.Message,
                inner = ex.InnerException?.Message
            });
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<RestaurantDto>> GetRestaurant(Guid id)
    {
        var userRestaurantId = GetRestaurantId();
        if (userRestaurantId.HasValue && userRestaurantId.Value != id)
        {
            return Forbid();
        }

        var restaurant = await _context.Restaurants
            .Include(r => r.Menus)
            .Include(r => r.Tables)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (restaurant == null)
            return NotFound(new { message = "Ресторан не найден" });

        return Ok(new RestaurantDto(
            restaurant.Id,
            restaurant.Name,
            restaurant.Description,
            restaurant.Address,
            restaurant.Phone,
            restaurant.LogoUrl,
            restaurant.IsActive,
            restaurant.AcceptingOrders,
            restaurant.PauseMessage,
            restaurant.CreatedAt,
            restaurant.Menus?.Count ?? 0,
            restaurant.Tables?.Count ?? 0,
            restaurant.DcMerchantId,
            restaurant.DcSecretKey,
            restaurant.DcArticul,
            IsOnlinePaymentAvailable(restaurant),
            restaurant.PaymentLink,
            restaurant.ServiceFeePercent,
            restaurant.DeliveryEnabled,
            restaurant.DeliveryFee,
            restaurant.TakeawayEnabled
        ));
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<RestaurantDto>> CreateRestaurant([FromBody] CreateRestaurantRequest request)
    {
        // Check if admin email is provided and unique
        if (!string.IsNullOrEmpty(request.AdminEmail))
        {
            var existingAdmin = await _context.RestaurantAdmins
                .FirstOrDefaultAsync(a => a.Email.ToLower() == request.AdminEmail.ToLower());

            if (existingAdmin != null)
            {
                return BadRequest(new { message = "Администратор с таким email уже существует" });
            }

            if (string.IsNullOrEmpty(request.AdminPassword))
            {
                return BadRequest(new { message = "Пароль администратора обязателен" });
            }

            if (request.AdminPassword.Length < 6)
            {
                return BadRequest(new { message = "Пароль должен содержать минимум 6 символов" });
            }
        }

        var restaurant = new Restaurant
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Description = request.Description,
            Address = request.Address,
            Phone = request.Phone,
            LogoUrl = request.LogoUrl,
            IsActive = true,
            AcceptingOrders = true,
            CreatedAt = DateTime.UtcNow
        };

        _context.Restaurants.Add(restaurant);

        // Create RestaurantAdmin if email is provided
        if (!string.IsNullOrEmpty(request.AdminEmail) && !string.IsNullOrEmpty(request.AdminPassword))
        {
            var restaurantAdmin = new RestaurantAdmin
            {
                Id = Guid.NewGuid(),
                Email = request.AdminEmail,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.AdminPassword),
                Name = request.AdminName ?? "Администратор",
                RestaurantId = restaurant.Id,
                CreatedAt = DateTime.UtcNow
            };

            _context.RestaurantAdmins.Add(restaurantAdmin);
        }

        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetRestaurant), new { id = restaurant.Id }, new RestaurantDto(
            restaurant.Id,
            restaurant.Name,
            restaurant.Description,
            restaurant.Address,
            restaurant.Phone,
            restaurant.LogoUrl,
            restaurant.IsActive,
            restaurant.AcceptingOrders,
            restaurant.PauseMessage,
            restaurant.CreatedAt,
            0,
            0,
            restaurant.DcMerchantId,
            restaurant.DcSecretKey,
            restaurant.DcArticul,
            false,
            restaurant.PaymentLink,
            restaurant.ServiceFeePercent,
            restaurant.DeliveryEnabled,
            restaurant.DeliveryFee,
            restaurant.TakeawayEnabled
        ));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<RestaurantDto>> UpdateRestaurant(Guid id, [FromBody] UpdateRestaurantRequest request)
    {
        var userRestaurantId = GetRestaurantId();
        if (userRestaurantId.HasValue && userRestaurantId.Value != id)
        {
            return Forbid();
        }

        var restaurant = await _context.Restaurants
            .Include(r => r.Menus)
            .Include(r => r.Tables)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (restaurant == null)
            return NotFound(new { message = "Ресторан не найден" });

        restaurant.Name = request.Name;
        restaurant.Description = request.Description;
        restaurant.Address = request.Address;
        restaurant.Phone = request.Phone;
        // LogoUrl изменяется только через upload-image или delete-image endpoints
        if (request.LogoUrl != null)
        {
            restaurant.LogoUrl = request.LogoUrl;
        }

        // DC Payment credentials
        restaurant.DcMerchantId = request.DcMerchantId;
        restaurant.DcSecretKey = request.DcSecretKey;
        restaurant.DcArticul = request.DcArticul;

        // Payment link
        restaurant.PaymentLink = request.PaymentLink;

        // Service fee percent
        if (request.ServiceFeePercent.HasValue)
        {
            restaurant.ServiceFeePercent = request.ServiceFeePercent.Value;
        }

        // Delivery/Takeaway settings
        restaurant.DeliveryEnabled = request.DeliveryEnabled;
        restaurant.DeliveryFee = request.DeliveryFee;
        restaurant.TakeawayEnabled = request.TakeawayEnabled;

        // Only super admin can change IsActive
        if (IsSuperAdmin())
        {
            restaurant.IsActive = request.IsActive;
        }

        await _context.SaveChangesAsync();

        return Ok(new RestaurantDto(
            restaurant.Id,
            restaurant.Name,
            restaurant.Description,
            restaurant.Address,
            restaurant.Phone,
            restaurant.LogoUrl,
            restaurant.IsActive,
            restaurant.AcceptingOrders,
            restaurant.PauseMessage,
            restaurant.CreatedAt,
            restaurant.Menus?.Count ?? 0,
            restaurant.Tables?.Count ?? 0,
            restaurant.DcMerchantId,
            restaurant.DcSecretKey,
            restaurant.DcArticul,
            IsOnlinePaymentAvailable(restaurant),
            restaurant.PaymentLink,
            restaurant.ServiceFeePercent,
            restaurant.DeliveryEnabled,
            restaurant.DeliveryFee,
            restaurant.TakeawayEnabled
        ));
    }

    // Toggle accepting orders (pause/resume)
    [HttpPost("{id}/toggle-orders")]
    public async Task<ActionResult<RestaurantDto>> ToggleOrders(Guid id, [FromBody] ToggleOrdersRequest request)
    {
        var userRestaurantId = GetRestaurantId();
        if (userRestaurantId.HasValue && userRestaurantId.Value != id)
        {
            return Forbid();
        }

        var restaurant = await _context.Restaurants
            .Include(r => r.Menus)
            .Include(r => r.Tables)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (restaurant == null)
            return NotFound(new { message = "Ресторан не найден" });

        restaurant.AcceptingOrders = request.AcceptingOrders;
        restaurant.PauseMessage = request.PauseMessage;

        await _context.SaveChangesAsync();

        return Ok(new RestaurantDto(
            restaurant.Id,
            restaurant.Name,
            restaurant.Description,
            restaurant.Address,
            restaurant.Phone,
            restaurant.LogoUrl,
            restaurant.IsActive,
            restaurant.AcceptingOrders,
            restaurant.PauseMessage,
            restaurant.CreatedAt,
            restaurant.Menus?.Count ?? 0,
            restaurant.Tables?.Count ?? 0,
            restaurant.DcMerchantId,
            restaurant.DcSecretKey,
            restaurant.DcArticul,
            IsOnlinePaymentAvailable(restaurant),
            restaurant.PaymentLink,
            restaurant.ServiceFeePercent,
            restaurant.DeliveryEnabled,
            restaurant.DeliveryFee,
            restaurant.TakeawayEnabled
        ));
    }

    // Get restaurant status (for frontend)
    [HttpGet("{id}/status")]
    [AllowAnonymous]
    public async Task<ActionResult<RestaurantStatusDto>> GetRestaurantStatus(Guid id)
    {
        var restaurant = await _context.Restaurants.FindAsync(id);

        if (restaurant == null)
            return NotFound(new { message = "Ресторан не найден" });

        return Ok(new RestaurantStatusDto(restaurant.AcceptingOrders, restaurant.PauseMessage));
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> DeleteRestaurant(Guid id)
    {
        var restaurant = await _context.Restaurants.FindAsync(id);

        if (restaurant == null)
            return NotFound(new { message = "Ресторан не найден" });

        _context.Restaurants.Remove(restaurant);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    /// <summary>
    /// Upload restaurant logo image
    /// </summary>
    [HttpPost("{id}/upload-image")]
    [Consumes("multipart/form-data")]
    public async Task<ActionResult<UploadImageResponse>> UploadImage(Guid id, IFormFile file)
    {
        var userRestaurantId = GetRestaurantId();
        if (userRestaurantId.HasValue && userRestaurantId.Value != id)
        {
            return Forbid();
        }

        var restaurant = await _context.Restaurants.FindAsync(id);
        if (restaurant == null)
            return NotFound(new { message = "Ресторан не найден" });

        if (file == null || file.Length == 0)
            return BadRequest(new { message = "Файл не выбран" });

        // Validate file type
        var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp", ".gif" };
        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!allowedExtensions.Contains(extension))
            return BadRequest(new { message = "Недопустимый формат файла. Разрешены: JPG, PNG, WebP, GIF" });

        // Validate file size (max 5MB)
        if (file.Length > 5 * 1024 * 1024)
            return BadRequest(new { message = "Размер файла не должен превышать 5 МБ" });

        try
        {
            // Create directory if not exists
            var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images", "restaurants");
            if (!Directory.Exists(uploadsFolder))
                Directory.CreateDirectory(uploadsFolder);

            // Delete old image if exists
            if (!string.IsNullOrEmpty(restaurant.LogoUrl))
            {
                var oldFilePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", restaurant.LogoUrl.TrimStart('/'));
                if (System.IO.File.Exists(oldFilePath))
                    System.IO.File.Delete(oldFilePath);
            }

            // Generate unique filename
            var fileName = $"{id}_{DateTime.UtcNow:yyyyMMddHHmmss}{extension}";
            var filePath = Path.Combine(uploadsFolder, fileName);

            // Save file
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // Update restaurant logo URL
            restaurant.LogoUrl = $"/images/restaurants/{fileName}";
            await _context.SaveChangesAsync();

            return Ok(new UploadImageResponse(restaurant.LogoUrl, "Изображение успешно загружено"));
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Ошибка при загрузке файла", error = ex.Message });
        }
    }

    /// <summary>
    /// Delete restaurant logo image
    /// </summary>
    [HttpDelete("{id}/image")]
    public async Task<ActionResult> DeleteImage(Guid id)
    {
        var userRestaurantId = GetRestaurantId();
        if (userRestaurantId.HasValue && userRestaurantId.Value != id)
        {
            return Forbid();
        }

        var restaurant = await _context.Restaurants.FindAsync(id);
        if (restaurant == null)
            return NotFound(new { message = "Ресторан не найден" });

        if (!string.IsNullOrEmpty(restaurant.LogoUrl))
        {
            var filePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", restaurant.LogoUrl.TrimStart('/'));
            if (System.IO.File.Exists(filePath))
                System.IO.File.Delete(filePath);

            restaurant.LogoUrl = null;
            await _context.SaveChangesAsync();
        }

        return NoContent();
    }
}

public record UploadImageResponse(string ImageUrl, string Message);
