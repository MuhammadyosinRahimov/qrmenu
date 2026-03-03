using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QrMenu.Api.DTOs;
using QrMenu.Core.Entities;
using QrMenu.Core.Enums;
using QrMenu.Infrastructure.Data;
using QrMenu.Infrastructure.Services;

namespace QrMenu.Api.Controllers;

[ApiController]
[Route("api/admin/tables")]
[Authorize(Roles = "Admin")]
public class AdminTablesController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IQrCodeService _qrCodeService;
    private readonly IConfiguration _configuration;

    public AdminTablesController(AppDbContext context, IQrCodeService qrCodeService, IConfiguration configuration)
    {
        _context = context;
        _qrCodeService = qrCodeService;
        _configuration = configuration;
    }

    [HttpGet]
    public async Task<ActionResult<List<TableDto>>> GetTables([FromQuery] Guid? restaurantId)
    {
        var query = _context.Tables
            .Include(t => t.Restaurant)
            .Include(t => t.Menu)
            .AsQueryable();

        if (restaurantId.HasValue)
            query = query.Where(t => t.RestaurantId == restaurantId.Value);

        var tables = await query
            .OrderBy(t => t.Number)
            .Select(t => new TableDto(
                t.Id,
                t.Number,
                t.Name,
                t.Type,
                GetTableTypeName(t.Type),
                t.Capacity,
                t.QrCode,
                t.IsActive,
                t.CreatedAt,
                t.RestaurantId,
                t.Restaurant.Name,
                t.MenuId,
                t.Menu != null ? t.Menu.Name : null
            ))
            .ToListAsync();

        return Ok(tables);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<TableDto>> GetTable(Guid id)
    {
        var table = await _context.Tables
            .Include(t => t.Restaurant)
            .Include(t => t.Menu)
            .FirstOrDefaultAsync(t => t.Id == id);

        if (table == null)
            return NotFound(new { message = "Стол не найден" });

        return Ok(new TableDto(
            table.Id,
            table.Number,
            table.Name,
            table.Type,
            GetTableTypeName(table.Type),
            table.Capacity,
            table.QrCode,
            table.IsActive,
            table.CreatedAt,
            table.RestaurantId,
            table.Restaurant.Name,
            table.MenuId,
            table.Menu?.Name
        ));
    }

    [HttpGet("types")]
    public ActionResult<List<TableTypeDto>> GetTableTypes()
    {
        var types = Enum.GetValues<TableType>()
            .Select(t => new TableTypeDto((int)t, GetTableTypeName(t)))
            .ToList();

        return Ok(types);
    }

    [HttpPost]
    public async Task<ActionResult<TableDto>> CreateTable([FromBody] CreateTableRequest request)
    {
        var restaurant = await _context.Restaurants.FindAsync(request.RestaurantId);
        if (restaurant == null)
            return BadRequest(new { message = "Ресторан не найден" });

        // Check if table number already exists in this restaurant
        if (await _context.Tables.AnyAsync(t => t.RestaurantId == request.RestaurantId && t.Number == request.Number))
            return BadRequest(new { message = "Стол с таким номером уже существует" });

        var baseUrl = _configuration["App:BaseUrl"] ?? "http://localhost:3000";
        var table = new Table
        {
            Id = Guid.NewGuid(),
            Number = request.Number,
            Name = request.Name ?? $"Стол {request.Number}",
            Type = request.Type,
            Capacity = request.Capacity,
            RestaurantId = request.RestaurantId,
            MenuId = request.MenuId,
            QrCode = $"{baseUrl}/menu?table={request.Number}&restaurant={request.RestaurantId}",
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        // Update QR code with menu if provided
        if (request.MenuId.HasValue)
        {
            table.QrCode = $"{baseUrl}/menu?table={request.Number}&menu={request.MenuId}";
        }

        _context.Tables.Add(table);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetTable), new { id = table.Id }, new TableDto(
            table.Id,
            table.Number,
            table.Name,
            table.Type,
            GetTableTypeName(table.Type),
            table.Capacity,
            table.QrCode,
            table.IsActive,
            table.CreatedAt,
            table.RestaurantId,
            restaurant.Name,
            table.MenuId,
            null
        ));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<TableDto>> UpdateTable(Guid id, [FromBody] UpdateTableRequest request)
    {
        var table = await _context.Tables
            .Include(t => t.Restaurant)
            .Include(t => t.Menu)
            .FirstOrDefaultAsync(t => t.Id == id);

        if (table == null)
            return NotFound(new { message = "Стол не найден" });

        // Check if table number already exists (except current table)
        if (await _context.Tables.AnyAsync(t => t.RestaurantId == table.RestaurantId && t.Number == request.Number && t.Id != id))
            return BadRequest(new { message = "Стол с таким номером уже существует" });

        table.Number = request.Number;
        table.Name = request.Name ?? $"Стол {request.Number}";
        table.Type = request.Type;
        table.Capacity = request.Capacity;
        table.MenuId = request.MenuId;
        table.IsActive = request.IsActive;

        // Update QR code
        var baseUrl = _configuration["App:BaseUrl"] ?? "http://localhost:3000";
        table.QrCode = request.MenuId.HasValue
            ? $"{baseUrl}/menu?table={request.Number}&menu={request.MenuId}"
            : $"{baseUrl}/menu?table={request.Number}&restaurant={table.RestaurantId}";

        await _context.SaveChangesAsync();

        // Reload menu for response
        if (table.MenuId.HasValue)
        {
            await _context.Entry(table).Reference(t => t.Menu).LoadAsync();
        }

        return Ok(new TableDto(
            table.Id,
            table.Number,
            table.Name,
            table.Type,
            GetTableTypeName(table.Type),
            table.Capacity,
            table.QrCode,
            table.IsActive,
            table.CreatedAt,
            table.RestaurantId,
            table.Restaurant.Name,
            table.MenuId,
            table.Menu?.Name
        ));
    }

    [HttpPut("{id}/toggle")]
    public async Task<IActionResult> ToggleTable(Guid id)
    {
        var table = await _context.Tables.FindAsync(id);
        if (table == null)
            return NotFound(new { message = "Стол не найден" });

        table.IsActive = !table.IsActive;
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteTable(Guid id)
    {
        var table = await _context.Tables.FindAsync(id);
        if (table == null)
            return NotFound(new { message = "Стол не найден" });

        _context.Tables.Remove(table);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpGet("{id}/qr")]
    public async Task<ActionResult<QrCodeResponse>> GetQrCode(Guid id)
    {
        var table = await _context.Tables.FindAsync(id);
        if (table == null)
            return NotFound(new { message = "Стол не найден" });

        var qrBase64 = _qrCodeService.GenerateQrCodeBase64(table.QrCode);

        return Ok(new QrCodeResponse(
            table.Id,
            table.Number,
            table.Name,
            qrBase64,
            table.QrCode
        ));
    }

    [HttpPost("{id}/generate-qr")]
    public async Task<ActionResult<QrCodeResponse>> GenerateQrCode(Guid id, [FromBody] GenerateQrCodeRequest request)
    {
        var table = await _context.Tables.FindAsync(id);
        if (table == null)
            return NotFound(new { message = "Стол не найден" });

        var menu = await _context.Menus.FindAsync(request.MenuId);
        if (menu == null)
            return BadRequest(new { message = "Меню не найдено" });

        var baseUrl = request.BaseUrl ?? _configuration["App:BaseUrl"] ?? "http://localhost:3000";
        var qrUrl = $"{baseUrl}/menu?table={table.Number}&menu={request.MenuId}";

        table.QrCode = qrUrl;
        table.MenuId = request.MenuId;
        await _context.SaveChangesAsync();

        var qrBase64 = _qrCodeService.GenerateQrCodeBase64(qrUrl);

        return Ok(new QrCodeResponse(
            table.Id,
            table.Number,
            table.Name,
            qrBase64,
            qrUrl
        ));
    }

    [HttpPost("bulk-generate-qr")]
    public async Task<ActionResult<List<QrCodeResponse>>> BulkGenerateQrCodes([FromBody] BulkGenerateQrRequest request)
    {
        var menu = await _context.Menus.FindAsync(request.MenuId);
        if (menu == null)
            return BadRequest(new { message = "Меню не найдено" });

        var tables = await _context.Tables
            .Where(t => request.TableIds.Contains(t.Id))
            .ToListAsync();

        if (tables.Count == 0)
            return BadRequest(new { message = "Столы не найдены" });

        var baseUrl = request.BaseUrl ?? _configuration["App:BaseUrl"] ?? "http://localhost:3000";
        var results = new List<QrCodeResponse>();

        foreach (var table in tables)
        {
            var qrUrl = $"{baseUrl}/menu?table={table.Number}&menu={request.MenuId}";
            table.QrCode = qrUrl;
            table.MenuId = request.MenuId;

            var qrBase64 = _qrCodeService.GenerateQrCodeBase64(qrUrl);
            results.Add(new QrCodeResponse(
                table.Id,
                table.Number,
                table.Name,
                qrBase64,
                qrUrl
            ));
        }

        await _context.SaveChangesAsync();

        return Ok(results);
    }

    private static string GetTableTypeName(TableType type) => type switch
    {
        TableType.Стандартный => "Стандартный",
        TableType.VIP => "VIP",
        TableType.Барная => "Барная стойка",
        TableType.Терраса => "Терраса",
        TableType.Кабинка => "Кабинка",
        TableType.Детский => "Детский",
        _ => "Неизвестный"
    };
}

public record BulkGenerateQrRequest(
    List<Guid> TableIds,
    Guid MenuId,
    string? BaseUrl
);
