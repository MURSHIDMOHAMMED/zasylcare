"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export function Select({
  options,
  value,
  onChange,
  placeholder,
  className,
  ...props
}: {
  options: { label: string; value: string }[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
} & Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "onChange">) {
  return (
    <select
      className={cn(
        "h-10 w-full rounded-lg border bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-primary/25",
        className
      )}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      {...props}
    >
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
