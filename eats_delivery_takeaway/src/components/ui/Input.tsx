"use client";

import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, leftIcon, rightIcon, className = "", ...props }, ref) => {
    return (
      <div className="w-full">
        {label && <label className="block text-sm font-medium text-muted mb-2">{label}</label>}
        <div className="relative">
          {leftIcon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">{leftIcon}</div>}
          <input
            ref={ref}
            className={`
              w-full ${leftIcon ? "pl-10" : "pl-4"} ${rightIcon ? "pr-10" : "pr-4"} py-3
              bg-white border border-border rounded-xl
              text-foreground placeholder:text-muted shadow-sm
              focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
              transition-all duration-200
              ${error ? "border-danger/60 ring-danger/20" : ""}
              ${className}
            `}
            {...props}
          />
          {rightIcon && <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted">{rightIcon}</div>}
        </div>
        {error && <p className="mt-2 text-sm text-danger">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
