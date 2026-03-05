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
  if (!url) return "https://happinessmakers.online/assets/logo.png";

  try {
    // If it's already an absolute URL (like Unsplash or Supabase full URL)
    if (url.startsWith('http')) {
      const urlObj = new URL(url);
      if (urlObj.hostname.includes("unsplash.com")) {
        return `${urlObj.origin}${urlObj.pathname}`;
      }
      return url;
    }

    // If it's a relative path, make it absolute
    const baseUrl = "https://happinessmakers.online";
    const cleanPath = url.startsWith('/') ? url : `/${url}`;
    return `${baseUrl}${cleanPath}`;
  } catch (e) {
    // Fallback logic
    if (url && !url.startsWith('http')) {
      return `https://happinessmakers.online${url.startsWith('/') ? '' : '/'}${url}`;
    }
    return url || "https://happinessmakers.online/assets/logo.png";
  }
}
