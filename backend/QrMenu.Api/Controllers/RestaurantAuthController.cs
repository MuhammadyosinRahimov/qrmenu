using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QrMenu.Api.DTOs;
using QrMenu.Infrastructure.Data;
using QrMenu.Infrastructure.Services;

namespace QrMenu.Api.Controllers;

[ApiController]
[Route("api/restaurant/auth")]
public class RestaurantAuthController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IJwtService _jwtService;

    public RestaurantAuthController(AppDbContext context, IJwtService jwtService)
    {
        _context = context;
        _jwtService = jwtService;
    }

    [HttpPost("login")]
    public async Task<ActionResult<RestaurantAdminLoginResponse>> Login([FromBody] AdminLoginRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
            return BadRequest(new { error = "Email and password are required" });

        var restaurantAdmin = await _context.RestaurantAdmins
            .Include(ra => ra.Restaurant)
            .FirstOrDefaultAsync(a => a.Email == request.Email);

        if (restaurantAdmin == null)
            return Unauthorized(new { error = "Invalid credentials" });

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

        return Ok(new RestaurantAdminLoginResponse(
            token,
            restaurantAdmin.Id,
            restaurantAdmin.Name,
            restaurantAdmin.Email,
            "RestaurantAdmin",
            restaurantAdmin.RestaurantId,
            restaurantAdmin.Restaurant.Name
        ));
    }
}
