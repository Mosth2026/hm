
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
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
import WhatsAppWidget from "@/components/WhatsAppWidget";

type LayoutMode = 'original' | 'premium' | 'fast';
const ALL_MODES: LayoutMode[] = ['original', 'premium', 'fast'];

const Index = () => {
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('original');
  const [enabledLayouts, setEnabledLayouts] = useState<LayoutMode[]>(['original']);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const fetchGlobalSettings = async () => {
      try {
        // 1. Fetch enabled layouts from DB
        const { data: dbSettings } = await supabase
          .from('store_settings')
          .select('value')
          .eq('key', 'enabled_layouts')
          .single();

        let enabled = ['original', 'premium', 'fast'] as LayoutMode[];
        
        if (dbSettings && Array.isArray(dbSettings.value)) {
          enabled = dbSettings.value as LayoutMode[];
        } else {
          // Fallback to localStorage if DB fetch fails
          const saved = localStorage.getItem('saada_enabled_layouts');
          if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed)) enabled = parsed.filter(m => ALL_MODES.includes(m));
          }
        }
        
        setEnabledLayouts(enabled);

        // 2. Determine initial mode
        const savedMode = localStorage.getItem('saada_layout_mode') as LayoutMode;
        if (savedMode && enabled.includes(savedMode)) {
          setLayoutMode(savedMode);
        } else {
          // Default to first available layout from DB (prioritize original)
          const defaultMode = enabled.includes('original') ? 'original' : (enabled[0] || 'original');
          setLayoutMode(defaultMode);
        }
      } catch (e) {
        console.error("Settings fetch error:", e);
      } finally {
        setIsReady(true);
      }
    };

    fetchGlobalSettings();
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
    <div className="min-h-screen flex flex-col font-tajawal rtl" dir="rtl">
      <Helmet>
        <title>متجر صناع السعادة | أصل المستورد في مصر</title>
      </Helmet>

      <Header />
      
      <main className="flex-grow pt-20">
        {layoutMode === 'original' ? (
          <div className="animate-in fade-in duration-700">
            <Hero />
            <FeaturedProducts showAll />
            <Features />
            <SocialBanner />
            <Testimonials />
            <Newsletter />
          </div>
        ) : (
          <div className="animate-in fade-in duration-700">
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
          </div>
        )}
      </main>

      <Footer />
      <WhatsAppWidget />

      {/* Floating Layout Switcher Pill - Professional UI */}
      {enabledLayouts.length > 1 && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[90] animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-1000">
          <div className="bg-white/80 backdrop-blur-2xl border border-primary/10 p-1.5 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.15)] flex items-center gap-1">
            {enabledLayouts.includes('original') && (
              <button
                onClick={() => toggleLayout('original')}
                className={cn(
                  "px-6 py-2.5 rounded-full text-xs font-black transition-all flex items-center gap-2",
                  layoutMode === 'original' 
                    ? "bg-primary text-white shadow-lg scale-105" 
                    : "text-primary/40 hover:text-primary hover:bg-primary/5"
                )}
              >
                <Home className="h-3.5 w-3.5" />
                <span>الوضع الأصلي</span>
              </button>
            )}
            {enabledLayouts.includes('premium') && (
              <button
                onClick={() => toggleLayout('premium')}
                className={cn(
                  "px-6 py-2.5 rounded-full text-xs font-black transition-all flex items-center gap-2",
                  layoutMode === 'premium' 
                    ? "bg-secondary text-primary shadow-lg scale-105" 
                    : "text-primary/40 hover:text-secondary hover:bg-secondary/5"
                )}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                <span>كلاسيك</span>
              </button>
            )}
            {enabledLayouts.includes('fast') && (
              <button
                onClick={() => toggleLayout('fast')}
                className={cn(
                  "px-6 py-2.5 rounded-full text-xs font-black transition-all flex items-center gap-2",
                  layoutMode === 'fast' 
                    ? "bg-saada-red text-white shadow-lg scale-105" 
                    : "text-primary/40 hover:text-saada-red hover:bg-saada-red/5"
                )}
              >
                <Zap className="h-3.5 w-3.5" />
                <span>تصفح سريع</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
