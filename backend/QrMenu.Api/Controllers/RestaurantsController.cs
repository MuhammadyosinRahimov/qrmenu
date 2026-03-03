using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QrMenu.Api.DTOs;
using QrMenu.Infrastructure.Data;

namespace QrMenu.Api.Controllers;

[ApiController]
[Route("api/restaurants")]
public class RestaurantsController : ControllerBase
{
    private readonly AppDbContext _context;

    public RestaurantsController(AppDbContext context)
    {
        _context = context;
    }

    // Get all active restaurants (public endpoint)
    [HttpGet]
    public async Task<ActionResult<List<PublicRestaurantDto>>> GetRestaurants([FromQuery] string? mode = null)
    {
        var query = _context.Restaurants
            .Where(r => r.IsActive && r.AcceptingOrders);

        // Filter by mode
        if (mode == "delivery")
        {
            query = query.Where(r => r.DeliveryEnabled);
        }
        else if (mode == "takeaway")
        {
            query = query.Where(r => r.TakeawayEnabled);
        }

        var restaurants = await query.ToListAsync();

        var dtos = restaurants.Select(r => new PublicRestaurantDto(
            r.Id,
            r.Name,
            r.Description,
            r.Address,
            r.Phone,
            r.LogoUrl,
            r.DeliveryEnabled,
            r.DeliveryFee,
            r.TakeawayEnabled,
            !string.IsNullOrEmpty(r.DcMerchantId) || !string.IsNullOrEmpty(r.PaymentLink)
        )).ToList();

        return Ok(dtos);
    }

    // Get restaurant details (public endpoint)
    [HttpGet("{id}")]
    public async Task<ActionResult<PublicRestaurantDto>> GetRestaurant(Guid id)
    {
        var restaurant = await _context.Restaurants.FindAsync(id);

        if (restaurant == null || !restaurant.IsActive)
            return NotFound(new { message = "Ресторан не найден" });

        var dto = new PublicRestaurantDto(
            restaurant.Id,
            restaurant.Name,
            restaurant.Description,
            restaurant.Address,
            restaurant.Phone,
            restaurant.LogoUrl,
            restaurant.DeliveryEnabled,
            restaurant.DeliveryFee,
            restaurant.TakeawayEnabled,
            !string.IsNullOrEmpty(restaurant.DcMerchantId) || !string.IsNullOrEmpty(restaurant.PaymentLink)
        );

        return Ok(dto);
    }

    // Get restaurant menu (public endpoint)
    [HttpGet("{id}/menu")]
    public async Task<ActionResult<RestaurantMenuDto>> GetRestaurantMenu(Guid id)
    {
        var restaurant = await _context.Restaurants
            .Include(r => r.Menus)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (restaurant == null || !restaurant.IsActive)
            return NotFound(new { message = "Ресторан не найден" });

        // Get the first active menu
        var menu = restaurant.Menus.FirstOrDefault(m => m.IsActive);
        if (menu == null)
            return NotFound(new { message = "У ресторана нет активного меню" });

        // Load categories through MenuCategory relationship
        var menuCategories = await _context.MenuCategories
            .Include(mc => mc.Category)
            .Where(mc => mc.MenuId == menu.Id && mc.Category.IsActive && !mc.Category.IsTemporarilyDisabled)
            .OrderBy(mc => mc.SortOrder)
            .ToListAsync();

        var categoryIds = menuCategories.Select(mc => mc.CategoryId).ToList();

        var products = await _context.Products
            .Include(p => p.Sizes)
            .Include(p => p.Addons)
            .Where(p => categoryIds.Contains(p.CategoryId) && p.IsAvailable)
            .ToListAsync();

        var categoryDtos = menuCategories.Select(mc => new PublicMenuCategoryDto(
            mc.Category.Id,
            mc.Category.Name,
            mc.Category.Icon,
            mc.SortOrder,
            products.Where(p => p.CategoryId == mc.CategoryId).Select(p => new MenuProductDto(
                p.Id,
                p.Name,
                p.Description,
                p.BasePrice,
                p.ImageUrl,
                p.IsAvailable,
                p.Sizes.Select(s => new ProductSizeDto(s.Id, s.Name, s.PriceModifier, s.IsDefault)).ToList(),
                p.Addons.Select(a => new ProductAddonDto(a.Id, a.Name, a.Price, a.IsAvailable)).ToList()
            )).ToList()
        )).ToList();

        return Ok(new RestaurantMenuDto(
            restaurant.Id,
            restaurant.Name,
            categoryDtos
        ));
    }

    // Get restaurant status (public endpoint for frontend)
    [HttpGet("{id}/status")]
    public async Task<ActionResult<RestaurantStatusDto>> GetRestaurantStatus(Guid id)
    {
        var restaurant = await _context.Restaurants.FindAsync(id);

        if (restaurant == null)
            return NotFound(new { message = "Ресторан не найден" });

        return Ok(new RestaurantStatusDto(restaurant.AcceptingOrders, restaurant.PauseMessage));
    }
}
