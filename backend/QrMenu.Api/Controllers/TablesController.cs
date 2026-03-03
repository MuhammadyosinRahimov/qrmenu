using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QrMenu.Api.DTOs;
using QrMenu.Infrastructure.Data;

namespace QrMenu.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TablesController : ControllerBase
{
    private readonly AppDbContext _context;

    public TablesController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<PublicTableDto>> GetTable(Guid id)
    {
        var table = await _context.Tables
            .Include(t => t.Restaurant)
            .Include(t => t.Menu)
            .FirstOrDefaultAsync(t => t.Id == id);
        if (table == null || !table.IsActive)
            return NotFound(new { error = "Стол не найден" });

        // Check online payment availability (DC credentials or payment link)
        var onlinePaymentAvailable =
            !string.IsNullOrEmpty(table.Restaurant.DcMerchantId) ||
            !string.IsNullOrEmpty(table.Restaurant.PaymentLink);

        return Ok(new PublicTableDto(
            table.Id,
            table.Number,
            table.Name,
            table.QrCode,
            table.IsActive,
            table.MenuId,
            table.Menu?.Name,
            table.RestaurantId,
            table.Restaurant.Name,
            table.Restaurant.Phone,
            onlinePaymentAvailable
        ));
    }

    [HttpGet("by-number/{number}")]
    public async Task<ActionResult<PublicTableDto>> GetTableByNumber(int number)
    {
        var table = await _context.Tables
            .Include(t => t.Restaurant)
            .Include(t => t.Menu)
            .FirstOrDefaultAsync(t => t.Number == number && t.IsActive);
        if (table == null)
            return NotFound(new { error = "Стол не найден" });

        // Check online payment availability (DC credentials or payment link)
        var onlinePaymentAvailable =
            !string.IsNullOrEmpty(table.Restaurant.DcMerchantId) ||
            !string.IsNullOrEmpty(table.Restaurant.PaymentLink);

        return Ok(new PublicTableDto(
            table.Id,
            table.Number,
            table.Name,
            table.QrCode,
            table.IsActive,
            table.MenuId,
            table.Menu?.Name,
            table.RestaurantId,
            table.Restaurant.Name,
            table.Restaurant.Phone,
            onlinePaymentAvailable
        ));
    }
}
