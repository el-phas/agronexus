import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Marketplace from "./pages/Marketplace";
import Dashboard from "./pages/Dashboard";
import Insights from "./pages/Insights";
import About from "./pages/About";
import Cart from "./pages/Cart";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        {/* Try to hydrate user from server-set cookie on app start */}
        <HydrateAuth />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/insights" element={<Insights />} />
          <Route path="/about" element={<About />} />
          <Route path="/cart" element={<Cart />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

function HydrateAuth() {
  useEffect(() => {
    import("@/services/auth").then(async (m) => {
      try {
        const auth = m.default;
        // If there is no local user stored but an HttpOnly cookie exists,
        // call the backend to fetch the current user and store locally.
        if (!auth.getUser()) {
          const me = await auth.getMe();
          if (me) auth.setUser(me);
        }
      } catch (e) {
        // Ignore failures (user not authenticated)
      }
    });
  }, []);
  return null;
}
