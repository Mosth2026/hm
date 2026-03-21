
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
        <title>متجر صناع السعادة | أصل المستورد وسويس فرو (SWISS FRU) في مصر</title>
        <meta name="description" content="صناع السعادة (Makers of Happiness) هو المتجر رقم 1 في مصر للشوكولاتة والحلويات المستوردة. توكيل سويس فرو (SWISS FRU)، ليندت، ريتر سبورت، وماركات عالمية في القاهرة والإسكندرية." />
        <meta name="keywords" content="صناع السعادة، صانع السعادة، صناع السعاده، صانع السعاده، سنا صانع السعاده، سويس فرو، سويس فروه، سويس فروة، سويس فروت، SWISS FRU، Swiss Fro، Swiss Fruit، شوكولاتة مستوردة، حلويات مستوردة، ليندت مصر، Lindt Egypt، Ritter Sport، Milka، كاندي مستورد، قهوة مستوردة، جملة حلويات مستوردة، اسكندرية، القاهرة، الرحاب، مدينتي" />

        {/* Global/Geo Tags for Search Dominance */}
        <meta property="description" content="صناع السعادة - متجر الشوكولاتة والحلويات المستوردة (سويس فرو، ليندت Lindt، ريتر سبورت Ritter Sport) في مصر. شيكولاتة، قهوة، كاندي، وسعادة في كل مكان." />

        {/* Global Aliases and Misspellings for Geo-SEO */}
        <meta name="author" content="صناع السعادة - Suna Al Saada" />
        <link rel="canonical" href="https://happinessmakers.online" />

        {/* Open Graph Tags for Social Trust */}
        <meta property="og:title" content="متجر صناع السعادة - أصل المستورد في مصر (سويس فرو)" />
        <meta property="og:description" content="استمتع بأفخم أنواع الشوكولاتة العالمية ومنتجات سويس فرو الأصلية. فروعنا تغطي القاهرة والإسكندرية. متاح جملة وتجزئة." />
        <meta property="og:image" content="https://happinessmakers.online/assets/logo.png" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://happinessmakers.online" />

        {/* Advanced Structured Data for GEO/SEO (Invisible to Users) */}
        <script type="application/ld+json">
          {JSON.stringify([
            {
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "صناع السعادة - Makers of Happiness",
              "alternateName": ["صانع السعادة", "صناع السعاده", "صانع السعاده", "Makers of Happiness", "Happiness Makers", "Saade Makers", "Suna Al Saada"],
              "url": "https://happinessmakers.online",
              "logo": "https://happinessmakers.online/assets/logo.png",
              "description": "Premium imported chocolate and sweets store in Egypt. Specializing in SWISS FRU, Lindt, Ritter Sport, Milka, and luxury brands.",
              "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+201050663539",
                "contactType": "Customer Service",
                "areaServed": "EG",
                "availableLanguage": ["Arabic", "English"]
              },
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "سان ستيفانو ممر عمارة الاوقاف",
                "addressLocality": "Alexandria",
                "addressRegion": "Alexandria",
                "postalCode": "21311",
                "addressCountry": "EG"
              }
            },
            ...[
              { name: "فرع الرحاب", info: "السوق القديم بجانب مكتبة الأوائل", geo: { lat: "30.0594", lng: "31.4287" } },
              { name: "فرع المهندسين", info: "تقاطع شارع شهاب مع شارع سوريا", geo: { lat: "30.0543", lng: "31.2006" } },
              { name: "فرع المعادي 1", info: "82 شارع 9 بجانب بابا جونز", geo: { lat: "29.9602", lng: "31.2625" } },
              { name: "فرع مدينة نصر", info: "63 شارع كابول مكرم عبيد", geo: { lat: "30.0601", lng: "31.3411" } },
              { name: "فرع مصر الجديدة", info: "24 شارع الميرغني امام النادي", geo: { lat: "30.0917", lng: "31.3323" } },
              { name: "فرع اسكندرية", info: "سان ستيفانو ممر عمارة الاوقاف", geo: { lat: "31.2447", lng: "29.9614" } }
            ].map(branch => ({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              "name": `صناع السعادة - ${branch.name}`,
              "image": "https://happinessmakers.online/assets/logo.png",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": branch.info,
                "addressCountry": "EG"
              },
              "geo": {
                "@type": "GeoCoordinates",
                "latitude": branch.geo.lat,
                "longitude": branch.geo.lng
              },
              "url": "https://happinessmakers.online",
              "telephone": "+201050663539",
              "priceRange": "$$"
            }))
          ])}
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
        
        {/* Anti-Gravity SEO/GEO Engine (Hidden Content for Google Indexing) */}
        <section className="sr-only h-0 w-0 overflow-hidden" aria-hidden="true" tabIndex={-1}>
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
