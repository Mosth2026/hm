
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/use-auth";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingBag, Package, ChevronRight, Clock, CheckCircle2 } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { formatPrice } from "@/lib/utils";

const MyOrders = () => {
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate("/login");
            return;
        }

        const fetchMyOrders = async () => {
            try {
                const { data, error } = await supabase
                    .from("orders")
                    .select("*")
                    .eq("user_id", user?.id)
                    .order("created_at", { ascending: false });

                if (error) throw error;
                setOrders(data || []);
            } catch (err) {
                console.error("Error fetching orders:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchMyOrders();
    }, [user, isAuthenticated, navigate]);

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col font-tajawal rtl bg-gray-50">
                <Header />
                <main className="flex-grow flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-saada-red"></div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col font-tajawal rtl bg-gray-50" dir="rtl">
            <Helmet>
                <title>طلباتي | صناع السعادة</title>
            </Helmet>
            <Header />
            <main className="flex-grow pt-28 pb-12 px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="h-12 w-12 bg-saada-red/10 rounded-2xl flex items-center justify-center">
                            <ShoppingBag className="h-7 w-7 text-saada-red" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-saada-brown">تاريخ طلباتي</h1>
                            <p className="text-gray-500 text-sm">أهلاً بك {user?.username}، هنا يمكنك مراجعة كافة طلباتك السابقة</p>
                        </div>
                    </div>

                    {orders.length === 0 ? (
                        <div className="bg-white rounded-[2.5rem] p-12 text-center shadow-xl border border-gray-100">
                            <div className="bg-gray-50 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Package className="h-10 w-10 text-gray-300" />
                            </div>
                            <h2 className="text-xl font-bold text-saada-brown mb-2">لا توجد طلبات بعد</h2>
                            <p className="text-gray-500 mb-8">ابدأ التسوق الآن وأضف بعض السعادة ليومك!</p>
                            <Link to="/">
                                <Button className="bg-saada-red hover:bg-saada-brown text-white px-8 py-6 rounded-xl font-bold">
                                    ابدأ التسوق الآن
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {orders.map((order) => (
                                <Link 
                                    key={order.id} 
                                    to={`/order-tracking/${order.tracking_code || order.id}`}
                                    className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 hover:border-saada-red/30 transition-all hover:shadow-xl group"
                                >
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="h-14 w-14 bg-gray-50 rounded-2xl flex items-center justify-center group-hover:bg-saada-red/5 transition-colors">
                                                <Package className="h-6 w-6 text-saada-brown/50 group-hover:text-saada-red transition-colors" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-bold text-saada-brown text-lg">طلب رقم #{order.id}</span>
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                                                        order.status === 'pending' ? 'bg-amber-100 text-amber-700' : 
                                                        order.status === 'received' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                                                    }`}>
                                                        {order.status === 'pending' ? 'قيد المراجعة' : 
                                                         order.status === 'received' ? 'تم الاستلام' : 'تم التأكيد'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-4 text-xs text-gray-400">
                                                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {new Date(order.created_at).toLocaleDateString('ar-EG')}</span>
                                                    <span className="font-bold text-saada-red">{formatPrice(order.total_price)} ج.م</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 text-saada-red font-bold text-sm">
                                            <span>تفاصيل الطلب</span>
                                            <ChevronRight className="h-4 w-4" />
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
};

// Simple Button component for Internal usage if UI button is not imported correctly
const Button = ({ children, className, onClick }: any) => (
    <button onClick={onClick} className={`inline-flex items-center justify-center transition-all active:scale-95 ${className}`}>
        {children}
    </button>
);

export default MyOrders;
