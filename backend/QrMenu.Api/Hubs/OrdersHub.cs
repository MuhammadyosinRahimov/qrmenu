using Microsoft.AspNetCore.SignalR;

namespace QrMenu.Api.Hubs;

public class OrdersHub : Hub
{
    // Admin group - for restaurant admins to receive all orders
    public async Task JoinAdminGroup()
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, "Admins");
    }

    public async Task LeaveAdminGroup()
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, "Admins");
    }

    // Customer group - for customers to receive their order updates
    public async Task JoinCustomerGroup(string userId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"Customer_{userId}");
    }

    public async Task LeaveCustomerGroup(string userId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"Customer_{userId}");
    }

    // Restaurant group - for updates specific to a restaurant
    public async Task JoinRestaurantGroup(string restaurantId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"Restaurant_{restaurantId}");
    }

    public async Task LeaveRestaurantGroup(string restaurantId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"Restaurant_{restaurantId}");
    }

    // Table group - for updates specific to a table session
    public async Task JoinTableGroup(string tableId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"Table_{tableId}");
    }

    public async Task LeaveTableGroup(string tableId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"Table_{tableId}");
    }

    public override async Task OnConnectedAsync()
    {
        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        await base.OnDisconnectedAsync(exception);
    }
}
