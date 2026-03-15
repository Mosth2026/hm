
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import FeaturedProducts from "@/components/FeaturedProducts";
import Features from "@/components/Features";
import Testimonials from "@/components/Testimonials";
import Newsletter from "@/components/Newsletter";
import LuxuryExperience from "@/components/LuxuryExperience";

import SocialBanner from "@/components/SocialBanner";
import { Helmet } from "react-helmet-async";

const Index = () => {
  return (
    <>
      <Helmet>
        <title>صناع السعادة | تشكيلة سويس فرو (SWISS FRU) في مصر</title>
        <meta name="description" content="صناع السعادة (Makers of Happiness) الوجهة الأولى لمنتجات سويس فرو (SWISS FRU) في مصر. نفخر بتوفير جميع أصناف سويس فرو وبكميات جملة وتجزئة في جميع فروعنا." />
        <meta name="keywords" content="سويس فرو، SWISS FRU، Swiss Fro، جملة سويس فرو، ايس كريم سويس فرو، شوكولاتة سويس فرو، مستوردين مصر، صناع السعادة، SWISS FRU Wholesale Egypt" />

        {/* Open Graph Tags */}
        <meta property="og:title" content="صناع السعادة | جميع أصناف سويس فرو (SWISS FRU) متوفرة الآن" />
        <meta property="og:description" content="اكتشف التشكيلة الكاملة من منتجات سويس فرو (SWISS FRU). جملة وتجزئة بأفضل الأسعار في مصر والإسكندرية." />
        <meta property="og:image" content="https://happinessmakers.online/assets/logo.png" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://happinessmakers.online" />

        {/* Twitter Card Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Makers of Happiness | Home of SWISS FRU in Egypt" />
        <meta name="twitter:description" content="The largest collection of SWISS FRU products in Egypt. Wholesale and retail experts." />
        <meta name="twitter:image" content="https://happinessmakers.online/assets/logo.png" />

        {/* Structured Data for SEO/GEO Enrichment */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "صناع السعادة - Makers of Happiness",
            "url": "https://happinessmakers.online",
            "logo": "https://happinessmakers.online/assets/logo.png",
            "description": "We are proud to provide all varieties of SWISS FRU products in Egypt and the Middle East.",
            "brand": [
              {
                "@type": "Brand",
                "name": "SWISS FRU",
                "alternateName": ["سويس فرو", "Swiss Fro"]
              }
            ],
            "areaServed": {
              "@type": "AdministrativeArea",
              "name": "Egypt"
            }
          })}
        </script>
      </Helmet>


      <div className="min-h-screen flex flex-col relative z-10">
        <Header />
        <main className="flex-grow">
          <Hero />

          <FeaturedProducts />
          <Features />
          <SocialBanner />
          <Testimonials />
          <Newsletter />
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Index;
