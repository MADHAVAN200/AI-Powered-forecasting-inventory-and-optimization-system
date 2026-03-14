"use client";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu";
import { Store, Users, Sparkles, ChevronDown, Check, BarChart3, Leaf } from "lucide-react";
import { cn } from "@/lib/utils";
// Helper component for animated gradient text
const GradientText = ({ children }) => (<span className="bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500 bg-clip-text text-transparent">
  {children}
</span>);
export default function LoginPage() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState(null);
  const roles = [
    {
      id: "vendor",
      title: "Vendor Portal",
      description: "Join our sustainable supply chain. Apply to sell surplus products.",
      image: "/vendors.png",
      route: "/vendor",
    },
    {
      id: "walmart-staff",
      title: "Staff Portal",
      description: "Manage inventory, analyze freshness data, and initiate actions.",
      image: "/staff.png",
      route: "/dashboard",
    },

  ];
  const handleRoleSelect = (role) => {
    if (selectedRole)
      return; // Prevent multiple clicks
    setSelectedRole(role.id);
    setTimeout(() => {
      navigate(role.route);
    }, 600);
  };
  return (<div className="w-full h-screen overflow-hidden grid grid-cols-1 lg:grid-cols-2">
    {/* Left Panel: Branding & Information */}
    <div className="hidden lg:flex flex-col justify-between p-12 text-white bg-blue-700 relative overflow-hidden">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-800 to-slate-900 animate-gradient-xy"></div>
      </div>

      <div className="relative z-10">
        <div className="flex items-center space-x-3">
          <img src="/logo.webp" alt="Walmart Spark" className="h-10 w-10" />
          <span className="text-2xl font-bold tracking-wide">
            Walmart Opti-Fresh
          </span>
        </div>
      </div>

      <div className="relative z-10">
        <h1 className="text-5xl font-bold leading-tight mb-4">
          Intelligent Freshness.
          <br />
          <GradientText>Zero Waste.</GradientText>
        </h1>
        <p className="text-lg text-blue-200 max-w-lg mb-8">
          Our AI-powered platform unifies the supply chain to eliminate waste, empower partners, and deliver maximum value from every product.
        </p>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-5 h-5 text-yellow-400" />
            <span className="text-blue-100">AI-Powered Analytics & Forecasting</span>
          </div>
          <div className="flex items-center gap-3">
            <Leaf className="w-5 h-5 text-yellow-400" />
            <span className="text-blue-100">Sustainable Impact & Waste Reduction</span>
          </div>
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-yellow-400" />
            <span className="text-blue-100">Unified Vendor & Staff Collaboration</span>
          </div>
        </div>
      </div>

      <div className="relative z-10 text-xs text-blue-300">
        © 2025 Team BeGANs - A Walmart Sparkathon Initiative
      </div>
    </div>

    {/* Right Panel: Portal Selection */}
    <div className="w-full h-full bg-slate-50 flex flex-col justify-center items-center p-8 relative">
      <div className="w-full max-w-md">
        <div className="text-center lg:hidden mb-8">
          <div className="flex items-center justify-center space-x-3">
            <img src="/walmart-spark.svg" alt="Walmart Spark" className="h-10 w-10" />
            <span className="text-2xl font-bold tracking-wide text-slate-800">OptiFresh</span>
          </div>
        </div>

        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-slate-800">Select Your Portal</h2>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center space-x-2">
                <span className="text-lg">🇮🇳</span>
                <span className="text-sm font-medium text-slate-700">India</span>
                <ChevronDown className="w-4 h-4 text-slate-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem className="flex items-center space-x-3 p-2 text-blue-600">
                <Check className="w-4 h-4" />
                <span className="text-lg">🇮🇳</span>
                <span className="font-medium">India (Current)</span>
              </DropdownMenuItem>
              <DropdownMenuItem disabled className="flex items-center space-x-3 p-2 opacity-50">
                <span className="w-4 h-4" />
                <span className="text-lg">🇺🇸</span>
                <span className="font-medium">United States</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="space-y-4">
          {roles.map((role) => {
            // Use Store icon as fallback if needed
            const IconComponent = role.id === "walmart-staff" ? Store :
              role.id === "vendor" ? Users :
                Sparkles;
            return (<button key={role.id} onClick={() => handleRoleSelect(role)} disabled={!!selectedRole} className={cn("w-full p-6 text-left bg-white rounded-xl border-2 border-transparent transition-all duration-300 group relative overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed", "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500", selectedRole === role.id && "border-blue-600")}>
              <div className="flex items-center gap-6">
                <div className={cn("flex-shrink-0 w-16 h-16 rounded-xl flex items-center justify-center transition-all duration-300", selectedRole === role.id ? "bg-blue-600 shadow-lg" : "bg-slate-100 group-hover:bg-blue-100 group-hover:shadow-md")}>
                  <img src={role.image} alt={role.title} className="w-10 h-10 object-contain transition-transform duration-300 group-hover:scale-110" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-900 mb-1">{role.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{role.description}</p>
                </div>
              </div>
              {/* Loading/Selected Animation */}
              <div className={cn("absolute top-0 left-0 h-full bg-blue-600 transition-all duration-500 ease-in-out", selectedRole === role.id ? 'w-full' : 'w-0')}>
                <div className="absolute inset-0 flex items-center justify-center text-white font-semibold">
                  {selectedRole === role.id && "Accessing..."}
                </div>
              </div>
            </button>);
          })}
        </div>
        <p className="text-center text-xs text-slate-400 mt-12 lg:hidden">
          © 2025 Team BeGANs - A Walmart Sparkathon Initiative
        </p>
      </div>
    </div>
  </div>);
}
