
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Package, AlertTriangle, TrendingUp, AlertCircle, Sparkles, Trash2, PieChart, RefreshCw, CheckCircle2, Image as ImageIcon } from "lucide-react";

interface AdminStatsProps {
    stats: any;
    activeFilter: string;
    setActiveFilter: (filter: any) => void;
    formatPrice: (price: number) => string;
}

const AdminStats: React.FC<AdminStatsProps> = ({ stats, activeFilter, setActiveFilter, formatPrice }) => {
  const statCards = [
    { 
        id: 'all', 
        label: "إجمالي المنتجات", 
        value: stats.totalProducts, 
        icon: Package, 
        gradient: "from-blue-500 to-blue-600",
        bg: "bg-blue-50",
        text: "text-blue-600",
        sub: "أصناف نشطة"
    },
    { 
        id: 'published', 
        label: "منشورة للعملاء", 
        value: stats.published || 0, 
        icon: CheckCircle2, 
        gradient: "from-emerald-500 to-emerald-600",
        bg: "bg-emerald-50",
        text: "text-emerald-600",
        sub: "معروضة الآن"
    },
    { 
        id: 'daily_changes', 
        label: "أصناف مبيعات", 
        value: stats.dailyChanges || 0, 
        icon: RefreshCw, 
        gradient: "from-purple-500 to-purple-600",
        bg: "bg-purple-50",
        text: "text-purple-600",
        sub: "(آخر جرد)"
    },
    { 
        id: 'daily_value', 
        label: "قيمة مبيعات", 
        value: formatPrice(stats.dailyValue), 
        icon: TrendingUp, 
        gradient: "from-amber-500 to-amber-600",
        bg: "bg-amber-50",
        text: "text-amber-600",
        sub: "(آخر جرد)"
    },
    { 
        id: 'ready-to-shot', 
        label: "صنف منتهي (له صورة)", 
        value: stats.readyToShot || 0, 
        icon: Trash2, 
        gradient: "from-rose-500 to-rose-600",
        bg: "bg-rose-50",
        text: "text-rose-600",
        sub: "بانتظار الرصيد"
    },
    { 
        id: 'trash', 
        label: "قسم الدرافت (مخفي)", 
        value: stats.trash || 0, 
        icon: Trash2, 
        gradient: "from-gray-500 to-gray-600",
        bg: "bg-gray-50",
        text: "text-gray-600",
        sub: "منتجات معطلة"
    },
    { 
        id: 'no-tax', 
        label: "بدون ضريبة", 
        value: stats.noTax || 0, 
        icon: Sparkles, 
        gradient: "from-cyan-500 to-cyan-600",
        bg: "bg-cyan-50",
        text: "text-cyan-600",
        sub: "أصناف معفاة"
    },
    { 
        id: 'no-photo', 
        label: "مسودة (بدون صورة)", 
        value: stats.needsPhoto || 0, 
        icon: ImageIcon, 
        gradient: "from-indigo-500 to-indigo-600",
        bg: "bg-indigo-50",
        text: "text-indigo-600",
        sub: "بانتظار الصور"
    },
    { 
        id: 'no-category', 
        label: "بحاجة لتصنيف", 
        value: stats.needsCategory || 0, 
        icon: PieChart, 
        gradient: "from-orange-500 to-orange-600",
        bg: "bg-orange-50",
        text: "text-orange-600",
        sub: "بانتظار القسم"
    },
    { 
        id: 'low-stock', 
        label: "نواقص عاجلة", 
        value: stats.lowStock || 0, 
        icon: AlertTriangle, 
        gradient: "from-red-500 to-red-600",
        bg: "bg-red-50",
        text: "text-red-600",
        sub: "أقل من 10 قطع"
    },
    { 
        id: 'zero', 
        label: "نفدت تماماً", 
        value: stats.zeroStock || 0, 
        icon: AlertCircle, 
        gradient: "from-pink-500 to-pink-600",
        bg: "bg-pink-50",
        text: "text-pink-600",
        sub: "رصيد صفر"
    },
    { 
        id: 'value', 
        label: "قيمة المخزون", 
        value: formatPrice(stats.totalValue), 
        icon: TrendingUp, 
        gradient: "from-emerald-500 to-emerald-600",
        bg: "bg-emerald-50",
        text: "text-emerald-600",
        sub: "إجمالي رأس المال"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
        {statCards.map((stat) => (
            <Card 
                key={stat.id}
                onClick={() => setActiveFilter(stat.id)}
                className={`group cursor-pointer transition-all duration-500 border-none relative overflow-hidden ${
                    activeFilter === stat.id 
                    ? 'ring-4 ring-saada-brown/20 bg-white shadow-2xl scale-[1.02]' 
                    : 'bg-white hover:bg-gray-50/50 shadow-sm hover:shadow-xl hover:-translate-y-1'
                }`}
            >
                <div className={`absolute top-0 right-0 w-1.5 h-full bg-gradient-to-b ${stat.gradient} opacity-80 group-hover:w-2 transition-all`} />
                <CardContent className="p-6 relative z-10 space-y-4">
                    <div className="flex items-start justify-between">
                        <div className={`p-4 rounded-[1.5rem] ${stat.bg} ${stat.text} shadow-inner group-hover:scale-110 transition-transform duration-500`}>
                            <stat.icon className="h-7 w-7" strokeWidth={2.5} />
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</span>
                            <span className={`text-xs font-bold ${stat.text} mt-1`}>{stat.sub}</span>
                        </div>
                    </div>
                    <div className="pt-2">
                        <h3 className="text-2xl font-black text-saada-brown tracking-tight">{stat.value}</h3>
                    </div>
                </CardContent>
            </Card>
        ))}
    </div>
  );
};

export default AdminStats;
