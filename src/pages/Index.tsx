
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import FeaturedProducts from "@/components/FeaturedProducts";
import Features from "@/components/Features";
import Testimonials from "@/components/Testimonials";
import Newsletter from "@/components/Newsletter";
import LuxuryExperience from "@/components/LuxuryExperience";
import TrustBanner from "@/components/TrustBanner";
import SocialBanner from "@/components/SocialBanner";
import { Helmet } from "react-helmet-async";

const Index = () => {
  return (
    <>
      <Helmet>
        <title>صناع السعادة | أكبر تشكيلة منتجات عالمية في مصر</title>
        <meta name="description" content="صناع السعادة (Sana'a Al-Saada) وجهتك الأولى لأفخر أنواع الشوكولاتة، الكاندي، القهوة، والسناكس المستوردة. فروعنا في القاهرة والإسكندرية تخدمكم بأفضل الماركات العالمية." />

        {/* Open Graph Tags */}
        <meta property="og:title" content="صناع السعادة | أكبر تشكيلة منتجات عالمية في مصر" />
        <meta property="og:description" content="وجهتك الأولى لأفخر أنواع الشوكولاتة، الكاندي، القهوة، والسناكس المستوردة." />
        <meta property="og:image" content="https://happinessmakers.online/assets/logo.png" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://happinessmakers.online" />

        {/* Twitter Card Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="صناع السعادة | أكبر تشكيلة منتجات عالمية في مصر" />
        <meta name="twitter:description" content="وجهتك الأولى لأفخر أنواع الشوكولاتة، الكاندي، القهوة، والسناكس المستوردة." />
        <meta name="twitter:image" content="https://happinessmakers.online/assets/logo.png" />
      </Helmet>


      <div className="min-h-screen flex flex-col relative z-10">
        <Header />
        <main className="flex-grow">
          <Hero />
          <TrustBanner />
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
