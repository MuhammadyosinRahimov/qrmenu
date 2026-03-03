using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QrMenu.Api.DTOs;
using QrMenu.Core.Entities;
using QrMenu.Infrastructure.Data;

namespace QrMenu.Api.Controllers;

[ApiController]
[Route("api/admin/menus")]
[Authorize(Roles = "Admin")]
public class AdminMenusController : ControllerBase
{
    private readonly AppDbContext _context;

    public AdminMenusController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<List<MenuDto>>> GetMenus([FromQuery] Guid? restaurantId)
    {
        var query = _context.Menus
            .Include(m => m.Restaurant)
            .Include(m => m.MenuCategories)
                .ThenInclude(mc => mc.Category)
                    .ThenInclude(c => c.Products)
            .AsQueryable();

        if (restaurantId.HasValue)
            query = query.Where(m => m.RestaurantId == restaurantId.Value);

        var menus = await query
            .OrderByDescending(m => m.CreatedAt)
            .Select(m => new MenuDto(
                m.Id,
                m.Name,
                m.Description,
                m.IsActive,
                m.CreatedAt,
                m.RestaurantId,
                m.Restaurant.Name,
                m.MenuCategories
                    .OrderBy(mc => mc.SortOrder)
                    .Select(mc => new MenuCategoryDto(
                        mc.Id,
                        mc.CategoryId,
                        mc.Category.Name,
                        mc.Category.Icon,
                        mc.SortOrder,
                        mc.Category.Products.Count
                    )).ToList()
            ))
            .ToListAsync();

        return Ok(menus);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<MenuDto>> GetMenu(Guid id)
    {
        var menu = await _context.Menus
            .Include(m => m.Restaurant)
            .Include(m => m.MenuCategories)
                .ThenInclude(mc => mc.Category)
                    .ThenInclude(c => c.Products)
            .FirstOrDefaultAsync(m => m.Id == id);

        if (menu == null)
            return NotFound(new { message = "Меню не найдено" });

        return Ok(new MenuDto(
            menu.Id,
            menu.Name,
            menu.Description,
            menu.IsActive,
            menu.CreatedAt,
            menu.RestaurantId,
            menu.Restaurant.Name,
            menu.MenuCategories
                .OrderBy(mc => mc.SortOrder)
                .Select(mc => new MenuCategoryDto(
                    mc.Id,
                    mc.CategoryId,
                    mc.Category.Name,
                    mc.Category.Icon,
                    mc.SortOrder,
                    mc.Category.Products.Count
                )).ToList()
        ));
    }

    [HttpPost]
    public async Task<ActionResult<MenuDto>> CreateMenu([FromBody] CreateMenuRequest request)
    {
        var restaurant = await _context.Restaurants.FindAsync(request.RestaurantId);
        if (restaurant == null)
            return BadRequest(new { message = "Ресторан не найден" });

        var menu = new Menu
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Description = request.Description,
            RestaurantId = request.RestaurantId,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        _context.Menus.Add(menu);

        // Add categories if provided
        if (request.CategoryIds != null && request.CategoryIds.Count > 0)
        {
            var sortOrder = 1;
            foreach (var categoryId in request.CategoryIds)
            {
                var category = await _context.Categories.FindAsync(categoryId);
                if (category != null)
                {
                    _context.MenuCategories.Add(new MenuCategory
                    {
                        Id = Guid.NewGuid(),
                        MenuId = menu.Id,
                        CategoryId = categoryId,
                        SortOrder = sortOrder++
                    });
                }
            }
        }

        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetMenu), new { id = menu.Id }, await GetMenuDto(menu.Id));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<MenuDto>> UpdateMenu(Guid id, [FromBody] UpdateMenuRequest request)
    {
        var menu = await _context.Menus
            .Include(m => m.MenuCategories)
            .FirstOrDefaultAsync(m => m.Id == id);

        if (menu == null)
            return NotFound(new { message = "Меню не найдено" });

        menu.Name = request.Name;
        menu.Description = request.Description;
        menu.IsActive = request.IsActive;

        // Update categories if provided
        if (request.CategoryIds != null)
        {
            // Remove existing categories
            _context.MenuCategories.RemoveRange(menu.MenuCategories);

            // Add new categories
            var sortOrder = 1;
            foreach (var categoryId in request.CategoryIds)
            {
                var category = await _context.Categories.FindAsync(categoryId);
                if (category != null)
                {
                    _context.MenuCategories.Add(new MenuCategory
                    {
                        Id = Guid.NewGuid(),
                        MenuId = menu.Id,
                        CategoryId = categoryId,
                        SortOrder = sortOrder++
                    });
                }
            }
        }

        await _context.SaveChangesAsync();

        return Ok(await GetMenuDto(menu.Id));
    }

    [HttpPost("{id}/categories")]
    public async Task<ActionResult<MenuDto>> AddCategoryToMenu(Guid id, [FromBody] AddCategoryToMenuRequest request)
    {
        var menu = await _context.Menus.FindAsync(id);
        if (menu == null)
            return NotFound(new { message = "Меню не найдено" });

        var category = await _context.Categories.FindAsync(request.CategoryId);
        if (category == null)
            return BadRequest(new { message = "Категория не найдена" });

        var existing = await _context.MenuCategories
            .AnyAsync(mc => mc.MenuId == id && mc.CategoryId == request.CategoryId);

        if (existing)
            return BadRequest(new { message = "Категория уже добавлена в меню" });

        _context.MenuCategories.Add(new MenuCategory
        {
            Id = Guid.NewGuid(),
            MenuId = id,
            CategoryId = request.CategoryId,
            SortOrder = request.SortOrder
        });

        await _context.SaveChangesAsync();

        return Ok(await GetMenuDto(id));
    }

    [HttpDelete("{menuId}/categories/{categoryId}")]
    public async Task<ActionResult> RemoveCategoryFromMenu(Guid menuId, Guid categoryId)
    {
        var menuCategory = await _context.MenuCategories
            .FirstOrDefaultAsync(mc => mc.MenuId == menuId && mc.CategoryId == categoryId);

        if (menuCategory == null)
            return NotFound(new { message = "Категория не найдена в меню" });

        _context.MenuCategories.Remove(menuCategory);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteMenu(Guid id)
    {
        var menu = await _context.Menus.FindAsync(id);

        if (menu == null)
            return NotFound(new { message = "Меню не найдено" });

        _context.Menus.Remove(menu);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private async Task<MenuDto> GetMenuDto(Guid id)
    {
        var menu = await _context.Menus
            .Include(m => m.Restaurant)
            .Include(m => m.MenuCategories)
                .ThenInclude(mc => mc.Category)
                    .ThenInclude(c => c.Products)
            .FirstAsync(m => m.Id == id);

        return new MenuDto(
            menu.Id,
            menu.Name,
            menu.Description,
            menu.IsActive,
            menu.CreatedAt,
            menu.RestaurantId,
            menu.Restaurant.Name,
            menu.MenuCategories
                .OrderBy(mc => mc.SortOrder)
                .Select(mc => new MenuCategoryDto(
                    mc.Id,
                    mc.CategoryId,
                    mc.Category.Name,
                    mc.Category.Icon,
                    mc.SortOrder,
                    mc.Category.Products.Count
                )).ToList()
        );
    }
}
