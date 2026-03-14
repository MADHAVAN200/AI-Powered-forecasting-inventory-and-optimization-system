
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Activity, AlertOctagon, CheckCircle2, Clock, Camera, Wifi,
    Server, Scan, AlertTriangle, Eye, ArrowRight, XCircle
} from 'lucide-react';
import {
    Card, CardContent, CardHeader, CardTitle, CardFooter
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Progress } from "@/components/ui/progress";

// --- MOCK DATA ---

const LANE_STATUS = [
    { id: 1, status: "Active", customer: "Session #4421", items: 12, time: "1:42", confidence: 98, hasAlert: false },
    { id: 2, status: "Active", customer: "Session #4422", items: 5, time: "0:30", confidence: 95, hasAlert: false },
    { id: 3, status: "Issue", customer: "Session #4419", items: 28, time: "4:15", confidence: 60, hasAlert: true, alertType: "Unscanned Item" },
    { id: 4, status: "Idle", customer: "-", items: 0, time: "-", confidence: 100, hasAlert: false },
    { id: 5, status: "Active", customer: "Session #4423", items: 8, time: "1:10", confidence: 92, hasAlert: false },
    { id: 6, status: "Issue", customer: "Session #4420", items: 3, time: "0:45", confidence: 45, hasAlert: true, alertType: "Product Mismatch" },
    { id: 7, status: "Idle", customer: "-", items: 0, time: "-", confidence: 100, hasAlert: false },
    { id: 8, status: "Active", customer: "Session #4424", items: 15, time: "2:20", confidence: 88, hasAlert: false },
];

const RECENT_ALERTS = [
    { id: 101, time: "10:42:15", lane: "Lane 3", type: "Unscanned Item", severity: "High", status: "New" },
    { id: 102, time: "10:41:30", lane: "Lane 6", type: "Product Mismatch", severity: "Medium", status: "New" },
    { id: 103, time: "10:38:00", lane: "Lane 1", type: "Suspicious Void", severity: "Low", status: "Resolved" },
    { id: 104, time: "10:35:22", lane: "Lane 5", type: "Weight Mismatch", severity: "Medium", status: "Resolved" },
];

const KPI_STATS = [
    { label: "Active Lanes", value: "5/8", icon: Activity, color: "text-blue-500" },
    { label: "Attention Needed", value: "2", icon: AlertOctagon, color: "text-red-500" },
    { label: "Anomaly Rate", value: "4.2%", icon: Eye, color: "text-orange-500" },
    { label: "Avg Confidence", value: "94%", icon: Scan, color: "text-green-500" },
];

// --- COMPONENT ---

const LiveCheckoutPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-foreground pb-20 font-sans w-full">

            {/* 1. HEADER & SYSTEM HEALTH */}
            <div className="sticky top-0 z-30 bg-[#111] border-b border-[#222] shadow-lg">
                <div className="px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">

                    <div className="flex items-center space-x-3">
                        <Scan className="w-6 h-6 text-blue-500" />
                        <div>
                            <h1 className="text-xl font-bold text-white tracking-tight">Live Checkout Monitoring</h1>
                            <p className="text-xs text-gray-500 font-mono uppercase tracking-wider flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                Store #402 • Main Exit Zone
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center space-x-2 px-3 py-1.5 bg-[#1a1a1a] rounded border border-[#333]">
                            <Camera className="w-3 h-3 text-green-500" />
                            <span className="text-xs text-gray-400">Vision: <span className="text-green-500 font-bold">Online</span></span>
                        </div>
                        <div className="flex items-center space-x-2 px-3 py-1.5 bg-[#1a1a1a] rounded border border-[#333]">
                            <Wifi className="w-3 h-3 text-green-500" />
                            <span className="text-xs text-gray-400">POS Sync: <span className="text-green-500 font-bold">Live</span></span>
                        </div>
                        <Button
                            variant="destructive"
                            size="sm"
                            className="h-8 text-xs font-bold uppercase tracking-wider bg-red-900/50 hover:bg-red-800 text-red-200 border border-red-800"
                        >
                            Emergency Halt
                        </Button>
                    </div>
                </div>
            </div>

            <div className="p-6 w-full space-y-6">

                {/* 2. SUMMARY KPI STRIP */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {KPI_STATS.map((stat, i) => {
                        const Icon = stat.icon;
                        return (
                            <Card key={i} className="bg-[#111] border-[#333]">
                                <CardContent className="flex items-center justify-between p-4">
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">{stat.label}</p>
                                        <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                                    </div>
                                    <div className={`p-2 bg-[#1a1a1a] rounded-lg ${stat.color}`}>
                                        <Icon className="w-5 h-5" />
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* 3. LIVE LANE GRID (2/3 Width) */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold text-white flex items-center">
                                <Server className="w-5 h-5 mr-2 text-gray-400" /> Lane Grid
                            </h2>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-green-500 mr-1"></span> Active</span>
                                <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-red-500 mr-1"></span> Alert</span>
                                <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-gray-500 mr-1"></span> Idle</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            {LANE_STATUS.map((lane) => (
                                <Card key={lane.id} className={`
                                    border relative overflow-hidden transition-all cursor-pointer hover:scale-[1.02]
                                    ${lane.status === 'Issue' ? 'bg-red-950/10 border-red-500/50' :
                                        lane.status === 'Active' ? 'bg-[#151515] border-green-900/30' :
                                            'bg-[#111] border-[#333]'}
                                `}>
                                    <CardHeader className="p-3 pb-0 flex flex-row items-center justify-between space-y-0">
                                        <div className="font-bold text-white text-lg">Lane {lane.id}</div>
                                        {lane.hasAlert && (
                                            <div className="animate-pulse">
                                                <AlertTriangle className="w-5 h-5 text-red-500" />
                                            </div>
                                        )}
                                    </CardHeader>
                                    <CardContent className="p-3">
                                        <div className="flex justify-between items-end mb-2">
                                            <div>
                                                <div className="text-xs text-gray-400">{lane.customer}</div>
                                                <div className="text-lg font-mono text-gray-200">{lane.time}</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-xs text-gray-500">Items</div>
                                                <div className="text-base font-bold text-white">{lane.items}</div>
                                            </div>
                                        </div>

                                        {lane.status !== 'Idle' && (
                                            <div className="space-y-1">
                                                <div className="flex justify-between text-[10px] text-gray-500">
                                                    <span>Confidence</span>
                                                    <span>{lane.confidence}%</span>
                                                </div>
                                                <Progress value={lane.confidence} className={`h-1 ${lane.confidence < 80 ? 'bg-red-900' : 'bg-gray-800'}`} indicatorClassName={`${lane.confidence < 80 ? 'bg-red-500' : 'bg-green-500'}`} />
                                            </div>
                                        )}

                                        {lane.hasAlert && (
                                            <div className="mt-3 p-2 bg-red-900/20 border border-red-900/50 rounded text-center">
                                                <span className="text-xs font-bold text-red-400 uppercase">{lane.alertType}</span>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>

                    {/* 4. ALERTS & ACTION (1/3 Width) */}
                    <div className="space-y-6">

                        {/* Active Alerts */}
                        <Card className="bg-[#111] border-[#333] h-[400px] flex flex-col">
                            <CardHeader className="py-3 border-b border-[#222]">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-base text-white">Active Alerts</CardTitle>
                                    <Badge variant="outline" className="text-red-400 border-red-900 bg-red-900/10">2 New</Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="flex-1 overflow-y-auto p-0">
                                <div className="divide-y divide-[#222]">
                                    {RECENT_ALERTS.filter(a => a.status === 'New').map((alert) => (
                                        <div key={alert.id} className="p-4 hover:bg-[#151515] transition-colors">
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="font-bold text-white text-sm">{alert.lane}</span>
                                                <span className="text-xs text-gray-500 font-mono">{alert.time}</span>
                                            </div>
                                            <div className="text-sm text-red-400 font-medium mb-2">{alert.type}</div>
                                            <div className="flex gap-2">
                                                <Button size="sm" className="h-7 text-xs bg-red-600 hover:bg-red-700 w-full">Intervene</Button>
                                                <Button size="sm" variant="outline" className="h-7 text-xs border-[#333] text-gray-400 hover:text-white w-full">Ignore</Button>
                                            </div>
                                        </div>
                                    ))}
                                    {RECENT_ALERTS.filter(a => a.status !== 'New').map((alert) => (
                                        <div key={alert.id} className="p-4 opacity-50 hover:opacity-80 transition-opacity">
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="font-bold text-gray-300 text-sm">{alert.lane}</span>
                                                <span className="text-xs text-gray-500 font-mono">{alert.time}</span>
                                            </div>
                                            <div className="text-sm text-gray-400 mb-1">{alert.type}</div>
                                            <div className="text-xs text-green-500 flex items-center">
                                                <CheckCircle2 className="w-3 h-3 mr-1" /> Resolved
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Recent Activity Mini-Feed */}
                        <Card className="bg-[#151515] border border-[#222]">
                            <CardHeader className="py-3 pb-2">
                                <CardTitle className="text-sm text-gray-400 uppercase tracking-widest">Recent Activity</CardTitle>
                            </CardHeader>
                            <CardContent className="pb-4">
                                <div className="space-y-3">
                                    <div className="flex items-center text-xs">
                                        <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
                                        <span className="text-gray-300">Lane 8 completed session (15 items)</span>
                                        <span className="ml-auto text-gray-500">2m ago</span>
                                    </div>
                                    <div className="flex items-center text-xs">
                                        <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
                                        <span className="text-gray-300">Lane 5 started new session</span>
                                        <span className="ml-auto text-gray-500">4m ago</span>
                                    </div>
                                    <div className="flex items-center text-xs">
                                        <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                                        <span className="text-gray-300">Staff cleared Lane 1 void alert</span>
                                        <span className="ml-auto text-gray-500">6m ago</span>
                                    </div>
                                </div>
                                <Button variant="link" size="sm" className="w-full text-xs text-blue-400 mt-2 h-6 p-0" onClick={() => navigate('/store-health')}>
                                    View Store Health <ArrowRight className="w-3 h-3 ml-1" />
                                </Button>
                            </CardContent>
                        </Card>

                    </div>

                </div>
            </div>
        </div>
    );
};

export default LiveCheckoutPage;
