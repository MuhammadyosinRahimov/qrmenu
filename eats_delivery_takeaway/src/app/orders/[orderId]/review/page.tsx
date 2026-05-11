"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/Header";
import { ReviewForm } from "@/components/orders/ReviewForm";
import { getOrder, createReview } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";

export default function ReviewPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = use(params);
  const router = useRouter();
  const toast = useToast();

  const { data: order } = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => getOrder(orderId),
  });

  const [submitting, setSubmitting] = useState(false);

  const hasDelivery = !!order?.deliveryAddress || order?.orderType === "Delivery";

  const submit = async (data: {
    rating: number;
    foodRating: number;
    deliveryRating?: number;
    comment: string;
  }) => {
    setSubmitting(true);
    try {
      await createReview(orderId, data);
      toast.show({ type: "success", message: "Спасибо за отзыв!" });
      router.replace(`/orders/${orderId}`);
    } catch (e: unknown) {
      toast.show({ type: "error", message: e instanceof Error ? e.message : "Ошибка отправки" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-dvh bg-gradient-to-b from-primary/5 via-surface to-surface pb-12">
      <Header title="Отзыв о заказе" />
      <div className="px-4 pt-6 pb-4 max-w-lg mx-auto">
        <ReviewForm hasDelivery={hasDelivery} onSubmit={submit} submitting={submitting} />
      </div>
    </div>
  );
}
