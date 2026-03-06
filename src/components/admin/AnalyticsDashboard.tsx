
import React, { useState, useEffect } from "react";
import {
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
    LineChart,
    Line
} from "recharts";
import {
    TrendingUp,
    Users,
    ShoppingCart,
    Package,
    Activity,
    MousePointerClick,
    ShoppingBag,
    ArrowUpRight,
    ArrowDownRight,
    Clock,
    MessageCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";

const COLORS = ['#8b1538', '#f31b3e', '#222319', '#fbbf24', '#10b981', '#3b82f6'];

const AnalyticsDashboard = () => {
    const [stats, setStats] = useState<any>({
        totalSales: 0,
        ordersCount: 0,
        customersCount: 0,
        visitorsCount: 0,
        conversionRate: 0,
        cartsCount: 0
    });
    const [categorySales, setCategorySales] = useState<any[]>([]);
    const [topProducts, setTopProducts] = useState<any[]>([]);
    const [abandonedCarts, setAbandonedCarts] = useState<any[]>([]);
    const [recentOrders, setRecentOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            // 1. Total Sales & Orders
            const { data: orders } = await supabase
                .from('orders')
                .select('id, total_price, status, created_at, customer_name, customer_phone');

            if (orders) {
                const total = orders.reduce((sum, o) => sum + Number(o.total_price), 0);
                const count = orders.length;

                // 2. Customers
                const uniquePhones = new Set(orders.map(o => o.customer_phone)).size;

                // 3. Product & Category Stats
                const { data: items } = await supabase
                    .from('order_items')
                    .select('product_name, quantity, price, product_id');

                const productSales: any = {};
                items?.forEach(item => {
                    productSales[item.product_name] = (productSales[item.product_name] || 0) + (item.quantity * item.price);
                });

                const topProds = Object.entries(productSales)
                    .map(([name, value]) => ({ name, value }))
                    .sort((a: any, b: any) => b.value - a.value)
                    .slice(0, 5);

                // 4. Site Analytics (Visitors/Funnel)
                const { data: events } = await supabase
                    .from('site_analytics')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (events) {
                    const sessions = new Set(events.filter(e => e.event_type === 'session_start').map(e => e.session_id)).size;
                    const carts = events.filter(e => e.event_type === 'add_to_cart').length;

                    // Abandoned Carts Recovery
                    const completedSessions = new Set(events.filter(e => e.event_type === 'order_complete' || e.event_type === 'whatsapp_checkout_complete').map(e => e.session_id));
                    const abandoned = events
                        .filter(e => e.event_type === 'checkout_progress' && !completedSessions.has(e.session_id) && e.customer_info?.phone)
                        .reduce((acc: any[], curr) => {
                            if (!acc.find(item => item.session_id === curr.session_id)) {
                                acc.push(curr);
                            }
                            return acc;
                        }, [])
                        .slice(0, 6);

                    setStats({
                        totalSales: total,
                        ordersCount: count,
                        customersCount: uniquePhones,
                        visitorsCount: sessions,
                        cartsCount: carts,
                        conversionRate: sessions ? ((count / sessions) * 100).toFixed(1) : 0
                    });

                    setAbandonedCarts(abandoned);
                }

                setTopProducts(topProds);
                setRecentOrders(orders.slice(-5).reverse());
            }
        } catch (error) {
            console.error("Error fetching analytics:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-20">
                <Activity className="h-10 w-10 animate-spin text-saada-red" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 font-tajawal rtl" dir="rtl">
            {/* Header Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-white border-none shadow-sm hover:shadow-md transition-shadow group overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-2 h-full bg-saada-red" />
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-sm text-gray-400 font-bold">إجمالي المبيعات</p>
                                <h3 className="text-3xl font-black text-saada-brown tracking-tight">{stats.totalSales.toLocaleString()} <span className="text-sm font-bold text-gray-400">ج.م</span></h3>
                            </div>
                            <div className="h-14 w-14 bg-red-50 rounded-2xl flex items-center justify-center text-saada-red group-hover:scale-110 transition-transform">
                                <TrendingUp className="h-7 w-7" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white border-none shadow-sm hover:shadow-md transition-shadow group overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-2 h-full bg-blue-500" />
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-sm text-gray-400 font-bold">زوار الموقع</p>
                                <h3 className="text-3xl font-black text-saada-brown tracking-tight">{stats.visitorsCount}</h3>
                            </div>
                            <div className="h-14 w-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                                <Users className="h-7 w-7" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white border-none shadow-sm hover:shadow-md transition-shadow group overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-2 h-full bg-emerald-500" />
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-sm text-gray-400 font-bold">عمليات الإضافة للسلة</p>
                                <h3 className="text-3xl font-black text-saada-brown tracking-tight">{stats.cartsCount}</h3>
                            </div>
                            <div className="h-14 w-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                                <ShoppingCart className="h-7 w-7" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white border-none shadow-sm hover:shadow-md transition-shadow group overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-2 h-full bg-amber-500" />
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-sm text-gray-400 font-bold">نسبة التحويل</p>
                                <h3 className="text-3xl font-black text-saada-brown tracking-tight">{stats.conversionRate}%</h3>
                            </div>
                            <div className="h-14 w-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
                                <Activity className="h-7 w-7" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Product Sales Chart */}
                <Card className="bg-white border-none shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between border-b border-gray-50 pb-4">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-saada-red" />
                            <CardTitle className="text-lg font-black text-saada-brown">توزيع المبيعات</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="h-[350px] pt-6">
                        <ResponsiveContainer width="100%" height="100%">
                            <ReBarChart data={topProducts} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} opacity={0.1} />
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    width={140}
                                    tick={{ fontSize: 11, fontWeight: 700, fill: '#64748b' }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', padding: '12px' }}
                                    formatter={(value: any) => [`${value.toLocaleString()} ج.م`, 'المبيعات']}
                                    labelStyle={{ fontWeight: 900, marginBottom: '4px', color: '#8b1538' }}
                                />
                                <Bar dataKey="value" fill="#8b1538" radius={[0, 8, 8, 0]} barSize={24}>
                                    {topProducts.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </ReBarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Abandoned Carts Recovery */}
                <Card className="bg-white border-none shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between border-b border-gray-50 pb-4">
                        <div className="flex items-center gap-2">
                            <ShoppingBag className="h-5 w-5 text-amber-500" />
                            <CardTitle className="text-lg font-black text-saada-brown">استعادة السلال المتروكة</CardTitle>
                        </div>
                        <span className="bg-amber-100 text-amber-600 text-[10px] px-2 py-1 rounded-full font-black uppercase">Abandoned</span>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="space-y-4">
                            {abandonedCarts.length > 0 ? abandonedCarts.map((cart, idx) => (
                                <div key={cart.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-amber-100">
                                    <div className="flex flex-col">
                                        <span className="font-black text-saada-brown">{cart.customer_info?.name || "عميل محتمل"}</span>
                                        <span className="text-xs text-gray-500 font-bold">{cart.customer_info?.phone}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="flex flex-col text-left mr-4">
                                            <span className="text-[10px] text-gray-400 font-bold uppercase">Last Activity</span>
                                            <span className="text-xs font-bold">{new Date(cart.created_at).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                        <a
                                            href={`https://wa.me/${cart.customer_info?.phone.startsWith('0') ? '2' + cart.customer_info?.phone : cart.customer_info?.phone}?text=${encodeURIComponent(`مرحباً ${cart.customer_info?.name}, نلاحظ أنه كان لديك بعض المنتجات الرائعة في سلتك بمتجر صناع السعادة ولكن لم تكتمل المحاولة. هل تواجه أي مشكلة؟`)}`}
                                            target="_blank"
                                            className="h-10 w-10 bg-emerald-500 text-white rounded-xl flex items-center justify-center hover:scale-110 transition-transform shadow-lg shadow-emerald-200"
                                        >
                                            <MessageCircle className="h-5 w-5" />
                                        </a>
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center py-10 opacity-50">
                                    <ShoppingCart className="h-12 w-12 mx-auto mb-2 opacity-10" />
                                    <p className="text-sm font-bold">لا توجد سلال متروكة حالياً</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Orders List */}
            <Card className="bg-white border-none shadow-sm pb-6">
                <CardHeader className="flex flex-row items-center justify-between border-b border-gray-50 pb-4">
                    <div className="flex items-center gap-2">
                        <Activity className="h-5 w-5 text-blue-500" />
                        <CardTitle className="text-lg font-black text-saada-brown">آخر الطلبات المستلمة</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="overflow-x-auto">
                        <table className="w-full text-right">
                            <thead>
                                <tr className="text-xs text-gray-400 font-black uppercase tracking-widest border-b border-gray-50">
                                    <th className="pb-4 font-black">العميل</th>
                                    <th className="pb-4 font-black">الهاتف</th>
                                    <th className="pb-4 font-black">القيمة</th>
                                    <th className="pb-4 font-black">التوقيت</th>
                                    <th className="pb-4 font-black">الحالة</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentOrders.map((order) => (
                                    <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                        <td className="py-4 font-bold text-saada-brown">{order.customer_name}</td>
                                        <td className="py-4 text-sm font-medium text-gray-500">{order.customer_phone}</td>
                                        <td className="py-4 font-black text-saada-red">{Number(order.total_price).toLocaleString()} ج.م</td>
                                        <td className="py-4 text-xs font-bold text-gray-400">{new Date(order.created_at).toLocaleDateString('ar-EG')}</td>
                                        <td className="py-4">
                                            <span className={`text-[10px] font-black px-2 py-1 rounded-lg uppercase ${order.status === 'received' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                                                {order.status === 'received' ? 'مستلم' : 'قيد المراجعة'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default AnalyticsDashboard;
