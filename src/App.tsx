
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/hooks/use-cart";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";
import PeriodTracker from "./pages/PeriodTracker";
import SafetyAlerts from "./pages/SafetyAlerts";
import Shop from "./pages/Shop";
import Dashboard from "./pages/Dashboard";
import ProductDetails from "./pages/ProductDetails";
import Checkout from "./pages/Checkout";
import Resources from "./pages/Resources";
import Cart from "./pages/Cart";
import Profile from "./pages/Profile";
import OrderTracking from "./pages/OrderTracking";
import { useState } from "react";
import AppLayout from "./components/AppLayout";

function App() {
  // Create a client
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes
        refetchOnWindowFocus: false,
      },
    },
  }));

  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <CartProvider>
            <Toaster />
            <Sonner />
            <Routes>
              <Route path="/" element={
                <AppLayout>
                  <Index />
                </AppLayout>
              } />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/period-tracker" element={<PeriodTracker />} />
              <Route path="/safety" element={<SafetyAlerts />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/resources" element={<Resources />} />
              <Route path="/product/:id" element={<ProductDetails />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/orders" element={<OrderTracking />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </CartProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}

export default App;
