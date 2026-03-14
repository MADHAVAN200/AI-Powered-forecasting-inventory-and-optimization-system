
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Activity, TrendingUp, AlertTriangle, CheckCircle2,
    ArrowRight, MapPin, Store, Calendar, Clock,
    Package, Users, ShoppingCart, Zap, BarChart2,
    ShieldAlert, Search
} from 'lucide-react';
import {
    Card, CardContent, CardDescription, CardHeader, CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
    RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis
} from 'recharts';

// --- MOCK DATA ---

const HEALTH_DIMENSIONS = [
    { title: "Demand Readiness", score: 88, status: "Healthy", trend: "+2%", icon: BarChart2, color: "text-green-500", border: "border-green-500/50" },
    { title: "Inventory Stability", score: 72, status: "Watch", trend: "-5%", icon: Package, color: "text-yellow-500", border: "border-yellow-500/50" },
    { title: "Ops Efficiency", score: 94, status: "Healthy", trend: "+1%", icon: Activity, color: "text-green-500", border: "border-green-500/50" },
    { title: "Checkout Speed", score: 65, status: "At Risk", trend: "-12%", icon: ShoppingCart, color: "text-orange-500", border: "border-orange-500/50" },
    { title: "AI Confidence", score: 92, status: "High", trend: "0%", icon: Zap, color: "text-blue-500", border: "border-blue-500/50" },
];

const RISK_SNAPSHOTS = [
    { title: "Forecast Volatility", count: 3, severity: "Medium", desc: "Unexpected spikes in Bev/Snacks" },
    { title: "Critical Shortages", count: 12, severity: "High", desc: "Staples below safety stock" },
    { title: "Checkout Anomalies", count: 5, severity: "High", desc: "Scan errors spike at Lane 4" },
    { title: "External Risk", count: 1, severity: "Low", desc: "Minor rain impact expected" },
];

const ATTENTION_QUEUE = [
    { id: 1, issue: "Shortage Risk (Critical)", desc: "Cola 12pk running out in < 4hrs", severity: "Critical", time: "Immediate", action: "Expedite Transfer" },
    { id: 2, issue: "Checkout Anomaly", desc: "Lane 4 Missed Scans > 5%", severity: "High", time: "< 1 Hour", action: "Verify Camera" },
    { id: 3, issue: "Spoilage Alert", desc: "Berries shelf life ending", severity: "High", time: "Today", action: "Markdown" },
    { id: 4, issue: "Staffing Gap", desc: "Predicted peak exceeds active lanes", severity: "Medium", time: "Next 2 Hours", action: "Open Lane 6" },
    { id: 5, issue: "Overstock alert", desc: "Seasonal candy accumulating", severity: "Low", time: "This Week", action: "Plan Promo" },
];

const HEALTH_SCORE_DATA = [
    { name: 'Health', value: 78, fill: '#3b82f6' }
];

// --- COMPONENT ---

