# Build stage
FROM mcr.microsoft.com/dotnet/sdk:7.0 AS build
WORKDIR /src

# Copy solution and project files
COPY QrMenu.sln .
COPY QrMenu.Core/QrMenu.Core.csproj QrMenu.Core/
COPY QrMenu.Infrastructure/QrMenu.Infrastructure.csproj QrMenu.Infrastructure/
COPY QrMenu.Api/QrMenu.Api.csproj QrMenu.Api/

# Restore dependencies
RUN dotnet restore

# Copy all source code
COPY . .

# Build and publish
RUN dotnet publish QrMenu.Api/QrMenu.Api.csproj -c Release -o /app/publish --no-restore

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:7.0 AS runtime
WORKDIR /app

# Install curl for healthcheck
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Copy published app
COPY --from=build /app/publish .

# Create directory for uploaded images
RUN mkdir -p /app/wwwroot/images

# Set environment variables
ENV ASPNETCORE_URLS=http://+:5079
ENV ASPNETCORE_ENVIRONMENT=Production

# Expose port
EXPOSE 5079

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=5 \
    CMD curl -f http://localhost:5079/health || exit 1

# Run the app
ENTRYPOINT ["dotnet", "QrMenu.Api.dll"]
