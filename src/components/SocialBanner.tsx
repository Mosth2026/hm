
import { Facebook, Instagram, MessageCircle, Users, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const SocialBanner = () => {
  return (
    <section className="py-12 md:py-16 relative overflow-hidden font-tajawal rtl bg-primary">
      {/* Decorative BG */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-secondary rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-red-600 rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="bg-white/5 backdrop-blur-xl rounded-[3rem] border border-white/10 p-8 md:p-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            <div className="space-y-8 text-right">
              <div className="flex items-center gap-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600/20 text-blue-400 text-xs font-black uppercase tracking-widest border border-blue-600/30">
                  <Facebook className="h-4 w-4" />
                  Facebook Community
                </div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-600/20 text-pink-400 text-xs font-black uppercase tracking-widest border border-pink-600/30">
                  <Instagram className="h-4 w-4" />
                  Instagram Feed
                </div>
              </div>
              <h2 className="text-4xl md:text-6xl font-black text-white leading-tight">
                انضم لأكبر تجمع <br />
                <span className="text-secondary italic">لعشاق السعادة</span> في مصر
              </h2>
              <p className="text-xl text-white/60 font-medium max-w-xl">
                أكثر من 400,000 صديق يشاركوننا شغف اكتشاف أجدد وأفخر أنواع السناكس العالمية. تابعنا لتصلك أحدث العروض الحصرية والمسابقات اليومية.
              </p>
              
              <div className="flex flex-wrap items-center gap-8 pt-4">
                <div className="flex flex-col">
                  <span className="text-3xl font-black text-white tracking-tighter">400K+</span>
                  <span className="text-xs text-white/40 uppercase font-black tracking-widest">Followers</span>
                </div>
                <div className="h-10 w-px bg-white/10" />
                <div className="flex flex-col">
                  <span className="text-3xl font-black text-white tracking-tighter">Daily</span>
                  <span className="text-xs text-white/40 uppercase font-black tracking-widest">Offers</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button 
                  asChild
                  size="lg"
                  className="h-16 px-10 bg-[#1877F2] hover:bg-[#0d65d9] text-white rounded-2xl text-xl font-black shadow-xl shadow-blue-600/20 transition-all hover:scale-105 group"
                >
                  <a href="https://www.facebook.com/share/1HpTkYTqRf/" target="_blank" rel="noopener noreferrer">
                    <Facebook className="ml-3 h-6 w-6 transition-transform group-hover:scale-110" />
                    تابعنا على فيسبوك
                  </a>
                </Button>
                <Button 
                  asChild
                  size="lg"
                  className="h-16 px-10 bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] hover:opacity-90 text-white rounded-2xl text-xl font-black shadow-xl shadow-purple-600/20 transition-all hover:scale-105 group border-0"
                >
                  <a href="https://www.instagram.com/happiness.makers.20?igsh=anRnZ2Mzcmw2Ymdk" target="_blank" rel="noopener noreferrer">
                    <Instagram className="ml-3 h-6 w-6 transition-transform group-hover:scale-110" />
                    تابعنا على انستجرام
                  </a>
                </Button>
              </div>
            </div>

            <div className="relative group lg:block hidden">
                <div className="absolute -inset-4 bg-gradient-to-tr from-blue-600/20 to-secondary/20 rounded-[4rem] blur-2xl group-hover:scale-105 transition-transform duration-700" />
                <div className="relative bg-white rounded-[3.5rem] p-4 shadow-2xl rotate-2 group-hover:rotate-0 transition-all duration-700">
                    <div className="aspect-[4/5] rounded-[2.5rem] overflow-hidden relative">
                         <img 
                            src="/assets/social-joy.png"
                            alt="Suna Al Saada Community" 
                            className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700"
                            loading="lazy"
                         />
                         <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                         
                         <div className="absolute bottom-8 left-8 right-8 bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/20">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 bg-secondary rounded-full flex items-center justify-center text-primary shadow-lg">
                                    <Users className="h-6 w-6" />
                                </div>
                                <div className="text-white">
                                    <p className="font-black text-lg leading-none">مجتمع صناع السعادة</p>
                                    <p className="text-xs font-bold text-white/70 mt-1">نشط الآن على مدار الساعة</p>
                                </div>
                            </div>
                         </div>
                    </div>
                </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default SocialBanner;

