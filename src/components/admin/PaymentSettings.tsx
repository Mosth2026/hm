import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
    CreditCard, Save, RefreshCw, Eye, EyeOff, ChevronDown, ChevronUp,
    AlertCircle, CheckCircle2, ExternalLink, Zap, TestTube,
    Copy, Info
} from 'lucide-react';
import { usePaymentSettings, PaymentGateway } from '@/hooks/use-payment-settings';
import { toast } from 'sonner';

const GATEWAY_GUIDES: Record<string, { steps: string[], docsUrl: string }> = {
    paymob: {
        steps: [
            'سجّل حساباً على paymob.com أو my.paymob.com',
            'من لوحة التحكم → Settings → Account Info → انسخ API Key',
            'من Developers → Payment Integrations → api_integration → انسخ Integration ID',
            'من Developers → iFrame → انسخ iFrame ID',
            'أدخل المفاتيح هنا واضغط حفظ، ثم فعّل البوابة',
        ],
        docsUrl: 'https://docs.paymob.com/docs/getting-started',
    },
    paymob_wallet: {
        steps: [
            'في حساب Paymob → Payment Integrations → Mobile Wallet',
            'أنشئ Integration جديدة من نوع "Mobile Wallets"',
            'انسخ الـ Integration ID الخاص بالمحفظة',
            'أدخل نفس API Key الخاص بحساب Paymob',
            'أدخل Wallet Integration ID في الحقل المخصص',
        ],
        docsUrl: 'https://docs.paymob.com/docs/mobile-wallets',
    },
    fawry: {
        steps: [
            'تواصل مع فريق مبيعات Fawry لفتح حساب تجاري',
            'ستحصل على Merchant Code و Security Key',
            'أدخل Merchant Code في حقل "Merchant Code"',
            'أدخل Security Key في حقل "API Secret"',
            'اختبر في الوضع التجريبي أولاً ثم فعّل الإنتاج',
        ],
        docsUrl: 'https://developer.fawrystaging.com/',
    },
    cod: { steps: [], docsUrl: '' },
    whatsapp: { steps: [], docsUrl: '' },
};

