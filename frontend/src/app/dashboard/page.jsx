import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity, AlertTriangle, ArrowRight, BarChart3, Bell, Brain,
  Calendar, CheckCircle2, ChevronRight, Clock, DollarSign,
  Info, Layers, LayoutDashboard, LineChart, MapPin, Network,
  Package, Search, Server, Shield, ShoppingCart, Store, Thermometer,
  TrendingDown, TrendingUp, Truck, Users, Zap, ArrowRightLeft, LogOut
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from "@/components/ui/progress";

const DashboardPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen bg-[#0a0a0a] text-foreground font-sans selection:bg-blue-500/30">

      {/* Sidebar (Vertical Navigation) */}
      <aside className="w-16 md:w-64 bg-[#111] border-r border-[#222] flex flex-col hidden md:flex sticky top-0 h-screen overflow-y-auto">
        <div className="p-4 flex items-center space-x-2 border-b border-[#222]">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg text-white hidden md:block">OptiFresh</span>
        </div>

        <nav className="flex-1 py-4 space-y-2 px-2">
          <Button variant="secondary" className="w-full justify-start bg-[#1a1a1a] text-white">
            <Store className="w-5 h-5 mr-3" />
            <span className="hidden md:block">Dashboard</span>
          </Button>
          <Button variant="ghost" className="w-full justify-start text-gray-400 hover:text-white hover:bg-[#222]" onClick={() => navigate('/control-tower')}>
            <LayoutDashboard className="w-5 h-5 mr-3" />
            <span className="hidden md:block">Control Tower</span>
          </Button>
          <Button variant="ghost" className="w-full justify-start text-red-500 hover:text-red-400 hover:bg-[#222]" onClick={() => navigate('/alerts')}>
            <Zap className="w-5 h-5 mr-3" />
            <span className="hidden md:block">Operational Alerts</span>
          </Button>
          <Button variant="ghost" className="w-full justify-start text-blue-400 hover:text-blue-300 hover:bg-[#222]" onClick={() => navigate('/stock-rebalancing')}>
            <ArrowRightLeft className="w-5 h-5 mr-3" />
            <span className="hidden md:block">Stock Rebalancing</span>
          </Button>
          <Button variant="ghost" className="w-full justify-start text-gray-400 hover:text-white hover:bg-[#222]" onClick={() => navigate('/vendor')}>
            <Package className="w-5 h-5 mr-3" />
            <span className="hidden md:block">Vendor Portal</span>
          </Button>
          <Button variant="ghost" className="w-full justify-start text-gray-400 hover:text-white hover:bg-[#222]" onClick={() => navigate('/logistics')}>
            <MapPin className="w-5 h-5 mr-3" />
            <span className="hidden md:block">Logistics</span>
          </Button>

        </nav>

        <div className="p-4 border-t border-[#222]">
          <Button variant="ghost" className="w-full justify-start text-gray-400 hover:text-white hover:bg-[#222]" onClick={() => navigate('/login')}>
            <LogOut className="w-5 h-5 mr-3" />
            <span className="hidden md:block">Sign Out</span>
          </Button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        {/* 3. DASHBOARD HEADER */}
        <header className="sticky top-0 z-30 bg-[#111] border-b border-[#222]">
          <div className="px-6 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <LayoutDashboard className="w-5 h-5 text-blue-500" />
                Enterprise Operations
              </h1>
              <div className="text-xs text-gray-400 font-mono mt-1 flex items-center gap-3">
                <span className="flex items-center"><MapPin className="w-3 h-3 mr-1" /> North America / East</span>
                <span className="text-gray-600">|</span>
                <span className="flex items-center"><Clock className="w-3 h-3 mr-1" /> {new Date().toLocaleTimeString()}</span>
                <span className="text-gray-600">|</span>
                <span className="flex items-center text-green-500"><Activity className="w-3 h-3 mr-1" /> Systems Nominal</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* Role Badge */}
              <Badge variant="outline" className="border-[#333] text-gray-400 font-normal">
                Regional Ops View
              </Badge>
            </div>
          </div>
        </header>

        <main className="p-6 max-w-[1600px] mx-auto space-y-8 w-full">

          {/* 4. GLOBAL HEALTH SNAPSHOT */}
          <section>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Network Health */}
              <Card className="bg-[#111] border-[#333]">
                <CardContent className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Network Health</p>
                    <Activity className="w-4 h-4 text-green-500" />
                  </div>
                  <div className="text-3xl font-bold text-white mb-1">94<span className="text-lg text-gray-500 font-normal">/100</span></div>
                  <div className="flex items-center text-xs text-green-500">
                    <TrendingUp className="w-3 h-3 mr-1" /> +2% vs yesterday
                  </div>
                </CardContent>
              </Card>

              {/* Stores at Risk */}
              <Card className="bg-[#111] border-[#333] cursor-pointer hover:border-red-500/50 transition-colors" onClick={() => navigate('/store-health')}>
                <CardContent className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Stores at Risk</p>
                    <Store className="w-4 h-4 text-red-500" />
                  </div>
                  <div className="text-3xl font-bold text-red-500 mb-1">3</div>
                  <div className="flex items-center text-xs text-red-400">
                    <AlertTriangle className="w-3 h-3 mr-1" /> Requires attention
                  </div>
                </CardContent>
              </Card>

              {/* Critical Inventory */}
              <Card className="bg-[#111] border-[#333] cursor-pointer hover:border-yellow-500/50 transition-colors" onClick={() => navigate('/inventory-risk')}>
                <CardContent className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Stockouts Imminent</p>
                    <Package className="w-4 h-4 text-yellow-500" />
                  </div>
                  <div className="text-3xl font-bold text-yellow-500 mb-1">12</div>
                  <div className="flex items-center text-xs text-gray-400">
                    Across 5 locations
                  </div>
                </CardContent>
              </Card>

              {/* Checkout Alerts */}
              <Card className="bg-[#111] border-[#333] cursor-pointer hover:border-blue-500/50 transition-colors" onClick={() => navigate('/live-checkout')}>
                <CardContent className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Checkout Alerts</p>
                    <ShoppingCart className="w-4 h-4 text-blue-500" />
                  </div>
                  <div className="text-3xl font-bold text-white mb-1">8</div>
                  <div className="flex items-center text-xs text-blue-400">
                    <Activity className="w-3 h-3 mr-1" /> High traffic detected
                  </div>
                </CardContent>
              </Card>

              {/* Logistics Status */}
              <Card className="bg-[#111] border-[#333] cursor-pointer hover:border-purple-500/50 transition-colors" onClick={() => navigate('/logistics')}>
                <CardContent className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">In Transit</p>
                    <Truck className="w-4 h-4 text-purple-500" />
                  </div>
                  <div className="text-3xl font-bold text-white mb-1">45</div>
                  <div className="flex items-center text-xs text-yellow-500">
                    <Clock className="w-3 h-3 mr-1" /> 2 Delayed
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* 5. DEMAND & INVENTORY INTELLIGENCE */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 pb-2 border-b border-[#222]">
                <LineChart className="w-5 h-5 text-blue-500" />
                <h2 className="text-lg font-bold text-white">Demand & Inventory</h2>
              </div>

              <Card className="bg-[#111] border-[#333] hover:border-blue-500/30 transition-colors group cursor-pointer h-[200px] flex flex-col" onClick={() => navigate('/forecast-engine')}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold text-white group-hover:text-blue-400 transition-colors flex items-center justify-between">
                    Demand Outlook
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </CardTitle>
                  <CardDescription>Next 7 Days Forecast</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-center">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="text-2xl font-bold text-green-500 flex items-center">
                        <TrendingUp className="w-5 h-5 mr-2" /> +12%
                      </div>
                      <p className="text-xs text-gray-500">Above baseline</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400 mb-1">Confidence</p>
                      <Badge variant="outline" className="text-green-400 border-green-900 bg-green-900/10">High (94%)</Badge>
                    </div>
                  </div>
                  <div className="h-1 w-full bg-[#222] rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 w-[75%]"></div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#111] border-[#333] hover:border-yellow-500/30 transition-colors group cursor-pointer h-[200px] flex flex-col" onClick={() => navigate('/inventory-risk')}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold text-white group-hover:text-yellow-400 transition-colors flex items-center justify-between">
                    Inventory Risk
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </CardTitle>
                  <CardDescription>Stock Health Distribution</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-center">
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Critical Shortages</span>
                      <span className="text-red-500 font-bold">14 SKUs</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Major Overstock</span>
                      <span className="text-yellow-500 font-bold">8 SKUs</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">At-Risk Stores</span>
                      <span className="text-white font-bold">Stores 402, 115</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#111] border-[#333] hover:border-blue-500/30 transition-colors group cursor-pointer h-[200px] flex flex-col" onClick={() => navigate('/store-health')}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold text-white group-hover:text-blue-400 transition-colors flex items-center justify-between">
                    Store Health Summary
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-center">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 text-center p-2 bg-[#1a1a1a] rounded border border-[#222]">
                      <div className="text-lg font-bold text-green-500">18</div>
                      <div className="text-[10px] text-gray-500 uppercase">Healthy</div>
                    </div>
                    <div className="flex-1 text-center p-2 bg-[#1a1a1a] rounded border border-[#222]">
                      <div className="text-lg font-bold text-yellow-500">4</div>
                      <div className="text-[10px] text-gray-500 uppercase">Watch</div>
                    </div>
                    <div className="flex-1 text-center p-2 bg-[#1a1a1a] rounded border border-[#222]">
                      <div className="text-lg font-bold text-red-500">3</div>
                      <div className="text-[10px] text-gray-500 uppercase">At-Risk</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 6. CHECKOUT & OPERATIONS & LOGISTICS */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 pb-2 border-b border-[#222]">
                <Layers className="w-5 h-5 text-purple-500" />
                <h2 className="text-lg font-bold text-white">Ops & Execution</h2>
              </div>

              <Card className="bg-[#111] border-[#333] hover:border-purple-500/30 transition-colors group cursor-pointer h-[200px] flex flex-col" onClick={() => navigate('/live-checkout')}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold text-white group-hover:text-purple-400 transition-colors flex items-center justify-between">
                    Checkout Operations
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </CardTitle>
                  <CardDescription>Live Lane Monitoring</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-center">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="relative">
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse absolute -top-1 -right-1"></div>
                      <ShoppingCart className="w-8 h-8 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-gray-300">
                        <span className="font-bold text-white">4</span> lanes require action
                      </div>
                      <div className="text-xs text-red-400">High anomaly rate at Store 115</div>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" className="w-full text-xs text-gray-400 hover:text-white justify-between h-auto py-1 px-0">
                    View Live Feed <ChevronRight className="w-3 h-3" />
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-[#111] border-[#333] hover:border-green-500/30 transition-colors group cursor-pointer h-[200px] flex flex-col" onClick={() => navigate('/logistics')}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold text-white group-hover:text-green-400 transition-colors flex items-center justify-between">
                    Logistics Pipeline
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </CardTitle>
                  <CardDescription>Inter-Store Transfers</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-center">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-gray-300">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div> In Transit
                      </div>
                      <span className="font-mono text-white">42</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-gray-300">
                        <div className="w-2 h-2 bg-gray-600 rounded-full mr-2"></div> Planned
                      </div>
                      <span className="font-mono text-white">15</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-gray-300">
                        <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div> Delayed
                      </div>
                      <span className="font-mono text-red-500 font-bold">2</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#111] border-[#333] hover:border-blue-500/30 transition-colors group cursor-pointer h-[200px] flex flex-col" onClick={() => navigate('/checkout-vision')}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold text-white group-hover:text-blue-400 transition-colors flex items-center justify-between">
                    Recent Issues
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </CardTitle>
                  <CardDescription>Vision Verification Log</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 flex-1 flex flex-col justify-center">
                  <div className="flex items-center justify-between text-sm p-2 bg-[#1a1a1a] rounded border border-[#222]">
                    <span className="text-gray-400">Misscan (St. 402)</span>
                    <Badge variant="secondary" className="bg-red-900/40 text-red-400 hover:bg-red-900/40">Critical</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm p-2 bg-[#1a1a1a] rounded border border-[#222]">
                    <span className="text-gray-400">Obstruction (St. 115)</span>
                    <Badge variant="secondary" className="bg-yellow-900/40 text-yellow-400 hover:bg-yellow-900/40">Warn</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 7. ALERTS & SYSTEM HEALTH */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 pb-2 border-b border-[#222]">
                <Zap className="w-5 h-5 text-red-500" />
                <h2 className="text-lg font-bold text-white">Alerts & System</h2>
              </div>

              {/* Active Alerts Strip - Spanning 2 rows (200+200 + 16 gap = 416) */}
              <Card className="bg-[#111] border-[#333] hover:border-red-500/50 transition-colors group cursor-pointer h-[416px] flex flex-col" onClick={() => navigate('/alerts')}>
                <CardHeader className="pb-2 bg-red-900/10 border-b border-red-900/20">
                  <CardTitle className="text-base font-semibold text-red-500 flex items-center justify-between">
                    Active Operational Alerts
                    <Badge className="bg-red-500 text-white hover:bg-red-600">3 Critical</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-3 flex-1 overflow-y-auto">
                  {[
                    { type: 'Inventory', msg: 'Stockout: Avocados @ St 402', age: '10m', icon: Package },
                    { type: 'Checkout', msg: 'Lane Blocked @ St 115', age: '45m', icon: ShoppingCart },
                    { type: 'System', msg: 'Vision Model Drift Detected', age: '1h', icon: Brain },
                    { type: 'Logistics', msg: 'Truck 42 Delayed (>2h)', age: '2h', icon: Truck },
                    { type: 'Store', msg: 'High Temp Alert (Freezer B)', age: '15m', icon: Thermometer },
                  ].map((alert, i) => (
                    <div key={i} className="flex items-start gap-3 p-2 hover:bg-[#1a1a1a] rounded transition-colors border border-transparent hover:border-[#333]">
                      <alert.icon className="w-4 h-4 text-gray-500 mt-0.5" />
                      <div className="flex-1">
                        <div className="text-sm text-gray-200">{alert.msg}</div>
                        <div className="text-xs text-red-400 font-mono">{alert.age} ago</div>
                      </div>
                    </div>
                  ))}
                  <div className="pt-2 text-center mt-auto">
                    <span className="text-xs text-gray-500 group-hover:text-red-400 transition-colors">View All 15 Alerts &rarr;</span>
                  </div>
                </CardContent>
              </Card>

              {/* AI System Health - Last row height (200) */}
              <Card className="bg-[#111] border-[#333] h-[200px] flex flex-col">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold text-white">System Governance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 flex-1 flex flex-col justify-center">
                  <div className="flex items-center justify-between cursor-pointer hover:bg-[#1a1a1a] p-1 rounded" onClick={() => navigate('/model-health')}>
                    <div className="flex items-center gap-2">
                      <Brain className="w-4 h-4 text-purple-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-200">Model Health</p>
                        <p className="text-xs text-gray-500">Vision v2.4.1</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-green-500 border-green-900 bg-green-900/10">Stable</Badge>
                  </div>

                  <div className="flex items-center justify-between cursor-pointer hover:bg-[#1a1a1a] p-1 rounded" onClick={() => navigate('/federated-learning')}>
                    <div className="flex items-center gap-2">
                      <Network className="w-4 h-4 text-blue-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-200">Federated Learning</p>
                        <p className="text-xs text-gray-500">Last Aggregation: 2h ago</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-xs text-gray-400">Active</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;
