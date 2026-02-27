
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
import { Helmet } from "react-helmet-async";

const Index = () => {
  return (
    <>
      <Helmet>
        <title>صناع السعادة | أرقى المنتجات العالمية في مصر</title>
        <meta name="description" content="وجهتك الأولى لأفخر أنواع الشوكولاتة، القهوة المختصة، والسناكس العالمية. نأتي لك بجودة عواصم العالم إلى باب منزلك في مصر." />
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
          <Testimonials />
          <Newsletter />
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Index;