const PaymentGatewayCard: React.FC<{
    gateway: PaymentGateway;
    onChange: (updated: PaymentGateway) => void;
}> = ({ gateway, onChange }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [showSecret, setShowSecret] = useState(false);
    const [showGuide, setShowGuide] = useState(false);

    const guide = GATEWAY_GUIDES[gateway.id];
    const isSimpleGateway = gateway.id === 'cod' || gateway.id === 'whatsapp';

    const update = (field: keyof PaymentGateway, value: any) => {
        onChange({ ...gateway, [field]: value });
    };

    const updateExtra = (key: string, value: string) => {
        onChange({ ...gateway, extra_config: { ...gateway.extra_config, [key]: value } });
    };

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast.success(`تم نسخ ${label}`);
    };

    return (
        <div
            className={`border rounded-3xl transition-all duration-300 overflow-hidden ${
                gateway.is_enabled
                    ? 'border-emerald-200 bg-gradient-to-br from-emerald-50/50 to-white shadow-lg shadow-emerald-100'
                    : 'border-gray-100 bg-white shadow-sm'
            }`}
        >
            {/* Header */}
            <div className="p-6 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div
                        className={`h-14 w-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 shadow-sm ${
                            gateway.is_enabled ? 'bg-emerald-100' : 'bg-gray-100'
                        }`}
                    >
                        {gateway.logo}
                    </div>
                    <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-black text-saada-brown text-lg leading-tight">{gateway.name_ar}</h3>
                            {gateway.is_enabled && (
                                <Badge className="bg-emerald-100 text-emerald-700 border-none font-bold text-xs px-3 rounded-full">
                                    <CheckCircle2 className="h-3 w-3 mr-1" /> مفعّل
                                </Badge>
                            )}
                            {gateway.is_test_mode && gateway.is_enabled && !isSimpleGateway && (
                                <Badge className="bg-amber-100 text-amber-700 border-none font-bold text-xs px-3 rounded-full">
                                    <TestTube className="h-3 w-3 mr-1" /> تجريبي
                                </Badge>
                            )}
                        </div>
                        <p className="text-sm text-gray-500 font-medium mt-0.5 line-clamp-1">{gateway.description_ar}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="flex items-center gap-2">
                        <span className={`text-sm font-bold ${gateway.is_enabled ? 'text-emerald-600' : 'text-gray-400'}`}>
                            {gateway.is_enabled ? 'مفعّل' : 'معطّل'}
                        </span>
                        <Switch
                            checked={gateway.is_enabled}
                            onCheckedChange={(checked) => update('is_enabled', checked)}
                            className="data-[state=checked]:bg-emerald-600"
                        />
                    </div>

                    {!isSimpleGateway && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="h-10 w-10 rounded-xl text-gray-500 hover:bg-gray-100"
                        >
                            {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                        </Button>
                    )}
                </div>
            </div>

            {/* Expanded Config */}
            {!isSimpleGateway && isExpanded && (
                <div className="px-6 pb-6 border-t border-gray-100 pt-6 space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                    {/* Test Mode Toggle */}
                    <div className="flex items-center justify-between p-4 bg-amber-50 rounded-2xl border border-amber-100">
                        <div className="flex items-center gap-2">
                            <TestTube className="h-5 w-5 text-amber-600" />
                            <div>
                                <p className="font-black text-amber-800 text-sm">الوضع التجريبي (Sandbox)</p>
                                <p className="text-xs text-amber-600 font-medium">لا تُفعّل على الإنتاج إلا بعد الاختبار الكامل</p>
                            </div>
                        </div>
                        <Switch
                            checked={gateway.is_test_mode}
                            onCheckedChange={(checked) => update('is_test_mode', checked)}
                            className="data-[state=checked]:bg-amber-500"
                        />
                    </div>

                    {/* API Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="font-black text-saada-brown text-sm">
                                API Key
                                {gateway.id === 'paymob' && <span className="text-gray-400 font-normal"> (من Account Info)</span>}
                            </Label>
                            <div className="relative">
                                <Input
                                    value={gateway.api_key}
                                    onChange={(e) => update('api_key', e.target.value)}
                                    placeholder="أدخل API Key هنا..."
                                    className="pr-4 pl-10 h-12 rounded-xl border-gray-200 bg-gray-50 font-mono text-sm"
                                    dir="ltr"
                                />
                                {gateway.api_key && (
                                    <button
                                        onClick={() => copyToClipboard(gateway.api_key, 'API Key')}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                                    >
                                        <Copy className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="font-black text-saada-brown text-sm">
                                {gateway.id === 'fawry' ? 'Security Key' : 'API Secret / Private Key'}
                            </Label>
                            <div className="relative">
                                <Input
                                    value={gateway.api_secret}
                                    onChange={(e) => update('api_secret', e.target.value)}
                                    type={showSecret ? 'text' : 'password'}
                                    placeholder="أدخل المفتاح السري..."
                                    className="pr-4 pl-20 h-12 rounded-xl border-gray-200 bg-gray-50 font-mono text-sm"
                                    dir="ltr"
                                />
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 flex gap-1">
                                    <button
                                        onClick={() => setShowSecret(!showSecret)}
                                        className="text-gray-400 hover:text-gray-700"
                                    >
                                        {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                    {gateway.api_secret && (
                                        <button
                                            onClick={() => copyToClipboard(gateway.api_secret, 'Secret Key')}
                                            className="text-gray-400 hover:text-gray-700"
                                        >
                                            <Copy className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {(gateway.id === 'paymob' || gateway.id === 'paymob_wallet') && (
                            <>
                                <div className="space-y-2">
                                    <Label className="font-black text-saada-brown text-sm">
                                        Integration ID
                                        <span className="text-gray-400 font-normal"> (بطاقات بنكية)</span>
                                    </Label>
                                    <Input
                                        value={gateway.integration_id}
                                        onChange={(e) => update('integration_id', e.target.value)}
                                        placeholder="مثال: 123456"
                                        className="h-12 rounded-xl border-gray-200 bg-gray-50 font-mono text-sm"
                                        dir="ltr"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="font-black text-saada-brown text-sm">
                                        iFrame ID
                                        <span className="text-gray-400 font-normal"> (صفحة الدفع)</span>
                                    </Label>
                                    <Input
                                        value={gateway.iframe_id}
                                        onChange={(e) => update('iframe_id', e.target.value)}
                                        placeholder="مثال: 789012"
                                        className="h-12 rounded-xl border-gray-200 bg-gray-50 font-mono text-sm"
                                        dir="ltr"
                                    />
                                </div>
                            </>
                        )}

                        {gateway.id === 'paymob_wallet' && (
                            <div className="space-y-2 md:col-span-2">
                                <Label className="font-black text-saada-brown text-sm">
                                    Wallet Integration ID
                                    <span className="text-gray-400 font-normal"> (Mobile Wallets)</span>
                                </Label>
                                <Input
                                    value={gateway.extra_config?.wallet_integration_id || ''}
                                    onChange={(e) => updateExtra('wallet_integration_id', e.target.value)}
                                    placeholder="Integration ID خاص بمحافظ الموبايل"
                                    className="h-12 rounded-xl border-gray-200 bg-gray-50 font-mono text-sm"
                                    dir="ltr"
                                />
                            </div>
                        )}

                        {gateway.id === 'fawry' && (
                            <div className="space-y-2">
                                <Label className="font-black text-saada-brown text-sm">Merchant Code</Label>
                                <Input
                                    value={gateway.extra_config?.merchant_code || ''}
                                    onChange={(e) => updateExtra('merchant_code', e.target.value)}
                                    placeholder="كود التاجر من فوري"
                                    className="h-12 rounded-xl border-gray-200 bg-gray-50 font-mono text-sm"
                                    dir="ltr"
                                />
                            </div>
                        )}
                    </div>

                    {/* Status Indicator */}
                    {gateway.is_enabled && !gateway.api_key && (
                        <div className="flex items-start gap-3 p-4 bg-red-50 rounded-2xl border border-red-100">
                            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="font-black text-red-700 text-sm">البوابة مفعّلة لكن بدون API Key!</p>
                                <p className="text-xs text-red-500 font-medium mt-0.5">
                                    أدخل مفاتيح الـ API حتى يتمكن العملاء من الدفع عبر هذه البوابة.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Integration Guide */}
                    {guide?.steps.length > 0 && (
                        <div>
                            <button
                                onClick={() => setShowGuide(!showGuide)}
                                className="flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
                            >
                                <Info className="h-4 w-4" />
                                {showGuide ? 'إخفاء' : 'عرض'} دليل الربط خطوة بخطوة
                                {showGuide ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </button>

                            {showGuide && (
                                <div className="mt-4 p-5 bg-indigo-50 rounded-2xl border border-indigo-100 animate-in fade-in duration-300">
                                    <ol className="space-y-3">
                                        {guide.steps.map((step, i) => (
                                            <li key={i} className="flex items-start gap-3">
                                                <span className="h-6 w-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 mt-0.5">
                                                    {i + 1}
                                                </span>
                                                <span className="text-sm font-medium text-indigo-900">{step}</span>
                                            </li>
                                        ))}
                                    </ol>
                                    {guide.docsUrl && (
                                        <a
                                            href={guide.docsUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="mt-4 flex items-center gap-2 text-sm font-bold text-indigo-700 hover:underline"
                                        >
                                            <ExternalLink className="h-4 w-4" />
                                            الوثائق الرسمية
                                        </a>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
const PaymentSettings: React.FC = () => {
    const { gateways, loading, saving, fetchSettings, saveSettings, setGateways } = usePaymentSettings();
    const [localGateways, setLocalGateways] = useState<PaymentGateway[]>([]);

    React.useEffect(() => {
        setLocalGateways(gateways);
    }, [gateways]);

    const handleGatewayChange = (updated: PaymentGateway) => {
        setLocalGateways(prev => prev.map(g => g.id === updated.id ? updated : g));
    };

    const handleSave = async () => {
        await saveSettings(localGateways);
        setGateways(localGateways);
    };

    const enabledCount = localGateways.filter(g => g.is_enabled).length;

    if (loading) {
        return (
            <div className="flex items-center justify-center py-32">
                <div className="text-center space-y-4">
                    <RefreshCw className="h-10 w-10 text-saada-red animate-spin mx-auto" />
                    <p className="text-gray-500 font-bold">جاري تحميل إعدادات الدفع...</p>
                </div>
            </div>
        );
    }
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <Card className="border-none shadow-2xl bg-gradient-to-br from-saada-brown to-black rounded-[2.5rem] overflow-hidden text-white">
                <CardContent className="p-8 md:p-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-5">
                            <div className="h-16 w-16 bg-white/10 backdrop-blur rounded-2xl flex items-center justify-center">
                                <CreditCard className="h-8 w-8 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black">بوابات الدفع</h2>
                                <p className="text-white/60 font-bold text-sm mt-1">
                                    {enabledCount} بوابة مفعّلة من أصل {localGateways.length}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 flex-wrap">
                            <Button
                                variant="ghost"
                                onClick={fetchSettings}
                                className="h-12 px-6 rounded-2xl text-white/70 hover:text-white hover:bg-white/10 font-bold gap-2"
                            >
                                <RefreshCw className="h-4 w-4" />
                                تحديث
                            </Button>
                            <Button
                                onClick={handleSave}
                                disabled={saving}
                                className="h-12 px-8 bg-white text-saada-brown hover:bg-white/90 rounded-2xl font-black gap-2 shadow-xl transition-all hover:scale-[1.02] active:scale-95"
                            >
                                {saving ? (
                                    <><RefreshCw className="h-4 w-4 animate-spin" /> جاري الحفظ...</>
                                ) : (
                                    <><Save className="h-4 w-4" /> حفظ كل الإعدادات</>
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* Quick Status */}
                    <div className="mt-8 grid grid-cols-2 md:grid-cols-5 gap-3">
                        {localGateways.map(g => (
                            <div
                                key={g.id}
                                onClick={() => handleGatewayChange({ ...g, is_enabled: !g.is_enabled })}
                                className={`cursor-pointer p-3 rounded-2xl text-center transition-all duration-200 ${
                                    g.is_enabled
                                        ? 'bg-emerald-500/20 border border-emerald-400/30 hover:bg-emerald-500/30'
                                        : 'bg-white/5 border border-white/10 hover:bg-white/10'
                                }`}
                            >
                                <div className="text-2xl">{g.logo}</div>
                                <div className={`text-[10px] font-bold mt-1 leading-tight ${g.is_enabled ? 'text-emerald-300' : 'text-white/40'}`}>
                                    {g.is_enabled ? '✓ مفعّل' : 'معطّل'}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Gateway Cards */}
            <div className="space-y-4">
                <h3 className="text-xl font-black text-saada-brown flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-saada-red" />
                    إعدادات كل بوابة دفع
                </h3>
                {localGateways.map(gateway => (
                    <PaymentGatewayCard
                        key={gateway.id}
                        gateway={gateway}
                        onChange={handleGatewayChange}
                    />
                ))}
            </div>

            {/* Save Button Bottom */}
            <div className="flex justify-end">
                <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="h-14 px-12 bg-saada-red hover:bg-saada-brown text-white rounded-2xl font-black text-lg gap-3 shadow-2xl shadow-saada-red/20 transition-all hover:scale-[1.02] active:scale-95"
                >
                    {saving ? (
                        <><RefreshCw className="h-5 w-5 animate-spin" /> جاري الحفظ...</>
                    ) : (
                        <><Save className="h-5 w-5" /> حفظ جميع إعدادات الدفع</>
                    )}
                </Button>
            </div>
        </div>
    );
};

export default PaymentSettings;
