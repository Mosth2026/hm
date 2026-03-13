import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { SITE_CONFIG } from "./constants"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function cleanProductName(name: any): string {
  if (!name) return "";
  const strName = String(name);
  return strName
    .replace(/^"/, '')
    .replace(/\[TAX_EXEMPT\]/g, '') // Remove tax tag
    .split('*')[0] // Take everything before the first '*'
    .trim();
}

export function formatPrice(price: number): string {
  const formatted = Number(Number(price).toFixed(1)).toString();
  return `${formatted} ج.م`;
}

export function getShareUrl(type: 'product' | 'category', id: string | number): string {
  return `${SITE_CONFIG.siteUrl}/api/seo?type=${type}&id=${id}`;
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
    const baseUrl = SITE_CONFIG.siteUrl;
    const cleanPath = url.startsWith('/') ? url : `/${url}`;
    return `${baseUrl}${cleanPath}`;
  } catch (e) {
    // Fallback logic
    if (url && !url.startsWith('http')) {
      return `${SITE_CONFIG.siteUrl}${url.startsWith('/') ? '' : '/'}${url}`;
    }
    return url || `${SITE_CONFIG.siteUrl}/assets/logo.png`;
  }
}
export function copyToClipboard(text: string): Promise<boolean> {
  // Try modern API first
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text)
      .then(() => true)
      .catch(() => false);
  }

  // Fallback for non-secure origins
  return new Promise((resolve) => {
    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      
      // Ensure the textarea is not visible
      textArea.style.position = "fixed";
      textArea.style.left = "-9999px";
      textArea.style.top = "0";
      document.body.appendChild(textArea);
      
      textArea.focus();
      textArea.select();
      
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      resolve(successful);
    } catch (err) {
      console.error('Fallback copy failed', err);
      resolve(false);
    }
  });
}
