using QRCoder;

namespace QrMenu.Infrastructure.Services;

public interface IQrCodeService
{
    byte[] GenerateQrCode(string url);
    string GenerateQrCodeBase64(string url);
}

public class QrCodeService : IQrCodeService
{
    public byte[] GenerateQrCode(string url)
    {
        using var qrGenerator = new QRCodeGenerator();
        using var qrCodeData = qrGenerator.CreateQrCode(url, QRCodeGenerator.ECCLevel.Q);
        using var qrCode = new PngByteQRCode(qrCodeData);
        return qrCode.GetGraphic(10);
    }

    public string GenerateQrCodeBase64(string url)
    {
        var qrBytes = GenerateQrCode(url);
        return Convert.ToBase64String(qrBytes);
    }
}
