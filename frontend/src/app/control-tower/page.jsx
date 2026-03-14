
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Calendar, MapPin, Activity, TrendingUp, Cloud, Thermometer,
    Camera, Scan, Shield, Server, Bell, Lightbulb, User, Settings,
    LogOut, Menu, Zap, LineChart, Brain, AlertTriangle, Package, Store, Eye,
    ArrowRightLeft
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import AlertSidebar, { AlertContent } from '@/components/alert-sidebar';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const ControlTowerPage = () => {
    const navigate = useNavigate();

    // Data Structure for Partitions
    const partitions = [
        {
            title: "Demand & Market Intelligence",
            description: "Retail research shows demand signals must be contextualized before forecasting.",
            id: "demand",
            cards: [
                {
                    title: "Event Intelligence",
                    icon: Calendar,
                    description: "Track city-level events influencing demand spikes",
                    metrics: ["Active events: 3", "High-impact alerts: 1"],
                    action: "Event Calendar Page",
                    path: "/event-intelligence"
                },
                {
                    title: "Trend Intelligence",
                    icon: Activity,
                    description: "Monitor product and city-level demand momentum",
                    metrics: ["Trend sparkline available"],
                    action: "Trend Analysis Page",
                    path: "/trend-intelligence"
                },
                {
                    title: "Weather Intelligence",
                    icon: Cloud,
                    description: "Forecast weather-driven demand and spoilage risks",
                    metrics: ["7-day condition strip"],
                    action: "Weather Tracker Page",
                    path: "/weather-intelligence"
                }
            ]
        },
        {
            title: "Forecasting & Planning Intelligence",
            description: "Forecasting is a decision-support function, not raw analytics.",
            id: "forecasting",
            cards: [
                {
                    title: "Demand Forecast Engine",
                    icon: LineChart,
                    description: "AI-driven demand prediction at store & SKU level",
                    metrics: ["Past vs forecast sparkline"],
                    action: "Forecast Engine Page",
                    path: "/forecast-engine"
                },
                {
                    title: "Scenario Planning",
                    icon: Brain,
                    description: "Simulate demand under events and weather changes",
                    metrics: ["Comparator Active"],
                    action: "Open Simulator",
                    path: "/scenario-planning",
                    badge: "Beta"
                }
            ]
        },
        {
            title: "Inventory & Store Operations",
            description: "Inventory is where forecast meets execution.",
            id: "inventory",
            cards: [
                {
                    title: "Inventory Risk Dashboard",
                    icon: AlertTriangle,
                    description: "Detect shortages, overstock, and demand mismatches",
                    metrics: ["Shortages: 12", "Overstock: 5"],
                    action: "Inventory Dashboard Page",
                    path: "/inventory-risk"
                },
                {
                    title: "Store Health Overview",
                    icon: Store,
                    description: "Operational readiness per store",
                    metrics: ["Risk Index: Low", "Critical SKUs: 2"],
                    action: "Store Health Page",
                    path: "/store-health"
                }
            ]
        },
        {
            title: "Checkout Intelligence & Verification",
            description: "Self-checkout is operational AI, not customer UX.",
            id: "checkout",
            cards: [
                {
                    title: "Live Checkout Monitoring",
                    icon: Eye,
                    description: "Monitor self-checkout lanes and anomalies",
                    metrics: ["Active lanes: 8", "Alerts: 0"],
                    action: "Checkout Monitoring Page",
                    path: "/live-checkout"
                },
                {
                    title: "Vision-Based Verification",
                    icon: Camera,
                    description: "AI-assisted product recognition & mismatch detection",
                    metrics: ["Confidence: 98%"],
                    action: "Checkout Vision Page",
                    path: "/checkout-vision"
                },
                {
                    title: "Checkout Analytics",
                    icon: Scan,
                    description: "Analyze errors, confidence, and store patterns",
                    metrics: ["Error rate: 1.2%"],
                    action: "Checkout Analytics Page",
                    path: "/checkout-analytics"
                }
            ]
        },
        {
            title: "AI Models & Governance",
            description: "Enterprise AI must be observable and controllable.",
            id: "governance",
            cards: [
                {
                    title: "Federated Learning Panel",
                    icon: Server,
                    description: "Monitor and update edge AI models across stores",
                    metrics: ["Avg accuracy: 94%", "Global gain: +2.3%"],
                    action: "FL Panel Page",
                    path: "/federated-learning"
                },
                {
                    title: "Model Health & Drift",
                    icon: Shield,
                    description: "Detect accuracy degradation and bias",
                    metrics: ["Health Score: 88/100"],
                    action: "Model Health Page",
                    path: "/model-health"
                }
            ]
        },
        {
            title: "Alerts & Recommendations",
            description: "Users don’t want dashboards — they want decisions surfaced.",
            id: "alerts",
            cards: [
                {
                    title: "Operational Alerts",
                    icon: Bell,
                    description: "Prioritized alerts requiring human action",
                    metrics: ["High: 3", "Medium: 5"],
                    action: "View Alerts",
                    path: "/alerts",
                    alertCount: 8
                },
                {
                    title: "AI Recommendations",
                    icon: Lightbulb,
                    description: "Context-aware suggestions across modules",
                    metrics: ["New suggestions: 4"],
                    action: "View Recommendations",
                    path: "/recommendations"
                }
            ]
        }
    ];

    return (
        <div className="flex min-h-screen bg-[#0a0a0a] text-foreground">
            {/* Sidebar (Vertical Navigation) */}
            <aside className="w-16 md:w-64 bg-[#111] border-r border-[#222] flex flex-col hidden md:flex sticky top-0 h-screen overflow-y-auto">
                <div className="p-4 flex items-center space-x-2 border-b border-[#222]">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <Activity className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-bold text-lg text-white hidden md:block">OptiFresh</span>
                </div>

                <nav className="flex-1 py-4 space-y-2 px-2">
                    <Button variant="ghost" className="w-full justify-start text-gray-400 hover:text-white hover:bg-[#222]" onClick={() => navigate('/dashboard')}>
                        <Store className="w-5 h-5 mr-3" />
                        <span className="hidden md:block">Dashboard</span>
                    </Button>
                    <Button variant="ghost" className="w-full justify-start text-gray-400 hover:text-white hover:bg-[#222]">
                        <Activity className="w-5 h-5 mr-3" />
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

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Global Context Bar */}
                <header className="h-16 bg-[#111] border-b border-[#222] flex items-center justify-between px-6 sticky top-0 z-10 w-full">
                    <div className="flex items-center space-x-6">
                        <div className="md:hidden">
                            <Menu className="w-6 h-6 text-gray-400" />
                        </div>
                        <div>
                            <h2 className="text-sm text-gray-400 font-medium">Selected Region</h2>
                            <div className="flex items-center space-x-2">
                                <span className="font-semibold text-white">North America / East Coast</span>
                            </div>
                        </div>
                        <Separator orientation="vertical" className="h-8 bg-[#333]" />
                        <div>
                            <h2 className="text-sm text-gray-400 font-medium">Data Freshness</h2>
                            <div className="flex items-center space-x-2">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                <span className="font-semibold text-green-500">Live</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        <div className="text-right hidden sm:block">
                            <h2 className="text-sm text-gray-400 font-medium">System Health</h2>
                            <p className="text-green-500 text-sm font-semibold">All Systems Nominal</p>
                        </div>

                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white relative">
                                    <Bell className="w-5 h-5" />
                                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse border border-[#111]"></span>
                                </Button>
                            </SheetTrigger>
                            <SheetContent className="bg-[#0f0f0f] border-l border-[#222] text-white p-0 w-80 sm:max-w-sm">
                                <AlertContent />
                            </SheetContent>
                        </Sheet>

                        <div className="w-8 h-8 bg-[#222] rounded-full flex items-center justify-center border border-[#333]">
                            <User className="w-4 h-4 text-gray-400" />
                        </div>
                    </div>
                </header>

                <div className="flex flex-1 overflow-hidden">
                    {/* Content Canvas */}
                    <main className="flex-1 p-6 space-y-8 overflow-y-auto bg-[#0a0a0a]">
                        <div className="mb-6">
                            <h1 className="text-2xl font-bold text-white mb-2">Control Tower</h1>
                            <p className="text-gray-400">Operational cockpit for warehouse and retail intelligence.</p>
                        </div>

                        {partitions.filter(p => p.id !== 'alerts').map((partition) => (
                            <div key={partition.id} className="space-y-4">
                                <div className="flex items-end justify-between border-b border-[#222] pb-2">
                                    <div>
                                        <h2 className="text-xl font-semibold text-blue-400">{partition.title}</h2>
                                        <p className="text-sm text-gray-500 mt-1">{partition.description}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {partition.cards.map((card, idx) => {
                                        const Icon = card.icon;
                                        return (
                                            <Card key={idx} onClick={() => card.path && navigate(card.path)} className="bg-[#111] border-[#333] hover:border-blue-500/50 transition-all cursor-pointer group rounded-xl overflow-hidden">
                                                <CardHeader className="pb-3">
                                                    <div className="flex items-start justify-between">
                                                        <div className={`p-2 rounded-lg bg-[#1a1a1a] group-hover:bg-blue-900/20 transition-colors`}>
                                                            <Icon className="w-6 h-6 text-blue-500" />
                                                        </div>
                                                        {card.badge && (
                                                            <Badge variant="secondary" className="bg-yellow-900/30 text-yellow-400 border-yellow-800/50">
                                                                {card.badge}
                                                            </Badge>
                                                        )}
                                                        {card.alertCount && (
                                                            <Badge variant="destructive" className="bg-red-900/30 text-red-400 border-red-800/50">
                                                                {card.alertCount} Active
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <CardTitle className="text-lg font-medium text-gray-200 mt-4 group-hover:text-blue-400 transition-colors">
                                                        {card.title}
                                                    </CardTitle>
                                                    <CardDescription className="text-gray-500 line-clamp-2">
                                                        {card.description}
                                                    </CardDescription>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="space-y-3">
                                                        {card.metrics.map((metric, i) => (
                                                            <div key={i} className="flex items-center text-sm text-gray-400">
                                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2" />
                                                                {metric}
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <div className="mt-4 pt-4 border-t border-[#222] flex items-center text-xs font-medium text-gray-500 uppercase tracking-wider group-hover:text-blue-400 transition-colors">
                                                        Open Module <TrendingUp className="w-3 h-3 ml-1" />
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </main>

                    {/* Operational Alerts Sidebar - REMOVED as per user request */}
                </div>
            </div>
        </div>
    );
};

export default ControlTowerPage;
