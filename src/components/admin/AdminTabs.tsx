
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import {
    Package,
    ShoppingCart,
    Ticket,
    List,
    Users,
    PieChart,
    RefreshCw,
    Search,
    Filter,
    Layers,
    GitBranch,
    CreditCard,
    UserCog,
    MapPin,
    Navigation,
    Monitor
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { hasPermission, UserRole } from "@/hooks/use-auth";

interface AdminTabsProps {
    activeTab: string;
    setActiveTab: (tab: any) => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    handleExportData: () => void;
    handleBranchChange: (id: string) => void;
    branches: any[];
    selectedBranchId: number | null;
    isNotificationsEnabled: boolean;
    toggleNotifications: () => void;
    userRole?: UserRole;
    user?: any;
    onDetectLocation?: () => void;
}

const AdminTabs: React.FC<AdminTabsProps> = ({ 
    activeTab, 
    setActiveTab, 
    searchQuery, 
    setSearchQuery,
    handleExportData,
    handleBranchChange,
    branches,
    selectedBranchId,
    isNotificationsEnabled,
    toggleNotifications,
    userRole = 'employee',
    user,
    onDetectLocation
}) => {
    const allTabs = [
        { id: 'products', label: "المنتجات", icon: Package, permission: 'products' },
        { id: 'category-tree', label: "شجرة الأقسام", icon: GitBranch, permission: 'category-tree' },
        { id: 'orders', label: "الطلبات", icon: ShoppingCart, permission: 'orders' },
        { id: 'coupons', label: "أكواد الخصم", icon: Ticket, permission: 'coupons' },
        { id: 'analytics', label: "التحليلات", icon: PieChart, permission: 'analytics' },
        { id: 'payment-settings', label: "بوابات الدفع", icon: CreditCard, permission: 'payment-settings' },
        { id: 'users', label: "إدارة المستخدمين", icon: UserCog, permission: 'users' },
        { id: 'logs', label: "السجل", icon: List, permission: 'logs' },
        { id: 'subscribers', label: "المشتركون", icon: Users, permission: 'subscribers' },
        { id: 'store-display', label: "أوضاع العرض", icon: Monitor, permission: 'store-display' },
    ];

    // Filter tabs by user permissions
    const currentUser = user || { role: userRole };
    const tabs = allTabs.filter(tab => hasPermission(currentUser, tab.permission));

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4 bg-white/50 backdrop-blur-md p-4 rounded-3xl shadow-sm border border-white/50">
                <div className="flex flex-wrap items-center gap-2">
                    {tabs.map((tab) => (
                        <Button
                            key={tab.id}
                            variant={activeTab === tab.id ? "default" : "ghost"}
                            onClick={() => setActiveTab(tab.id)}
                            className={`h-11 px-6 rounded-2xl gap-2 font-bold transition-all ${
                                activeTab === tab.id 
                                ? 'bg-saada-brown text-white shadow-lg shadow-saada-brown/20' 
                                : 'text-gray-500 hover:bg-white hover:text-saada-brown'
                            }`}
                        >
                            <tab.icon className="h-4 w-4" />
                            {tab.label}
                        </Button>
                    ))}
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-white/60 p-1 rounded-2xl border border-gray-100 shadow-inner">
                        <Button variant="ghost" size="icon" onClick={toggleNotifications} className={`h-10 w-10 rounded-xl transition-all ${isNotificationsEnabled ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}>
                            {isNotificationsEnabled ? '🔔' : '🔕'}
                        </Button>
                        
                        {/* Geo-detect button */}
                        {onDetectLocation && (
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={onDetectLocation}
                                className="h-10 w-10 rounded-xl text-indigo-500 hover:bg-indigo-50 transition-all"
                                title="تحديد الفرع الأقرب تلقائياً"
                            >
                                <Navigation className="h-4 w-4" />
                            </Button>
                        )}
                        
                        <select 
                            value={selectedBranchId || ''} 
                            onChange={(e) => handleBranchChange(e.target.value)}
                            className="h-10 px-4 bg-transparent border-none focus:ring-0 text-sm font-bold text-saada-brown cursor-pointer min-w-[140px]"
                        >
                            {branches.map(b => (
                                <option key={b.id} value={b.id}>{b.name}</option>
                            ))}
                        </select>
                    </div>

                    {hasPermission(currentUser, 'export') && (
                        <Button onClick={handleExportData} variant="outline" className="h-11 rounded-2xl gap-2 font-bold border-saada-brown text-saada-brown hover:bg-saada-brown hover:text-white shadow-sm">
                            تصدير إكسيل
                        </Button>
                    )}
                </div>
            </div>

            {activeTab === 'products' && (
                <div className="flex items-center gap-4 bg-white p-4 rounded-3xl shadow-sm border border-gray-100">
                    <div className="relative flex-1">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                            placeholder="ابحث بالاسم، القسم، أو الباركود..."
                            className="pr-11 h-12 bg-gray-50/50 border-none focus:bg-white transition-all rounded-2xl text-lg font-tajawal"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminTabs;
