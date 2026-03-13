
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate, useLocation, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { LogIn, UserPlus, ArrowRight, ShieldCheck, Heart } from "lucide-react";
import { Helmet } from "react-helmet-async";

const LoginPage = () => {
    const { login, register } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isRegister, setIsRegister] = useState(false);
    const [loading, setLoading] = useState(false);
    
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        username: ""
    });

    const from = (location.state as any)?.from?.pathname || "/";

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isRegister) {
                const result = await register(formData.email, formData.password, formData.username);
                if (result.success) {
                    toast.success("تم إنشاء الحساب بنجاح! مرحباً بك في صناع السعادة.");
                    navigate(from, { replace: true });
                } else {
                    toast.error(result.error || "خطأ في التسجيل");
                }
            } else {
                const result = await login(formData.email, formData.password);
                if (result.success) {
                    toast.success("تم تسجيل الدخول بنجاح.");
                    navigate(from, { replace: true });
                } else {
                    toast.error("بيانات الدخول غير صحيحة");
                }
            }
        } catch (error) {
            toast.error("حدث خطأ غير متوقع");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col font-tajawal rtl bg-gray-50/50">
            <Helmet>
                <title>{isRegister ? "إنشاء حساب" : "تسجيل الدخول"} | صناع السعادة</title>
            </Helmet>
            <Header />
            <main className="flex-grow flex items-center justify-center pt-28 pb-12 px-4">
                <div className="w-full max-w-md">
                    <div className="bg-white rounded-[2.5rem] p-4 md:p-8 shadow-2xl border border-gray-100/50 animate-in fade-in zoom-in duration-500">
                        <div className="text-center mb-10">
                            <div className="h-16 w-16 bg-saada-red/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                {isRegister ? <UserPlus className="h-8 w-8 text-saada-red" /> : <LogIn className="h-8 w-8 text-saada-red" />}
                            </div>
                            <h1 className="text-3xl font-black text-saada-brown mb-2">{isRegister ? "انضم إلينا" : "مرحباً بعودتك"}</h1>
                            <p className="text-gray-400 text-sm">كن جزءاً من عالم السعادة وتابع طلباتك بسهولة</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {isRegister && (
                                <div className="space-y-2">
                                    <Label className="text-saada-brown font-bold mr-1">الاسم الكريم</Label>
                                    <Input 
                                        placeholder="مثلاً: محمد علي"
                                        className="h-14 rounded-2xl border-gray-100 bg-gray-50/50 focus:bg-white transition-all px-6 text-lg"
                                        value={formData.username}
                                        onChange={(e) => setFormData({...formData, username: e.target.value})}
                                        required={isRegister}
                                    />
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label className="text-saada-brown font-bold mr-1">البريد الإلكتروني</Label>
                                <Input 
                                    type="email"
                                    placeholder="your@email.com"
                                    className="h-14 rounded-2xl border-gray-100 bg-gray-50/50 focus:bg-white transition-all px-6 text-lg ltr"
                                    dir="ltr"
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-saada-brown font-bold mr-1">كلمة المرور {isRegister && <span className="text-[10px] text-saada-red">(6 أحرف على الأقل)</span>}</Label>
                                <Input 
                                    type="password"
                                    placeholder="••••••••"
                                    className="h-14 rounded-2xl border-gray-100 bg-gray-50/50 focus:bg-white transition-all px-6 text-lg ltr"
                                    dir="ltr"
                                    value={formData.password}
                                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                                    required
                                />
                            </div>

                            <Button 
                                type="submit" 
                                disabled={loading}
                                className="w-full h-15 bg-saada-red hover:bg-saada-brown text-white text-lg font-black rounded-2xl shadow-xl shadow-saada-red/20 flex items-center justify-center gap-3 transition-all hover:-translate-y-1 active:scale-[0.98]"
                            >
                                {loading ? "جاري التحميل..." : (isRegister ? "إنشاء حسابي الآن" : "تسجيل الدخول")}
                                {!loading && <ArrowRight className="h-5 w-5" />}
                            </Button>
                        </form>

                        <div className="mt-8 pt-6 border-t border-gray-50 text-center">
                            <p className="text-gray-500 mb-2">
                                {isRegister ? "لديك حساب بالفعل؟" : "ليس لديك حساب؟"}
                            </p>
                            <button 
                                onClick={() => setIsRegister(!isRegister)}
                                className="text-saada-red font-black hover:underline underline-offset-4"
                            >
                                {isRegister ? "سجل دخولك من هنا" : "أنشئ حساباً جديداً في لحظة"}
                            </button>
                        </div>
                    </div>

                    <div className="mt-8 flex items-center justify-center gap-6 text-gray-400">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest"><ShieldCheck className="h-4 w-4" /> حماية تامة للبيانات</div>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest"><Heart className="h-4 w-4" /> تجربة تسوق ممتعة</div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default LoginPage;
