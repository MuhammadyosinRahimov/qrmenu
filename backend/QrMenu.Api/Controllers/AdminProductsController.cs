using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QrMenu.Api.DTOs;
using QrMenu.Core.Entities;
using QrMenu.Infrastructure.Data;

namespace QrMenu.Api.Controllers;

[ApiController]
[Route("api/admin/products")]
[Authorize(Roles = "Admin")]
public class AdminProductsController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IWebHostEnvironment _env;

    public AdminProductsController(AppDbContext context, IWebHostEnvironment env)
    {
        _context = context;
        _env = env;
    }

    [HttpGet]
    public async Task<ActionResult<List<ProductDto>>> GetProducts(
        [FromQuery] Guid? categoryId,
        [FromQuery] Guid? menuId,
        [FromQuery] bool includeDeleted = false)
    {
        var query = _context.Products
            .Include(p => p.Category)
            .Include(p => p.Menu)
            .AsQueryable();

        // Фильтруем удалённые продукты (по умолчанию не показываем)
        if (!includeDeleted)
            query = query.Where(p => !p.IsDeleted);

        if (categoryId.HasValue)
            query = query.Where(p => p.CategoryId == categoryId.Value);

        if (menuId.HasValue)
            query = query.Where(p => p.MenuId == menuId.Value);

        var products = await query
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
            product.Id, product.Name, product.Description, product.BasePrice, product.ImageUrl,
            product.Rating, product.Calories, product.PrepTimeMinutes, product.IsAvailable, product.CategoryId,
            product.Sizes.Select(s => new ProductSizeDto(s.Id, s.Name, s.PriceModifier, s.IsDefault)).ToList(),
            product.Addons.Select(a => new ProductAddonDto(a.Id, a.Name, a.Price, a.IsAvailable)).ToList()
        );

        return Ok(dto);
    }

    [HttpPost]
    public async Task<ActionResult<ProductDto>> CreateProduct([FromBody] CreateProductRequest request)
    {
        var product = new Product
        {
            Name = request.Name,
            Description = request.Description,
            BasePrice = request.BasePrice,
            ImageUrl = request.ImageUrl ?? "",
            Calories = request.Calories,
            PrepTimeMinutes = request.PrepTimeMinutes,
            CategoryId = request.CategoryId,
            MenuId = request.MenuId,
            IsAvailable = true,
            Rating = 0
        };

        _context.Products.Add(product);
        await _context.SaveChangesAsync();

        // Load related entities
        await _context.Entry(product).Reference(p => p.Category).LoadAsync();
        if (product.MenuId.HasValue)
            await _context.Entry(product).Reference(p => p.Menu).LoadAsync();

        return CreatedAtAction(nameof(GetProduct), new { id = product.Id },
            new ProductDto(product.Id, product.Name, product.Description, product.BasePrice, product.ImageUrl,
                product.Rating, product.Calories, product.PrepTimeMinutes, product.IsAvailable, product.CategoryId,
                product.Category != null ? product.Category.Name : null,
                product.MenuId,
                product.Menu != null ? product.Menu.Name : null));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateProduct(Guid id, [FromBody] UpdateProductRequest request)
    {
        var product = await _context.Products.FindAsync(id);
        if (product == null)
            return NotFound();

        product.Name = request.Name;
        product.Description = request.Description;
        product.BasePrice = request.BasePrice;
        product.ImageUrl = request.ImageUrl ?? product.ImageUrl;
        product.Calories = request.Calories;
        product.PrepTimeMinutes = request.PrepTimeMinutes;
        product.IsAvailable = request.IsAvailable;
        product.CategoryId = request.CategoryId;
        product.MenuId = request.MenuId;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteProduct(Guid id)
    {
        var product = await _context.Products
            .Include(p => p.Sizes)
            .Include(p => p.Addons)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (product == null)
            return NotFound(new { error = "Продукт не найден" });

        // Проверяем, есть ли заказы с этим продуктом
        var hasOrders = await _context.OrderItems.AnyAsync(oi => oi.ProductId == id);
        if (hasOrders)
        {
            // Soft delete — помечаем как удалённый, но сохраняем в базе
            product.IsDeleted = true;
            product.IsAvailable = false;
            await _context.SaveChangesAsync();

            return Ok(new {
                message = "Продукт скрыт (soft delete)",
                reason = "Продукт был заказан ранее и сохранён для истории заказов"
            });
        }

        // Hard delete — полностью удаляем, если нет заказов
        _context.ProductSizes.RemoveRange(product.Sizes);
        _context.ProductAddons.RemoveRange(product.Addons);
        _context.Products.Remove(product);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpPut("{id}/toggle")]
    public async Task<IActionResult> ToggleProduct(Guid id)
    {
        var product = await _context.Products.FindAsync(id);
        if (product == null)
            return NotFound();

        product.IsAvailable = !product.IsAvailable;
        await _context.SaveChangesAsync();

        return Ok(new { isAvailable = product.IsAvailable });
    }

    [HttpPost("{id}/image")]
    public async Task<IActionResult> UploadImage(Guid id, IFormFile file)
    {
        var product = await _context.Products.FindAsync(id);
        if (product == null)
            return NotFound();

        if (file == null || file.Length == 0)
            return BadRequest(new { error = "No file uploaded" });

        // Валидация типа файла
        var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp", ".gif" };
        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!allowedExtensions.Contains(extension))
            return BadRequest(new { error = "Недопустимый формат файла. Разрешены: JPG, PNG, WebP, GIF" });

        // Валидация размера (5MB)
        if (file.Length > 5 * 1024 * 1024)
            return BadRequest(new { error = "Размер файла не должен превышать 5 МБ" });

        var uploadsFolder = Path.Combine(_env.ContentRootPath, "wwwroot", "images");
        Directory.CreateDirectory(uploadsFolder);

        var fileName = $"{id}{Path.GetExtension(file.FileName)}";
        var filePath = Path.Combine(uploadsFolder, fileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        product.ImageUrl = $"/images/{fileName}";
        await _context.SaveChangesAsync();

        return Ok(new { imageUrl = product.ImageUrl });
    }

    [HttpPost("{id}/sizes")]
    public async Task<ActionResult<ProductSizeDto>> AddSize(Guid id, [FromBody] CreateProductSizeRequest request)
    {
        var product = await _context.Products.FindAsync(id);
        if (product == null)
            return NotFound();

        var size = new ProductSize
        {
            ProductId = id,
            Name = request.Name,
            PriceModifier = request.PriceModifier,
            IsDefault = request.IsDefault
        };

        _context.ProductSizes.Add(size);
        await _context.SaveChangesAsync();

        return Ok(new ProductSizeDto(size.Id, size.Name, size.PriceModifier, size.IsDefault));
    }

    [HttpPost("{id}/addons")]
    public async Task<ActionResult<ProductAddonDto>> AddAddon(Guid id, [FromBody] CreateProductAddonRequest request)
    {
        var product = await _context.Products.FindAsync(id);
        if (product == null)
            return NotFound();

        var addon = new ProductAddon
        {
            ProductId = id,
            Name = request.Name,
            Price = request.Price,
            IsAvailable = true
        };

        _context.ProductAddons.Add(addon);
        await _context.SaveChangesAsync();

        return Ok(new ProductAddonDto(addon.Id, addon.Name, addon.Price, addon.IsAvailable));
    }
}
