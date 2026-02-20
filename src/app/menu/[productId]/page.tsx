"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { getProduct, getImageUrl } from "@/lib/api";
import { useCartStore } from "@/stores/cartStore";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Badge } from "@/components/ui/Badge";

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.productId as string;
  const addItem = useCartStore((state) => state.addItem);

  const [selectedSizeId, setSelectedSizeId] = useState<string | undefined>();
  const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(1);

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", productId],
    queryFn: () => getProduct(productId),
    enabled: !!productId,
  });

  // Set default size when product loads
  useMemo(() => {
    if (product?.sizes) {
      const defaultSize = product.sizes.find((s) => s.isDefault);
      if (defaultSize && !selectedSizeId) {
        setSelectedSizeId(defaultSize.id);
      }
    }
  }, [product?.sizes, selectedSizeId]);

  const totalPrice = useMemo(() => {
    if (!product) return 0;

    let price = product.basePrice;

    // Add size modifier
    if (selectedSizeId) {
      const size = product.sizes.find((s) => s.id === selectedSizeId);
      if (size) price += size.priceModifier;
    }

    // Add addons
    selectedAddonIds.forEach((addonId) => {
      const addon = product.addons.find((a) => a.id === addonId);
      if (addon) price += addon.price;
    });

    return price * quantity;
  }, [product, selectedSizeId, selectedAddonIds, quantity]);

  const handleAddToCart = () => {
    if (!product) return;

    const selectedSize = product.sizes.find((s) => s.id === selectedSizeId);
    const selectedAddons = product.addons.filter((a) =>
      selectedAddonIds.includes(a.id)
    );

    let unitPrice = product.basePrice;
    if (selectedSize) unitPrice += selectedSize.priceModifier;
    selectedAddons.forEach((a) => (unitPrice += a.price));

    addItem({
      productId: product.id,
      productName: product.name,
      imageUrl: product.imageUrl,
      sizeId: selectedSizeId,
      sizeName: selectedSize?.name,
      addonIds: selectedAddonIds,
      addonNames: selectedAddons.map((a) => a.name),
      quantity,
      unitPrice,
      totalPrice: unitPrice * quantity,
    });

    router.push("/cart");
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ru-RU").format(price);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="animate-pulse">
          <div className="h-72 bg-surface" />
          <div className="p-4 space-y-4">
            <div className="h-8 bg-surface rounded w-3/4" />
            <div className="h-4 bg-surface rounded w-full" />
            <div className="h-4 bg-surface rounded w-2/3" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted">Продукт не найден</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Image */}
      <div className="relative h-72 bg-surface-light">
        {getImageUrl(product.imageUrl) ? (
          <Image
            src={getImageUrl(product.imageUrl)!}
            alt={product.name}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Icon name="restaurant" size={64} className="text-muted" />
          </div>
        )}

        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-md"
        >
          <Icon name="arrow_back" size={24} className="text-foreground" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6">
        {/* Title and price */}
        <div>
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-2xl font-bold text-foreground">{product.name}</h1>
            <span className="text-xl font-bold text-orange-500">
              {formatPrice(product.basePrice)} ₽
            </span>
          </div>
          <p className="text-muted mt-2">{product.description}</p>
        </div>

        {/* Info badges */}
        <div className="flex flex-wrap gap-2">
          {product.rating > 0 && (
            <Badge variant="warning">
              <span className="flex items-center gap-1">
                <Icon name="star" size={14} filled />
                {product.rating.toFixed(1)}
              </span>
            </Badge>
          )}
          <Badge>
            <span className="flex items-center gap-1">
              <Icon name="schedule" size={14} />
              {product.prepTimeMinutes} мин
            </span>
          </Badge>
          {product.calories > 0 && (
            <Badge>
              <span className="flex items-center gap-1">
                <Icon name="local_fire_department" size={14} />
                {product.calories} ккал
              </span>
            </Badge>
          )}
        </div>

        {/* Sizes */}
        {product.sizes.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-muted mb-3">Размер</h3>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((size) => (
                <button
                  key={size.id}
                  onClick={() => setSelectedSizeId(size.id)}
                  className={`px-4 py-2 rounded-xl border transition-all ${
                    selectedSizeId === size.id
                      ? "border-orange-500 bg-orange-50 text-orange-600"
                      : "border-border text-muted hover:border-orange-300"
                  }`}
                >
                  <span className="text-sm font-medium">{size.name}</span>
                  {size.priceModifier > 0 && (
                    <span className="text-xs ml-1">
                      (+{formatPrice(size.priceModifier)} ₽)
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Addons */}
        {product.addons.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-muted mb-3">
              Дополнительно
            </h3>
            <div className="space-y-2">
              {product.addons.map((addon) => (
                <button
                  key={addon.id}
                  onClick={() => {
                    setSelectedAddonIds((prev) =>
                      prev.includes(addon.id)
                        ? prev.filter((id) => id !== addon.id)
                        : [...prev, addon.id]
                    );
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
                    selectedAddonIds.includes(addon.id)
                      ? "border-orange-500 bg-orange-50"
                      : "border-border hover:border-orange-300"
                  }`}
                >
                  <span className="text-foreground">{addon.name}</span>
                  <span className="text-orange-500 font-medium">
                    +{formatPrice(addon.price)} ₽
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quantity */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-muted">Количество</span>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-10 h-10 rounded-xl bg-gray-100 border border-border flex items-center justify-center text-foreground hover:bg-gray-200"
            >
              <Icon name="remove" size={20} />
            </button>
            <span className="text-xl font-bold text-foreground w-8 text-center">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="w-10 h-10 rounded-xl bg-gray-100 border border-border flex items-center justify-center text-foreground hover:bg-gray-200"
            >
              <Icon name="add" size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Add to cart button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-border shadow-lg">
        <Button onClick={handleAddToCart} className="w-full" size="lg">
          Добавить в корзину — {formatPrice(totalPrice)} ₽
        </Button>
      </div>
    </div>
  );
}
