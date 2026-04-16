import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface PaymentGateway {
    id: string;
    name: string;
    name_ar: string;
    description_ar: string;
    logo: string;
    is_enabled: boolean;
    api_key: string;
    api_secret: string;
    integration_id: string;
    iframe_id: string;
    extra_config: Record<string, string>;
    is_test_mode: boolean;
    sort_order: number;
}

const DEFAULT_GATEWAYS: PaymentGateway[] = [
    {
        id: 'cod',
        name: 'cash_on_delivery',
        name_ar: 'الدفع عند الاستلام',
        description_ar: 'ادفع نقداً لمندوب الشحن عند استلام طلبك',
        logo: '💵',
        is_enabled: true,
        api_key: '',
        api_secret: '',
        integration_id: '',
        iframe_id: '',
        extra_config: {},
        is_test_mode: false,
        sort_order: 1,
    },
    {
        id: 'paymob',
        name: 'paymob',
        name_ar: 'Paymob (بطاقات بنكية)',
        description_ar: 'ادفع بأمان ببطاقة Visa / MasterCard عبر Paymob',
        logo: '💳',
        is_enabled: false,
        api_key: '',
        api_secret: '',
        integration_id: '',
        iframe_id: '',
        extra_config: {},
        is_test_mode: true,
        sort_order: 2,
    },
    {
        id: 'paymob_wallet',
        name: 'paymob_wallet',
        name_ar: 'محفظة فودافون كاش / أورنج كاش',
        description_ar: 'ادفع بمحفظتك الإلكترونية فودافون كاش أو أورنج كاش',
        logo: '📱',
        is_enabled: false,
        api_key: '',
        api_secret: '',
        integration_id: '',
        iframe_id: '',
        extra_config: { wallet_integration_id: '' },
        is_test_mode: true,
        sort_order: 3,
    },
    {
        id: 'fawry',
        name: 'fawry',
        name_ar: 'فوري',
        description_ar: 'ادفع في أقرب منفذ فوري على مدار الساعة',
        logo: '🏪',
        is_enabled: false,
        api_key: '',
        api_secret: '',
        integration_id: '',
        iframe_id: '',
        extra_config: { merchant_code: '' },
        is_test_mode: true,
        sort_order: 4,
    },
    {
        id: 'whatsapp',
        name: 'whatsapp',
        name_ar: 'إتمام الطلب عبر واتساب',
        description_ar: 'أرسل طلبك مباشرةً إلى خدمة العملاء عبر واتساب',
        logo: '💬',
        is_enabled: true,
        api_key: '',
        api_secret: '',
        integration_id: '',
        iframe_id: '',
        extra_config: {},
        is_test_mode: false,
        sort_order: 5,
    },
];

export function usePaymentSettings() {
    const [gateways, setGateways] = useState<PaymentGateway[]>(DEFAULT_GATEWAYS);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const fetchSettings = useCallback(async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('payment_settings')
                .select('*')
                .order('sort_order', { ascending: true });

            if (error) {
                // Table might not exist yet - use defaults silently
                console.warn('payment_settings table not found, using defaults:', error.message);
                setGateways(DEFAULT_GATEWAYS);
                return;
            }

            if (data && data.length > 0) {
                // Merge DB data with defaults (in case new gateways added in future)
                const merged = DEFAULT_GATEWAYS.map(def => {
                    const dbRow = data.find((d: any) => d.gateway_id === def.id);
                    if (!dbRow) return def;
                    return {
                        ...def,
                        is_enabled: dbRow.is_enabled ?? def.is_enabled,
                        api_key: dbRow.api_key ?? '',
                        api_secret: dbRow.api_secret ?? '',
                        integration_id: dbRow.integration_id ?? '',
                        iframe_id: dbRow.iframe_id ?? '',
                        extra_config: dbRow.extra_config ?? def.extra_config,
                        is_test_mode: dbRow.is_test_mode ?? def.is_test_mode,
                        sort_order: dbRow.sort_order ?? def.sort_order,
                    };
                });
                setGateways(merged);
            } else {
                setGateways(DEFAULT_GATEWAYS);
            }
        } catch (err) {
            console.warn('Could not load payment settings:', err);
            setGateways(DEFAULT_GATEWAYS);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    const saveSettings = async (updatedGateways: PaymentGateway[]) => {
        setSaving(true);
        try {
            const upsertData = updatedGateways.map(g => ({
                gateway_id: g.id,
                name: g.name,
                name_ar: g.name_ar,
                is_enabled: g.is_enabled,
                api_key: g.api_key,
                api_secret: g.api_secret,
                integration_id: g.integration_id,
                iframe_id: g.iframe_id,
                extra_config: g.extra_config,
                is_test_mode: g.is_test_mode,
                sort_order: g.sort_order,
                updated_at: new Date().toISOString(),
            }));

            const { error } = await supabase
                .from('payment_settings')
                .upsert(upsertData, { onConflict: 'gateway_id' });

            if (error) throw error;

            setGateways(updatedGateways);
            toast.success('✅ تم حفظ إعدادات الدفع بنجاح!');
        } catch (error: any) {
            console.error('Save payment settings error:', error);
            if (error?.code === '42P01') {
                toast.error('جدول الإعدادات غير موجود بعد. أنشئه من SQL Editor في Supabase.');
            } else {
                toast.error('خطأ في الحفظ: ' + error.message);
            }
        } finally {
            setSaving(false);
        }
    };

    const enabledGateways = gateways.filter(g => g.is_enabled).sort((a, b) => a.sort_order - b.sort_order);

    return { gateways, loading, saving, fetchSettings, saveSettings, setGateways, enabledGateways };
}
