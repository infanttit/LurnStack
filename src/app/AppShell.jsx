import { Outlet } from "react-router-dom";
import SiteFooter from "../components/layout/SiteFooter";
import SiteNavbar from "../components/layout/SiteNavbar";
import { CartFlyAnimator } from "../cart";

export default function AppShell() {
  return (
    <div className="min-h-dvh bg-background text-on-background">
      <CartFlyAnimator />
      <SiteNavbar />
      <Outlet />
      <SiteFooter />
    </div>
  );
}
