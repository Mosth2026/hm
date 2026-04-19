
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import CategoryGrid from "@/components/CategoryGrid";
import FastCategories from "@/components/FastCategories";
import PromotionCarousel from "@/components/PromotionCarousel";
import FeaturedProducts from "@/components/FeaturedProducts";
import Features from "@/components/Features";
import Testimonials from "@/components/Testimonials";
import Newsletter from "@/components/Newsletter";
import SwissFruSection from "@/components/SwissFruSection";
import LifestyleCollections from "@/components/LifestyleCollections";
import SocialBanner from "@/components/SocialBanner";
import { Helmet } from "react-helmet-async";
import { LayoutGrid, Zap, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

type LayoutMode = 'original' | 'premium' | 'fast';
const ALL_MODES: LayoutMode[] = ['original', 'premium', 'fast'];

const Index = () => {
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('original');
  const [enabledLayouts, setEnabledLayouts] = useState<LayoutMode[]>(['original']);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      // Read enabled layouts from admin settings
      let enabled: LayoutMode[] = ['original'];
      const savedEnabled = localStorage.getItem('saada_enabled_layouts');
      if (savedEnabled) {
        const parsed = JSON.parse(savedEnabled);
        if (Array.isArray(parsed) && parsed.length > 0) {
          enabled = parsed.filter((m: string) => ALL_MODES.includes(m as LayoutMode)) as LayoutMode[];
        }
      }
      
      if (enabled.length === 0) enabled = ['original'];
      setEnabledLayouts(enabled);

      // Read saved layout mode
      const savedMode = localStorage.getItem('saada_layout_mode') as LayoutMode | null;
      if (savedMode && enabled.includes(savedMode)) {
        setLayoutMode(savedMode);
      } else {
        setLayoutMode('original'); // Always safe fallback
      }
    } catch (err) {
      console.error("Layout initialization error:", err);
      setEnabledLayouts(['original']);
      setLayoutMode('original');
    } finally {
      setIsReady(true);
    }
  }, []);

  const toggleLayout = (mode: LayoutMode) => {
    setLayoutMode(mode);
    localStorage.setItem('saada_layout_mode', mode);
  };

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white font-tajawal rtl">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 border-4 border-primary/10 border-t-secondary animate-spin rounded-full" />
          <p className="text-primary font-bold animate-pulse">جاري تحضير تجربة سعيدة...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>متجر صناع السعادة | أصل المستورد وسويس فرو (SWISS FRU) في مصر</title>
        <meta name="description" content="صناع السعادة (Makers of Happiness) هو المتجر رقم 1 في مصر للشوكولاتة والحلويات المستوردة. توكيل سويس فرو (SWISS FRU)، ليندت، ريتر سبورت، وماركات عالمية في القاهرة والإسكندرية." />
        <meta name="keywords" content="صناع السعادة، صانع السعادة، صناع السعاده، صانع السعاده، سنا صانع السعاده، سويس فرو، سويس فروه، سويس فروة، سويس فروت، SWISS FRU، Swiss Fro، Swiss Fruit، شوكولاتة مستوردة، حلويات مستوردة، ليندت مصر، Lindt Egypt، Ritter Sport، Milka، كاندي مستورد، قهوة مستوردة، جملة حلويات مستوردة، اسكندرية، القاهرة، الرحاب، مدينتي" />
      </Helmet>

      <div className="min-h-screen flex flex-col relative z-10 font-tajawal rtl" dir="rtl">
        <Header />
        
        {/* Layout Switcher — only renders when 2+ modes are enabled by admin */}
        {enabledLayouts.length > 1 && (
          <div className="absolute top-24 left-6 md:top-32 md:left-10 z-[50] animate-in fade-in slide-in-from-left-10 duration-1000">
            <div className="bg-white/80 backdrop-blur-xl p-1.5 rounded-full shadow-2xl border border-primary/5 flex gap-1 items-center shadow-primary/20 hover:scale-105 transition-all duration-500">
              {enabledLayouts.map(modeId => {
                const mode = ALL_MODES.find(m => m === modeId);
                if (!mode) return null;
                
                const isSelected = layoutMode === modeId;
                const label = modeId === 'original' ? 'الوضع الأصلي' : modeId === 'premium' ? 'العرض الكلاسيكي' : 'التصفح السريع';
                const Icon = modeId === 'original' ? Home : modeId === 'premium' ? LayoutGrid : Zap;
                const activeColor = modeId === 'original' ? 'bg-amber-600 shadow-amber-600/30' : modeId === 'premium' ? 'bg-primary shadow-primary/30' : 'bg-saada-red shadow-saada-red/30';
                const textColor = modeId === 'original' ? 'text-amber-600' : modeId === 'premium' ? 'text-primary' : 'text-saada-red';

                return (
                  <Button
                    key={modeId}
                    onClick={() => toggleLayout(modeId)}
                    className={`h-10 w-10 md:h-12 md:w-auto md:px-4 rounded-full transition-all duration-500 font-black text-xs gap-2 ${
                      isSelected ? `${activeColor} text-white shadow-xl` : `bg-transparent ${textColor}/40 hover:bg-gray-100`
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden md:inline">{label}</span>
                  </Button>
                );
              })}
            </div>
          </div>
        )}

        <main className="flex-grow">
          {layoutMode === 'original' ? (
            <>
              <Hero />
              <div className="container mx-auto px-4 py-8">
                <h2 className="text-3xl font-black text-primary mb-8 text-center">أقسامنا الرئيسية</h2>
                <CategoryGrid />
              </div>
              <FeaturedProducts showAll />
              <Features />
              <SocialBanner />
              <Testimonials />
              <Newsletter />
            </>
          ) : (
            <>
              <PromotionCarousel />
              {layoutMode === 'premium' ? (
                <>
                  <Hero />
                  <CategoryGrid />
                </>
              ) : (
                <FastCategories />
              )}
              <SwissFruSection />
              <LifestyleCollections />
              <FeaturedProducts />
              <Features />
              <SocialBanner />
              <Testimonials />
              <Newsletter />
            </>
          )}
        </main>
        <Footer />
        
        {/* Anti-Gravity SEO Engine */}
        <section className="sr-only h-0 w-0 overflow-hidden" aria-hidden="true">
          <h2>صناع السعادة - صانع السعاده - متجر الشوكولاتة والحلويات المستوردة</h2>
          <p>
            شوكلاته مستورده، حلويات مستورده، سويس فرو، SWISS FRU، سويس فروه، سويس فروة، سويس فروت، Swiss Fruit، Swiss Fro، 
            Lindt Egypt، Ritter Sport Egypt، Milka Egypt، Lotus Biscoff، Nutella، مالتيزر، كيندر، 
            صناع السعادة القاهرة، صناع السعادة اسكندرية، فرع الرحاب، فرع المهندسين، فرع المعادي، فرع مدينة نصر، فرع مصر الجديدة، فرع سان ستيفانو، 
            جملة حلويات مستوردة، توكيل سويس فرو، موزعين سويس فرو، سعادة، صانع السعادة اليكس، Happiness Makers، Suna Al Saada، Sunaa Elsaada.
          </p>
        </section>
      </div>
    </>
  );
};

export default Index;
