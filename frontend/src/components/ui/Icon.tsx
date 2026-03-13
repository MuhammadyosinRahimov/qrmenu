interface IconProps {
  name: string;
  size?: number;
  className?: string;
  filled?: boolean;
}

// Map of common icon aliases to Material Symbols names
const iconAliases: Record<string, string> = {
  // Food & Drink
  "pizza": "local_pizza",
  "burger": "lunch_dining",
  "coffee": "coffee",
  "drink": "local_bar",
  "dessert": "cake",
  "salad": "salad",
  "soup": "soup_kitchen",
  "sushi": "set_meal",
  "pasta": "dinner_dining",
  "breakfast": "egg_alt",
  "bakery": "bakery_dining",
  "grill": "outdoor_grill",
  "seafood": "set_meal",
  "vegetarian": "eco",
  "fast_food": "fastfood",
  "asian": "ramen_dining",
  "mexican": "tapas",
  "italian": "local_pizza",
  // Common fallbacks
  "food": "restaurant",
  "menu": "menu_book",
  "category": "category",
  "all": "grid_view",
};

export function Icon({
  name,
  size = 24,
  className = "",
  filled = false,
}: IconProps) {
  // Normalize icon name: try alias first, then original, then fallback
  const normalizedName = iconAliases[name?.toLowerCase()] || name || "category";

  return (
    <span
      className={`material-symbols-${filled ? "rounded" : "outlined"} ${className}`}
      style={{ fontSize: size }}
    >
      {normalizedName}
    </span>
  );
}
