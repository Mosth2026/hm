import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function cleanProductName(name: string): string {
  if (!name) return "";
  // Removes patterns like "* 12 ق", "* 24 ق", " * 13 ق", etc.
  // Also removes the quote mark at the beginning if present
  return name
    .replace(/^"/, '')
    .split('*')[0] // Take everything before the first '*'
    .trim();
}

export function formatPrice(price: number): string {
  const formatted = Number(Number(price).toFixed(1)).toString();
  return `${formatted} ج.م`;
}

export function cleanImageUrl(url: string | undefined): string {
  if (!url) return "";
  try {
    const urlObj = new URL(url);
    // Unsplash cleaning: Keep only the base image ID
    if (urlObj.hostname.includes("unsplash.com")) {
      return `${urlObj.origin}${urlObj.pathname}`;
    }
    // General cleaning for other services if needed
    return url;
  } catch (e) {
    return url || "";
  }
}
