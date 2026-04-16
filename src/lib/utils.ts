import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { SITE_CONFIG } from "./constants"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function cleanProductName(name: any): string {
  if (!name) return "";
  let str = String(name);
  return str
    .replace(/^"/, '')
    .replace(/\[ADD_CAT:.*?(\]|$)/g, '') // Remove [ADD_CAT:...] even if unclosed
    .replace(/\[.*?\]/g, '') // Remove any closed bracket metadata
    .replace(/\[\w+(\-[^\]\s]*)?(\]|$)/g, '') // Remove dangling [tags
    .replace(/باركود:\s*\d+/g, '')
    .replace(/\d+\s*:باركود/g, '')
    .replace(/@/g, '')
    .split('*')[0]
    .trim();
}

export function formatPrice(price: number | string): string {
  const num = Number(price);
  if (isNaN(num)) return "0.00 ج.م";
  // Always show 2 decimal places to ensure precision as requested
  return `${num.toFixed(2)} ج.م`;
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

export function getWhatsAppLink(phone: string, message: string): string {
  // Clean phone number: remove all non-digits
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Encode message for URI
  const encodedMessage = encodeURIComponent(message);
  
  // Detect if user is on a mobile device
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent || navigator.vendor || (window as any).opera
  );

  // Smart Redirection logic:
  // On mobile: Use the app protocol directly to skip the "Web/Landing" page
  // On Desktop: Use the web client for convenience, or the api link
  if (isMobile) {
    return `whatsapp://send?phone=${cleanPhone}&text=${encodedMessage}`;
  } else {
    // For desktop, we can use web.whatsapp.com if we want to be aggressive, 
    // or just use the official api.whatsapp.com which handles both.
    // However, the user specifically mentioned preferring avoiding the 'web' confusion on mobile.
    // On desktop, web.whatsapp.com is often what people expect.
    return `https://web.whatsapp.com/send?phone=${cleanPhone}&text=${encodedMessage}`;
  }
}
