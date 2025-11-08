import * as React from "react";
import { cn } from "@/lib/utils";

export function Button({ className, variant = "default", size = "default", ...props }) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "disabled:opacity-50 disabled:pointer-events-none",
        {
          default: "bg-blue-600 text-white hover:bg-blue-700",
          outline: "border border-blue-600 text-blue-600 hover:bg-blue-50",
          ghost: "hover:bg-gray-100 text-gray-700",
        }[variant],
        {
          default: "h-10 py-2 px-4",
          sm: "h-9 px-3",
          lg: "h-11 px-8",
        }[size],
        className
      )}
      {...props}
    />
  );
}
