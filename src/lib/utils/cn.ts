/**
 * Merges class names, filtering out falsy values.
 * Lightweight alternative to clsx. No external dependency needed.
 */
export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
