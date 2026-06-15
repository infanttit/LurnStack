import { Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import SiteFooter from "../components/layout/SiteFooter";
import SiteNavbar from "../components/layout/SiteNavbar";
import { CartFlyAnimator } from "../cart";
import { AiChatWidget } from "../ai-chat";
import { ZohoSalesIQ } from "../integrations/zoho/salesiq";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);
  return null;
}

export default function AppShell() {
  return (
    <div className="min-h-dvh bg-background text-on-background">
      <ScrollToTop />
      <ZohoSalesIQ />
      <CartFlyAnimator />
      <AiChatWidget />
      <SiteNavbar />
      <main className="pt-[89px]">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  );
}
