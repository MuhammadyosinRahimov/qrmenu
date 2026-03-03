using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QrMenu.Api.DTOs;
using QrMenu.Core.Entities;
using QrMenu.Infrastructure.Data;
using QrMenu.Infrastructure.Services;

namespace QrMenu.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly ISmsService _smsService;
    private readonly IJwtService _jwtService;

    public AuthController(AppDbContext context, ISmsService smsService, IJwtService jwtService)
    {
        _context = context;
        _smsService = smsService;
        _jwtService = jwtService;
    }

    [HttpPost("send-otp")]
    public async Task<IActionResult> SendOtp([FromBody] SendOtpRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Phone))
            return BadRequest(new { error = "Phone number is required" });

        // Generate random 4-digit OTP code
        var code = Random.Shared.Next(1000, 9999).ToString();

        // Save OTP to database
        var otpCode = new OtpCode
        {
            Phone = request.Phone,
            Code = code,
            ExpiresAt = DateTime.UtcNow.AddMinutes(5)
        };
        _context.OtpCodes.Add(otpCode);
        await _context.SaveChangesAsync();

        // Send SMS
        await _smsService.SendOtpAsync(request.Phone, code);

        return Ok(new { message = "OTP sent successfully" });
    }

    [HttpPost("verify-otp")]
    public async Task<IActionResult> VerifyOtp([FromBody] VerifyOtpRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Phone) || string.IsNullOrWhiteSpace(request.Code))
            return BadRequest(new { error = "Phone and code are required" });

        // Find valid OTP
        var otpCode = await _context.OtpCodes
            .Where(o => o.Phone == request.Phone && o.Code == request.Code && !o.IsUsed && o.ExpiresAt > DateTime.UtcNow)
            .OrderByDescending(o => o.CreatedAt)
            .FirstOrDefaultAsync();

        if (otpCode == null)
            return BadRequest(new { error = "Invalid or expired OTP code" });

        // Mark OTP as used
        otpCode.IsUsed = true;

        // Find or create user
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Phone == request.Phone);
        if (user == null)
        {
            user = new User { Phone = request.Phone };
            _context.Users.Add(user);
        }
        user.LastLoginAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        // Generate JWT
        var token = _jwtService.GenerateToken(user.Id, user.Phone);

        return Ok(new AuthResponse(token, user.Id, user.Phone));
    }
}
