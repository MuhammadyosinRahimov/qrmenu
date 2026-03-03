using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QrMenu.Api.DTOs;
using QrMenu.Infrastructure.Data;
using QrMenu.Infrastructure.Services;

namespace QrMenu.Api.Controllers;

[ApiController]
[Route("api/admin/auth")]
public class AdminAuthController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IJwtService _jwtService;

    public AdminAuthController(AppDbContext context, IJwtService jwtService)
    {
        _context = context;
        _jwtService = jwtService;
    }

    [HttpPost("login")]
    public async Task<ActionResult<AdminLoginResponse>> Login([FromBody] AdminLoginRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
            return BadRequest(new { error = "Email and password are required" });

        // Try to find super admin first
        var admin = await _context.Admins.FirstOrDefaultAsync(a => a.Email == request.Email);
        if (admin != null)
        {
            if (!BCrypt.Net.BCrypt.Verify(request.Password, admin.PasswordHash))
                return Unauthorized(new { error = "Invalid credentials" });

            admin.LastLoginAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            var token = _jwtService.GenerateToken(admin.Id, admin.Email, isAdmin: true);
            return Ok(new AdminLoginResponse(token, admin.Id, admin.Name, admin.Email, "Admin"));
        }

        // Try restaurant admin
        var restaurantAdmin = await _context.RestaurantAdmins
            .Include(ra => ra.Restaurant)
            .FirstOrDefaultAsync(a => a.Email == request.Email);

        if (restaurantAdmin != null)
        {
            if (!BCrypt.Net.BCrypt.Verify(request.Password, restaurantAdmin.PasswordHash))
                return Unauthorized(new { error = "Invalid credentials" });

            if (!restaurantAdmin.Restaurant.IsActive)
                return Unauthorized(new { error = "Restaurant is not active" });

            restaurantAdmin.LastLoginAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            var token = _jwtService.GenerateRestaurantAdminToken(
                restaurantAdmin.Id,
                restaurantAdmin.Email,
                restaurantAdmin.RestaurantId
            );

            return Ok(new AdminLoginResponse(
                token,
                restaurantAdmin.Id,
                restaurantAdmin.Name,
                restaurantAdmin.Email,
                "RestaurantAdmin",
                restaurantAdmin.RestaurantId,
                restaurantAdmin.Restaurant.Name
            ));
        }

        return Unauthorized(new { error = "Invalid credentials" });
    }
}
