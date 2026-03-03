using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QrMenu.Infrastructure.Data;

namespace QrMenu.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MenusController : ControllerBase
{
    private readonly AppDbContext _context;

    public MenusController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("{id}")]
    public async Task<ActionResult> GetMenu(Guid id)
    {
        var menu = await _context.Menus
            .Include(m => m.Restaurant)
            .FirstOrDefaultAsync(m => m.Id == id && m.IsActive);

        if (menu == null)
            return NotFound(new { error = "Меню не найдено" });

        return Ok(new
        {
            id = menu.Id,
            name = menu.Name,
            description = menu.Description,
            restaurantId = menu.RestaurantId,
            restaurantName = menu.Restaurant.Name
        });
    }
}
