
import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Helmet } from "react-helmet-async";
import { BadgeCheck, Heart, MapPin, Store, Users, ShoppingBag, Star, ShieldCheck } from "lucide-react";

const AboutUs = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#fdfdfd] font-tajawal rtl">
      <Helmet>
        <title>من نحن | صناع السعادة - أصل المستورد في مصر</title>
        <meta name="description" content="تعرف على قصة صناع السعادة، وجهتكم الأولى لأجود أنواع الشوكولاتة والحلويات المستوردة وسويس فرو (SWISS FRU) في مصر. فروعنا في القاهرة والإسكندرية في خدمتكم." />
      </Helmet>

      <Header />

      <main className="flex-grow pt-32 pb-20">
        {/* Hero Section */}
        <section className="relative py-20 overflow-hidden">
          <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 -skew-x-12 translate-x-1/2 pointer-events-none" />
          <div className="container mx-auto px-4 md:px-8 text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/20 text-secondary mb-8 animate-fade-in">
              <Star className="h-4 w-4 fill-secondary" />
              <span className="font-black uppercase tracking-widest text-xs">Makers of Happiness Since 2011</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-primary mb-6 leading-tight">
              صناع السعادة <br />
              <span className="text-secondary italic">قصة شغف بالتميز</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              بدأت رحلتنا من إيماننا بأن السعادة تكمن في التفاصيل الصغيرة، وفي قطعة شوكولاتة فاخرة تأخذك في رحلة حول العالم. نحن لسنا مجرد متجر، نحن جسر يربطكم بأشهر المصانع العالمية.
            </p>
          </div>
        </section>

        {/* Stats Grid */}
        <section className="py-12 border-y border-primary/5 bg-white">
          <div className="container mx-auto px-4 md:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { icon: <Store className="h-8 w-8 text-secondary" />, title: "7 فروع", subtitle: "عبر القاهرة والإسكندرية" },
                { icon: <ShoppingBag className="h-8 w-8 text-secondary" />, title: "+150 براند", subtitle: "أرقى الماركات العالمية" },
                { icon: <Users className="h-8 w-8 text-secondary" />, title: "+50,000", subtitle: "عميل سعيد سنوياً" },
                { icon: <ShieldCheck className="h-8 w-8 text-secondary" />, title: "100%", subtitle: "أصالة وجودة مضمونة" }
              ].map((stat, idx) => (
                <div key={idx} className="text-center space-y-3 p-6 rounded-3xl hover:bg-primary/5 transition-all">
                  <div className="bg-secondary/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    {stat.icon}
                  </div>
                  <h3 className="text-3xl font-black text-primary">{stat.title}</h3>
                  <p className="text-sm font-bold text-muted-foreground">{stat.subtitle}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Vision & Mission */}
        <section className="py-24">
          <div className="container mx-auto px-4 md:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="relative group">
                <div className="absolute inset-0 bg-secondary/20 rounded-[3rem] rotate-3 scale-95 blur-2xl group-hover:rotate-6 transition-transform duration-700" />
                <img 
                  src="/assets/logo.png" 
                  alt="Suna Al Saada Experience" 
                  className="relative z-10 w-full rounded-[2.5rem] shadow-2xl border-8 border-white bg-[#f9f9f9]"
                />
              </div>
              <div className="space-y-12">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-primary text-secondary rounded-xl flex items-center justify-center">
                      <Heart className="h-6 w-6" />
                    </div>
                    <h2 className="text-3xl font-black text-primary italic">رؤيتنا</h2>
                  </div>
                  <p className="text-lg text-muted-foreground leading-relaxed font-medium">
                    نسعى لأن نكون المرجع الأول والوحيد في مصر لكل من يبحث عن الجودة الفائقة والتجربة الفريدة في عالم الحلويات المستوردة، مع الالتزام بتوفير أصناف حصرية مثل سويس فرو (SWISS FRU) التي نفخر بكوننا الموزع الأبرز لها.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-primary text-secondary rounded-xl flex items-center justify-center">
                      <BadgeCheck className="h-6 w-6" />
                    </div>
                    <h2 className="text-3xl font-black text-primary italic">رسالتنا</h2>
                  </div>
                  <p className="text-lg text-muted-foreground leading-relaxed font-medium">
                    تقديم منتجات أصلية 100% تأتيكم مباشرة من المصانع العالمية إلى فروعنا، وضمان أفضل قيمة مقابل سعر لموزعينا وعملائنا الكرام في جميع أنحاء الجمهورية.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Our Values */}
        <section className="py-24 bg-primary text-white rounded-[4rem] mx-4 md:mx-8 px-8 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-white/5 -skew-x-12 translate-x-1/2 pointer-events-none" />
          <div className="container mx-auto relative z-10">
            <h2 className="text-4xl font-black mb-16 text-center">قيمنا الأساسية</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
              <div className="space-y-6">
                <div className="h-20 w-20 bg-secondary text-primary rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl">
                  <BadgeCheck className="h-10 w-10" />
                </div>
                <h3 className="text-2xl font-black text-secondary">الجودة المطلقة</h3>
                <p className="text-white/60 font-medium">لا نقبل بأقل من الامتياز في كل منتج يوضع على رفوفنا.</p>
              </div>
              <div className="space-y-6">
                <div className="h-20 w-20 bg-secondary text-primary rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl">
                  <Heart className="h-10 w-10" />
                </div>
                <h3 className="text-2xl font-black text-secondary">الثقة والأصالة</h3>
                <p className="text-white/60 font-medium">كل قطعة عندنا هي "أصل المستورد" ونتعهد دائماً بالصدق مع عملائنا.</p>
              </div>
              <div className="space-y-6">
                <div className="h-20 w-20 bg-secondary text-primary rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl">
                  <MapPin className="h-10 w-10" />
                </div>
                <h3 className="text-2xl font-black text-secondary">القرب منكم</h3>
                <p className="text-white/60 font-medium">نتوسع باستمرارية لنكون دائماً الأقرب إليكم عبر فروعنا في أرقى أحياء مصر.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default AboutUs;
