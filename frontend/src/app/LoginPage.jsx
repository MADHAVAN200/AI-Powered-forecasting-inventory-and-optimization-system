import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Store, Users, BarChart3, Leaf, ShieldAlert, KeyRound, Mail, Loader2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/supabaseClient";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState(null);
  const { user, role, loading, loginDemo } = useAuth();

  useEffect(() => {
    // If user is already logged in and the context finished loading
    if (user && !loading) {
      if (role === "vendor") {
        navigate("/vendor", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    }
  }, [user, role, loading, navigate]);

  const demoAccounts = [
    { title: "Admin", email: "admin@walmart.com", icon: ShieldAlert },
    { title: "Staff", email: "staff@walmart.com", icon: Store },
    { title: "Vendor", email: "vendor@walmart.com", icon: Users }
  ];

  const handleLogin = async (e, overrideEmail, overridePassword) => {
    e?.preventDefault();
    const targetEmail = overrideEmail || email;
    const targetPassword = overridePassword || password;

    if (!targetEmail || !targetPassword) {
      setLoginError("Please enter both email and password.");
      return;
    }

    setIsLoading(true);
    setLoginError(null);

    // Determine route based on email demo matching (or default to dashboard)
    const targetRoute = targetEmail.includes("vendor") ? "/vendor" : "/dashboard";

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: targetEmail,
        password: targetPassword,
      });

      if (error) {
        console.warn('Supabase auth failed (falling back to demo mode):', error.message);
        // Fallback for demo if users aren't fully seeded or rate limited
        loginDemo(targetEmail);
        setTimeout(() => navigate(targetRoute), 800);
      } else {
        setTimeout(() => navigate(targetRoute), 800);
      }
    } catch (err) {
      console.error('Login error:', err);
      loginDemo(targetEmail);
      setTimeout(() => navigate(targetRoute), 800);
    }
  };

  const autofillDemo = (demoEmail) => {
    setEmail(demoEmail);
    setPassword("Password123!");
    setLoginError(null);
    handleLogin(null, demoEmail, "Password123!");
  };

  return (
    <div className="w-full h-screen overflow-hidden grid grid-cols-1 lg:grid-cols-2 bg-[#0a0a0a] text-foreground font-sans">
      {/* Left Panel: Branding & Information */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-[#111] border-r border-[#222] relative overflow-hidden">
        {/* Subtle Ambient Glow */}
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/10 blur-[100px] rounded-full pointer-events-none"></div>

        <div className="relative z-10">
        </div>

        <div className="relative z-10">
          <h1 className="text-4xl font-bold leading-tight mb-6 text-white max-w-lg">
            AI Powered forecasting, inventory and optimization system
          </h1>
          <p className="text-lg text-gray-400 max-w-lg mb-8">
            Our AI-powered platform unifies the supply chain to eliminate waste, empower partners, and deliver maximum value from every product.
          </p>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#1a1a1a] rounded-lg border border-[#333]">
                <BarChart3 className="w-5 h-5 text-blue-400" />
              </div>
              <span className="text-gray-300 font-medium">AI-Powered Analytics & Forecasting</span>
            </div>
            <div className="flex items-center gap-3">
               <div className="p-2 bg-[#1a1a1a] rounded-lg border border-[#333]">
                <Leaf className="w-5 h-5 text-green-400" />
              </div>
              <span className="text-gray-300 font-medium">Sustainable Impact & Waste Reduction</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#1a1a1a] rounded-lg border border-[#333]">
                 <Users className="w-5 h-5 text-purple-400" />
              </div>
              <span className="text-gray-300 font-medium">Unified Vendor & Staff Collaboration</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-gray-500 font-medium tracking-wide">
        </div>
      </div>

      {/* Right Panel: Login Form */}
      <div className="w-full h-full bg-[#0a0a0a] flex flex-col justify-center items-center p-8 relative">
        <div className="w-full max-w-md">
          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
            <p className="text-gray-400">Sign in to access your portal</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 block">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-[#111] border border-[#333] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 block">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <KeyRound className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-[#111] border border-[#333] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {/* Error Message */}
            {loginError && (
              <div className="text-red-400 text-sm font-medium px-1 bg-red-400/10 py-2 rounded-lg text-center border border-red-500/20">
                {loginError}
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full py-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-lg transition-all shadow-lg hover:shadow-blue-600/25 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </Button>
          </form>

          {/* Demo Accounts Quick-Fill Section */}
          <div className="mt-10 pt-8 border-t border-[#222]">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-4 font-semibold text-center">
              Quick Test Accounts
            </p>
            <div className="grid grid-cols-3 gap-3">
              {demoAccounts.map((acc, idx) => {
                const Icon = acc.icon;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => autofillDemo(acc.email)}
                    className="flex flex-col items-center justify-center p-3 rounded-lg bg-[#111] border border-[#222] hover:border-blue-500/50 hover:bg-[#1a1a1a] transition-all cursor-pointer group"
                  >
                    <Icon className="w-5 h-5 text-gray-400 group-hover:text-blue-400 mb-2 transition-colors" />
                    <span className="text-xs font-medium text-gray-300 group-hover:text-white transition-colors">{acc.title}</span>
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
