
import React from "react";
import { ArrowUpRight, Sparkles, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";

const SwissFruSection = () => {
    return (
        <section className="py-24 bg-[#222319] text-[#E8D9C5] relative overflow-hidden font-tajawal rtl">
            {/* Background Texture/Accents */}
            <div className="absolute top-0 left-0 w-full h-full opacity-[0.05] pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(#E8D9C5 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
            
            <div className="absolute -top-[20%] -right-[10%] w-[600px] h-[600px] bg-secondary/10 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute -bottom-[20%] -left-[10%] w-[500px] h-[500px] bg-[#f31b3e]/5 rounded-full blur-[100px] animate-float" />

            <div className="container mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    {/* Visual Side */}
                    <div className="relative group order-2 lg:order-1">
                        <div className="relative aspect-square md:aspect-[4/5] rounded-[3rem] overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.5)] border border-white/10 group-hover:scale-[1.02] transition-transform duration-1000">
                            {/* Updated with a luxury representation of quality confectionery */}
                            <img 
                                src="https://yacjvrfwcahjqqbuiyxy.supabase.co/storage/v1/object/public/products/product-images/1773868549731-99dlw5f.webp" 
                                alt="Global Swiss Fru Prestige" 
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                            />
                            {/* Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-[#222319] via-transparent to-transparent opacity-60" />
                            
                            {/* Floating Batch */}
                            <div className="absolute bottom-10 right-10 p-6 bg-white/10 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl animate-bounce-slow">
                                <div className="text-3xl font-black text-[#f31b3e] drop-shadow-[0_0_15px_rgba(243,27,62,0.5)]">TOP #1</div>
                                <div className="text-[10px] font-black uppercase tracking-widest text-[#E8D9C5]/60">Global Luxury Brand</div>
                            </div>
                        </div>

                        {/* Decoration Elements */}
                        <div className="absolute -top-10 -left-10 h-32 w-32 bg-secondary/20 rounded-full blur-3xl animate-pulse" />
                    </div>

                    {/* Content Side */}
                    <div className="space-y-10 order-1 lg:order-2">
                        <div className="space-y-6">
                            <div className="inline-flex items-center gap-3 px-5 py-2 bg-white/5 backdrop-blur-xl rounded-full border border-white/10">
                                <Sparkles className="h-4 w-4 text-secondary" />
                                <span className="text-xs font-black uppercase tracking-[0.3em] text-secondary">Global Prestige</span>
                            </div>
                            
                            <h2 className="text-5xl md:text-7xl lg:text-8xl font-black leading-none tracking-tighter">
                                براند <span className="text-secondary italic">سويس فرو</span> <br />
                                أيقونة العالم
                            </h2>
                            
                            <p className="text-xl md:text-2xl text-[#E8D9C5]/60 font-bold max-w-xl leading-relaxed">
                                الاسم الذي ارتبط بالفخامة في كل دول العالم، ومذاق السعادة الذي أحبه الملايين. سويس فرو ليست مجرد منتجات، بل هي تجربة عالمية فاخرة أثبتت مكانتها كأرقى ما يمكن تذوقه.
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-6 pt-4">
                            <Link 
                                to="/search?q=Swiss%20Fru" 
                                className="h-18 px-10 bg-secondary hover:bg-white text-primary rounded-2xl flex items-center gap-4 font-black text-lg transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-secondary/20"
                            >
                                <ShoppingBag className="h-6 w-6" />
                                استكشف العالم الفاخر
                                <ArrowUpRight className="h-5 w-5 opacity-50" />
                            </Link>
                            
                            <Link 
                                to="/categories/chocolate" 
                                className="h-18 px-10 border-2 border-white/10 hover:bg-white/5 text-white rounded-2xl flex items-center gap-4 font-black text-lg transition-all"
                            >
                                التشكيلة العالمية
                            </Link>
                        </div>

                        {/* Brand Values */}
                        <div className="grid grid-cols-2 gap-8 pt-10 border-t border-white/5">
                            <div className="space-y-2">
                                <div className="text-secondary font-black text-xl">أفخر الخامات</div>
                                <div className="text-sm font-bold text-[#E8D9C5]/40 leading-relaxed">ننتقي أفضل الخامات العالمية التي تمنح سويس فرو ملمسها وطعمها الفريد الذي يعشقه الجميع.</div>
                            </div>
                            <div className="space-y-2">
                                <div className="text-secondary font-black text-xl">اسم نثق به</div>
                                <div className="text-sm font-bold text-[#E8D9C5]/40 leading-relaxed">الثقة والجودة التي جعلت سويس فرو تحتل المرتبة الأولى في قلوب محبي المنتجات الفاخرة.</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default SwissFruSection;
