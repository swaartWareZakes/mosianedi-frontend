// lib/utils.ts

// Simple Tailwind-friendly classnames helper.
// Usage: cn("base", condition && "extra")
export function cn(
    ...classes: Array<string | false | null | undefined>
  ): string {
    return classes.filter(Boolean).join(" ");
  }