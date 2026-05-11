"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

const RATING_LABELS: Record<number, string> = {
  1: "Ужасно",
  2: "Плохо",
  3: "Нормально",
  4: "Хорошо",
  5: "Отлично",
};

function BigStarRating({
  value,
  onChange,
  label,
  icon,
}: {
  value: number;
  onChange: (v: number) => void;
  label: string;
  icon?: string;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const display = hover ?? value;
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {icon && (
            <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Icon name={icon} size={18} className="text-primary" />
            </span>
          )}
          <span className="text-sm font-semibold">{label}</span>
        </div>
        {display > 0 && (
          <span className="text-xs font-medium text-primary">
            {RATING_LABELS[display]}
          </span>
        )}
      </div>
      <div className="flex justify-between">
        {[1, 2, 3, 4, 5].map((n) => {
          const active = display >= n;
          return (
            <button
              key={n}
              type="button"
              onClick={() => onChange(n)}
              onMouseEnter={() => setHover(n)}
              onMouseLeave={() => setHover(null)}
              className="p-1 active:scale-90 transition-transform"
              aria-label={`${n} ${n === 1 ? "звезда" : n < 5 ? "звезды" : "звёзд"}`}
            >
              <Icon
                name="star"
                size={40}
                filled={active}
                className={
                  active
                    ? "text-amber-400 drop-shadow-[0_2px_4px_rgba(245,158,11,0.45)]"
                    : "text-gray-200"
                }
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function ReviewForm({
  hasDelivery,
  onSubmit,
  submitting,
}: {
  hasDelivery: boolean;
  onSubmit: (data: {
    rating: number;
    foodRating: number;
    deliveryRating?: number;
    comment: string;
  }) => void;
  submitting?: boolean;
}) {
  const [rating, setRating] = useState(0);
  const [foodRating, setFoodRating] = useState(0);
  const [deliveryRating, setDeliveryRating] = useState(0);
  const [comment, setComment] = useState("");

  const canSubmit = rating > 0 && foodRating > 0 && (!hasDelivery || deliveryRating > 0);

  return (
    <div className="space-y-4">
      {/* Hero header with gradient */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary to-primary/80 px-6 py-8 text-white">
        <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/10" />
        <div className="absolute -left-6 -bottom-6 w-24 h-24 rounded-full bg-white/10" />
        <div className="relative">
          <div className="text-xs uppercase tracking-wider opacity-80 mb-1">
            Спасибо за заказ
          </div>
          <h1 className="text-2xl font-extrabold leading-tight">
            Как вам?
          </h1>
          <p className="text-sm opacity-90 mt-1">
            Поставьте оценку — это помогает ресторанам стать лучше
          </p>
        </div>
      </div>

      <BigStarRating
        value={rating}
        onChange={setRating}
        label="Общее впечатление"
        icon="sparkles"
      />

      <BigStarRating
        value={foodRating}
        onChange={setFoodRating}
        label="Качество еды"
        icon="food"
      />

      {hasDelivery && (
        <BigStarRating
          value={deliveryRating}
          onChange={setDeliveryRating}
          label="Доставка"
          icon="delivery"
        />
      )}

      <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm space-y-2">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Icon name="chat" size={18} className="text-primary" />
          </span>
          <label htmlFor="review-comment" className="text-sm font-semibold">
            Комментарий
          </label>
          <span className="ml-auto text-[11px] text-muted">
            {comment.length}/500
          </span>
        </div>
        <textarea
          id="review-comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Расскажите подробнее — что понравилось или что улучшить"
          className="w-full min-h-[110px] px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-transparent text-sm resize-none"
          maxLength={500}
        />
      </div>

      <Button
        fullWidth
        isLoading={submitting}
        disabled={!canSubmit}
        onClick={() =>
          onSubmit({
            rating,
            foodRating,
            deliveryRating: hasDelivery ? deliveryRating : undefined,
            comment: comment.trim(),
          })
        }
      >
        <Icon name="check" size={18} className="mr-2" />
        Отправить отзыв
      </Button>
    </div>
  );
}
