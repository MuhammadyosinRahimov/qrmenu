"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { getImageUrl } from "@/lib/api";
import { useCartStore } from "@/stores/cartStore";
import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

export default function CartPage() {
  const router = useRouter();
  const { items, updateQuantity, removeItem, getSubtotal, getTax, getTotal } =
    useCartStore();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ru-RU").format(price);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <Header title="Корзина" />
        <div className="flex flex-col items-center justify-center py-20 px-4">
          <div className="w-24 h-24 rounded-full bg-orange-50 flex items-center justify-center mb-6">
            <Icon name="shopping_cart" size={48} className="text-orange-400" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">
            Корзина пуста
          </h2>
          <p className="text-muted text-center mb-6">
            Добавьте блюда из меню, чтобы сделать заказ
          </p>
          <Button onClick={() => router.push("/menu")}>Перейти в меню</Button>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-48">
      <Header title="Корзина" />

      <div className="p-4 space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-xl p-4 flex gap-4 shadow-sm border border-border"
          >
            {/* Image */}
            <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
              {getImageUrl(item.imageUrl) ? (
                <Image
                  src={getImageUrl(item.imageUrl)!}
                  alt={item.productName}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Icon name="restaurant" size={24} className="text-muted" />
                </div>
              )}
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground truncate">
                {item.productName}
              </h3>
              {item.sizeName && (
                <p className="text-sm text-muted">{item.sizeName}</p>
              )}
              {item.addonNames.length > 0 && (
                <p className="text-sm text-muted truncate">
                  + {item.addonNames.join(", ")}
                </p>
              )}

              <div className="flex items-center justify-between mt-3">
                <span className="text-primary font-bold">
                  {formatPrice(item.totalPrice)} ₽
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-foreground hover:bg-gray-200"
                  >
                    <Icon name="remove" size={18} />
                  </button>
                  <span className="w-6 text-center font-medium text-foreground">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-foreground hover:bg-gray-200"
                  >
                    <Icon name="add" size={18} />
                  </button>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center text-red-500 ml-2 hover:bg-red-200"
                  >
                    <Icon name="delete" size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="fixed bottom-16 left-0 right-0 bg-white border-t border-border p-4 shadow-lg">
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-muted">
            <span>Подитог</span>
            <span>{formatPrice(getSubtotal())} ₽</span>
          </div>
          <div className="flex justify-between text-muted">
            <span>Налог (10%)</span>
            <span>{formatPrice(getTax())} ₽</span>
          </div>
          <div className="flex justify-between text-lg font-bold text-foreground">
            <span>Итого</span>
            <span className="text-orange-500">{formatPrice(getTotal())} ₽</span>
          </div>
        </div>

        <Button
          onClick={() => router.push("/checkout")}
          className="w-full"
          size="lg"
        >
          Оформить заказ
        </Button>
      </div>

      <BottomNav />
    </div>
  );
}
