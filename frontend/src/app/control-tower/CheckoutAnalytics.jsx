
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, Legend
} from 'recharts';
import {
    Activity, TrendingUp, AlertTriangle, CheckCircle2, XCircle,
    Calendar, Scan, Eye, Filter, Download, Info, Home
} from 'lucide-react';
import {
    Card, CardContent, CardHeader, CardTitle, CardDescription
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Separator } from '@/components/ui/separator';
import {
    Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink,
    BreadcrumbPage, BreadcrumbSeparator
} from '@/components/ui/breadcrumb';

// --- MOCK DATA ---

const ANOMALY_TREND_DATA = [
    { day: "Mon", anomalies: 12, misscan: 8, mismatch: 4 },
    { day: "Tue", anomalies: 15, misscan: 10, mismatch: 5 },
    { day: "Wed", anomalies: 8, misscan: 5, mismatch: 3 },
    { day: "Thu", anomalies: 22, misscan: 14, mismatch: 8 },
    { day: "Fri", anomalies: 18, misscan: 11, mismatch: 7 },
    { day: "Sat", anomalies: 28, misscan: 18, mismatch: 10 },
    { day: "Sun", anomalies: 25, misscan: 16, mismatch: 9 },
];

const ANOMALY_TYPE_DATA = [
    { name: 'Missed Scan', value: 65, color: '#ef4444' },
    { name: 'Product Mismatch', value: 25, color: '#f97316' },
    { name: 'Low Confidence', value: 10, color: '#eab308' },
];

const LANE_PERFORMANCE_DATA = [
    { id: "LANE-01", sessions: 450, anomalyRate: 1.2, resolutionTime: "45s", status: "Healthy" },
    { id: "LANE-02", sessions: 412, anomalyRate: 0.8, resolutionTime: "30s", status: "Healthy" },
    { id: "LANE-03", sessions: 390, anomalyRate: 4.5, resolutionTime: "120s", status: "High Risk" },
    { id: "LANE-04", sessions: 425, anomalyRate: 1.1, resolutionTime: "40s", status: "Healthy" },
    { id: "LANE-05", sessions: 380, anomalyRate: 3.2, resolutionTime: "95s", status: "Warning" },
];

const INSIGHTS = [
    { type: "Critical", message: "Lane 3 consistently flags 'Product Mismatch' between 5-7 PM. Possible lighting glare issue.", icon: AlertTriangle, color: "text-red-500" },
    { type: "Improvement", message: "OCR failure rate spiked for 'Beverage' category. Check for new packaging designs.", icon: TrendingUp, color: "text-blue-500" },
    { type: "Operational", message: "Avg Human Resolution Time increased by 15s on weekends. Consider staffing adjustments.", icon: Activity, color: "text-yellow-500" },
];

// --- COMPONENT ---

const CheckoutAnalyticsPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const fromControlTower = queryParams.get('from') === 'control-tower';

    const [timeRange, setTimeRange] = useState("7d");

    return (
        <div className="min-h-screen bg-background text-foreground pb-20 font-sans w-full flex flex-col">

            {/* 1. HEADER & FILTERS */}
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
                                    Checkout Analytics
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
                                <h1 className="text-xl font-bold text-foreground tracking-tight">Checkout Analytics</h1>
                                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-card border border-border text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                                    Live Stream
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground">Store performance, anomaly detection patterns, and lane efficiency metrics.</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Select defaultValue="all">
                            <SelectTrigger className="w-[180px] h-9 bg-muted border-border text-xs shadow-inner">
                                <SelectValue placeholder="Select Store" />
                            </SelectTrigger>
                            <SelectContent className="bg-card border-border">
                                <SelectItem value="all">Store #402 (Ahmedabad)</SelectItem>
                                <SelectItem value="region">Region East (Hub)</SelectItem>
                            </SelectContent>
                        </Select>

                        <div className="bg-muted rounded-md flex p-1 border border-border shadow-inner">
                            {['24h', '7d', '30d'].map((range) => (
                                <button
                                    key={range}
                                    onClick={() => setTimeRange(range)}
                                    className={`px-4 py-1 text-[10px] font-bold uppercase tracking-widest rounded transition-all ${timeRange === range ? 'bg-card text-blue-400 shadow-sm border border-border' : 'text-muted-foreground hover:text-foreground'}`}
                                >
                                    {range}
                                </button>
                            ))}
                        </div>

                        <Button variant="outline" size="sm" className="h-9 border-border text-muted-foreground hover:text-foreground bg-muted shadow-sm px-4">
                            <Download className="w-3.5 h-3.5 mr-2" /> <span className="text-[10px] font-bold uppercase tracking-widest">Export</span>
                        </Button>
                    </div>
                </div>
            </header>

            <div className="p-6 w-full max-w-[1800px] mx-auto space-y-6">

                {/* 2. PERFORMANCE OVERVIEW CARDS */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="bg-card border-border hover:border-blue-500/30 transition-colors shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total Sessions ({timeRange})</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-foreground tabular-nums">12,450</div>
                            <p className="text-[10px] text-green-500 font-bold flex items-center mt-1 uppercase tracking-tighter">
                                <TrendingUp className="w-3 h-3 mr-1" /> +5.2% VS PERIOD
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="bg-card border-border hover:border-red-500/30 transition-colors shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Anomaly Rate</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-500 tabular-nums">2.1%</div>
                            <p className="text-[10px] text-red-400 font-bold flex items-center mt-1 uppercase tracking-tighter">
                                <TrendingUp className="w-3 h-3 mr-1" /> +0.4% VOLATILITY
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="bg-card border-border hover:border-blue-500/30 transition-colors shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Auto-Correction</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-500 tabular-nums">85.4%</div>
                            <p className="text-[10px] text-muted-foreground font-bold flex items-center mt-1 uppercase tracking-tighter">
                                AI VERIFIED THRESHOLD
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="bg-card border-border hover:border-green-500/30 transition-colors shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Avg Resolution</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-foreground tabular-nums">42s</div>
                            <p className="text-[10px] text-green-500 font-bold flex items-center mt-1 uppercase tracking-tighter">
                                <CheckCircle2 className="w-3 h-3 mr-1" /> WITHIN SLA RANGE
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* 3. ANOMALY TRENDS (2/3 Width) */}
                    <Card className="lg:col-span-2 bg-card border-border shadow-md">
                        <CardHeader className="border-b border-border/50 bg-muted/10">
                            <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-[0.2em]">Anomaly Trend & Composition</CardTitle>
                            <CardDescription className="text-xs text-muted-foreground">Daily breakdown of flagged checkout sessions by risk category.</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[350px] pt-6">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={ANOMALY_TREND_DATA} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border" vertical={false} />
                                    <XAxis dataKey="day" stroke="currentColor" className="text-muted-foreground" tick={{ fill: 'currentColor', fontSize: 10, fontWeight: 'bold' }} />
                                    <YAxis stroke="currentColor" className="text-muted-foreground" tick={{ fill: 'currentColor', fontSize: 10, fontWeight: 'bold' }} />
                                    <RechartsTooltip
                                        contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '12px' }}
                                        itemStyle={{ fontWeight: 'bold' }}
                                    />
                                    <Legend wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingTop: '20px' }} />
                                    <Bar dataKey="misscan" name="MISSED SCANS" stackId="a" fill="#ef4444" radius={[0, 0, 2, 2]} />
                                    <Bar dataKey="mismatch" name="PRODUCT MISMATCH" stackId="a" fill="#3b82f6" radius={[2, 2, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* 4. ANOMALY DISTRIBUTION (1/3 Width) */}
                    <Card className="bg-card border-border shadow-md">
                        <CardHeader className="border-b border-border/50 bg-muted/10">
                            <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-[0.2em]">Failure Mode Analysis</CardTitle>
                            <CardDescription className="text-xs text-muted-foreground">Categorical distribution of system anomalies.</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[350px] flex items-center justify-center pt-6">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={ANOMALY_TYPE_DATA}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={90}
                                        paddingAngle={8}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {ANOMALY_TYPE_DATA.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} opacity={0.8} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px' }} />
                                    <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* 5. HIGH RISK LANES TABLE */}
                    <Card className="lg:col-span-2 bg-card border-border shadow-md">
                        <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 bg-muted/10">
                            <div>
                                <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-[0.2em]">Lane Performance Risk Matrix</CardTitle>
                                <CardDescription className="text-xs text-muted-foreground mt-1">Terminal-level efficiency and calibration metrics.</CardDescription>
                            </div>
                            <Button variant="outline" size="sm" className="border-border text-muted-foreground text-[10px] font-bold uppercase tracking-widest bg-card h-8">
                                <Filter className="w-3.5 h-3.5 mr-2 text-blue-500" /> Filter Lanes
                            </Button>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader className="bg-muted/50">
                                    <TableRow className="border-border/50 hover:bg-transparent">
                                        <TableHead className="text-muted-foreground font-bold uppercase text-[9px] tracking-widest">Lane ID</TableHead>
                                        <TableHead className="text-muted-foreground font-bold uppercase text-[9px] tracking-widest text-center">Sessions</TableHead>
                                        <TableHead className="text-muted-foreground font-bold uppercase text-[9px] tracking-widest text-center">Anomaly Rate</TableHead>
                                        <TableHead className="text-muted-foreground font-bold uppercase text-[9px] tracking-widest text-center">Avg Resolution</TableHead>
                                        <TableHead className="text-muted-foreground font-bold uppercase text-[9px] tracking-widest text-right">Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {LANE_PERFORMANCE_DATA.map((lane) => (
                                        <TableRow key={lane.id} className="border-border/50 hover:bg-muted/30 transition-colors">
                                            <TableCell className="font-mono text-[11px] text-blue-500 font-bold">{lane.id}</TableCell>
                                            <TableCell className="text-center font-bold tabular-nums text-foreground">{lane.sessions}</TableCell>
                                            <TableCell className="text-center">
                                                <span className={`text-[11px] font-bold tabular-nums ${lane.anomalyRate > 3 ? 'text-red-500' : 'text-foreground'}`}>
                                                    {lane.anomalyRate}%
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-center text-muted-foreground text-[11px] font-bold tabular-nums">{lane.resolutionTime}</TableCell>
                                            <TableCell className="text-right">
                                                <Badge variant="outline" className={`text-[9px] font-bold uppercase tracking-tighter px-2 h-5
                                                    ${lane.status === 'High Risk' ? 'text-red-400 border-red-500/20 bg-red-500/5' :
                                                        lane.status === 'Warning' ? 'text-yellow-400 border-yellow-500/20 bg-yellow-500/5' :
                                                            'text-green-400 border-green-500/20 bg-green-500/5'}
                                                `}>
                                                    {lane.status}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    {/* 6. OPERATIONAL INSIGHTS (AI) */}
                    <Card className="bg-card border-border shadow-md">
                        <CardHeader className="border-b border-border/50 bg-muted/10">
                            <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-[0.2em] flex items-center">
                                <Scan className="w-4 h-4 mr-2 text-purple-500" /> Operational Insights
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-6">
                            {INSIGHTS.map((insight, i) => {
                                const Icon = insight.icon;
                                return (
                                    <div key={i} className="p-3 rounded-xl bg-muted/30 border border-border flex items-start space-x-3 hover:border-blue-500/30 transition-all cursor-default group shadow-sm">
                                        <div className={`mt-0.5 p-1.5 rounded-lg bg-card border border-border group-hover:scale-110 transition-transform ${insight.color}`}>
                                            <Icon className="w-3.5 h-3.5" />
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.1em] mb-1">{insight.type}</p>
                                            <p className="text-[11px] text-foreground font-medium leading-relaxed">{insight.message}</p>
                                        </div>
                                    </div>
                                )
                            })}
                            <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold uppercase text-[10px] tracking-widest h-10 shadow-lg shadow-blue-600/20">
                                Refresh Intelligence
                            </Button>
                        </CardContent>
                    </Card>

                </div>
            </div>
        </div>
    );
};

export default CheckoutAnalyticsPage;



