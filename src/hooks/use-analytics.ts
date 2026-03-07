
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';

// Key for storage
const SESSION_KEY = 'saada_session_id';

export const useAnalytics = () => {
    useEffect(() => {
        if (typeof window === 'undefined') return;

        // Initialize session if not exists
        let sessionId = localStorage.getItem(SESSION_KEY);
        if (!sessionId) {
            try {
                sessionId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2) + Date.now().toString(36);
                localStorage.setItem(SESSION_KEY, sessionId);
                logEvent('session_start', { userAgent: navigator.userAgent });
            } catch (e) {
                sessionId = 'temp-session-' + Date.now();
            }
        }

        // Log page view
        logEvent('page_view', { path: window.location.pathname });
    }, []);

    const logEvent = async (eventType: string, eventData: any = {}, customerInfo: any = null) => {
        const sessionId = localStorage.getItem(SESSION_KEY);
        if (!sessionId) return;

        try {
            await supabase.from('site_analytics').insert([{
                session_id: sessionId,
                event_type: eventType,
                event_data: eventData,
                customer_info: customerInfo
            }]);
        } catch (e) {
            // Silently fail to not break UX
            console.error('Analytics error:', e);
        }
    };

    const trackAddToCart = (product: any, quantity: number) => {
        logEvent('add_to_cart', { id: product.id, name: product.name, quantity, price: product.price });
    };

    const trackRemoveFromCart = (productId: number, productName: string) => {
        logEvent('remove_from_cart', { id: productId, name: productName });
    };

    const trackCheckoutClick = (items: any[], total: number) => {
        logEvent('checkout_click', { items_count: items.length, total });
    };

    const trackWhatsAppClick = (product: any, orderId?: string) => {
        logEvent('whatsapp_click', { product_id: product.id, product_name: product.name, order_id: orderId });
    };

    return { logEvent, trackAddToCart, trackRemoveFromCart, trackCheckoutClick, trackWhatsAppClick };
};
