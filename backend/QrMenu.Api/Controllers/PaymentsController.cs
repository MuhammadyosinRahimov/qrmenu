using System.Security.Cryptography;
using System.Text;
using System.Xml.Linq;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using QrMenu.Api.DTOs;
using QrMenu.Api.Hubs;
using QrMenu.Core.Entities;
using QrMenu.Infrastructure.Data;

namespace QrMenu.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PaymentsController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IConfiguration _configuration;
    private readonly HttpClient _httpClient;
    private readonly IHubContext<OrdersHub> _hubContext;

    public PaymentsController(
        AppDbContext context,
        IConfiguration configuration,
        IHttpClientFactory httpClientFactory,
        IHubContext<OrdersHub> hubContext)
    {
        _context = context;
        _configuration = configuration;
        _httpClient = httpClientFactory.CreateClient();
        _hubContext = hubContext;
    }

    /// <summary>
    /// Создаёт данные для формы оплаты DC Bank
    /// </summary>
    [HttpPost("create")]
    [Authorize]
    public async Task<ActionResult<PaymentFormData>> CreatePayment([FromBody] CreatePaymentRequest request)
    {
        // Получить заказ с рестораном (поддержка как table-based, так и restaurant-based заказов)
        var order = await _context.Orders
            .Include(o => o.Table)
                .ThenInclude(t => t.Restaurant)
            .Include(o => o.Restaurant)
            .FirstOrDefaultAsync(o => o.Id == request.OrderId);

        if (order == null)
            return NotFound(new { error = "Заказ не найден" });

        // Получить ресторан (для delivery/takeaway - напрямую, для dine-in - через стол)
        var restaurant = order.Restaurant ?? order.Table?.Restaurant;

        if (restaurant == null)
            return BadRequest(new { error = "Ресторан не найден для заказа" });

        // Генерировать уникальный PaymentId для этого заказа
        var paymentId = GeneratePaymentId();

        // Сохранить PaymentId в заказе
        order.PaymentId = paymentId;
        order.PaymentMethod = "online";
        await _context.SaveChangesAsync();

        // DC Bank проверка
        if (!string.IsNullOrEmpty(restaurant.DcMerchantId) && !string.IsNullOrEmpty(restaurant.DcSecretKey))
        {
            return Ok(CreateDcPayment(order, restaurant, request, paymentId));
        }
        else
        {
            return BadRequest(new { error = "Онлайн оплата недоступна для этого ресторана" });
        }
    }

    /// <summary>
    /// Запрос оплаты наличными - уведомляет админа через SignalR
    /// </summary>
    [HttpPost("cash")]
    [Authorize]
    public async Task<ActionResult<CashPaymentResponse>> RequestCashPayment([FromBody] CashPaymentRequest request)
    {
        var order = await _context.Orders
            .Include(o => o.Table)
                .ThenInclude(t => t.Restaurant)
            .Include(o => o.Restaurant)
            .FirstOrDefaultAsync(o => o.Id == request.OrderId);

        if (order == null)
            return NotFound(new { error = "Заказ не найден" });

        // Обновить метод оплаты
        order.PaymentMethod = "cash";
        await _context.SaveChangesAsync();

        // Определить название и ресторан
        var orderName = order.OrderType switch
        {
            Core.Enums.OrderType.Delivery => $"Доставка: {order.CustomerName}",
            Core.Enums.OrderType.Takeaway => $"Самовывоз: {order.CustomerName}",
            _ => order.Table?.Name ?? $"Стол #{order.TableNumber}"
        };
        var restaurantId = order.RestaurantId ?? order.Table?.RestaurantId ?? Guid.Empty;

        // Уведомить админов через SignalR
        await _hubContext.Clients.Group("Admins").SendAsync("CashPaymentRequested", new
        {
            OrderId = order.Id,
            TableNumber = order.TableNumber,
            TableName = orderName,
            Amount = order.Total,
            RequestedAt = DateTime.UtcNow,
            RestaurantId = restaurantId,
            OrderType = order.OrderType
        });

        return Ok(new CashPaymentResponse(
            Success: true,
            Message: order.OrderType == Core.Enums.OrderType.DineIn
                ? "Официант скоро подойдёт для оплаты"
                : "Ожидайте подтверждения оплаты",
            OrderId: order.Id,
            TableNumber: order.TableNumber,
            Amount: order.Total
        ));
    }

    /// <summary>
    /// Создание платежа через DC Bank
    /// </summary>
    private PaymentFormData CreateDcPayment(Order order, Restaurant restaurant, CreatePaymentRequest request, string paymentId)
    {
        var merchant = restaurant.DcMerchantId!;
        var secretKey = restaurant.DcSecretKey!;
        var articul = restaurant.DcArticul ?? "30";
        var account = restaurant.Phone ?? "";
        var amount = (int)(order.Total * 100); // Конвертация в тийины
        var currency = _configuration.GetValue<int>("DcPayment:Currency", 972);
        var formUrl = _configuration["DcPayment:FormUrl"] ?? "https://acquiring.dc.tj/pay/form.php";

        // Генерация Sign: MD5(OrderId + Merchant + SecretKey)
        var sign = GenerateMD5Sign($"{paymentId}{merchant}{secretKey}");

        // Создание XML запроса
        var xml = new XElement("Request",
            new XElement("Operation", "CreateOrder"),
            new XElement("Merchant", merchant),
            new XElement("OrderId", paymentId),
            new XElement("Amount", amount),
            new XElement("Articul", articul),
            new XElement("Account", account),
            new XElement("Currency", currency),
            new XElement("Description", $"Оплата заказа #{order.TableNumber}"),
            new XElement("ApproveURL", request.ApproveUrl),
            new XElement("DeclineURL", request.DeclineUrl),
            new XElement("CancelURL", request.CancelUrl),
            new XElement("Sign", sign)
        );

        return new PaymentFormData(
            FormUrl: formUrl,
            Provider: "dc",
            FormFields: new Dictionary<string, string>
            {
                ["Request"] = xml.ToString()
            }
        );
    }

    /// <summary>
    /// Проверяет статус оплаты DC Bank
    /// </summary>
    [HttpGet("{orderId}/status")]
    [Authorize]
    public async Task<ActionResult<PaymentStatusResponse>> CheckPaymentStatus(Guid orderId)
    {
        var order = await _context.Orders
            .Include(o => o.Table)
                .ThenInclude(t => t.Restaurant)
            .Include(o => o.Restaurant)
            .FirstOrDefaultAsync(o => o.Id == orderId);

        if (order == null)
            return NotFound(new { error = "Заказ не найден" });

        if (string.IsNullOrEmpty(order.PaymentId))
            return BadRequest(new { error = "Платёж не инициирован" });

        // Получить ресторан (для delivery/takeaway - напрямую, для dine-in - через стол)
        var restaurant = order.Restaurant ?? order.Table?.Restaurant;

        if (restaurant == null)
            return BadRequest(new { error = "Ресторан не найден" });

        // DC Bank проверка
        if (!string.IsNullOrEmpty(restaurant.DcMerchantId) && !string.IsNullOrEmpty(restaurant.DcSecretKey))
        {
            return Ok(await CheckDcStatus(order, restaurant));
        }
        else
        {
            return BadRequest(new { error = "Платёжные credentials не настроены" });
        }
    }

    /// <summary>
    /// Проверка статуса через DC Bank
    /// </summary>
    private async Task<PaymentStatusResponse> CheckDcStatus(Order order, Restaurant restaurant)
    {
        var checkPayUrl = _configuration["DcPayment:CheckPayUrl"] ?? "https://acquiring.dc.tj/pay/CheckPay.php";
        var sign = GenerateMD5Sign($"{order.PaymentId}{restaurant.DcMerchantId}{restaurant.DcSecretKey}");

        // Создание XML запроса для CheckPay
        var xml = new XElement("Request",
            new XElement("Operation", "CheckPay"),
            new XElement("Merchant", restaurant.DcMerchantId),
            new XElement("OrderId", order.PaymentId),
            new XElement("Sign", sign)
        );

        try
        {
            var content = new FormUrlEncodedContent(new[]
            {
                new KeyValuePair<string, string>("Request", xml.ToString())
            });

            var response = await _httpClient.PostAsync(checkPayUrl, content);
            var responseBody = await response.Content.ReadAsStringAsync();

            // Парсинг ответа
            var responseXml = XElement.Parse(responseBody);
            var withdrawalStatus = int.Parse(responseXml.Element("WithdrawalStatus")?.Value ?? "0");

            // Обновить статус в заказе
            order.PaymentStatus = withdrawalStatus;

            if (withdrawalStatus == 10) // Успешный платёж
            {
                order.IsPaid = true;
                order.PaidAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();

            var statusMessage = withdrawalStatus switch
            {
                10 => "Оплата успешна",
                0 or 1 or 5 => "Ожидание оплаты",
                3 => "Ошибка оплаты",
                _ => "Неизвестный статус"
            };

            return new PaymentStatusResponse(withdrawalStatus == 10, withdrawalStatus, statusMessage);
        }
        catch (Exception ex)
        {
            return new PaymentStatusResponse(false, 0, $"Ошибка проверки статуса: {ex.Message}");
        }
    }

    /// <summary>
    /// Обновляет статус оплаты (для внутреннего использования/callback)
    /// </summary>
    [HttpPost("update-status")]
    public async Task<ActionResult> UpdatePaymentStatus([FromBody] UpdatePaymentStatusRequest request)
    {
        var order = await _context.Orders
            .FirstOrDefaultAsync(o => o.PaymentId == request.PaymentId);

        if (order == null)
            return NotFound(new { error = "Заказ не найден" });

        order.PaymentStatus = request.Status;

        if (request.Status == 10)
        {
            order.IsPaid = true;
            order.PaidAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();

        return Ok(new { success = true });
    }

    /// <summary>
    /// Проверяет доступность онлайн оплаты для ресторана
    /// </summary>
    [HttpGet("available/{restaurantId}")]
    public async Task<ActionResult<bool>> IsPaymentAvailable(Guid restaurantId)
    {
        var restaurant = await _context.Restaurants.FindAsync(restaurantId);

        if (restaurant == null)
            return NotFound(new { error = "Ресторан не найден" });

        var isAvailable = !string.IsNullOrEmpty(restaurant.DcMerchantId) &&
                          !string.IsNullOrEmpty(restaurant.DcSecretKey);

        return Ok(new { available = isAvailable });
    }

    private static string GenerateMD5Sign(string input)
    {
        using var md5 = MD5.Create();
        var inputBytes = Encoding.UTF8.GetBytes(input);
        var hashBytes = md5.ComputeHash(inputBytes);
        return Convert.ToHexString(hashBytes).ToLower();
    }

    private static string GeneratePaymentId()
    {
        // Генерация уникального числового ID
        return DateTimeOffset.UtcNow.ToUnixTimeMilliseconds().ToString();
    }
}
