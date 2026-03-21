
import { Link } from "react-router-dom";
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin, ExternalLink, ShieldCheck, MessageCircle } from "lucide-react";
import { SITE_CONFIG } from "@/lib/constants";

const Footer = () => {
  return (
    <footer className="relative bg-primary text-white font-tajawal rtl pt-24 pb-12 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-secondary/5 -skew-x-12 translate-x-1/2 pointer-events-none" />

      <div className="container mx-auto px-4 md:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 md:gap-16 mb-20">

          {/* Brand Section */}
          <div className="space-y-6 md:space-y-8 text-center md:text-right">
            <Link to="/" className="inline-block transition-transform hover:scale-105 duration-500">
              <img
                src="/assets/logo.png"
                alt="Suna Al-Saada"
                className="h-20 md:h-28 mx-auto md:mx-0 object-contain"
              />
            </Link>
            <p className="text-white/60 text-base md:text-lg leading-relaxed font-medium">
              نفخر في صناع السعادة بتوفير جميع أصناف سويس فرو (SWISS FRU) وبكميات في جميع فروعنا بالجملة والتجزئة، لنقدم لكم دائماً أصل المستورد وأجود الماركات العالمية.
            </p>
            <div className="flex items-center justify-center md:justify-start gap-4">
              <a
                href="https://www.facebook.com/share/1HpTkYTqRf/"
                target="_blank"
                rel="noopener noreferrer"
                className="h-11 w-11 md:h-12 md:w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-secondary hover:text-primary hover:-translate-y-2 transition-all duration-500"
              >
                <Facebook className="h-5 w-5 md:h-6 md:w-6" />
              </a>
              <a
                href="https://www.instagram.com/happiness.makers.20?igsh=anRnZ2Mzcmw2Ymdk"
                target="_blank"
                rel="noopener noreferrer"
                className="h-11 w-11 md:h-12 md:w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-secondary hover:text-primary hover:-translate-y-2 transition-all duration-500"
              >
                <Instagram className="h-5 w-5 md:h-6 md:w-6" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6 md:space-y-8 text-center md:text-right">
            <h3 className="text-xl md:text-2xl font-black text-secondary uppercase tracking-widest font-outfit">Sitemap</h3>
            <ul className="space-y-3 md:space-y-4">
              {[
                { label: 'الرئيسية', path: '/' },
                { label: 'المنتجات', path: '/categories/chocolate' },
                { label: 'من نحن', path: '/#about' },
                { label: 'اتصل بنا', path: '#contact' },
                { label: 'لوحة التحكم', path: '/admin' }
              ].map((item, idx) => (
                <li key={idx}>
                  <Link
                    to={item.path}
                    className="text-white/60 hover:text-white flex items-center justify-center md:justify-start gap-2 group transition-all font-bold"
                  >
                    <div className="h-1.5 w-1.5 rounded-full bg-secondary scale-0 group-hover:scale-100 transition-transform" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div className="space-y-6 md:space-y-8 text-center md:text-right">
            <h3 className="text-xl md:text-2xl font-black text-secondary uppercase tracking-widest font-outfit">Luxuries</h3>
            <ul className="space-y-3 md:space-y-4">
              {['الشوكولاتة', 'القهوة', 'المشروبات', 'الكوكيز والبسكويت', 'الكاندي', 'الاسناكس', 'مستحضرات التجميل'].map((item, idx) => (
                <li key={idx}>
                  <Link
                    to={`/categories/${['chocolate', 'coffee', 'drinks', 'cookies', 'candy', 'snacks', 'cosmetics'][idx]}`}
                    className="text-white/60 hover:text-white flex items-center justify-center md:justify-start gap-2 group transition-all font-bold"
                  >
                    <div className="h-1.5 w-1.5 rounded-full bg-secondary scale-0 group-hover:scale-100 transition-transform" />
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-6 md:space-y-8 text-center md:text-right">
            <h3 className="text-xl md:text-2xl font-black text-secondary uppercase tracking-widest font-outfit">Contact</h3>
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-4">
                <div className="h-11 w-11 md:h-12 md:w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                  <MapPin className="h-5 w-5 md:h-6 md:w-6 text-secondary" />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-white/40 font-black uppercase tracking-widest">Office</p>
                  <p className="font-bold text-sm md:text-base">{SITE_CONFIG.address}</p>
                </div>
              </div>
              <div className="flex flex-col md:flex-row items-center md:items-start gap-4">
                <div className="h-11 w-11 md:h-12 md:w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-secondary">
                  <Phone className="h-5 w-5 md:h-6 md:w-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-white/40 font-black uppercase tracking-widest">Phone</p>
                  <p className="font-bold text-sm md:text-base underline decoration-secondary/30 hover:decoration-secondary transition-all">{SITE_CONFIG.officePhone}</p>
                </div>
              </div>

              <a href={`https://wa.me/${SITE_CONFIG.whatsappNumber}`} target="_blank" rel="noopener noreferrer" className="flex flex-col md:flex-row items-center md:items-start gap-4 group/wa transition-transform hover:translate-x-2">
                <div className="h-11 w-11 md:h-12 md:w-12 rounded-2xl bg-[#25D366]/10 border border-[#25D366]/20 flex items-center justify-center shrink-0 text-[#25D366]">
                  <MessageCircle className="h-5 w-5 md:h-6 md:w-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-white/40 font-black uppercase tracking-widest">WhatsApp</p>
                  <p className="font-bold text-sm md:text-base text-[#25D366]">{SITE_CONFIG.phoneNumber}</p>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* Branches Section - FULL WIDTH on Desktop for balance */}
        <div id="contact" className="pt-16 border-t border-white/5 mb-20 text-center md:text-right">
          <h3 className="text-xl md:text-2xl font-black text-secondary uppercase tracking-widest font-outfit mb-8">Our Branches</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8 lg:gap-16">
            {[
              { name: "فرع الرحاب", info: "السوق القديم بجانب مكتبة الأوائل", phone: "01050005701", map: "https://maps.app.goo.gl/atDFtjPyawmjVF2f7" },
              { name: "فرع المهندسين", info: "تقاطع شارع شهاب مع شارع سوريا", phone: "01050663537", map: "https://maps.app.goo.gl/n8ZGWeHtxUBbdA497" },
              { name: "فرع المعادي 1", info: "82 شارع 9 بجانب بابا جونز", phone: "01050663538", map: "https://maps.app.goo.gl/1QEZhey61yARYkai6" },
              { name: "فرع المعادي 2", info: "49 شارع 9 المعادي", phone: "01050006956", map: "https://maps.app.goo.gl/gqYx3aiy9VbaJWD28" },
              { name: "فرع مدينة نصر", info: "63 شارع كابول مكرم عبيد", phone: "01050006929", map: "https://maps.app.goo.gl/xEoTtekT3Yii3Rag9" },
              { name: "فرع مصر الجديدة", info: "24 شارع الميرغني امام النادي", phone: "01050006946", map: "https://maps.app.goo.gl/52u6nSZCBhzigG2v5" },
              { name: "فرع اسكندرية", info: "سان ستيفانو ممر عمارة الاوقاف", phone: "01050663539", map: "https://maps.app.goo.gl/GzcPvygy4inj9dbj7" },
            ].map((branch, idx) => (
              <div key={idx} className="space-y-1 bg-white/5 p-4 rounded-2xl md:bg-transparent md:p-0">
                <div className="flex items-center justify-center md:justify-start gap-2 text-secondary">
                  <MapPin className="h-4 w-4" />
                  <span className="font-bold">{branch.name}</span>
                </div>
                <p className="text-[11px] text-white/50 leading-tight">{branch.info}</p>
                <div className="flex items-center justify-center md:justify-start gap-4 text-[10px] font-black uppercase tracking-tighter mt-1">
                  <a href={`tel:${branch.phone}`} className="text-white/40 hover:text-white transition-colors">{branch.phone}</a>
                  <a href={branch.map} target="_blank" rel="noopener noreferrer" className="text-secondary/60 hover:text-secondary flex items-center gap-1">
                    <ExternalLink className="h-3 w-3" />
                    الموقع
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8 text-white/40 font-bold text-xs md:text-sm text-center md:text-right">
          <p>© {new Date().getFullYear()} Suna Al-Saada. Created with Passion by Excellence Team.</p>
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8">
            <Link to="#" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="#" className="hover:text-white transition-colors">Terms of Service</Link>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10 text-white/60">
              <ShieldCheck className="h-4 w-4 text-green-500" />
              <span>Secured Checkout</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
