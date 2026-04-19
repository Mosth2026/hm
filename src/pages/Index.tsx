
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
import WhatsAppWidget from "@/components/WhatsAppWidget";

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
    <div className="min-h-screen flex flex-col font-tajawal rtl" dir="rtl">
      <Helmet>
        <title>متجر صناع السعادة | أصل المستورد في مصر</title>
      </Helmet>

      <Header />
      
      <main className="flex-grow pt-20">
        {layoutMode === 'original' ? (
          <div className="animate-in fade-in duration-700">
            <Hero />
            <div className="container mx-auto px-4 py-8">
              <h2 className="text-3xl font-black text-primary mb-8 text-center italic">أقسامنا الرئيسية</h2>
              <CategoryGrid />
            </div>
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
    </div>
  );
};

export default Index;
