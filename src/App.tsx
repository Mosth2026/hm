
import React, { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import CategoryPage from "./pages/CategoryPage";
import ProductDetails from "./pages/ProductDetails";
import SearchPage from "./pages/SearchPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderTracking from "./pages/OrderTracking";
import MyOrders from "./pages/MyOrders";
import LoginPage from "./pages/LoginPage";
import AdminDashboard from "./pages/AdminDashboard";
import ThemeToggle from "./components/ThemeToggle";
import WhatsAppWidget from "./components/WhatsAppWidget";
import LuxuryExperience from "./components/LuxuryExperience";
import PremiumDecorations from "./components/PremiumDecorations";
import AnalyticsTracker from "./components/AnalyticsTracker";

try {
  const version = "3.3.4-final";
  if (typeof window !== 'undefined' && localStorage.getItem('site_v') !== version) {
    localStorage.clear();
    localStorage.setItem('site_v', version);
  }
} catch (e) { }

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch() {
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#fdfdfd] p-6 text-center font-tajawal rtl">
          <div className="max-w-md w-full space-y-8 animate-in zoom-in duration-500">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/5 rounded-[3rem] blur-3xl" />
              <div className="relative h-32 w-32 bg-white rounded-[2.5rem] flex items-center justify-center shadow-[0_20px_50px_rgba(0,0,0,0.05)] mx-auto border border-primary/5">
                <div className="h-16 w-16 bg-saada-red/10 rounded-2xl flex items-center justify-center animate-bounce">
                  <svg className="h-8 w-8 text-saada-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h1 className="text-3xl font-black text-primary leading-tight">نعتذر، حدث "صداع" تقني بسيط!</h1>
              <p className="text-muted-foreground font-medium leading-relaxed">
                يبدو أننا واجهنا عقبة صغيرة أثناء تحضير سعادتك. 
                لا تقلق، فريقنا يعمل على إصلاحها الآن.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <Button 
                onClick={() => window.location.reload()} 
                className="bg-primary hover:bg-black text-white rounded-2xl h-14 text-lg font-black shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                تحديث الصفحة واستعادة السعادة
              </Button>
              
              <Button 
                variant="ghost" 
                onClick={() => window.location.href = '/'}
                className="text-primary/60 font-bold hover:bg-primary/5 rounded-2xl h-12"
              >
                العودة للرئيسية
              </Button>
            </div>
            
            <p className="text-[10px] text-muted-foreground/40 font-bold uppercase tracking-widest pt-8 uppercase">
              Saade Makers • Luxury Retail Protection
            </p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

import { BranchProvider } from "./context/BranchContext";
import { useLocation as useRouteLocation } from "react-router-dom";

import FestiveBalloons from "./components/FestiveBalloons";

const ScrollToTop = () => {
  const { pathname } = useRouteLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const App = () => {
  return (
    <ErrorBoundary>
      <BranchProvider>
        <HelmetProvider>
          <QueryClientProvider client={queryClient}>
            <TooltipProvider>
              <Toaster />
              <Sonner position="bottom-right" richColors />
              <BrowserRouter>
                <ScrollToTop />
                <div className="relative min-h-screen bg-background overflow-x-hidden">
                  <FestiveBalloons />
                  <LuxuryExperience />
                  <ThemeToggle />
                  <WhatsAppWidget />
                  <AnalyticsTracker />
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="/products" element={<Index />} />
                    <Route path="/categories/:categoryId" element={<CategoryPage />} />
                    <Route path="/products/:productId" element={<ProductDetails />} />
                    <Route path="/search" element={<SearchPage />} />
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/checkout" element={<CheckoutPage />} />
                    <Route path="/my-orders" element={<MyOrders />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/order-preview/:orderId" element={<OrderTracking />} />
                    <Route path="/order-tracking/:orderId" element={<OrderTracking />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </div>
              </BrowserRouter>
            </TooltipProvider>
          </QueryClientProvider>
        </HelmetProvider>
      </BranchProvider>
    </ErrorBoundary>
  );
};

export default App;
