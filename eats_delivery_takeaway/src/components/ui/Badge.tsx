interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "error" | "primary" | "info";
  size?: "sm" | "md";
  className?: string;
}

export function Badge({ children, variant = "default", size = "sm", className = "" }: BadgeProps) {
  const variants = {
    default: "bg-gray-100 text-gray-700",
    success: "bg-green-100 text-green-700",
    warning: "bg-secondary-light text-secondary-dark",
    error: "bg-danger/10 text-danger",
    primary: "bg-primary-light text-primary",
    info: "bg-blue-100 text-blue-700",
  };
  const sizes = { sm: "px-2 py-0.5 text-xs", md: "px-3 py-1 text-sm" };
  return (
    <span className={`inline-flex items-center font-medium rounded-xl ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </span>
  );
}
