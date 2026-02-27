
import { useEffect, useState } from "react";
import { User, Quote, Star } from "lucide-react";
import { cn } from "@/lib/utils";

const testimonials = [
  {
    id: 1,
    name: "م. كريم الشافعي",
    role: "عاشق للسفر",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=60",
    text: "كنت دايماً بجيب الشوكولاتة دي معايا من أوروبا، بجد انبهت لما لقيتها هنا بنفس الجودة والاهتمام. صناع السعادة رجعولي أجمل ذكريات السفر.",
    rating: 5,
  },
  {
    id: 2,
    name: "سارة محمود",
    role: "سيدة أعمال",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=60",
    text: "الرقي في التعامل والدقة في انتقاء البراندات العالمية هو اللي بيميزهم. التغليف والتقديم فعلاً هدية تشرف لأي حد.",
    rating: 5,
  },
  {
    id: 3,
    name: "د. هاني يوسف",
    role: "عميل دائم",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=60",
    text: "كنت فاكر إني مش هلاقي المنتجات دي غير بره مصر، بس 'صناع السعادة' وفروا علينا كتير باختياراتهم اللي دايمًا بتصيب الهدف. منتهى الفخامة.",
    rating: 5,
  }
];

const Testimonials = () => {
  return (
    <section className="py-24 bg-primary text-white font-tajawal rtl relative overflow-hidden">
      {/* Background Texture */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none"
        style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/carbon-fibre.png")' }} />

      <div className="container mx-auto px-4 md:px-8 relative z-10">
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/20 border border-secondary/30 text-secondary text-xs font-black uppercase tracking-widest">
            <Quote className="h-4 w-4" />
            Client Success Stories
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight">
            ماذا يقول <span className="text-secondary italic">عشاق السعادة</span>؟
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, idx) => (
            <div
              key={t.id}
              className="group relative bg-white/10 backdrop-blur-xl p-8 rounded-[3rem] border border-white/10 transition-all duration-500 hover:bg-white/15 hover:-translate-y-4 shadow-2xl"
            >
              <div className="mb-8 relative shrink-0">
                <div className="absolute -inset-2 bg-secondary/30 rounded-full blur animate-pulse group-hover:bg-secondary/50 transition-colors" />
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="relative w-24 h-24 rounded-full object-cover border-4 border-white mx-auto shadow-2xl"
                />
                <div className="absolute -bottom-2 -left-2 h-10 w-10 bg-secondary rounded-full flex items-center justify-center border-4 border-primary">
                  <Quote className="h-4 w-4 text-primary fill-primary" />
                </div>
              </div>

              <div className="space-y-6 text-center">
                <div className="flex justify-center gap-1">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-secondary text-secondary" />
                  ))}
                </div>

                <p className="text-lg font-medium leading-relaxed italic text-gray-100">
                  "{t.text}"
                </p>

                <div className="pt-6 border-t border-white/10">
                  <h4 className="text-xl font-black text-secondary">{t.name}</h4>
                  <p className="text-sm text-white/50 font-bold uppercase tracking-wider">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
