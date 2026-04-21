
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
import Sidebar from '@/components/Sidebar';
import ThemeToggle from '@/components/ThemeToggle';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { AlertContent } from '@/components/alert-sidebar';
import { useAuth } from '@/context/AuthContext';

const ControlTowerPage = () => {
    const navigate = useNavigate();
    const { role } = useAuth();

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
                    path: "/control-tower/event-intelligence"
                },
                {
                    title: "Trend Intelligence",
                    icon: Activity,
                    description: "Monitor product and city-level demand momentum",
                    metrics: ["Trend sparkline available"],
                    action: "Trend Analysis Page",
                    path: "/control-tower/trend-intelligence"
                },
                {
                    title: "Weather Intelligence",
                    icon: Cloud,
                    description: "Forecast weather-driven demand and spoilage risks",
                    metrics: ["7-day condition strip"],
                    action: "Weather Tracker Page",
                    path: "/control-tower/weather-intelligence"
                }
            ]
        },
        {
            title: "Planning & Simulation",
            description: "Advanced simulation tools for strategic decision support.",
            id: "forecasting",
            cards: [
                {
                    title: "Scenario Planning",
                    icon: Brain,
                    description: "Simulate demand under events and weather changes",
                    metrics: ["Scenario Planner Active"],
                    action: "Open Simulator",
                    path: "/control-tower/scenario-planning",
                    badge: "Beta"
                }
            ]
        },
    ];

    // Admin Only Section
    if (role === 'admin') {
        partitions.push({
            title: "Administrative Oversight",
            description: "Centralized monitoring for store operations and financial compliance.",
            id: "admin",
            cards: [
                {
                    title: "Store Transactions",
                    icon: ArrowRightLeft,
                    description: "Comprehensive log of all transactions across all checkout lanes",
                    metrics: ["Real-time feed", "8 Lanes active"],
                    action: "Audit Transactions",
                    path: "/control-tower/admin-transactions",
                    badge: "Admin"
                }
            ]
        });
    }

    return (
        <div className="flex min-h-screen bg-[#0a0a0a] text-foreground">
            <Sidebar />

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Global Context Bar */}
                <header className="h-16 bg-[#111] border-b border-[#222] flex items-center justify-between px-6 sticky top-0 z-10 w-full">
                    <div className="flex items-center space-x-6">
                        <div className="md:hidden">
                            <Menu className="w-6 h-6 text-gray-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white tracking-tight">Control Tower</h2>
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
                        {partitions.map((partition) => (
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
                                            <Card key={idx} onClick={() => card.path && navigate(`${card.path}?from=control-tower`)} className="bg-[#111] border-[#333] hover:border-blue-500/50 transition-all cursor-pointer group rounded-xl overflow-hidden">
                                                <CardHeader className="pb-3">
                                                    <CardTitle className="text-lg font-medium text-gray-200 group-hover:text-blue-400 transition-colors">
                                                        {card.title}
                                                    </CardTitle>
                                                    <CardDescription className="text-gray-500 line-clamp-2">
                                                        {card.description}
                                                    </CardDescription>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="pt-4 border-t border-[#222] flex items-center text-xs font-medium text-gray-500 uppercase tracking-wider group-hover:text-blue-400 transition-colors">
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
