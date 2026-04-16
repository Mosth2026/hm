
import React, { useEffect, useCallback } from 'react';
import { useAdminDashboard } from "@/hooks/use-admin-dashboard";
import AdminStats from "@/components/admin/AdminStats";
import AdminTabs from "@/components/admin/AdminTabs";
import ProductTable from "@/components/admin/ProductTable";
import OrderList from "@/components/admin/OrderList";
import DashboardDialogs from "@/components/admin/DashboardDialogs";
import AnalyticsDashboard from "@/components/admin/AnalyticsDashboard";
import UserManagement from "@/components/admin/UserManagement";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { 
    Heart, Package, Plus, Upload, RefreshCw, Trash2, 
    Ticket, Users, List, TrendingUp, Calendar, Phone, Mail,
    CheckCircle2, XCircle, LogOut, MapPin, Navigation
} from "lucide-react";

import { CategoryTreeManager } from "@/components/admin/CategoryTreeManager";
import PaymentSettings from "@/components/admin/PaymentSettings";
import LayoutSettings from "@/components/admin/LayoutSettings";
import { hasPermission, ROLE_LABELS, ROLE_COLORS, UserRole } from "@/hooks/use-auth";

const AdminDashboard = () => {
    const { 
        user, isAuthenticated, products, loading, searchQuery, stats, activeFilter, selectedCategoryLabel, activeTab,
        isEditDialogOpen, isUploading, isCropperOpen, tempImageUrl, currentProduct, importProgress, selectedProductIds,
        coupons, couponsLoading, isCouponDialogOpen, newCoupon, subscribers, subscribersLoading, orders, ordersLoading,
        logs, logsLoading, isLifecycleOpen, lifecycleProduct, lifecycleData, lifecycleLoading, isBulkCategoryOpen,
        bulkCategoryId, isExemptImport, branches, selectedBranchId, isNotificationsEnabled, updatedSessionIds,
        
        setSearchQuery, setActiveFilter, setSelectedCategoryLabel, setActiveTab, setIsEditDialogOpen, setIsUploading,
        setIsCropperOpen, setTempImageUrl, setCurrentProduct, setImportProgress, setSelectedProductIds,
        setIsCouponDialogOpen, setNewCoupon, setIsLifecycleOpen, setIsBulkCategoryOpen, setBulkCategoryId,
        setIsExemptImport, setSelectedBranchId, setIsNotificationsEnabled,
        
        login, logout, initialize, logAction, fetchProducts, fetchOrders, handleBranchChange, toggleNotifications,
        handleEdit, handleAddNew, handleDelete, handleSave, handleImageUpload, handleCropComplete, handleSkip,
        handleMarkAsReceived, handleReturnOrder, handleDeleteOrder, handleExportData, handleBulkCategoryUpdate,
        fetchProductLifecycle, formatPrice, categories, fetchCategories, handleExcelImport, handleCleanupDuplicates, handleRestoreLostImages,
        handleCreateCoupon, handleDeleteCoupon
    } = useAdminDashboard();

    const userRole = (user?.role || 'customer') as UserRole;
    const isStaff = hasPermission(user, 'dashboard');

    // =====================================================
    // GEO-BRANCH AUTO-DETECTION
    // =====================================================
    const calculateDistance = useCallback((lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }, []);

    const detectAndSetNearestBranch = useCallback(() => {
        if (!("geolocation" in navigator) || branches.length === 0) return;

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                let nearest = branches[0];
                let minDist = Infinity;

                branches.forEach((b: any) => {
                    const dist = calculateDistance(latitude, longitude, b.latitude, b.longitude);
                    if (dist < minDist) {
                        minDist = dist;
                        nearest = b;
                    }
                });

                if (nearest) {
                    handleBranchChange(String(nearest.id));
                    // Show toast with distance
                    const distText = minDist < 1 ? `${Math.round(minDist * 1000)} م` : `${minDist.toFixed(1)} كم`;
                    import('sonner').then(({ toast }) => {
                        toast.success(`تم تحديد الفرع الأقرب`, {
                            description: `📍 ${nearest.name} (${distText})`,
                            duration: 4000
                        });
                    });
                }
            },
            (error) => {
                console.error("Geolocation error:", error);
                import('sonner').then(({ toast }) => {
                    toast.error('تعذر تحديد موقعك', {
                        description: 'يرجى السماح بصلاحية الموقع أو اختيار الفرع يدوياً'
                    });
                });
            }
        );
    }, [branches, handleBranchChange, calculateDistance]);

    // Auto-detect on first load if no branch is saved
    useEffect(() => {
        if (isAuthenticated && branches.length > 0 && !selectedBranchId) {
            detectAndSetNearestBranch();
        }
    }, [isAuthenticated, branches.length]);

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-saada-brown flex items-center justify-center p-4 font-tajawal rtl" dir="rtl">
                <Card className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl border-none">
                    <CardHeader className="bg-saada-red text-white p-10 text-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-black/10 backdrop-blur-sm -rotate-6 scale-150"></div>
                        <div className="relative z-10 h-28 w-28 bg-black rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl transform hover:rotate-6 transition-transform">
                            <img src="/logo.png" className="h-[120%] w-[120%] object-cover" alt="Logo" />
                        </div>
                        <CardTitle className="text-3xl font-black italic relative z-10">دخول لوحة التحكم</CardTitle>
                    </CardHeader>
                    <CardContent className="p-10 space-y-8">
                        <div className="space-y-6">
                            <div className="space-y-3">
                                <Label className="text-saada-brown font-black text-lg">اسم المستخدم</Label>
                                <Input
                                    className="h-14 rounded-2xl bg-gray-50/50 border-none focus:ring-2 ring-saada-brown transition-all text-lg font-bold"
                                    id="username"
                                />
                            </div>
                            <div className="space-y-3">
                                <Label className="text-saada-brown font-black text-lg">كلمة المرور</Label>
                                <Input
                                    className="h-14 rounded-2xl bg-gray-50/50 border-none focus:ring-2 ring-saada-brown transition-all text-lg font-bold"
                                    type="password"
                                    id="password"
                                />
                            </div>
                        </div>
                        <Button 
                            className="w-full h-16 bg-saada-brown hover:bg-black text-white rounded-2xl font-black text-xl shadow-2xl shadow-saada-brown/30 transition-all hover:scale-[1.02] active:scale-95"
                            onClick={() => {
                                const u = (document.getElementById('username') as HTMLInputElement).value;
                                const p = (document.getElementById('password') as HTMLInputElement).value;
                                login(u, p);
                            }}
                        >
                            دخول آمن
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // SECURITY GUARD: Only staff roles can access the dashboard
    if (!isStaff) {
        return (
            <div className="min-h-screen bg-[#FDFCFB] flex items-center justify-center p-8 font-tajawal rtl" dir="rtl">
                <Card className="w-full max-w-lg bg-white rounded-[2.5rem] overflow-hidden shadow-2xl border-none text-center">
                    <CardContent className="p-12 space-y-8">
                        <div className="h-24 w-24 bg-red-100 rounded-[2rem] flex items-center justify-center mx-auto">
                            <svg className="h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                            </svg>
                        </div>
                        <div className="space-y-3">
                            <h1 className="text-3xl font-black text-saada-brown">غير مصرح بالدخول</h1>
                            <p className="text-gray-500 font-medium text-lg">عذراً، هذه الصفحة متاحة فقط للمديرين والمسؤولين.</p>
                        </div>
                        <div className="flex flex-col gap-3">
                            <Button onClick={() => window.location.href = '/'} className="h-14 bg-saada-brown hover:bg-black text-white rounded-2xl font-black text-lg">العودة للرئيسية</Button>
                            <Button variant="ghost" onClick={() => logout()} className="h-12 text-gray-400 font-bold rounded-2xl">تسجيل الخروج</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const username = user?.username?.toLowerCase() || '';
    const isOwner = userRole === 'owner';

    // Get selected branch name for display
    const selectedBranchName = branches.find((b: any) => b.id === selectedBranchId)?.name || 'كل الفروع';

    return (
        <div className="min-h-screen bg-[#FDFCFB] p-4 md:p-10 font-tajawal rtl selection:bg-saada-brown selection:text-white" dir="rtl">
            <div className="max-w-[1600px] mx-auto space-y-10">
                
                {importProgress && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                        <Card className="w-full max-w-md bg-white rounded-3xl p-8 text-center space-y-6 shadow-2xl animate-in zoom-in-95">
                            <RefreshCw className="h-12 w-12 text-saada-red animate-spin mx-auto" strokeWidth={3} />
                            <h3 className="text-2xl font-black text-saada-brown">جاري معالجة البيانات...</h3>
                            <div className="space-y-2">
                                <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-saada-red transition-all duration-300" 
                                        style={{ width: `${(importProgress.current / importProgress.total) * 100}%` }}
                                    />
                                </div>
                                <div className="flex justify-between text-sm font-bold text-gray-400">
                                    <span>{importProgress.current} من {importProgress.total}</span>
                                    <span>{Math.round((importProgress.current / importProgress.total) * 100)}%</span>
                                </div>
                            </div>
                        </Card>
                    </div>
                )}

                {/* Header Section */}
                <header className="flex flex-col xl:flex-row xl:items-center justify-between gap-8 pb-8 border-b border-gray-100">
                    <div className="flex items-center gap-6 group">
                        <div className="h-24 w-24 bg-saada-brown rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-saada-brown/20 rotate-3 group-hover:rotate-0 transition-transform duration-500 overflow-hidden">
                            <img src="/logo.png" className="h-[120%] w-[120%] object-cover" alt="Logo" />
                        </div>
                        <div>
                            <h1 className="text-5xl font-black text-saada-brown leading-tight tracking-tighter">
                                لوحة التحكم <span className="text-saada-red italic">الذكية</span>
                            </h1>
                            <div className="flex items-center gap-3 mt-2">
                                <span className="h-3 w-3 bg-emerald-500 rounded-full animate-pulse shadow-lg shadow-emerald-500/50" />
                                <span className="text-gray-400 font-bold text-lg">
                                    أهلاً بك يا <span className="text-saada-brown">{user?.username}</span>
                                </span>
                                <Badge className={`${ROLE_COLORS[userRole]} font-bold rounded-lg px-3 py-1 text-xs`}>
                                    {ROLE_LABELS[userRole]}
                                </Badge>
                                {selectedBranchId && (
                                    <span className="flex items-center gap-1.5 text-gray-400 font-medium text-sm bg-gray-50 px-3 py-1 rounded-lg">
                                        <MapPin className="h-3.5 w-3.5 text-saada-red" />
                                        {selectedBranchName}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4">
                        <Button 
                            variant="outline"
                            onClick={() => logout()}
                            className="h-16 px-8 border-2 border-saada-brown text-saada-brown hover:bg-saada-brown hover:text-white rounded-3xl gap-3 font-black text-lg transition-all hover:scale-[1.02] active:scale-95 shadow-xl shadow-saada-brown/5"
                        >
                            <LogOut className="h-6 w-6" />
                            تسجيل الخروج
                        </Button>

                        {hasPermission(user, 'import') && (
                            <>
                                <input id="excel-import" type="file" className="hidden" accept=".xlsx, .xls, .csv" onChange={handleExcelImport} />
                                <Button 
                                    onClick={() => document.getElementById('excel-import')?.click()}
                                    className="h-16 px-8 bg-emerald-600 hover:bg-emerald-700 text-white rounded-3xl gap-3 font-black text-lg shadow-2xl shadow-emerald-200 transition-all hover:scale-[1.02] active:scale-95"
                                >
                                    <Upload className="h-6 w-6" />
                                    رفع الرصيد
                                </Button>
                            </>
                        )}

                        {hasPermission(user, 'products.write') && (
                            <Button 
                                onClick={handleAddNew}
                                className="h-16 px-8 bg-saada-red hover:bg-black text-white rounded-3xl gap-3 font-black text-lg shadow-2xl shadow-saada-red/20 transition-all hover:scale-[1.02] active:scale-95"
                            >
                                <Plus className="h-6 w-6" />
                                إضافة منتج
                            </Button>
                        )}

                        {isOwner && (
                            <div className="flex items-center bg-white p-2 rounded-3xl border border-gray-100 shadow-xl h-16">
                                <Button variant="ghost" onClick={handleCleanupDuplicates} className="h-12 px-6 rounded-2xl text-amber-600 font-black hover:bg-amber-50 gap-2 transition-all">
                                    <Trash2 className="h-4 w-4" />
                                    تنظيف المكررات
                                </Button>
                                <div className="w-px h-10 bg-gray-100 mx-2" />
                                <Button variant="ghost" onClick={handleRestoreLostImages} className="h-12 px-6 rounded-2xl text-indigo-600 font-black hover:bg-indigo-50 gap-2 transition-all">
                                    <RefreshCw className="h-4 w-4" />
                                    استعادة الصور
                                </Button>
                            </div>
                        )}
                    </div>
                </header>

                <AdminStats 
                    stats={stats} 
                    activeFilter={activeFilter} 
                    setActiveFilter={setActiveFilter} 
                    formatPrice={formatPrice} 
                />

                <AdminTabs 
                    activeTab={activeTab} 
                    setActiveTab={setActiveTab} 
                    searchQuery={searchQuery} 
                    setSearchQuery={setSearchQuery}
                    handleExportData={handleExportData}
                    handleBranchChange={handleBranchChange}
                    branches={branches}
                    selectedBranchId={selectedBranchId}
                    isNotificationsEnabled={isNotificationsEnabled}
                    toggleNotifications={toggleNotifications}
                    userRole={userRole}
                    user={user}
                    onDetectLocation={detectAndSetNearestBranch}
                />

                <main className="animate-in fade-in slide-in-from-bottom-6 duration-700">
                    {/* Status Sections and Filters are now handled via the Stat Cards above */}

                    {activeTab === 'products' ? (
                        <ProductTable 
                            products={products}
                            loading={loading}
                            activeFilter={activeFilter}
                            searchQuery={searchQuery}
                            selectedProductIds={selectedProductIds}
                            setSelectedProductIds={setSelectedProductIds}
                            handleEdit={handleEdit}
                            handleDelete={handleDelete}
                            fetchProductLifecycle={fetchProductLifecycle}
                            formatPrice={formatPrice}
                            isSpecial={isOwner}
                        />
                    ) : activeTab === 'category-tree' ? (
                        <CategoryTreeManager 
                            categories={categories}
                            products={products}
                            onRefresh={fetchProducts}
                            onRefreshCategories={fetchCategories}
                        />
                    ) : activeTab === 'orders' ? (
                        <OrderList 
                            orders={orders}
                            loading={ordersLoading}
                            handleMarkAsReceived={handleMarkAsReceived}
                            handleReturnOrder={handleReturnOrder}
                            handleDeleteOrder={handleDeleteOrder}
                            formatPrice={formatPrice}
                        />
                    ) : activeTab === 'analytics' ? (
                        <AnalyticsDashboard />
                    ) : activeTab === 'payment-settings' ? (
                        <PaymentSettings />
                    ) : activeTab === 'users' ? (
                        <UserManagement />
                    ) : activeTab === 'coupons' ? (
                        <Card className="border-none shadow-2xl bg-white/70 backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
                            <CardHeader className="p-8 border-b border-gray-100 flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="text-2xl font-black text-saada-brown flex items-center gap-3">
                                        <Ticket className="h-7 w-7 text-saada-red" />
                                        أكواد الخصم
                                    </CardTitle>
                                    <CardDescription className="font-bold mt-1">إدارة العروض والخصومات النشطة</CardDescription>
                                </div>
                                <Button onClick={() => setIsCouponDialogOpen(true)} className="bg-saada-red hover:bg-black rounded-2xl h-12 px-6 font-black gap-2 transition-all">
                                    <Plus className="h-5 w-5" />
                                    إنشاء كود جديد
                                </Button>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader className="bg-gray-50/10">
                                        <TableRow>
                                            <TableHead className="text-right py-6 font-black text-saada-brown">الكود</TableHead>
                                            <TableHead className="text-right py-6 font-black text-saada-brown">القيمة</TableHead>
                                            <TableHead className="text-right py-6 font-black text-saada-brown">الاستخدامات</TableHead>
                                            <TableHead className="text-right py-6 font-black text-saada-brown">الحالة</TableHead>
                                            <TableHead className="text-center py-6 font-black text-saada-brown">الإجراءات</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {coupons.length === 0 ? (
                                            <TableRow><TableCell colSpan={5} className="text-center py-20 text-gray-400 font-bold">لا توجد أكواد خصم متاحة حالياً</TableCell></TableRow>
                                        ) : (
                                            coupons.map(c => (
                                                <TableRow key={c.id}>
                                                    <TableCell className="font-black text-lg text-saada-red">{c.code}</TableCell>
                                                    <TableCell className="font-bold">{c.discount_value}{c.discount_type === 'percentage' ? '%' : ' ج.م'}</TableCell>
                                                    <TableCell className="font-medium text-gray-500">{c.usage_count || 0}</TableCell>
                                                    <TableCell><Badge className="bg-emerald-100 text-emerald-700 font-bold">نشط</Badge></TableCell>
                                                    <TableCell className="text-center"><Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDeleteCoupon(c.id)}><Trash2 className="h-4 w-4" /></Button></TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    ) : activeTab === 'subscribers' ? (
                        <Card className="border-none shadow-2xl bg-white/70 backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
                            <CardHeader className="p-8 border-b border-gray-100">
                                <CardTitle className="text-2xl font-black text-saada-brown flex items-center gap-3">
                                    <Users className="h-7 w-7 text-indigo-600" />
                                    المشتركون في النشرة
                                </CardTitle>
                                <CardDescription className="font-bold mt-1">قائمة العملاء المهتمين بالعروض</CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="text-right py-6 font-black text-saada-brown">البريد الإلكتروني</TableHead>
                                            <TableHead className="text-right py-6 font-black text-saada-brown">تاريخ الاشتراك</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {subscribers.length === 0 ? (
                                            <TableRow><TableCell colSpan={2} className="text-center py-20 text-gray-400 font-bold">لا يوجد مشتركون حالياً</TableCell></TableRow>
                                        ) : (
                                            subscribers.map(s => (
                                                <TableRow key={s.id}>
                                                    <TableCell className="font-bold flex items-center gap-2"><Mail className="h-4 w-4 text-gray-400" /> {s.email}</TableCell>
                                                    <TableCell className="text-gray-500 font-medium">{new Date(s.created_at).toLocaleDateString('ar-EG')}</TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    ) : activeTab === 'logs' ? (
                        <Card className="border-none shadow-2xl bg-white/70 backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
                            <CardHeader className="p-8 border-b border-gray-100">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-2xl font-black text-saada-brown flex items-center gap-3">
                                            <List className="h-7 w-7 text-saada-brown" />
                                            سجل العمليات (Logs)
                                        </CardTitle>
                                        <CardDescription className="font-bold mt-1">متابعة كافة تحركات المديرين على النظام</CardDescription>
                                    </div>
                                    <Badge variant="outline" className="border-saada-brown text-saada-brown font-black px-4 h-9 rounded-full">آخر 200 عملية</Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="text-right py-6 font-black text-saada-brown">المسؤول</TableHead>
                                            <TableHead className="text-right py-6 font-black text-saada-brown">الإجراء</TableHead>
                                            <TableHead className="text-right py-6 font-black text-saada-brown">التفاصيل</TableHead>
                                            <TableHead className="text-right py-6 font-black text-saada-brown">التوقيت</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {logs.map(log => (
                                            <TableRow key={log.id} className="hover:bg-saada-brown/5 transition-colors">
                                                <TableCell className="font-black text-saada-brown">{log.username}</TableCell>
                                                <TableCell><Badge className="bg-indigo-50 text-indigo-700 border-indigo-100 font-bold">{log.action}</Badge></TableCell>
                                                <TableCell className="text-sm font-medium text-gray-500 max-w-xs truncate">{JSON.stringify(log.details)}</TableCell>
                                                <TableCell className="text-xs font-bold text-gray-400">{new Date(log.created_at).toLocaleString('ar-EG')}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    ) : activeTab === 'store-display' ? (
                        <LayoutSettings />
                    ) : (
                        <Card className="border-none shadow-xl bg-white/70 backdrop-blur-md rounded-3xl p-20 text-center">
                            <div className="text-2xl font-black text-gray-300">هذا القسم قيد التطوير بلمساتنا السحرية...</div>
                        </Card>
                    )}
                </main>

                {/* Floating Bulk Action Bar */}
                {selectedProductIds.length > 0 && activeTab === 'products' && (
                    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-10 duration-500">
                        <div className="bg-black/90 backdrop-blur-2xl px-8 py-4 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.4)] border border-white/10 flex items-center gap-8">
                            <div className="flex flex-col">
                                <span className="text-saada-red font-black text-xl leading-none">{selectedProductIds.length}</span>
                                <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest mt-1">منتج مختار</span>
                            </div>
                            
                            <div className="w-px h-10 bg-white/10" />
                            
                            <div className="flex items-center gap-3">
                                <Button 
                                    onClick={() => setIsBulkCategoryOpen(true)}
                                    className="h-12 px-6 bg-white hover:bg-saada-red hover:text-white text-black font-black rounded-2xl gap-2 transition-all shadow-xl"
                                >
                                    <Package className="h-5 w-5" />
                                    نقل لقسم آخـر
                                </Button>
                                
                                <Button 
                                    variant="ghost"
                                    onClick={() => setSelectedProductIds([])}
                                    className="h-12 px-6 text-white/60 hover:text-white hover:bg-white/5 font-bold rounded-2xl transition-all"
                                >
                                    إلغاء التحديد
                                </Button>

                                <Button 
                                    variant="ghost"
                                    onClick={() => {
                                        if(confirm(`حذف ${selectedProductIds.length} منتج نهائياً؟`)) {
                                            selectedProductIds.forEach(id => handleDelete(id));
                                            setSelectedProductIds([]);
                                        }
                                    }}
                                    className="h-12 w-12 p-0 text-red-500 hover:bg-red-500/10 rounded-2xl transition-all"
                                >
                                    <Trash2 className="h-5 w-5" />
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                <footer className="pt-20 pb-10 text-center">
                    <div className="inline-flex items-center gap-3 px-10 py-5 bg-white rounded-[3rem] shadow-xl border border-gray-50 text-gray-400 font-black text-lg transition-all hover:scale-105 active:scale-95 group cursor-default">
                        صمم بكل <Heart className="h-5 w-5 fill-saada-red text-saada-red group-hover:scale-125 transition-transform" /> بواسطة فريق التقنية في صناع السعادة &copy; {new Date().getFullYear()}
                    </div>
                </footer>

                <DashboardDialogs 
                    isEditDialogOpen={isEditDialogOpen}
                    setIsEditDialogOpen={setIsEditDialogOpen}
                    currentProduct={currentProduct}
                    setCurrentProduct={setCurrentProduct}
                    handleSave={handleSave}
                    handleImageUpload={handleImageUpload}
                    isUploading={isUploading}
                    categories={categories}
                    isCropperOpen={isCropperOpen}
                    setIsCropperOpen={setIsCropperOpen}
                    tempImageUrl={tempImageUrl}
                    handleCropComplete={handleCropComplete}
                    handleSkip={handleSkip}
                    isLifecycleOpen={isLifecycleOpen}
                    setIsLifecycleOpen={setIsLifecycleOpen}
                    lifecycleProduct={lifecycleProduct}
                    lifecycleData={lifecycleData}
                    lifecycleLoading={lifecycleLoading}
                    isBulkCategoryOpen={isBulkCategoryOpen}
                    setIsBulkCategoryOpen={setIsBulkCategoryOpen}
                    bulkCategoryId={bulkCategoryId}
                    setBulkCategoryId={setBulkCategoryId}
                    handleBulkCategoryUpdate={handleBulkCategoryUpdate}
                    isCouponDialogOpen={isCouponDialogOpen}
                    setIsCouponDialogOpen={setIsCouponDialogOpen}
                    newCoupon={newCoupon}
                    setNewCoupon={setNewCoupon}
                    handleCreateCoupon={handleCreateCoupon}
                />
            </div>
        </div>
    );
};


export default AdminDashboard;
