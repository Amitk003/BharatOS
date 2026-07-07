import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

export function Button({
  className,
  variant = "primary",
  size = "md",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        {
          "bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500":
            variant === "primary",
          "bg-gray-800 text-gray-100 hover:bg-gray-700 focus-visible:ring-gray-500":
            variant === "secondary",
          "border border-gray-700 bg-transparent text-gray-100 hover:bg-gray-800 focus-visible:ring-gray-500":
            variant === "outline",
          "bg-transparent text-gray-300 hover:bg-gray-800 focus-visible:ring-gray-500":
            variant === "ghost",
          "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500":
            variant === "danger",
        },
        {
          "h-8 px-3 text-xs": size === "sm",
          "h-10 px-4 text-sm": size === "md",
          "h-12 px-6 text-base": size === "lg",
        },
        className
      )}
      {...props}
    />
  );
}
