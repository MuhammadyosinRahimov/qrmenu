interface IconProps {
  name: string;
  size?: number;
  className?: string;
  filled?: boolean;
}

export function Icon({
  name,
  size = 24,
  className = "",
  filled = false,
}: IconProps) {
  return (
    <span
      className={`material-symbols-${filled ? "rounded" : "outlined"} ${className}`}
      style={{ fontSize: size }}
    >
      {name}
    </span>
  );
}
