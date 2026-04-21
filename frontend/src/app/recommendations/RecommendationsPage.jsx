import React, { useState, useEffect, useMemo } from 'react';
import { 
    History, Filter, Download, Search, Calendar as CalendarIcon, 
    ArrowRight, CheckCircle2, XCircle, Clock, AlertCircle,
    Brain, LineChart, PieChart as PieChartIcon, Table as TableIcon,
    RefreshCw, ChevronLeft, ChevronRight, Home, LayoutDashboard, Settings
} from 'lucide-react';
import {
    Card, CardContent, CardDescription, CardHeader, CardTitle
} from '@/components/ui/card';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import {
    LineChart as ReLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
    ResponsiveContainer, Legend, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import Sidebar from '@/components/Sidebar';
import { recommendationService } from '@/services/recommendationService';
import {
    Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink,
    BreadcrumbPage, BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import { useLocation, useNavigate } from 'react-router-dom';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#f97316'];

const MODULES = [
    'all',
    'Demand & Market Intelligence',
    'Operational Alerts',
    'Stock Rebalancing',
    'Vendor Portal',
    'Demand Forecast',
    'Inventory Risk',
    'Checkout Intelligence',
    'Logistics'
];

const RecommendationsPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const fromControlTower = queryParams.get('from') === 'control-tower';

    const [data, setData] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [filters, setFilters] = useState({
        module: 'all',
        status: 'all',
        priority: 'all',
        startDate: '',
        endDate: ''
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const [dataRes, statsRes] = await Promise.all([
                recommendationService.getAll({ ...filters, page, limit: 15 }),
                recommendationService.getStats(filters)
            ]);
            setData(dataRes.data);
            setTotal(dataRes.total);
            setStats(statsRes);
        } catch (err) {
            console.error('Error loading recommendations:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [filters, page]);

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setPage(1);
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Applied': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
            case 'Dismissed': return <XCircle className="w-4 h-4 text-red-500" />;
            default: return <Clock className="w-4 h-4 text-yellow-500" />;
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'Critical': return 'text-red-500 border-red-500/30 bg-red-500/10';
            case 'High': return 'text-orange-500 border-orange-500/30 bg-orange-500/10';
            case 'Medium': return 'text-blue-500 border-blue-500/30 bg-blue-500/10';
            default: return 'text-gray-500 border-gray-500/30 bg-gray-500/10';
        }
    };

    const chartData = useMemo(() => {
        if (!stats) return [];
        return Object.entries(stats.byModule).map(([name, value]) => ({ name, value }));
    }, [stats]);

    const priorityData = useMemo(() => {
        if (!stats) return [];
        return Object.entries(stats.byPriority).map(([name, value]) => ({ name, value }));
    }, [stats]);

    return (
        <div className="min-h-screen bg-background text-foreground pb-20">
            
            <main className="flex flex-col min-w-0">
                {/* Header & Filters */}
                <div className="sticky top-0 z-30 bg-card/95 backdrop-blur-md border-b border-border px-6 py-6 shadow-md transition-all">
                    {/* Breadcrumb */}
                    <div className="mb-2">
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem>
                                    <BreadcrumbLink
                                        onClick={() => navigate('/')}
                                        className="flex items-center gap-1 text-muted-foreground hover:text-primary cursor-pointer text-[11px] transition-colors"
                                    >
                                        <Home className="w-3 h-3" />
                                        Home
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator className="text-border" />
                                {fromControlTower && (
                                    <>
                                        <BreadcrumbItem>
                                            <BreadcrumbLink
                                                onClick={() => navigate('/control-tower')}
                                                className="flex items-center gap-1 text-muted-foreground hover:text-primary cursor-pointer text-[11px] transition-colors"
                                            >
                                                Control Tower
                                            </BreadcrumbLink>
                                        </BreadcrumbItem>
                                        <BreadcrumbSeparator className="text-border" />
                                    </>
                                )}
                                <BreadcrumbItem>
                                    <BreadcrumbPage className="text-purple-500 text-[11px] font-medium">
                                        AI Recommendations
                                    </BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>

                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center space-x-3">
                                <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                                <h1 className="text-2xl font-bold text-foreground">AI Intelligence Log</h1>
                                <Badge variant="outline" className="text-purple-600 border-purple-500/30 bg-purple-100 dark:bg-purple-900/10 text-[10px] h-5">
                                    Strategic Engine v4.2
                                </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">Audit trail of autonomous optimization signals & reasoning chains.</p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" className="h-9 px-3 bg-card border-border text-muted-foreground hover:text-foreground">
                                <Download className="w-4 h-4 mr-2" /> Export
                            </Button>
                            <Button onClick={fetchData} variant="outline" size="sm" className="h-9 px-3 bg-card border-border text-purple-500 hover:text-purple-400">
                                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Filters Row */}
                    <div className="flex flex-wrap items-end gap-4 p-4 bg-card border border-border rounded-xl shadow-sm">
                        <div className="flex flex-col space-y-1.5">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest pl-1">Module Source</label>
                            <Select value={filters.module} onValueChange={(v) => handleFilterChange('module', v)}>
                                <SelectTrigger className="w-[180px] h-9 bg-background border-border text-foreground text-xs">
                                    <SelectValue placeholder="All Modules" />
                                </SelectTrigger>
                                <SelectContent className="bg-card border-border text-foreground">
                                    {MODULES.map(m => (
                                        <SelectItem key={m} value={m} className="text-xs">{m === 'all' ? 'All Modules' : m}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex flex-col space-y-1.5">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest pl-1">Priority Tier</label>
                            <Select value={filters.priority} onValueChange={(v) => handleFilterChange('priority', v)}>
                                <SelectTrigger className="w-[140px] h-9 bg-background border-border text-foreground text-xs">
                                    <SelectValue placeholder="Priority" />
                                </SelectTrigger>
                                <SelectContent className="bg-card border-border text-foreground">
                                    <SelectItem value="all" className="text-xs">All Levels</SelectItem>
                                    <SelectItem value="Critical" className="text-xs">Critical</SelectItem>
                                    <SelectItem value="High" className="text-xs">High Priority</SelectItem>
                                    <SelectItem value="Medium" className="text-xs">Standard</SelectItem>
                                    <SelectItem value="Low" className="text-xs">Low Risk</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex flex-col space-y-1.5">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest pl-1">Status</label>
                            <Select value={filters.status} onValueChange={(v) => handleFilterChange('status', v)}>
                                <SelectTrigger className="w-[110px] h-9 bg-background border-border text-foreground text-xs">
                                    <SelectValue placeholder="All" />
                                </SelectTrigger>
                                <SelectContent className="bg-card border-border text-foreground">
                                    <SelectItem value="all" className="text-xs">All</SelectItem>
                                    <SelectItem value="Pending" className="text-xs">Pending</SelectItem>
                                    <SelectItem value="Applied" className="text-xs">Applied</SelectItem>
                                    <SelectItem value="Dismissed" className="text-xs">Dismissed</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex flex-col space-y-1.5">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest pl-1">Target Date</label>
                            <Input 
                                type="date" 
                                className="h-9 w-[150px] bg-background border-border text-foreground text-xs focus:ring-purple-500/20" 
                                value={filters.startDate}
                                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                            />
                        </div>

                        <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-9 text-muted-foreground hover:text-foreground"
                            onClick={() => setFilters({ module: 'all', status: 'all', priority: 'all', startDate: '', endDate: '' })}
                        >
                            Reset
                        </Button>
                    </div>

                    {/* Stats Section */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="bg-card border-border relative overflow-hidden group hover:border-purple-500/30 transition-colors">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total Recommendations</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-black text-foreground tabular-nums tracking-tighter">{total.toLocaleString()}</div>
                                <div className="text-[10px] text-muted-foreground mt-1 flex items-center">
                                    <Globe className="w-3 h-3 mr-1" /> System-wide aggregate
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-card border-border relative overflow-hidden group hover:border-red-500/30 transition-colors">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Critical Actions</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-black text-red-500 tabular-nums tracking-tighter">{stats?.byPriority?.Critical || 0}</div>
                                <div className="text-[10px] text-muted-foreground mt-1 flex items-center">
                                    <AlertTriangle className="w-3 h-3 mr-1" /> Immediate attention required
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-card border-border relative overflow-hidden group hover:border-blue-500/30 transition-colors">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Avg Impact Score</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-black text-blue-600 dark:text-blue-400 tabular-nums tracking-tighter">84.2</div>
                                <div className="text-[10px] text-muted-foreground mt-1 flex items-center">
                                    <TrendingUp className="w-3 h-3 mr-1" /> +12% Efficiency Gain
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Table Section */}
                    <Card className="bg-card border-border overflow-hidden">
                        <CardHeader className="pb-0 border-b border-border bg-muted/30 px-6 py-4">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-semibold flex items-center gap-2 text-foreground">
                                    <TableIcon className="w-4 h-4 text-muted-foreground" /> Detailed Recommendations Log
                                </CardTitle>
                                <div className="text-[10px] text-muted-foreground">Showing {data.length} of {total} results</div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-border bg-muted/30 hover:bg-transparent">
                                        <TableHead className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest py-4 pl-6">Timestamp</TableHead>
                                        <TableHead className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest py-4">Module Source</TableHead>
                                        <TableHead className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest py-4">Strategic Recommendation</TableHead>
                                        <TableHead className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest py-4 text-center">Priority</TableHead>
                                        <TableHead className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest py-4 text-center">Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        Array.from({ length: 5 }).map((_, i) => (
                                            <TableRow key={i} className="border-border animate-pulse">
                                                <TableCell colSpan={5} className="h-12 bg-muted/20"></TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        data.map((row) => (
                                            <TableRow key={row.id} className="border-border hover:bg-accent/40 transition-colors group">
                                                <TableCell className="text-xs text-muted-foreground font-mono py-4">
                                                    {new Date(row.date).toLocaleDateString(undefined, { month: 'short', day: '2-digit', year: 'numeric' })}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                                        <span className="text-[11px] font-medium text-foreground">{row.module}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="text-xs text-foreground group-hover:text-primary transition-colors">{row.recommendation}</span>
                                                        <span className="text-[9px] text-muted-foreground mt-1 uppercase tracking-tighter">Impact: {row.impact} Model Output</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <Badge variant="outline" className={`text-[9px] uppercase font-bold shadow-sm ${getPriorityColor(row.priority)}`}>
                                                        {row.priority}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <div className="flex flex-col items-center gap-1">
                                                        {getStatusIcon(row.status)}
                                                        <span className="text-[9px] text-muted-foreground font-bold uppercase">{row.status}</span>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    {/* Pagination */}
                    <div className="flex items-center justify-between pb-10">
                        <div className="text-xs text-muted-foreground">
                            Page {page} of {Math.ceil(total / 15) || 1}
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="bg-card border-border h-8 w-8 p-0"
                                disabled={page === 1}
                                onClick={() => setPage(p => p - 1)}
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="bg-card border-border h-8 w-8 p-0"
                                disabled={page >= Math.ceil(total / 15)}
                                onClick={() => setPage(p => p + 1)}
                            >
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default RecommendationsPage;
