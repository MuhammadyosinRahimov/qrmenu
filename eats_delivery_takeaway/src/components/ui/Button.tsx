"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "navy" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { variant = "primary", size = "md", isLoading = false, fullWidth = false, className = "", children, disabled, ...props },
    ref
  ) => {
    const base =
      "font-semibold rounded-full transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
      primary: "bg-primary text-white hover:bg-primary-600 active:scale-[0.98] shadow-md shadow-primary/20",
      navy: "bg-primary-dark text-white hover:bg-primary-700 active:scale-[0.98] shadow-md",
      secondary: "bg-gray-100 text-foreground hover:bg-gray-200 active:scale-[0.98]",
      outline: "border-2 border-primary text-primary hover:bg-primary-light",
      ghost: "text-muted hover:text-foreground hover:bg-gray-100",
      danger: "bg-danger text-white hover:bg-red-600 active:scale-[0.98]",
    };

    const sizes = {
      sm: "px-5 py-3 text-sm",
      md: "px-6 py-3 text-base",
      lg: "px-8 py-4 text-lg",
    };

    return (
      <button
        ref={ref}
        className={`${base} ${variants[variant]} ${sizes[size]} ${fullWidth ? "w-full" : ""} ${className}`}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Загрузка...
          </>
        ) : children}
      </button>
    );
  }
);

Button.displayName = "Button";
