namespace QrMenu.Api.DTOs;

public record SendOtpRequest(string Phone);
public record VerifyOtpRequest(string Phone, string Code);
public record AuthResponse(string Token, Guid UserId, string Phone);

public record AdminLoginRequest(string Email, string Password);
public record AdminLoginResponse(string Token, Guid AdminId, string Name, string Email, string Role = "Admin", Guid? RestaurantId = null, string? RestaurantName = null);

public record RestaurantAdminLoginResponse(string Token, Guid AdminId, string Name, string Email, string Role, Guid RestaurantId, string RestaurantName);
