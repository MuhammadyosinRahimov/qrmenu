using System.Net.Http.Headers;
using System.Text.Json;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace QrMenu.Infrastructure.Services;

public interface ISmsService
{
    Task<bool> SendOtpAsync(string phone, string code);
}

public class MockSmsService : ISmsService
{
    private readonly ILogger<MockSmsService> _logger;

    public MockSmsService(ILogger<MockSmsService> logger)
    {
        _logger = logger;
    }

    public Task<bool> SendOtpAsync(string phone, string code)
    {
        // Mock implementation - logs OTP instead of sending SMS
        _logger.LogInformation("SMS OTP to {Phone}: {Code}", phone, code);
        Console.WriteLine($"SMS OTP to {phone}: {code}");
        return Task.FromResult(true);
    }
}

public class OsonSmsService : ISmsService
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<OsonSmsService> _logger;
    private readonly string _token;
    private readonly string _login;
    private readonly string _sender;

    public OsonSmsService(
        HttpClient httpClient,
        IConfiguration configuration,
        ILogger<OsonSmsService> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
        _token = configuration["OsonSms:Token"] ?? throw new ArgumentNullException("OsonSms:Token not configured");
        _login = configuration["OsonSms:Login"] ?? throw new ArgumentNullException("OsonSms:Login not configured");
        _sender = configuration["OsonSms:Sender"] ?? "QRMenu";
    }

    public async Task<bool> SendOtpAsync(string phone, string code)
    {
        try
        {
            // Format phone number (remove + if present, ensure starts with 992)
            var phoneNumber = phone.TrimStart('+');
            if (!phoneNumber.StartsWith("992"))
            {
                phoneNumber = "992" + phoneNumber.TrimStart('9', '2');
            }

            // Generate unique transaction ID
            var txnId = Guid.NewGuid().ToString("N");

            // Build SMS message
            var message = $"Ваш код подтверждения: {code}. Никому не сообщайте этот код.";

            // Build request URL
            var url = $"https://api.osonsms.com/sendsms_v1.php" +
                      $"?from={Uri.EscapeDataString(_sender)}" +
                      $"&phone_number={phoneNumber}" +
                      $"&msg={Uri.EscapeDataString(message)}" +
                      $"&login={Uri.EscapeDataString(_login)}" +
                      $"&txn_id={txnId}";

            // Create request with authorization header
            var request = new HttpRequestMessage(HttpMethod.Get, url);
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _token);

            _logger.LogInformation("Sending OTP SMS to {Phone}, txn_id: {TxnId}", phoneNumber, txnId);

            // Send request
            var response = await _httpClient.SendAsync(request);
            var responseContent = await response.Content.ReadAsStringAsync();

            _logger.LogInformation("OsonSMS response: {StatusCode} - {Content}",
                (int)response.StatusCode, responseContent);

            if (response.StatusCode == System.Net.HttpStatusCode.Created) // 201
            {
                _logger.LogInformation("SMS sent successfully to {Phone}", phoneNumber);
                return true;
            }

            // Parse error response
            try
            {
                var errorResponse = JsonSerializer.Deserialize<OsonSmsErrorResponse>(responseContent);
                _logger.LogError("OsonSMS error: {Code} - {Message}",
                    errorResponse?.Error?.Code, errorResponse?.Error?.Msg);
            }
            catch
            {
                _logger.LogError("OsonSMS error: {Content}", responseContent);
            }

            return false;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send SMS to {Phone}", phone);
            return false;
        }
    }

    private class OsonSmsErrorResponse
    {
        public OsonSmsError? Error { get; set; }
    }

    private class OsonSmsError
    {
        public int Code { get; set; }
        public string? Msg { get; set; }
        public string? Timestamp { get; set; }
    }
}
