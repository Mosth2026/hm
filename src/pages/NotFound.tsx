
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="flex flex-col min-h-screen font-tajawal rtl">
      <Header />
      <main className="flex-grow flex items-center justify-center bg-gray-50 pt-36 md:pt-44 pb-20">
        <div className="text-center px-4">
          <h1 className="text-8xl font-bold text-saada-red mb-4">404</h1>
          <p className="text-2xl text-saada-brown mb-8">عذراً، الصفحة التي تبحث عنها غير موجودة</p>
          <Button asChild className="bg-saada-red hover:bg-saada-brown text-white px-8 py-6 text-lg">
            <Link to="/">العودة للصفحة الرئيسية</Link>
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NotFound;
