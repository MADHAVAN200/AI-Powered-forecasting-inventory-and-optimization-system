import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LogOut, Store, Package, ShoppingCart, Truck } from "lucide-react";
export function UniversalHeader() {
  const location = useLocation();
  const pathname = location.pathname;
  const navigate = useNavigate();
  // Don't show header on login page
  // Don't show header on login page or control tower (as it has its own shell)
  // Also hiding for intelligence modules for full-screen immersion
  if (pathname === "/" || pathname === "/login" ||
    pathname === "/event-intelligence" ||
    pathname === "/trend-intelligence" ||
    pathname === "/weather-intelligence" ||
    pathname === "/forecast-engine" ||
    pathname === "/scenario-planning" ||
    pathname === "/inventory-risk" ||
    pathname === "/store-health" ||
    pathname === "/live-checkout" ||
    pathname === "/checkout-vision" ||
    pathname === "/checkout-analytics" ||
    pathname === "/federated-learning" ||
    pathname === "/model-health" ||
    pathname === "/alerts" ||
    pathname === "/stock-rebalancing" ||
    pathname === "/vendor")
    return null;
  const handleSignOut = () => {
    navigate("/");
  };
  const getRoleInfo = () => {
    if (pathname.startsWith("/dashboard")) {
      return { role: "Walmart Staff", icon: Store, color: "bg-blue-600" };
    }
    if (pathname.startsWith("/vendor")) {
      return { role: "Vendor", icon: Package, color: "bg-blue-600" };
    }
    if (pathname.startsWith("/customer")) {
      return { role: "Customer", icon: ShoppingCart, color: "bg-blue-600" };
    }
    if (pathname.startsWith("/logistics")) {
      return { role: "Logistics", icon: Truck, color: "bg-blue-600" };
    }
    return { role: "User", icon: Store, color: "bg-gray-500" };
  };
  const getBreadcrumbs = () => {
    const segments = pathname.split("/").filter(Boolean);
    const breadcrumbs = [];
    if (segments.includes("dashboard")) {
      breadcrumbs.push({ label: "Dashboard", href: "/dashboard" });
      if (segments.includes("category")) {
        breadcrumbs.push({ label: "Categories", href: "/dashboard" });
        const categoryId = segments[segments.indexOf("category") + 1];
        if (categoryId) {
          breadcrumbs.push({
            label: categoryId.charAt(0).toUpperCase() + categoryId.slice(1),
            href: `/dashboard/category/${categoryId}`,
          });
        }
      }
      else if (segments.includes("flash-sales")) {
        breadcrumbs.push({ label: "Flash Sales", href: "/dashboard/flash-sales" });
      }
      else if (segments.includes("analytics")) {
        breadcrumbs.push({ label: "Analytics", href: "/dashboard/analytics" });
      }
      else if (segments.includes("godown")) {
        breadcrumbs.push({ label: "Storage Management", href: "/dashboard/godown" });
      }
    }
    else if (segments.includes("logistics")) {
      breadcrumbs.push({ label: "Logistics", href: "/logistics" });
    }
    else if (segments.includes("vendor")) {
      breadcrumbs.push({ label: "Vendor Portal", href: "/vendor" });
    }
    return breadcrumbs;
  };
  const roleInfo = getRoleInfo();
  const RoleIcon = roleInfo.icon;
  const breadcrumbs = getBreadcrumbs();
  return (<div className="bg-white border-b border-gray-200 px-6 py-3 shadow-sm">
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <Store className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Walmart OptiFresh</h1>
          </div>
        </div>
        <Badge className={`${roleInfo.color} text-white border-0 px-3 py-1`}>
          <RoleIcon className="w-4 h-4 mr-2" />
          {roleInfo.role}
        </Badge>
      </div>

      <div className="flex items-center space-x-3">
        <Button variant="outline" size="sm" onClick={handleSignOut} className="border-gray-200 hover:bg-gray-50 bg-transparent">
          <LogOut className="w-4 h-4 mr-2" />
          Home
        </Button>
      </div>
    </div>
  </div>);
}
