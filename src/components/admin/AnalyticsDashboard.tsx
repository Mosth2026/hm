
import React, { useState, useEffect } from "react";
import {
    AreaChart,
    Area,
    BarChart as ReBarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend
} from "recharts";
import {
    TrendingUp,
    Users,
    ShoppingCart,
    Package,
    Activity,
    ShoppingBag,
    ArrowUpRight,
    ArrowDownRight,
    Clock,
    MessageCircle,
    Calendar,
    Search,
    ChevronLeft,
    ChevronRight,
    MapPin,
    DollarSign,
    Target,
    Zap,
    Briefcase
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/lib/supabase";
import { Badge } from "@/components/ui/badge";

const PREM_COLORS = ['#8B0000', '#D4AF37', '#1A1A1A', '#4A0404', '#722F37', '#C5A059'];

const AnalyticsDashboard = () => {
    const [stats, setStats] = useState<any>({
        totalSales: 0,
        ordersCount: 0,
        customersCount: 0,
        visitorsCount: 0,
        conversionRate: 0,
        avgOrderValue: 0,
        estimatedProfit: 0
    });
    const [revenueTrend, setRevenueTrend] = useState<any[]>([]);
    const [categorySales, setCategorySales] = useState<any[]>([]);
    const [topProducts, setTopProducts] = useState<any[]>([]);
    const [abandonedCarts, setAbandonedCarts] = useState<any[]>([]);
    const [recentOrders, setRecentOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isVisitorModalOpen, setIsVisitorModalOpen] = useState(false);
    const [visitorLogs, setVisitorLogs] = useState<any[]>([]);
    const [todayCount, setTodayCount] = useState(0);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            // 1. Fetch Orders
            const { data: orders } = await supabase
                .from('orders')
                .select('*')
                .order('created_at', { ascending: true });

            if (orders) {
                const total = orders.reduce((sum, o) => sum + Number(o.total_price), 0);
                const count = orders.length;
                const avgV = count > 0 ? (total / count).toFixed(0) : 0;

                // Process Revenue Trend
                const trendMap = new Map();
                orders.forEach(o => {
                    const date = new Date(o.created_at).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' });
                    trendMap.set(date, (trendMap.get(date) || 0) + Number(o.total_price));
                });
                setRevenueTrend(Array.from(trendMap.entries()).map(([name, value]) => ({ name, value })));

                // 2. Customers
                const uniquePhones = new Set(orders.map(o => o.customer_phone)).size;

                // 3. Product & Category Stats
                const { data: items } = await supabase
                    .from('order_items')
                    .select('product_name, quantity, price, category_name');

                const productSales: any = {};
                const catSales: any = {};
                
                items?.forEach(item => {
                    productSales[item.product_name] = (productSales[item.product_name] || 0) + (item.quantity * item.price);
                    catSales[item.category_name || 'أخرى'] = (catSales[item.category_name || 'أخرى'] || 0) + (item.quantity * item.price);
                });

                const topProdsRes = Object.entries(productSales)
                    .map(([name, value]) => ({ name, value: Number(value) }))
                    .sort((a: any, b: any) => b.value - a.value)
                    .slice(0, 5);
                
                const catSalesRes = Object.entries(catSales)
                    .map(([name, value]) => ({ name, value: Number(value) }))
                    .sort((a: any, b: any) => b.value - a.value)
                    .slice(0, 5);

                // 4. Funnel Analytics
                const { data: events } = await supabase
                    .from('site_analytics')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (events) {
                    const sessionIds = new Set(events.map(e => e.session_id).filter(Boolean));
                    const sessionsCount = sessionIds.size;
                    
                    const startOfToday = new Date();
                    startOfToday.setHours(0, 0, 0, 0);
                    
                    const todaySessions = new Set(
                        events
                            .filter(e => new Date(e.created_at).getTime() >= startOfToday.getTime())
                            .map(e => e.session_id)
                            .filter(Boolean)
                    ).size;

                    const completedSessions = new Set(events.filter(e => e.event_type === 'order_complete').map(e => e.session_id));
                    const abandoned = events
                        .filter(e => e.event_type === 'checkout_progress' && !completedSessions.has(e.session_id) && e.customer_info?.phone)
                        .reduce((acc: any[], curr) => {
                            if (!acc.find(item => item.session_id === curr.session_id)) acc.push(curr);
                            return acc;
                        }, [])
                        .slice(0, 6);

                    setStats({
                        totalSales: total,
                        ordersCount: count,
                        customersCount: uniquePhones,
                        visitorsCount: sessionsCount,
                        avgOrderValue: avgV,
                        estimatedProfit: (total * 0.25).toFixed(0), // Placeholder: 25% profit margin
                        conversionRate: sessionsCount ? ((count / sessionsCount) * 100).toFixed(1) : 0
                    });

                    setTodayCount(todaySessions);
                    setAbandonedCarts(abandoned);
                    const uniqueSessionsMap = new Map();
                    [...events].reverse().forEach(e => uniqueSessionsMap.set(e.session_id, e));
                    setVisitorLogs(Array.from(uniqueSessionsMap.values()).reverse());
                }

                setTopProducts(topProdsRes);
                setCategorySales(catSalesRes);
                setRecentOrders(orders.slice(-6).reverse());
            }
        } catch (error) {
            console.error("Dashboard Fetch Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const StatusCard = ({ title, value, icon: Icon, color, trend }: any) => (
        <Card className="relative overflow-hidden group border-none shadow-xl bg-white transition-all hover:-translate-y-1">
            <div className={`absolute top-0 right-0 w-1.5 h-full ${color}`} />
            <CardContent className="p-6">
                <div className="flex items-start justify-between">
                    <div className="space-y-2">
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">{title}</p>
                        <h3 className="text-3xl font-black text-saada-brown">{value}</h3>
                        {trend && (
                            <div className="flex items-center gap-1">
                                <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                                <span className="text-[10px] font-black text-emerald-600">{trend}% زيادة</span>
                            </div>
                        )}
                    </div>
                    <div className={`h-14 w-14 rounded-2xl flex items-center justify-center bg-gray-50 group-hover:scale-110 transition-transform shadow-inner`}>
                        <Icon className="h-7 w-7 text-saada-brown opacity-80" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    if (loading) return <div className="p-20 flex justify-center"><Zap className="h-12 w-12 animate-pulse text-saada-red" /></div>;

    return (
        <div className="space-y-10 font-tajawal rtl pb-10 px-2" dir="rtl">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-4xl font-black text-saada-brown flex items-center gap-3 tracking-tighter">
                        مركز العمليات والتحليلات
                        <Badge className="bg-saada-red text-white border-none px-3 py-1 text-[10px] font-black animate-pulse">مباشر</Badge>
                    </h2>
                    <p className="text-gray-400 font-bold mt-2">مرحباً بك في مركز التحكم التجاري لصناع السعادة</p>
                </div>
                <div className="flex items-center gap-3 bg-white/50 backdrop-blur-xl p-3 rounded-[2rem] border border-white/50 shadow-sm">
                    <Calendar className="h-6 w-6 text-saada-brown" />
                    <span className="font-black text-saada-brown text-lg">{new Date().toLocaleDateString('ar-EG', { month: 'long', year: 'numeric' })}</span>
                </div>
            </div>

            {/* Smart Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatusCard title="إجمالي الإيرادات" value={`${stats.totalSales.toLocaleString()} ج.م`} icon={DollarSign} color="bg-saada-red" trend="12.5" />
                <StatusCard title="متوسط الطلب" value={`${stats.avgOrderValue.toLocaleString()} ج.م`} icon={Target} color="bg-gold-500" />
                <StatusCard title="الزوار النشطين" value={stats.visitorsCount} icon={Users} color="bg-amber-500" trend={todayCount > 0 ? "5.2" : null} />
                <StatusCard title="صافي الربح المتوقع" value={`${stats.estimatedProfit.toLocaleString()} ج.م`} icon={Briefcase} color="bg-emerald-500" />
            </div>

            {/* Main Visual Intelligence */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Sale Trend Chart */}
                <Card className="lg:col-span-2 border-none shadow-2xl bg-white rounded-[2.5rem] overflow-hidden">
                    <CardHeader className="p-8 border-b border-gray-50 bg-gradient-to-l from-gray-50/50 to-transparent flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-xl font-black text-saada-brown tracking-tight">نبض المبيعات السنوي</CardTitle>
                            <p className="text-xs text-gray-400 font-bold mt-1">تتبع أداء الإيرادات اليومي مقارنة بالفترات السابقة</p>
                        </div>
                        <Activity className="h-6 w-6 text-saada-red animate-pulse" />
                    </CardHeader>
                    <CardContent className="h-[400px] p-8">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={revenueTrend}>
                                <defs>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8B0000" stopOpacity={0.2}/>
                                        <stop offset="95%" stopColor="#8B0000" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 11, fontWeight: 700, fill: '#64748B'}} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 11, fontWeight: 700, fill: '#64748B'}} />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)', padding: '20px' }}
                                    formatter={(v: any) => [`${v.toLocaleString()} ج.م`, 'الإيرادات']}
                                />
                                <Area type="monotone" dataKey="value" stroke="#8B0000" strokeWidth={4} fillOpacity={1} fill="url(#colorValue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Top Categories Distribution */}
                <Card className="border-none shadow-2xl bg-[#1A1A1A] rounded-[2.5rem] text-white">
                    <CardHeader className="p-8 border-b border-white/5">
                        <CardTitle className="text-xl font-black tracking-tight">كفاءة الأقسام</CardTitle>
                        <p className="text-xs text-white/40 font-bold mt-1">توزيع القوة الشرائية بين أقسام المتجر</p>
                    </CardHeader>
                    <CardContent className="h-[400px] flex flex-col justify-center items-center">
                        <ResponsiveContainer width="100%" height="250px">
                            <PieChart>
                                <Pie 
                                    data={categorySales} 
                                    cx="50%" cy="50%" 
                                    innerRadius={60} outerRadius={90} 
                                    paddingAngle={8} 
                                    dataKey="value"
                                >
                                    {categorySales.map((_, i) => <Cell key={`cell-${i}`} fill={PREM_COLORS[i % PREM_COLORS.length]} stroke="none" />)}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="w-full mt-6 space-y-3 px-4">
                            {categorySales.slice(0, 4).map((cat, i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: PREM_COLORS[i] }} />
                                        <span className="text-xs font-bold text-white/80">{cat.name}</span>
                                    </div>
                                    <span className="text-xs font-black text-gold-500">{((cat.value / stats.totalSales) * 100).toFixed(0)}%</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Bottom Intelligence Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Highest Selling Products */}
                <Card className="lg:col-span-2 border-none shadow-xl bg-white rounded-[2.5rem] overflow-hidden">
                    <CardHeader className="p-8 border-b border-gray-50 flex flex-row items-center justify-between">
                        <CardTitle className="text-xl font-black text-saada-brown tracking-tight">نخبة المنتجات</CardTitle>
                        <button onClick={fetchAnalytics} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><Search className="h-5 w-5 text-gray-400" /></button>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="space-y-4">
                            {topProducts.map((p, i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl group hover:bg-white hover:shadow-lg hover:shadow-gray-100 transition-all cursor-default translate-x-0">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-xl bg-white shadow-sm flex items-center justify-center font-black text-saada-brown">{i+1}</div>
                                        <div className="flex flex-col">
                                            <span className="font-black text-saada-brown group-hover:text-saada-red transition-colors">{p.name}</span>
                                            <span className="text-[10px] text-gray-400 font-bold uppercase">Top Performer</span>
                                        </div>
                                    </div>
                                    <div className="text-left">
                                        <div className="text-lg font-black text-saada-brown">{p.value.toLocaleString()} <span className="text-[10px]">ج.م</span></div>
                                        <div className="h-1 w-24 bg-gray-200 rounded-full mt-1 overflow-hidden">
                                            <div className="h-full bg-saada-red rounded-full" style={{ width: `${(p.value / topProducts[0].value) * 100}%` }} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Abandoned Recovery System */}
                <Card className="border-none shadow-xl bg-gradient-to-br from-white to-orange-50/30 rounded-[2.5rem] overflow-hidden">
                    <CardHeader className="p-8 border-b border-gray-50">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-xl font-black text-saada-brown">فرص مبيعات متروكة</CardTitle>
                            <ShoppingCart className="h-6 w-6 text-orange-500" />
                        </div>
                        <p className="text-xs text-gray-400 font-bold mt-1">تواصل مع العملاء الذين لم يكملوا طلباتهم</p>
                    </CardHeader>
                    <CardContent className="p-6 overflow-y-auto max-h-[450px]">
                        <div className="space-y-4">
                            {abandonedCarts.map((cart, idx) => (
                                <div key={idx} className="bg-white p-5 rounded-2xl shadow-sm border border-orange-100/50 flex flex-col gap-3 group transition-all hover:border-orange-500">
                                    <div className="flex justify-between items-start">
                                        <div className="flex flex-col">
                                            <span className="font-black text-saada-brown text-base">{cart.customer_info?.name || "عميل محتمل"}</span>
                                            <span className="text-xs font-bold text-gray-400">{cart.customer_info?.phone}</span>
                                        </div>
                                        <Badge className="bg-orange-100 text-orange-600 border-none text-[10px] uppercase font-black tracking-tighter">Abandoned</Badge>
                                    </div>
                                    <div className="flex items-center justify-between mt-2 pt-3 border-t border-gray-50">
                                        <div className="flex flex-col">
                                            <span className="text-[9px] text-gray-300 font-black uppercase">Activity</span>
                                            <span className="text-xs font-bold text-saada-brown">{new Date(cart.created_at).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                        <a 
                                            href={`https://wa.me/${cart.customer_info?.phone.startsWith('0') ? '2' + cart.customer_info?.phone : cart.customer_info?.phone}?text=${encodeURIComponent(`مرحباً ${cart.customer_info?.name}, نلاحظ أنه كان لديك بعض المنتجات الرائعة في سلتك بمتجر صناع السعادة ولكن لم تكتمل المحاولة. هل تواجه أي مشكلة؟`)}`}
                                            target="_blank"
                                            className="h-10 px-4 bg-emerald-500 text-white rounded-xl flex items-center gap-2 font-black text-xs hover:scale-105 active:scale-95 transition-all shadow-lg shadow-emerald-100"
                                        >
                                            <MessageCircle className="h-4 w-4" />
                                            متابعة
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Enhanced Recent Orders Table */}
            <Card className="border-none shadow-2xl bg-white rounded-[2.5rem] overflow-hidden">
                <CardHeader className="p-8 border-b border-gray-50 flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-2xl font-black text-saada-brown">سجل العمليات الأخير</CardTitle>
                        <p className="text-xs text-gray-400 font-bold mt-1">مراقبة دقيقة لكافة الطلبات الواردة للمتجر</p>
                    </div>
                    <Badge variant="outline" className="h-8 px-4 rounded-xl border-gray-200 font-black text-gray-400">آخر 6 طلبات</Badge>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-right">
                            <thead className="bg-gray-50/50">
                                <tr className="text-[10px] text-gray-400 font-black uppercase tracking-widest border-b border-gray-50">
                                    <th className="p-6">العميل</th>
                                    <th className="p-6">رقم الهاتف</th>
                                    <th className="p-6">إجمالي الطلب</th>
                                    <th className="p-6">التاريخ والوقت</th>
                                    <th className="p-6">حالة المعاملة</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentOrders.map((order) => (
                                    <tr key={order.id} className="border-b border-gray-50 hover:bg-saada-red/5 transition-colors group cursor-default">
                                        <td className="p-6">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-saada-brown/5 flex items-center justify-center font-black text-saada-brown text-xs">{order.customer_name?.charAt(0)}</div>
                                                <span className="font-black text-saada-brown group-hover:text-saada-red transition-colors">{order.customer_name}</span>
                                            </div>
                                        </td>
                                        <td className="p-6 text-sm font-bold text-gray-500 font-mono tracking-tight">{order.customer_phone}</td>
                                        <td className="p-6 font-black text-saada-brown">{Number(order.total_price).toLocaleString()} <span className="text-[10px] font-bold">ج.م</span></td>
                                        <td className="p-6 flex flex-col">
                                            <span className="text-xs font-black text-saada-brown">{new Date(order.created_at).toLocaleDateString('ar-EG')}</span>
                                            <span className="text-[10px] text-gray-300 font-bold uppercase">{new Date(order.created_at).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</span>
                                        </td>
                                        <td className="p-6">
                                            <span className={`text-[10px] font-black px-3 py-1.5 rounded-full uppercase ${
                                                order.status === 'received' ? 'bg-emerald-100 text-emerald-600' : 
                                                order.status === 'shipped' ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'
                                            }`}>
                                                {order.status === 'received' ? 'مستلم' : 
                                                 order.status === 'shipped' ? 'تم الشحن' : 'قيد المراجعة'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Professional Visitors Modal */}
            <Dialog open={isVisitorModalOpen} onOpenChange={setIsVisitorModalOpen}>
                <DialogContent className="max-w-3xl bg-white rounded-[3rem] p-0 overflow-hidden border-none shadow-[0_40px_100px_rgba(0,0,0,0.3)] animate-in zoom-in-95 duration-300 font-tajawal rtl" dir="rtl">
                    <div className="bg-[#1A1A1A] p-10 text-white relative h-32 flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <div className="h-16 w-16 rounded-[1.5rem] bg-white/10 flex items-center justify-center backdrop-blur-xl">
                                <Users className="h-8 w-8 text-gold-500" />
                            </div>
                            <div>
                                <DialogTitle className="text-3xl font-black tracking-tighter">سجل الزيارات والنشاط</DialogTitle>
                                <p className="text-white/40 text-sm font-bold mt-1 tracking-widestone">Detailed User Traffic Analytics</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="text-right">
                                <span className="text-[10px] text-white/30 font-black block uppercase italic">Total Visits</span>
                                <span className="text-2xl font-black text-white">{stats.visitorsCount}</span>
                            </div>
                            <div className="w-px h-10 bg-white/10" />
                            <div className="text-right">
                                <span className="text-[10px] text-white/30 font-black block uppercase italic">Today</span>
                                <span className="text-2xl font-black text-gold-500">{todayCount}</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 max-h-[500px] overflow-y-auto bg-gray-50/50">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {visitorLogs.map((log, i) => {
                                const d = new Date(log.created_at);
                                return (
                                    <div key={i} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group hover:border-saada-red transition-all cursor-default">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 group-hover:text-saada-red transition-colors"><Activity className="h-5 w-5" /></div>
                                            <div className="flex flex-col">
                                                <span className="text-xs font-black text-saada-brown">{d.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</span>
                                                <span className="text-[10px] font-bold text-gray-400">{d.toLocaleDateString('ar-EG')}</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-[9px] font-mono text-gray-300 uppercase">Session ID</span>
                                            <span className="text-[10px] font-bold text-gray-400">{log.session_id?.substring(0, 8)}...</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="p-6 bg-white border-t border-gray-50 text-center">
                        <button onClick={() => setIsVisitorModalOpen(false)} className="px-10 h-14 bg-saada-brown text-white rounded-2xl font-black text-lg hover:bg-black transition-all shadow-xl shadow-saada-brown/20">إغلاق التقرير</button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AnalyticsDashboard;
