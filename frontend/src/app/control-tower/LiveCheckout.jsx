
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Activity, AlertOctagon, CheckCircle2, Clock, Camera, Wifi,
    Server, Scan, AlertTriangle, Eye, ArrowRight, XCircle, Home
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
import {
    Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink,
    BreadcrumbPage, BreadcrumbSeparator
} from '@/components/ui/breadcrumb';

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
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const fromControlTower = queryParams.get('from') === 'control-tower';


    return (
        <div className="min-h-screen bg-background text-foreground pb-20 font-sans w-full">

            {/* 1. HEADER & SYSTEM HEALTH */}
            <header className="sticky top-0 z-30 bg-sidebar/95 backdrop-blur-md border-b border-sidebar-border shadow-lg">
                {/* Breadcrumb Section */}
                <div className="px-6 pt-3">
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink
                                    onClick={() => navigate('/')}
                                    className="flex items-center gap-1 text-muted-foreground hover:text-blue-400 cursor-pointer text-[11px] transition-colors"
                                >
                                    <Home className="w-3 h-3" />
                                    Home
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator className="text-gray-600" />
                            {fromControlTower && (
                                <>
                                    <BreadcrumbItem>
                                        <BreadcrumbLink
                                            onClick={() => navigate('/control-tower')}
                                            className="flex items-center gap-1 text-muted-foreground hover:text-blue-400 cursor-pointer text-[11px] transition-colors"
                                        >
                                            Control Tower
                                        </BreadcrumbLink>
                                    </BreadcrumbItem>
                                    <BreadcrumbSeparator className="text-gray-600" />
                                </>
                            )}
                            <BreadcrumbItem>
                                <BreadcrumbPage className="text-blue-400 text-[11px] font-medium">
                                    Live Checkout
                                </BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>

                <div className="px-6 py-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center space-x-4">
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                            <Scan className="w-6 h-6 text-blue-500" />
                        </div>
                        <div>
                            <div className="flex items-center space-x-3">
                                <h1 className="text-xl font-bold text-foreground tracking-tight uppercase">Live Checkout Monitoring</h1>
                                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-card border border-border text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                                    Real-time Feed
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground">Store #402 • Main Exit Zone • Visual Anomaly Detection Active</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex items-center space-x-4 mr-4">
                            <div className="flex items-center space-x-2">
                                <Camera className="w-3.5 h-3.5 text-green-500" />
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">Vision: <span className="text-foreground">ONLINE</span></span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Wifi className="w-3.5 h-3.5 text-blue-500" />
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">POS: <span className="text-foreground">SYNCED</span></span>
                            </div>
                        </div>
                        <Button
                            variant="destructive"
                            size="sm"
                            className="h-9 px-4 text-[10px] font-black uppercase tracking-widest bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/20"
                        >
                            Emergency Halt
                        </Button>
                    </div>
                </div>
            </header>

            <div className="p-6 w-full space-y-6">

                {/* 2. SUMMARY KPI STRIP */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {KPI_STATS.map((stat, i) => {
                        const Icon = stat.icon;
                        return (
                            <Card key={i} className="bg-card border-border hover:border-blue-500/30 transition-colors shadow-sm">
                                <CardContent className="flex items-center justify-between p-4">
                                    <div>
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</p>
                                        <p className="text-2xl font-black text-foreground mt-1 tabular-nums tracking-tighter">{stat.value}</p>
                                    </div>
                                    <div className={`p-2.5 bg-muted rounded-xl border border-border shadow-inner ${stat.color}`}>
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
                            <h2 className="text-lg font-bold text-foreground flex items-center">
                                <Server className="w-5 h-5 mr-2 text-muted-foreground" /> Lane Grid
                            </h2>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-green-500 mr-1"></span> Active</span>
                                <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-red-500 mr-1"></span> Alert</span>
                                <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-gray-500 mr-1"></span> Idle</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            {LANE_STATUS.map((lane) => (
                                <Card key={lane.id} className={`
                                    border-2 relative overflow-hidden transition-all cursor-pointer hover:shadow-xl group
                                    ${lane.status === 'Issue' ? 'bg-red-500/5 border-red-500/30' :
                                        lane.status === 'Active' ? 'bg-card border-blue-500/10' :
                                            'bg-muted/30 border-border opacity-60 hover:opacity-100'}
                                `}>
                                    <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
                                        <div className="font-black text-foreground text-base uppercase tracking-tighter">Lane {lane.id}</div>
                                        {lane.hasAlert && (
                                            <div className="animate-pulse bg-red-500 rounded-full p-1 shadow-lg shadow-red-500/40">
                                                <AlertTriangle className="w-3.5 h-3.5 text-white" />
                                            </div>
                                        )}
                                    </CardHeader>
                                    <CardContent className="p-4 pt-0">
                                        <div className="flex justify-between items-end mb-3">
                                            <div>
                                                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{lane.customer}</div>
                                                <div className="text-xl font-black text-foreground tabular-nums">{lane.time}</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Items</div>
                                                <div className="text-lg font-black text-foreground tabular-nums">{lane.items}</div>
                                            </div>
                                        </div>

                                        {lane.status !== 'Idle' && (
                                            <div className="space-y-1.5">
                                                <div className="flex justify-between text-[9px] font-black uppercase tracking-widest">
                                                    <span className="text-muted-foreground">Confidence</span>
                                                    <span className={lane.confidence < 80 ? 'text-red-500' : 'text-blue-500'}>{lane.confidence}%</span>
                                                </div>
                                                <Progress value={lane.confidence} className="h-1 bg-muted border border-border" indicatorClassName={`${lane.confidence < 80 ? 'bg-red-500' : 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]'}`} />
                                            </div>
                                        )}

                                        {lane.hasAlert && (
                                            <div className="mt-4 p-2 bg-red-500/10 border border-red-500/20 rounded-lg text-center shadow-inner">
                                                <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">{lane.alertType}</span>
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
                        <Card className="bg-card border-border h-[400px] flex flex-col shadow-md">
                            <CardHeader className="py-3.5 border-b border-border/50 bg-muted/10">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Active Alerts</CardTitle>
                                    <Badge variant="outline" className="text-red-500 border-red-500/20 bg-red-500/10 font-bold text-[10px] px-2 h-5">2 CRITICAL</Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="flex-1 overflow-y-auto p-0">
                                <div className="divide-y divide-border/30">
                                    {RECENT_ALERTS.filter(a => a.status === 'New').map((alert) => (
                                        <div key={alert.id} className="p-4 hover:bg-muted/30 transition-colors group">
                                            <div className="flex justify-between items-start mb-1.5">
                                                <span className="font-black text-foreground text-xs uppercase tracking-tighter">{alert.lane}</span>
                                                <span className="text-[10px] text-muted-foreground font-bold tabular-nums">{alert.time}</span>
                                            </div>
                                            <div className="text-[11px] text-red-500 font-bold mb-3 flex items-center">
                                                <AlertTriangle className="w-3 h-3 mr-1.5" /> {alert.type.toUpperCase()}
                                            </div>
                                            <div className="flex gap-2">
                                                <Button size="sm" className="h-8 text-[10px] font-black uppercase tracking-widest bg-red-600 hover:bg-red-700 w-full shadow-md shadow-red-600/10">Intervene</Button>
                                                <Button size="sm" variant="outline" className="h-8 text-[10px] font-black uppercase tracking-widest border-border bg-card text-muted-foreground hover:text-foreground w-full">Squelch</Button>
                                            </div>
                                        </div>
                                    ))}
                                    {RECENT_ALERTS.filter(a => a.status !== 'New').map((alert) => (
                                        <div key={alert.id} className="p-4 opacity-40 hover:opacity-100 transition-all cursor-default">
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="font-bold text-muted-foreground text-[11px] uppercase tracking-tighter">{alert.lane}</span>
                                                <span className="text-[10px] text-muted-foreground font-medium">{alert.time}</span>
                                            </div>
                                            <div className="text-[11px] text-muted-foreground mb-1.5 font-medium">{alert.type}</div>
                                            <div className="text-[9px] font-black text-green-500 flex items-center uppercase tracking-widest">
                                                <CheckCircle2 className="w-3 h-3 mr-1.5" /> Logged & Resolved
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Recent Activity Mini-Feed */}
                        <Card className="bg-muted/30 border border-border shadow-sm">
                            <CardHeader className="py-3 pb-2 border-b border-border/50 bg-muted/10">
                                <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Live Telemetry Feed</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4 pb-4">
                                <div className="space-y-3.5">
                                    <div className="flex items-center text-[11px] font-medium group cursor-default">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                                        <span className="text-muted-foreground group-hover:text-foreground transition-colors">Lane 8 completed session <span className="text-foreground font-bold tabular-nums">(15 items)</span></span>
                                        <span className="ml-auto text-[9px] font-bold text-muted-foreground uppercase">2m ago</span>
                                    </div>
                                    <div className="flex items-center text-[11px] font-medium group cursor-default">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                                        <span className="text-muted-foreground group-hover:text-foreground transition-colors">Lane 5 started new session</span>
                                        <span className="ml-auto text-[9px] font-bold text-muted-foreground uppercase">4m ago</span>
                                    </div>
                                    <div className="flex items-center text-[11px] font-medium group cursor-default">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 mr-2 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
                                        <span className="text-muted-foreground group-hover:text-foreground transition-colors">Staff cleared Lane 1 void alert</span>
                                        <span className="ml-auto text-[9px] font-bold text-muted-foreground uppercase">6m ago</span>
                                    </div>
                                </div>
                                <Button variant="link" size="sm" className="w-full text-[10px] font-black uppercase tracking-[0.2em] text-blue-500 mt-4 h-6 p-0 hover:text-blue-400 no-underline" onClick={() => navigate('/control-tower/store-health' + (fromControlTower ? '?from=control-tower' : ''))}>
                                    Network Diagnostics <ArrowRight className="w-3.5 h-3.5 ml-2" />
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



