
import React, { useState, useEffect } from "react";
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
import { LayoutGrid, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

const Index = () => {
  const [layoutMode, setLayoutMode] = useState<'premium' | 'fast'>('premium');

  useEffect(() => {
    const savedMode = localStorage.getItem('saada_layout_mode');
    if (savedMode === 'premium' || savedMode === 'fast') {
      setLayoutMode(savedMode);
    }
  }, []);

  const toggleLayout = (mode: 'premium' | 'fast') => {
    setLayoutMode(mode);
    localStorage.setItem('saada_layout_mode', mode);
  };

  return (
    <>
      <Helmet>
        <title>متجر صناع السعادة | أصل المستورد وسويس فرو (SWISS FRU) في مصر</title>
        <meta name="description" content="صناع السعادة (Makers of Happiness) هو المتجر رقم 1 في مصر للشوكولاتة والحلويات المستوردة. توكيل سويس فرو (SWISS FRU)، ليندت، ريتر سبورت، وماركات عالمية في القاهرة والإسكندرية." />
        <meta name="keywords" content="صناع السعادة، صانع السعادة، صناع السعاده، صانع السعاده، سنا صانع السعاده، سويس فرو، سويس فروه، سويس فروة، سويس فروت، SWISS FRU، Swiss Fro، Swiss Fruit، شوكولاتة مستوردة، حلويات مستوردة، ليندت مصر، Lindt Egypt، Ritter Sport، Milka، كاندي مستورد، قهوة مستوردة، جملة حلويات مستوردة، اسكندرية، القاهرة، الرحاب، مدينتي" />
      </Helmet>

      <div className="min-h-screen flex flex-col relative z-10 font-tajawal rtl" dir="rtl">
        <Header />
        
        {/* Modern Layout Switcher - Moved to Top to avoid WhatsApp area overlap */}
        <div className="absolute top-24 left-6 md:top-32 md:left-10 z-[50] animate-in fade-in slide-in-from-left-10 duration-1000">
           <div className="bg-white/80 backdrop-blur-xl p-1.5 rounded-full shadow-2xl border border-primary/5 flex gap-1 items-center shadow-primary/20 hover:scale-105 transition-all duration-500">
              <Button 
                onClick={() => toggleLayout('premium')}
                className={`h-10 w-10 md:h-12 md:w-auto md:px-4 rounded-full transition-all duration-500 font-black text-xs gap-2 ${
                  layoutMode === 'premium' ? 'bg-primary text-white shadow-xl shadow-primary/30' : 'bg-transparent text-primary/40 hover:bg-primary/5'
                }`}
              >
                <LayoutGrid className="h-4 w-4" />
                <span className="hidden md:inline">العرض الكلاسيكي</span>
              </Button>
              <Button 
                onClick={() => toggleLayout('fast')}
                className={`h-10 w-10 md:h-12 md:w-auto md:px-4 rounded-full transition-all duration-500 font-black text-xs gap-2 ${
                  layoutMode === 'fast' ? 'bg-saada-red text-white shadow-xl shadow-saada-red/30' : 'bg-transparent text-saada-red/40 hover:bg-saada-red/5'
                }`}
              >
                <Zap className="h-4 w-4" />
                <span className="hidden md:inline">التصفح السريع</span>
              </Button>
           </div>
        </div>

        <main className="flex-grow">
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
