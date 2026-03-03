using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QrMenu.Api.DTOs;
using QrMenu.Core.Entities;
using QrMenu.Infrastructure.Data;

namespace QrMenu.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CategoriesController : ControllerBase
{
    private readonly AppDbContext _context;

    public CategoriesController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<List<CategoryDto>>> GetCategories([FromQuery] Guid? menuId)
    {
        IQueryable<Category> query;

        if (menuId.HasValue)
        {
            // Категории привязанные к меню через MenuCategories
            var categoryIdsInMenu = _context.Set<MenuCategory>()
                .Where(mc => mc.MenuId == menuId.Value)
                .Select(mc => mc.CategoryId);

            // Категории с глобальными продуктами (без menuId) или продуктами этого меню
            var categoryIdsWithProducts = _context.Products
                .Where(p => p.IsAvailable && (p.MenuId == null || p.MenuId == menuId.Value))
                .Select(p => p.CategoryId)
                .Distinct();

            query = _context.Categories
                .Include(c => c.ParentCategory)
                .Where(c => c.IsActive && (categoryIdsInMenu.Contains(c.Id) || categoryIdsWithProducts.Contains(c.Id)));
        }
        else
        {
            // Без menuId возвращаем все активные категории
            query = _context.Categories
                .Include(c => c.ParentCategory)
                .Where(c => c.IsActive);
        }

        var categories = await query
            .OrderBy(c => c.SortOrder)
            .Select(c => new CategoryDto(
                c.Id,
                c.Name,
                c.Icon,
                c.SortOrder,
                c.IsActive,
                c.ParentCategoryId,
                c.ParentCategory != null ? c.ParentCategory.Name : null,
                c.AvailableFrom,
                c.AvailableTo,
                c.IsTemporarilyDisabled,
                true,
                null
            ))
            .ToListAsync();

        return Ok(categories);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<CategoryDto>> GetCategory(Guid id)
    {
        var category = await _context.Categories
            .Include(c => c.ParentCategory)
            .FirstOrDefaultAsync(c => c.Id == id);
        if (category == null)
            return NotFound();

        return Ok(new CategoryDto(
            category.Id,
            category.Name,
            category.Icon,
            category.SortOrder,
            category.IsActive,
            category.ParentCategoryId,
            category.ParentCategory?.Name,
            category.AvailableFrom,
            category.AvailableTo,
            category.IsTemporarilyDisabled,
            true,
            null
        ));
    }
}
