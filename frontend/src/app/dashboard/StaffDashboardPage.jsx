
import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, 
  ShoppingCart, 
  ArrowRight, 
  TrendingUp, 
  Clock, 
  AlertCircle,
  Zap,
  ArrowUpRight,
  ShieldAlert,
  Search,
  LayoutDashboard,
  User,
  Activity,
  Package
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import Sidebar from '@/components/Sidebar';
import ThemeToggle from '@/components/ThemeToggle';
import { backendModuleService } from '@/services/backendModuleService';
import { checkoutVisionService } from '@/services/checkoutVisionService';
import { useAuth } from '@/context/AuthContext';

const StaffDashboardPage = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [lastSync, setLastSync] = useState(new Date());

  const [data, setData] = useState({
    alerts: [],
    checkoutKpis: [],
    recentTransactions: [],
    stats: {
      criticalAlerts: 0,
      totalSales: 0,
      checkoutVolume: 0
    }
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [alertsData, checkoutData] = await Promise.all([
          backendModuleService.getModuleData('alerts'),
          checkoutVisionService.getCheckoutData()
        ]);

        const alerts = alertsData?.alerts || [];
        const transactions = checkoutData?.transactions || [];
        const totalSales = transactions.reduce((acc, curr) => acc + Number(curr.total || 0), 0);

        setData({
          alerts: alerts.slice(0, 5),
          checkoutKpis: checkoutData?.kpis || [],
          recentTransactions: transactions.slice(0, 5),
          stats: {
            criticalAlerts: alerts.filter(a => a.priority === 'Critical' || a.priority === 'High').length,
            totalSales,
            checkoutVolume: transactions.length
          }
        });
        setLastSync(new Date());
      } catch (err) {
        console.error('Staff Dashboard data fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000); // Auto refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const staffStats = useMemo(() => [
    {
      label: "Active Alerts",
      value: data.stats.criticalAlerts,
      icon: Bell,
      color: "text-red-500",
      bg: "bg-red-500/10",
      description: "Needs immediate attention"
    },
    {
      label: "Billing Volume",
      value: data.stats.checkoutVolume,
      icon: ShoppingCart,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      description: "Transactions processed today"
    },
    {
      label: "Total Sales",
      value: `Rs. ${data.stats.totalSales.toLocaleString()}`,
      icon: TrendingUp,
      color: "text-green-500",
      bg: "bg-green-500/10",
      description: "Daily revenue stream"
    }
  ], [data]);

  return (
    <div className="flex min-h-screen bg-background text-foreground font-sans">
      <Sidebar />
      
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header Section */}
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600/10 rounded-lg border border-blue-500/20">
              <Zap className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground tracking-tight">Staff Operations Hub</h1>
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Operational Dashboard • {lastSync.toLocaleTimeString()}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
             <ThemeToggle />
             <div className="hidden md:flex flex-col items-end mr-2">
                <span className="text-sm font-semibold text-foreground">{user?.email?.split('@')[0]}</span>
                <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">Active Duty</span>
             </div>
             <div className="w-10 h-10 rounded-full bg-muted border border-border flex items-center justify-center">
                <User className="w-5 h-5 text-muted-foreground" />
             </div>
          </div>
        </header>

        <main className="flex-1 p-6 space-y-6 overflow-y-auto">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {staffStats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <Card key={idx} className="bg-card border-border hover:border-primary/20 transition-all shadow-sm hover:shadow-md dark:shadow-none">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-2.5 ${stat.bg} rounded-xl border border-current/10`}>
                        <Icon className={`w-5 h-5 ${stat.color}`} />
                      </div>
                      <Badge variant="outline" className="text-[10px] border-border text-muted-foreground">Live</Badge>
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</h3>
                      <div className="text-3xl font-bold text-foreground tracking-tight">{stat.value}</div>
                      <p className="text-[11px] text-muted-foreground/80">{stat.description}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Detailed Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Alerts Feed */}
            <Card className="bg-card border-border flex flex-col shadow-sm hover:shadow-md dark:shadow-none transition-shadow">
              <CardHeader className="border-b border-border/60 pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-red-500" />
                    <CardTitle className="text-foreground text-base">Critical System Alerts</CardTitle>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => navigate('/control-tower/alerts')} className="text-blue-400 hover:text-blue-300 gap-1 text-xs">
                    View All <ArrowRight className="w-3 h-3" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0 flex-1">
                {data.alerts.length > 0 ? (
                  <div className="divide-y divide-border">
                    {data.alerts.map((alert, idx) => (
                      <div key={idx} className="p-4 flex items-start gap-4 hover:bg-accent/50 transition-colors group cursor-pointer">
                        <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${alert.priority === 'Critical' ? 'bg-red-500' : 'bg-orange-500'}`} />
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-foreground group-hover:text-blue-400 transition-colors">{alert.type}</span>
                            <span className="text-[10px] text-muted-foreground">{alert.timestamp || 'Just now'}</span>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-1">{alert.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-12 text-center">
                    <Activity className="w-8 h-8 text-muted/30 mb-3" />
                    <p className="text-sm text-muted-foreground">No active alerts detected</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Billing Feed */}
            <Card className="bg-card border-border flex flex-col shadow-sm hover:shadow-md dark:shadow-none transition-shadow">
              <CardHeader className="border-b border-border/60 pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5 text-blue-500" />
                    <CardTitle className="text-foreground text-base">Recent Checkouts</CardTitle>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => navigate('/checkout-vision')} className="text-blue-400 hover:text-blue-300 gap-1 text-xs">
                    Open Smart Billing <ArrowRight className="w-3 h-3" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0 flex-1">
                {data.recentTransactions.length > 0 ? (
                  <div className="divide-y divide-border">
                    {data.recentTransactions.map((tx, idx) => (
                      <div key={idx} className="p-4 flex items-center justify-between hover:bg-accent/50 transition-colors cursor-pointer group">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center border border-border group-hover:border-blue-500/30 transition-colors">
                            <Package className="w-4 h-4 text-gray-500" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground">Lane {tx.lane}</p>
                            <p className="text-[10px] text-muted-foreground">{Array.isArray(tx.items) ? tx.items.length : tx.items} items processed</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-foreground">Rs. {Number(tx.total).toLocaleString()}</p>
                          <p className="text-[10px] text-emerald-500 font-medium">Completed</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-12 text-center">
                    <Clock className="w-8 h-8 text-muted/30 mb-3" />
                    <p className="text-sm text-muted-foreground">Waiting for transactions...</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
             <div 
               onClick={() => navigate('/checkout-vision')}
               className="p-6 rounded-2xl bg-gradient-to-br from-blue-500/5 to-transparent border border-blue-500/20 hover:border-blue-500/40 hover:bg-blue-500/[0.02] transition-all cursor-pointer group relative overflow-hidden shadow-sm hover:shadow-md dark:shadow-none"
             >
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                  <ShoppingCart className="w-24 h-24 text-blue-500" />
                </div>
                <div className="relative z-10">
                  <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-blue-500/20">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-1">Scale Smart Billing</h3>
                  <p className="text-sm text-muted-foreground max-w-xs">Access Vision AI tools to analyze checkout throughput and fraud detection.</p>
                  <div className="mt-4 flex items-center gap-2 text-sm font-bold text-blue-400 uppercase tracking-widest group-hover:translate-x-1 transition-transform">
                    Launch Module <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>
             </div>

             <div 
               onClick={() => navigate('/control-tower/alerts')}
               className="p-6 rounded-2xl bg-gradient-to-br from-red-500/5 to-transparent border border-red-500/20 hover:border-red-500/40 hover:bg-red-500/[0.02] transition-all cursor-pointer group relative overflow-hidden shadow-sm hover:shadow-md dark:shadow-none"
             >
                 <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Bell className="w-24 h-24 text-red-500" />
                </div>
                <div className="relative z-10">
                  <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-red-500/20">
                    <ShieldAlert className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-1">Operational Alerts</h3>
                  <p className="text-sm text-muted-foreground max-w-xs">Monitor and resolve active store floor issues and stock-out risks.</p>
                  <div className="mt-4 flex items-center gap-2 text-sm font-bold text-red-400 uppercase tracking-widest group-hover:translate-x-1 transition-transform">
                    View Alert Center <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>
             </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default StaffDashboardPage;
