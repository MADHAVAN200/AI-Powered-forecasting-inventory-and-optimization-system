
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, Legend
} from 'recharts';
import {
    Activity, TrendingUp, AlertTriangle, CheckCircle2, XCircle,
    Calendar, Scan, Eye, Filter, Download, Info
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
    const [timeRange, setTimeRange] = useState("7d");

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-foreground pb-20 font-sans w-full flex flex-col">

            {/* 1. HEADER & FILTERS */}
            <header className="sticky top-0 z-30 bg-[#111] border-b border-[#222] shadow-lg">
                <div className="px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center space-x-4">
                        <div>
                            <h1 className="text-xl font-bold text-white tracking-tight">Checkout Analytics</h1>
                            <p className="text-xs text-gray-500 font-mono">Store performance & anomaly patterns</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Select defaultValue="all">
                            <SelectTrigger className="w-[140px] h-8 bg-[#1a1a1a] border-[#333] text-xs">
                                <SelectValue placeholder="Store" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Store #402</SelectItem>
                                <SelectItem value="region">Region East</SelectItem>
                            </SelectContent>
                        </Select>

                        <div className="bg-[#1a1a1a] rounded flex p-1 border border-[#333]">
                            {['24h', '7d', '30d'].map((range) => (
                                <button
                                    key={range}
                                    onClick={() => setTimeRange(range)}
                                    className={`px-3 py-1 text-xs font-medium rounded transition-colors ${timeRange === range ? 'bg-[#333] text-white' : 'text-gray-500 hover:text-gray-300'}`}
                                >
                                    {range}
                                </button>
                            ))}
                        </div>

                        <Button variant="outline" size="sm" className="h-8 border-[#333] text-gray-400 hover:text-white bg-[#1a1a1a]">
                            <Download className="w-3 h-3 mr-2" /> Export
                        </Button>
                    </div>
                </div>
            </header>

            <div className="p-6 w-full max-w-[1800px] mx-auto space-y-6">

                {/* 2. PERFORMANCE OVERVIEW CARDS */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="bg-[#111] border-[#333]">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-medium text-gray-500 uppercase">Total Sessions ({timeRange})</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">12,450</div>
                            <p className="text-xs text-green-500 flex items-center mt-1">
                                <TrendingUp className="w-3 h-3 mr-1" /> +5.2% vs last period
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="bg-[#111] border-[#333]">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-medium text-gray-500 uppercase">Anomaly Rate</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-yellow-500">2.1%</div>
                            <p className="text-xs text-red-400 flex items-center mt-1">
                                <TrendingUp className="w-3 h-3 mr-1" /> +0.4% spike detected
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="bg-[#111] border-[#333]">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-medium text-gray-500 uppercase">Auto-Correction Rate</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-500">85%</div>
                            <p className="text-xs text-gray-500 mt-1">
                                Human intervention needed in 15%
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="bg-[#111] border-[#333]">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-medium text-gray-500 uppercase">Avg Resolution Time</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">42s</div>
                            <p className="text-xs text-green-500 flex items-center mt-1">
                                <CheckCircle2 className="w-3 h-3 mr-1" /> Within SLA (60s)
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* 3. ANOMALY TRENDS (2/3 Width) */}
                    <Card className="lg:col-span-2 bg-[#111] border-[#333]">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold text-white">Anomaly Trends & Composition</CardTitle>
                            <CardDescription className="text-gray-500">Daily breakdown of flagged checkout sessions by risk type.</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[350px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={ANOMALY_TREND_DATA} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                                    <XAxis dataKey="day" stroke="#555" tick={{ fill: '#888', fontSize: 12 }} />
                                    <YAxis stroke="#555" tick={{ fill: '#888', fontSize: 12 }} />
                                    <RechartsTooltip
                                        contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                    <Legend />
                                    <Bar dataKey="misscan" name="Missed Scans" stackId="a" fill="#ef4444" radius={[0, 0, 4, 4]} />
                                    <Bar dataKey="mismatch" name="Prod. Mismatch" stackId="a" fill="#f97316" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* 4. ANOMALY DISTRIBUTION (1/3 Width) */}
                    <Card className="bg-[#111] border-[#333]">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold text-white">Failure Mode Analysis</CardTitle>
                            <CardDescription className="text-gray-500">Distribution of anomaly types.</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[350px] flex items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={ANOMALY_TYPE_DATA}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {ANOMALY_TYPE_DATA.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }} />
                                    <Legend verticalAlign="bottom" height={36} />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* 5. HIGH RISK LANES TABLE */}
                    <Card className="lg:col-span-2 bg-[#111] border-[#333]">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-lg font-bold text-white">Lane Performance Risk Matrix</CardTitle>
                                <CardDescription className="text-gray-500">Identifying hardware or calibration issues per terminal.</CardDescription>
                            </div>
                            <Button variant="outline" size="sm" className="border-[#333] text-gray-400">
                                <Filter className="w-3 h-3 mr-2" /> Filter
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader className="bg-[#1a1a1a]">
                                    <TableRow className="border-none hover:bg-transparent">
                                        <TableHead className="text-gray-400">Lane ID</TableHead>
                                        <TableHead className="text-gray-400">Total Sessions</TableHead>
                                        <TableHead className="text-gray-400">Anomaly Rate</TableHead>
                                        <TableHead className="text-gray-400">Avg Resolution</TableHead>
                                        <TableHead className="text-gray-400">Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {LANE_PERFORMANCE_DATA.map((lane) => (
                                        <TableRow key={lane.id} className="border-b border-[#222] hover:bg-[#1a1a1a] transition-colors">
                                            <TableCell className="font-mono text-gray-300">{lane.id}</TableCell>
                                            <TableCell className="text-white">{lane.sessions}</TableCell>
                                            <TableCell>
                                                <span className={`${lane.anomalyRate > 3 ? 'text-red-400 font-bold' : 'text-gray-300'}`}>
                                                    {lane.anomalyRate}%
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-gray-400">{lane.resolutionTime}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={`
                                                    ${lane.status === 'High Risk' ? 'text-red-400 border-red-900 bg-red-900/10' :
                                                        lane.status === 'Warning' ? 'text-yellow-400 border-yellow-900 bg-yellow-900/10' :
                                                            'text-green-400 border-green-900 bg-green-900/10'}
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
                    <Card className="bg-[#111] border-[#333]">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold text-white flex items-center">
                                <Scan className="w-5 h-5 mr-2 text-purple-400" /> AI Insights
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {INSIGHTS.map((insight, i) => {
                                const Icon = insight.icon;
                                return (
                                    <div key={i} className="p-3 rounded-lg bg-[#1a1a1a] border border-[#222] flex items-start space-x-3 hover:border-gray-700 transition-colors">
                                        <div className={`mt-0.5 p-1 rounded bg-[#222] ${insight.color}`}>
                                            <Icon className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-300 uppercase mb-1">{insight.type}</p>
                                            <p className="text-sm text-gray-400 leading-snug">{insight.message}</p>
                                        </div>
                                    </div>
                                )
                            })}
                            <Button className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white text-xs">
                                Generate New Insights
                            </Button>
                        </CardContent>
                    </Card>

                </div>
            </div>
        </div>
    );
};

export default CheckoutAnalyticsPage;
