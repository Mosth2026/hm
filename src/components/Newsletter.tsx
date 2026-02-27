
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";
import { Send, Mail, Sparkles } from "lucide-react";

const Newsletter = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      toast.success("تم الاشتراك بنجاح! مرحباً بك في عالم السعادة.", {
        style: { background: 'var(--primary)', color: 'white', borderRadius: '1rem' }
      });
      setEmail("");
      setLoading(false);
    }, 1200);
  };

  return (
    <section className="py-24 relative overflow-hidden font-tajawal rtl bg-stone-50/50">
      <div className="container mx-auto px-4 md:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="relative bg-primary rounded-[3rem] p-8 md:p-16 overflow-hidden shadow-2xl hover:shadow-[0_40px_80px_-20px_rgba(34,35,25,0.4)] transition-all duration-700">
            {/* Decorative background */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="text-right space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/20 text-secondary text-[10px] font-black uppercase tracking-[0.2em]">
                  <Sparkles className="h-3 w-3" />
                  The Inner Circle
                </div>
                <h2 className="text-3xl md:text-5xl font-black text-white leading-tight">
                  كن أول من يعيش <br />
                  <span className="text-secondary italic">تجربة السعادة</span> الجديدة
                </h2>
                <p className="text-white/70 text-lg font-medium">
                  اشترك في نشرتنا الحصرية ليصلك جديدنا من نكهات الشوكولاتة والقهوة العالمية، وعروضنا الاستثنائية.
                </p>
              </div>

              <div className="bg-white/5 backdrop-blur-md p-2 rounded-[2.5rem] border border-white/10 shadow-2xl">
                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-grow group">
                    <Mail className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/50 group-focus-within:text-secondary transition-colors" />
                    <Input
                      type="email"
                      placeholder="بريدك الإلكتروني الراقي"
                      className="h-16 pr-12 bg-white/10 border-white/10 text-white placeholder:text-white/30 rounded-2xl focus:ring-secondary focus:border-secondary transition-all text-lg font-bold"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="h-16 px-10 bg-secondary hover:bg-white hover:text-primary text-primary rounded-2xl text-lg font-black transition-all active:scale-95 shadow-xl shadow-secondary/20 group"
                    disabled={loading}
                  >
                    {loading ? "جاري الحفظ..." : (
                      <>
                        انضم إلينا
                        <Send className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
                      </>
                    )}
                  </Button>
                </form>
                <p className="text-[10px] text-white/40 mt-4 text-center font-bold font-outfit uppercase tracking-widest">
                  Privacy Guaranteed • No Spam • Luxury Quality Only
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
