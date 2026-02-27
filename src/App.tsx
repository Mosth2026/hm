
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

import AdminDashboard from "./pages/AdminDashboard";
import ThemeToggle from "./components/ThemeToggle";
import WhatsAppWidget from "./components/WhatsAppWidget";
import LuxuryExperience from "./components/LuxuryExperience";
import PremiumDecorations from "./components/PremiumDecorations";

// Forced cleanup for multiple account conflicts
try {
  const version = "3.2.2-luxury";
  if (typeof window !== 'undefined' && localStorage.getItem('site_v') !== version) {
    localStorage.clear();
    localStorage.setItem('site_v', version);
    console.log("Storage cleared for Luxury update");
  }
} catch (e) {
  console.error("Cleanup failed", e);
}

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
  componentDidCatch(error: any, errorInfo: any) {
    console.error("CRITICAL UI ERROR:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-white p-6 text-center font-tajawal rtl">
          <div className="space-y-4">
            <h1 className="text-2xl font-black text-primary">نعتذر، حدث خطأ تقني بسيط</h1>
            <p className="text-muted-foreground">جاري العمل على استعادة الصفحة تلقائياً...</p>
            <Button onClick={() => window.location.reload()} className="bg-primary text-white rounded-xl px-8 h-12">تحديث الصفحة</Button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const App = () => {
  return (
    <ErrorBoundary>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <Sonner position="bottom-right" richColors />
            <BrowserRouter>
              <div className="relative min-h-screen bg-background">
                <LuxuryExperience />
                <PremiumDecorations />
                <ThemeToggle />
                <WhatsAppWidget />
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/categories/:categoryId" element={<CategoryPage />} />
                  <Route path="/products/:productId" element={<ProductDetails />} />
                  <Route path="/search" element={<SearchPage />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/order-preview/:orderId" element={<OrderTracking />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
            </BrowserRouter>
          </TooltipProvider>
        </QueryClientProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
};

export default App;
