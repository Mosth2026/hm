
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import FeaturedProducts from "@/components/FeaturedProducts";
import Features from "@/components/Features";
import Testimonials from "@/components/Testimonials";
import Newsletter from "@/components/Newsletter";
import LuxuryExperience from "@/components/LuxuryExperience";
import LifestyleCollections from "@/components/LifestyleCollections";
import TrustBanner from "@/components/TrustBanner";
import SocialBanner from "@/components/SocialBanner";
import { Helmet } from "react-helmet-async";

const Index = () => {
  return (
    <>
      <Helmet>
        <title>صناع السعادة | أكبر تشكيلة منتجات عالمية في مصر</title>
        <meta name="description" content="صناع السعادة (Sana'a Al-Saada) وجهتك الأولى لأفخر أنواع الشوكولاتة، الكاندي، القهوة، والسناكس المستوردة. فروعنا في القاهرة والإسكندرية تخدمكم بأفضل الماركات العالمية." />
      </Helmet>

      <LuxuryExperience />

      <div className="min-h-screen flex flex-col relative z-10">
        <Header />
        <main className="flex-grow">
          <Hero />
          <TrustBanner />
          <LifestyleCollections />
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
