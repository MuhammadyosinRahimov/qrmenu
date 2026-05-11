import type { Order } from "@/types";
import { useCartStore } from "@/stores/cartStore";
import { useOrderModeStore } from "@/stores/orderModeStore";

/**
 * Repeat an order: clear cart, add items as approximate cart lines, switch mode, return cart route.
 * NOTE: OrderItem only carries `selectedAddons` as names (no IDs) and no sizeId, so the resulting
 * cart line is a best-effort recreation. User can adjust before checkout.
 */
export function repeatOrder(order: Order): string {
  const restaurantId = order.restaurantId;
  if (!restaurantId) return "/cart";

  const cart = useCartStore.getState();
  const mode = useOrderModeStore.getState();

  cart.clearCart();

  for (const it of order.items ?? []) {
    cart.addItem({
      productId: it.productId,
      restaurantId,
      productName: it.productName,
      imageUrl: undefined,
      sizeId: undefined,
      sizeName: it.sizeName,
      addonIds: [],
      addonNames: it.selectedAddons ?? [],
      quantity: it.quantity,
      unitPrice: it.unitPrice,
      totalPrice: it.unitPrice * it.quantity,
      note: it.note,
    });
  }

  if (order.orderType === "Delivery") {
    mode.setMode("delivery");
  } else if (order.orderType === "Takeaway") {
    mode.setMode("takeaway");
  }

  return "/cart";
}
