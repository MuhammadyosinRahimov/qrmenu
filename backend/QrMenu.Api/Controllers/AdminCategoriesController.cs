using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QrMenu.Api.DTOs;
using QrMenu.Core.Entities;
using QrMenu.Infrastructure.Data;

namespace QrMenu.Api.Controllers;

[ApiController]
[Route("api/admin/categories")]
[Authorize(Roles = "Admin,RestaurantAdmin")]
public class AdminCategoriesController : ControllerBase
{
    private readonly AppDbContext _context;

    public AdminCategoriesController(AppDbContext context)
    {
        _context = context;
    }

    private bool IsCategoryCurrentlyAvailable(Category category)
    {
        if (category.IsTemporarilyDisabled)
            return false;

        if (!category.AvailableFrom.HasValue || !category.AvailableTo.HasValue)
            return true;

        var now = DateTime.Now.TimeOfDay;
        return now >= category.AvailableFrom.Value && now <= category.AvailableTo.Value;
    }

    [HttpGet]
    public async Task<ActionResult<List<CategoryDto>>> GetCategories()
    {
        var categories = await _context.Categories
            .Include(c => c.ParentCategory)
            .OrderBy(c => c.SortOrder)
            .ToListAsync();

        var dtos = categories.Select(c => new CategoryDto(
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
            IsCategoryCurrentlyAvailable(c),
            null
        )).ToList();

        return Ok(dtos);
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
            IsCategoryCurrentlyAvailable(category),
            null
        ));
    }

    [HttpPost]
    public async Task<ActionResult<CategoryDto>> CreateCategory([FromBody] CreateCategoryRequest request)
    {
        var category = new Category
        {
            Name = request.Name,
            Icon = request.Icon,
            SortOrder = request.SortOrder,
            IsActive = true,
            ParentCategoryId = request.ParentCategoryId,
            AvailableFrom = request.AvailableFrom,
            AvailableTo = request.AvailableTo
        };

        _context.Categories.Add(category);
        await _context.SaveChangesAsync();

        // Reload with parent info
        await _context.Entry(category).Reference(c => c.ParentCategory).LoadAsync();

        return CreatedAtAction(nameof(GetCategory), new { id = category.Id },
            new CategoryDto(
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
                IsCategoryCurrentlyAvailable(category),
                null
            ));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateCategory(Guid id, [FromBody] UpdateCategoryRequest request)
    {
        var category = await _context.Categories.FindAsync(id);
        if (category == null)
            return NotFound();

        // Prevent circular reference
        if (request.ParentCategoryId == id)
            return BadRequest(new { error = "Category cannot be its own parent" });

        category.Name = request.Name;
        category.Icon = request.Icon;
        category.SortOrder = request.SortOrder;
        category.IsActive = request.IsActive;
        category.ParentCategoryId = request.ParentCategoryId;
        category.AvailableFrom = request.AvailableFrom;
        category.AvailableTo = request.AvailableTo;
        category.IsTemporarilyDisabled = request.IsTemporarilyDisabled;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    // Toggle temporary availability (quick on/off)
    [HttpPost("{id}/toggle-availability")]
    public async Task<ActionResult<CategoryDto>> ToggleAvailability(Guid id, [FromBody] ToggleCategoryAvailabilityRequest request)
    {
        var category = await _context.Categories
            .Include(c => c.ParentCategory)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (category == null)
            return NotFound();

        category.IsTemporarilyDisabled = request.IsTemporarilyDisabled;
        await _context.SaveChangesAsync();

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
            IsCategoryCurrentlyAvailable(category),
            null
        ));
    }

    // Set schedule for category availability
    [HttpPost("{id}/schedule")]
    public async Task<ActionResult<CategoryDto>> SetSchedule(Guid id, [FromBody] SetCategoryScheduleRequest request)
    {
        var category = await _context.Categories
            .Include(c => c.ParentCategory)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (category == null)
            return NotFound();

        category.AvailableFrom = request.AvailableFrom;
        category.AvailableTo = request.AvailableTo;
        await _context.SaveChangesAsync();

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
            IsCategoryCurrentlyAvailable(category),
            null
        ));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCategory(Guid id)
    {
        var category = await _context.Categories.FindAsync(id);
        if (category == null)
            return NotFound();

        _context.Categories.Remove(category);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
