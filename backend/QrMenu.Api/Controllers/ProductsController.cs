using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QrMenu.Api.DTOs;
using QrMenu.Infrastructure.Data;

namespace QrMenu.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly AppDbContext _context;

    public ProductsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<List<ProductDto>>> GetProducts(
        [FromQuery] Guid? categoryId,
        [FromQuery] Guid? menuId)
    {
        var query = _context.Products
            .Include(p => p.Category)
            .Include(p => p.Menu)
            .AsQueryable();

        // Фильтр по меню - показываем блюда этого меню + глобальные (без menuId)
        if (menuId.HasValue)
        {
            query = query.Where(p => p.MenuId == menuId.Value || p.MenuId == null);
        }

        if (categoryId.HasValue)
        {
            query = query.Where(p => p.CategoryId == categoryId.Value);
        }

        // Return only available products for public API
        var products = await query
            .Where(p => p.IsAvailable)
            .OrderBy(p => p.Name)
            .Select(p => new ProductDto(
                p.Id, p.Name, p.Description, p.BasePrice, p.ImageUrl,
                p.Rating, p.Calories, p.PrepTimeMinutes, p.IsAvailable, p.CategoryId,
                p.Category != null ? p.Category.Name : null,
                p.MenuId,
                p.Menu != null ? p.Menu.Name : null
            ))
            .ToListAsync();

        return Ok(products);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ProductDetailDto>> GetProduct(Guid id)
    {
        var product = await _context.Products
            .Include(p => p.Sizes)
            .Include(p => p.Addons)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (product == null)
            return NotFound();

        var dto = new ProductDetailDto(
            product.Id,
            product.Name,
            product.Description,
            product.BasePrice,
            product.ImageUrl,
            product.Rating,
            product.Calories,
            product.PrepTimeMinutes,
            product.IsAvailable,
            product.CategoryId,
            product.Sizes.Select(s => new ProductSizeDto(s.Id, s.Name, s.PriceModifier, s.IsDefault)).ToList(),
            product.Addons.Where(a => a.IsAvailable).Select(a => new ProductAddonDto(a.Id, a.Name, a.Price, a.IsAvailable)).ToList()
        );

        return Ok(dto);
    }
}
