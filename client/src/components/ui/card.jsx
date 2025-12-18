import * as React from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }) {
  return (
    <div
      className={cn("rounded-xl border bg-white dark:bg-gray-900 shadow-md hover:shadow-lg transition", className)}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }) {
  return <div className={cn("p-4 border-b", className)} {...props} />;
}

export function CardTitle({ className, ...props }) {
  return <h3 className={cn("font-semibold text-lg", className)} {...props} />;
}

export function CardDescription({ className, ...props }) {
  return <p className={cn("text-sm text-gray-500 dark:text-gray-400", className)} {...props} />;
}

export function CardContent({ className, ...props }) {
  return <div className={cn("p-4", className)} {...props} />;
}

