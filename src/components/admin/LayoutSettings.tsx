
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Home, LayoutGrid, Zap, Eye, EyeOff } from "lucide-react";

type LayoutId = 'original' | 'premium' | 'fast';

const LAYOUT_MODES: { id: LayoutId; label: string; description: string; icon: React.ElementType; color: string; bg: string }[] = [
  {
    id: 'original',
    label: 'الوضع الأصلي',
    description: 'Hero + المنتجات + التقييمات — التصميم الأول للمتجر',
    icon: Home,
    color: 'text-amber-600',
    bg: 'bg-amber-50 border-amber-100',
  },
  {
    id: 'premium',
    label: 'العرض الكلاسيكي',
    description: 'كاروسيل + Hero + شبكة الأقسام + SwissFru + المجموعات',
    icon: LayoutGrid,
    color: 'text-saada-brown',
    bg: 'bg-stone-50 border-stone-100',
  },
  {
    id: 'fast',
    label: 'التصفح السريع',
    description: 'تصفح سريع بالأقسام بدون hero — مثالي للموبايل',
    icon: Zap,
    color: 'text-saada-red',
    bg: 'bg-red-50 border-red-100',
  },
];

const LayoutSettings = () => {
  const [enabledLayouts, setEnabledLayouts] = useState<LayoutId[]>(['original', 'premium', 'fast']);

  useEffect(() => {
    const saved = localStorage.getItem('saada_enabled_layouts');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setEnabledLayouts(parsed as LayoutId[]);
        }
      } catch {}
    }
  }, []);

  const toggleLayout = (id: LayoutId) => {
    setEnabledLayouts(prev => {
      const isEnabled = prev.includes(id);
      if (isEnabled && prev.length === 1) return prev;
      const next = isEnabled ? prev.filter(l => l !== id) : [...prev, id];
      localStorage.setItem('saada_enabled_layouts', JSON.stringify(next));
      return next;
    });
  };

  const enabledCount = enabledLayouts.length;

  return (
    <div className="space-y-6 font-tajawal" dir="rtl">
      <Card className="border-0 shadow-lg rounded-3xl overflow-hidden">
        <CardHeader className="bg-gradient-to-l from-saada-brown/5 to-amber-50 pb-4">
          <CardTitle className="text-xl font-black text-saada-brown flex items-center gap-2">
            <Eye className="h-5 w-5" />
            إعدادات أوضاع عرض المتجر
          </CardTitle>
          <p className="text-sm text-gray-500 mt-1">
            تحكم في أي أوضاع تظهر لزوار المتجر — الوضع المخفي لا يظهر في زر التبديل
          </p>
        </CardHeader>

        <CardContent className="p-6 space-y-4">
          {LAYOUT_MODES.map(mode => {
            const Icon = mode.icon;
            const isEnabled = enabledLayouts.includes(mode.id);
            const isLastEnabled = enabledCount === 1 && isEnabled;

            return (
              <div
                key={mode.id}
                className={`flex items-center justify-between p-5 rounded-2xl border-2 transition-all duration-300 ${
                  isEnabled ? mode.bg : 'bg-gray-50 border-gray-100 opacity-60'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2.5 rounded-xl ${isEnabled ? 'bg-white shadow-sm' : 'bg-gray-100'}`}>
                    <Icon className={`h-5 w-5 ${isEnabled ? mode.color : 'text-gray-400'}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className={`font-black text-base ${isEnabled ? 'text-gray-800' : 'text-gray-400'}`}>
                        {mode.label}
                      </p>
                      {isEnabled ? (
                        <span className="text-[10px] bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-full">
                          ظاهر
                        </span>
                      ) : (
                        <span className="text-[10px] bg-gray-100 text-gray-400 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                          <EyeOff className="h-2.5 w-2.5" /> مخفي
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{mode.description}</p>
                  </div>
                </div>

                <Switch
                  checked={isEnabled}
                  onCheckedChange={() => toggleLayout(mode.id)}
                  disabled={isLastEnabled}
                  title={isLastEnabled ? 'لا يمكن إخفاء آخر وضع متاح' : ''}
                  className={isEnabled ? 'data-[state=checked]:bg-emerald-500' : ''}
                />
              </div>
            );
          })}

          <p className="text-xs text-gray-400 text-center pt-2 border-t border-gray-100">
            {enabledCount === 1
              ? 'وضع واحد فقط — لا يظهر زر التبديل للزوار'
              : `${enabledCount} أوضاع مفعلة — زر التبديل يظهر للزوار`}
          </p>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm rounded-3xl bg-amber-50/50 border border-amber-100">
        <CardContent className="p-5">
          <p className="text-sm text-amber-700 font-bold">ملاحظة:</p>
          <p className="text-xs text-amber-600 mt-1">
            التغييرات تُطبَّق فوراً على المتجر. إذا كان الزائر على وضع تم إخفاؤه، سيتم تحويله تلقائياً لأول وضع متاح عند تحديث الصفحة.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default LayoutSettings;