const StoreHealthPage = () => {
    const navigate = useNavigate();
    const [selectedRegion, setSelectedRegion] = useState("North America");
    const [selectedStore, setSelectedStore] = useState("Store #402");
    const [timeContext, setTimeContext] = useState("live");

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-foreground pb-20 font-sans">

            {/* 1. GLOBAL STORE FILTERS (Sticky) */}
            <div className="sticky top-0 z-30 bg-[#111] border-b border-[#222] shadow-lg">
                <div className="px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">

                    <div className="flex items-center space-x-3">
                        <Store className="w-6 h-6 text-blue-500" />
                        <div>
                            <h1 className="text-xl font-bold text-white tracking-tight">Store Health Overview</h1>
                            <p className="text-xs text-gray-500 font-mono uppercase tracking-wider flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                Live Operational Status
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                            <SelectTrigger className="w-[140px] h-9 bg-[#1a1a1a] border-[#333] text-gray-200 text-xs shadow-inner">
                                <SelectValue placeholder="Region" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#1a1a1a] border-[#333] text-white">
                                <SelectItem value="North America">North America</SelectItem>
                                <SelectItem value="Europe">Europe</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={selectedStore} onValueChange={setSelectedStore}>
                            <SelectTrigger className="w-[140px] h-9 bg-[#1a1a1a] border-[#333] text-gray-200 text-xs shadow-inner">
                                <SelectValue placeholder="Store" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#1a1a1a] border-[#333] text-white">
                                <SelectItem value="Store #402">Store #402 - NY</SelectItem>
                                <SelectItem value="Store #405">Store #405 - NJ</SelectItem>
                            </SelectContent>
                        </Select>

                        <ToggleGroup type="single" value={timeContext} onValueChange={(val) => val && setTimeContext(val)} className="bg-[#1a1a1a] border border-[#333] rounded-md p-0.5">
                            <ToggleGroupItem value="live" className="h-8 px-3 text-xs text-gray-400 data-[state=on]:bg-blue-900/40 data-[state=on]:text-blue-400">Live</ToggleGroupItem>
                            <ToggleGroupItem value="72h" className="h-8 px-3 text-xs text-gray-400 data-[state=on]:bg-gray-800 data-[state=on]:text-white">Next 72h</ToggleGroupItem>
                        </ToggleGroup>
                    </div>
                </div>
            </div>

            <div className="p-6 w-full space-y-8">

                {/* 2. STORE HEALTH SCORE & DIMENSIONS */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

                    {/* Health Score Anchor */}
                    <Card className="bg-[#111] border-[#333] flex flex-col items-center justify-center p-6 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
                        <h2 className="text-gray-400 text-sm font-medium uppercase tracking-widest mb-4">Overall Health Score</h2>
                        <div className="relative w-48 h-48 flex items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadialBarChart
                                    innerRadius="70%"
                                    outerRadius="100%"
                                    barSize={10}
                                    data={HEALTH_SCORE_DATA}
                                    startAngle={180}
                                    endAngle={0}
                                >
                                    <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                                    <RadialBar background clockWise dataKey="value" cornerRadius={10} fill="#3b82f6" />
                                </RadialBarChart>
                            </ResponsiveContainer>
                            <div className="absolute flex flex-col items-center">
                                <span className="text-5xl font-bold text-white">78</span>
                                <span className="text-yellow-400 text-sm font-bold mt-1">Acceptable</span>
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 text-center mt-2 px-4">
                            Score is conservative due to detected inventory volatility in aisle 3.
                        </p>
                    </Card>

                    {/* Dimensions & Snapshots */}
                    <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* Core Dimensions */}
                        <div className="space-y-3">
                            <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-2">Core Dimensions</h3>
                            {HEALTH_DIMENSIONS.map((dim, idx) => {
                                const Icon = dim.icon;
                                return (
                                    <div key={idx} className={`bg-[#151515] p-3 rounded-lg border border-[#222] flex items-center justify-between hover:border-[#444] transition-colors cursor-pointer group`}>
                                        <div className="flex items-center space-x-3">
                                            <div className={`p-2 rounded bg-[#1a1a1a] ${dim.color} group-hover:text-white transition-colors`}>
                                                <Icon className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-gray-200">{dim.title}</div>
                                                <div className="text-xs text-gray-500">{dim.status}</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-bold text-white">{dim.score}</div>
                                            <div className={`text-xs ${dim.trend.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>{dim.trend}</div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        {/* Risk Snapshot */}
                        <div className="space-y-3">
                            <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-2">Risk Snapshot</h3>
                            <div className="grid grid-cols-2 gap-3">
                                {RISK_SNAPSHOTS.map((risk, idx) => (
                                    <div key={idx} className="bg-[#151515] p-4 rounded-lg border border-[#222] flex flex-col justify-between hover:bg-[#1a1a1a] transition-colors">
                                        <div className="flex justify-between items-start mb-2">
                                            <Badge variant="outline" className={`
                                                ${risk.severity === 'Critical' ? 'text-red-400 border-red-900' :
                                                    risk.severity === 'High' ? 'text-orange-400 border-orange-900' :
                                                        'text-gray-400 border-gray-800'} text-[10px] h-5 px-1
                                            `}>
                                                {risk.severity}
                                            </Badge>
                                            <span className="text-lg font-bold text-white">{risk.count}</span>
                                        </div>
                                        <div>
                                            <div className="text-xs font-semibold text-gray-300">{risk.title}</div>
                                            <div className="text-[10px] text-gray-500 mt-1 leading-tight">{risk.desc}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="bg-blue-900/10 border border-blue-900/30 p-4 rounded-lg mt-3">
                                <div className="flex items-start space-x-3">
                                    <ShieldAlert className="w-5 h-5 text-blue-400 mt-0.5" />
                                    <div>
                                        <div className="text-sm font-semibold text-blue-100">AI Advisory</div>
                                        <div className="text-xs text-blue-300 mt-1 leading-relaxed">
                                            Store health is stable but trending downward due to checkout delays. Review staffing allocation.
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                {/* 3. IMMEDIATE ATTENTION QUEUE */}
                <div className="bg-[#111] border border-[#333] rounded-xl overflow-hidden">
                    <div className="p-4 border-b border-[#222] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h3 className="text-lg font-bold text-white">Immediate Attention Queue</h3>
                            <p className="text-xs text-gray-500">Prioritized issues requiring action within 4 hours.</p>
                        </div>
                        <Button variant="outline" size="sm" className="border-[#333] bg-[#1a1a1a] text-gray-300 hover:text-white hover:bg-[#222] text-xs">
                            View All Alerts
                        </Button>
                    </div>
                    <Table>
                        <TableHeader>
                            <TableRow className="border-[#222] bg-[#151515] hover:bg-[#151515]">
                                <TableHead className="text-gray-400 h-9 text-xs uppercase w-[200px]">Issue Type</TableHead>
                                <TableHead className="text-gray-400 h-9 text-xs uppercase">Description</TableHead>
                                <TableHead className="text-gray-400 h-9 text-xs uppercase w-[120px]">Severity</TableHead>
                                <TableHead className="text-gray-400 h-9 text-xs uppercase w-[120px]">Time</TableHead>
                                <TableHead className="text-gray-400 h-9 text-xs uppercase text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {ATTENTION_QUEUE.map((row) => (
                                <TableRow key={row.id} className="border-[#222] hover:bg-[#1a1a1a]">
                                    <TableCell className="font-semibold text-white py-3">{row.issue}</TableCell>
                                    <TableCell className="text-gray-400 text-sm py-3">{row.desc}</TableCell>
                                    <TableCell className="py-3">
                                        <Badge variant="outline" className={`
                                            ${row.severity === 'Critical' ? 'text-red-400 border-red-900 bg-red-900/10' :
                                                row.severity === 'High' ? 'text-orange-400 border-orange-900 bg-orange-900/10' :
                                                    'text-blue-400 border-blue-900 bg-blue-900/10'}
                                        `}>
                                            {row.severity}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-gray-300 text-xs font-mono py-3">{row.time}</TableCell>
                                    <TableCell className="text-right py-3">
                                        <Button size="sm" variant="ghost" className="h-7 text-xs text-blue-400 hover:text-blue-300 hover:bg-blue-900/20">
                                            {row.action} <ArrowRight className="w-3 h-3 ml-1" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {/* 4. CROSS MODULE NAVIGATION */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { title: "Inventory Risk", path: "/inventory-risk", icon: AlertTriangle, color: "hover:border-orange-500/40" },
                        { title: "Forecast Engine", path: "/forecast-engine", icon: Activity, color: "hover:border-blue-500/40" },
                        { title: "Scenario Plan", path: "/scenario-planning", icon: TrendingUp, color: "hover:border-green-500/40" },
                        { title: "Weather Intel", path: "/weather-intelligence", icon: Calendar, color: "hover:border-purple-500/40" },
                    ].map((nav, i) => (
                        <div
                            key={i}
                            onClick={() => navigate(nav.path)}
                            className={`bg-[#111] border border-[#222] p-4 rounded-lg cursor-pointer transition-all flex items-center justify-between group ${nav.color}`}
                        >
                            <div className="flex items-center space-x-3">
                                <div className="text-gray-500 group-hover:text-white transition-colors"><nav.icon className="w-4 h-4" /></div>
                                <span className="font-semibold text-gray-300 group-hover:text-white text-sm">{nav.title}</span>
                            </div>
                            <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-white opacity-0 group-hover:opacity-100 transition-all" />
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
};

export default StoreHealthPage;
