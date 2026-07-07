import * as React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "danger" | "info";
}

export function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        {
          "bg-gray-800 text-gray-300": variant === "default",
          "bg-green-900/60 text-green-400": variant === "success",
          "bg-yellow-900/60 text-yellow-400": variant === "warning",
          "bg-red-900/60 text-red-400": variant === "danger",
          "bg-blue-900/60 text-blue-400": variant === "info",
        },
        className
      )}
      {...props}
    />
  );
}
