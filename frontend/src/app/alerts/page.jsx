
import React, { useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    AlertTriangle, AlertOctagon, Info, CheckCircle2, Clock,
    Filter, MoreHorizontal, ArrowRight, Activity, Search,
    ChevronDown, ChevronRight, User, Shield, Store, Zap, Home
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
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';

import Sidebar from '@/components/Sidebar';
import ThemeToggle from '@/components/ThemeToggle';
import { backendModuleService } from '@/services/backendModuleService';
import { useAuth } from '@/context/AuthContext';

const FALLBACK_ALERTS_DATA = [
    {
        id: "ALT-2024-001",
        priority: "Critical",
        type: "Inventory",
        source: "Inventory Risk",
        description: "Imminent stockout for Avocados (Hass) at Store #402. Safety stock breached.",
        store: "Store 402",
        time: "10m ago",
        sla: "15m remaining",
        status: "New",
        owner: "Unassigned",
        rootCause: ["Demand spike (+40%)", "Late delivery"],
        recommendation: "Initiate emergency replenishment from Warehouse B."
    },
    {
        id: "ALT-2024-002",
        priority: "High",
        type: "Model/System",
        source: "Model Health",
        description: "Vision Model accuracy dropped by 1.5% in the last hour.",
        store: "Global",
        time: "45m ago",
        sla: "2h remaining",
        status: "In Progress",
        owner: "Sarah J. (AI Ops)",
        rootCause: ["Lighting condition change", "New packaging detected"],
        recommendation: "Trigger localized retraining for affected cameras."
    },
    {
        id: "ALT-2024-003",
        priority: "High",
        type: "Checkout",
        source: "Live Monitoring",
        description: "Repeated lane anomalies at Lane 03. Possible camera obstruction.",
        store: "Store 115",
        time: "1h ago",
        sla: "Overdue",
        status: "New",
        owner: "Unassigned",
        rootCause: ["Camera occlusion", "Sensor noise"],
        recommendation: "Dispatch floor staff to inspect Lane 03."
    },
    {
        id: "ALT-2024-004",
        priority: "Medium",
        type: "Forecast",
        source: "Demand Engine",
        description: "Forecast volatility exceeds threshold due to unmapped local event.",
        store: "Store 892",
        time: "3h ago",
        sla: "4h remaining",
        status: "Acknowledged",
        owner: "Mike R.",
        rootCause: ["Event detection lag", "Weather shift"],
        recommendation: "Review event parameters in Scenario Planner."
    },
];

const OperationalAlertsPage = () => {
    const { role } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const fromControlTower = queryParams.get('from') === 'control-tower';
    const [selectedAlert, setSelectedAlert] = useState(null);
    const [filterPriority, setFilterPriority] = useState("all");
    const [alerts, setAlerts] = useState(FALLBACK_ALERTS_DATA);
    const [avgResponseTime, setAvgResponseTime] = useState('8m');
    const [createSheetOpen, setCreateSheetOpen] = useState(false);
    const [isSavingAlert, setIsSavingAlert] = useState(false);
    const [createError, setCreateError] = useState('');
    const [newAlert, setNewAlert] = useState({
        description: '',
        priority: 'High',
        type: 'Inventory',
        store: 'Store 402',
        rootCauseText: '',
        recommendation: 'Review and triage.',
    });

    React.useEffect(() => {
        const loadAlerts = async () => {
            try {
                const data = await backendModuleService.getModuleData('alerts');
                setAlerts(data?.alerts || FALLBACK_ALERTS_DATA);
                setAvgResponseTime(data?.kpis?.avgResponseTime || '8m');
            } catch (err) {
                console.error('Failed to fetch alerts module data:', err);
            }
        };
        loadAlerts();
    }, []);

    // Filter logic
    const filteredAlerts = alerts.filter(alert => {
        if (filterPriority === "all") return true;
        return alert.priority.toLowerCase() === filterPriority;
    });

    const derivedKpis = useMemo(() => {
        const critical = alerts.filter(a => a.priority === 'Critical').length;
        const high = alerts.filter(a => a.priority === 'High').length;
        const overdue = alerts.filter(a => a.sla === 'Overdue').length;
        return { critical, high, overdue };
    }, [alerts]);

    const resetCreateForm = () => {
        setNewAlert({
            description: '',
            priority: 'High',
            type: 'Inventory',
            store: 'Store 402',
            rootCauseText: '',
            recommendation: 'Review and triage.',
        });
        setCreateError('');
    };

    const handleAlertFieldChange = (field, value) => {
        setNewAlert((prev) => ({ ...prev, [field]: value }));
    };

    const handleAddAlert = async () => {
        if (!newAlert.description.trim()) {
            setCreateError('Description is required.');
            return;
        }

        setIsSavingAlert(true);
        setCreateError('');

        const alertPayload = {
            id: `ALT-${Date.now()}`,
            priority: newAlert.priority,
            type: newAlert.type,
            source: 'Manual Entry',
            description: newAlert.description.trim(),
            store: newAlert.store.trim() || 'Store 402',
            time: 'Just now',
            sla: '30m remaining',
            status: 'New',
            owner: 'Unassigned',
            rootCause: newAlert.rootCauseText
                .split(',')
                .map((item) => item.trim())
                .filter(Boolean),
            recommendation: newAlert.recommendation.trim() || 'Review and triage.'
        };

        try {
            if (alertPayload.rootCause.length === 0) {
                alertPayload.rootCause = ['Manual note'];
            }

            await backendModuleService.addModuleItem('alerts', 'alerts', alertPayload);
            setAlerts((prev) => [alertPayload, ...prev]);
            setCreateSheetOpen(false);
            resetCreateForm();
            toast({
                title: 'Alert saved',
                description: 'The alert has been added successfully.',
            });
        } catch (err) {
            console.error('Failed to add alert:', err);
            setCreateError(err.message || 'Could not save alert.');
            toast({
                title: 'Save failed',
                description: err.message || 'Could not save alert.',
                variant: 'destructive',
            });
        } finally {
            setIsSavingAlert(false);
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-blue-500/30 pb-20">
            {/* Header & Filters */}
            <div className="sticky top-0 z-30 bg-sidebar/95 backdrop-blur-md border-b border-sidebar-border px-6 h-16 flex items-center shadow-sm">

                <div className="flex items-center justify-between gap-6 w-full">
                    <div className="flex items-center space-x-4">
                        <div className="p-2 bg-red-500/10 rounded-lg border border-red-500/20">
                            <Zap className="w-5 h-5 text-red-500" />
                        </div>
                        <div>
                            <div className="flex items-center space-x-3">
                                <h1 className="text-lg font-bold text-foreground tracking-tight">Operational Alerts</h1>
                                <Badge variant="outline" className="text-red-500 border-red-500/30 bg-red-500/10 text-[10px] h-5">
                                    Live
                                </Badge>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative group hidden md:block">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground group-focus-within:text-blue-500 transition-colors" />
                            <Input
                                type="search"
                                placeholder="Search alerts..."
                                className="w-64 pl-9 h-9 bg-background border-border text-xs text-foreground focus-visible:ring-blue-500/50 shadow-inner"
                            />
                        </div>
                        <Button 
                            variant="outline" 
                            size="sm"
                            className="h-9 border-border text-muted-foreground hover:text-foreground bg-background text-xs"
                            onClick={() => {
                                resetCreateForm();
                                setCreateSheetOpen(true);
                            }}
                        >
                            <AlertTriangle className="w-3.5 h-3.5 mr-2 text-purple-500" /> Add Alert
                        </Button>
                        <Button size="sm" className="h-9 bg-blue-600 hover:bg-blue-500 text-white text-xs px-4 shadow-lg shadow-blue-500/20">
                            <CheckCircle2 className="w-3.5 h-3.5 mr-2" /> Acknowledge All
                        </Button>
                        <div className="ml-1 pl-1 border-l border-border h-6 flex items-center">
                            <ThemeToggle />
                        </div>
                    </div>
                </div>

            </div>

            <div className="p-6 w-full space-y-6">
                {/* Filters Strip */}
                <div className="flex flex-wrap items-center gap-3 bg-muted/30 p-4 rounded-xl border border-border">
                    <Select defaultValue="all" onValueChange={setFilterPriority}>
                        <SelectTrigger className="w-[130px] h-9 bg-background border-border text-[11px] text-foreground hover:border-blue-500/50 transition-colors">
                            <SelectValue placeholder="Priority" />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border text-foreground">
                            <SelectItem value="all">Any Priority</SelectItem>
                            <SelectItem value="critical">Critical</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select defaultValue="all">
                        <SelectTrigger className="w-[130px] h-9 bg-background border-border text-[11px] text-foreground hover:border-blue-500/50 transition-colors">
                            <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border text-foreground">
                            <SelectItem value="all">All Categories</SelectItem>
                            <SelectItem value="inventory">Inventory</SelectItem>
                            <SelectItem value="forecast">Forecast</SelectItem>
                            <SelectItem value="checkout">Checkout</SelectItem>
                            <SelectItem value="model">Model/System</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select defaultValue="new">
                        <SelectTrigger className="w-[130px] h-9 bg-background border-border text-[11px] text-foreground hover:border-blue-500/50 transition-colors">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border text-foreground">
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="new">New</SelectItem>
                            <SelectItem value="acknowledged">Acknowledged</SelectItem>
                            <SelectItem value="resolved">Resolved</SelectItem>
                        </SelectContent>
                    </Select>
                    <Badge variant="outline" className="border-border text-muted-foreground ml-auto uppercase text-[9px] font-bold tracking-widest">{filteredAlerts.length} Active Alerts</Badge>
                </div>

                {/* 2. KPI SNAPSHOT */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="bg-card border-border md:col-span-1 hover:border-red-500/30 transition-colors">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-medium text-muted-foreground uppercase">Critical Active</CardTitle>
                        </CardHeader>
                        <CardContent className="flex items-center justify-between">
                            <div>
                                <div className="text-4xl font-bold text-red-500 tabular-nums">{derivedKpis.critical}</div>
                                <p className="text-[10px] text-red-400 mt-1 font-medium flex items-center uppercase tracking-wider">
                                    <AlertOctagon className="w-3 h-3 mr-1" /> Triage Required
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-card border-border md:col-span-1 hover:border-yellow-500/30 transition-colors">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-medium text-muted-foreground uppercase">High Priority</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-bold text-yellow-500 tabular-nums">{derivedKpis.high}</div>
                            <p className="text-[10px] text-muted-foreground mt-1 flex items-center uppercase tracking-wider">
                                +4 since last hour
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="bg-card border-border md:col-span-1 hover:border-blue-500/30 transition-colors">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-medium text-muted-foreground uppercase">Avg Response Time</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-bold text-foreground tabular-nums">{avgResponseTime}</div>
                            <p className="text-[10px] text-green-500 mt-1 flex items-center uppercase tracking-wider font-semibold">
                                <CheckCircle2 className="w-3 h-3 mr-1" /> Within SLA Target
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="bg-card border-border md:col-span-1 hover:border-border transition-colors">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-medium text-muted-foreground uppercase">Overdue</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-bold text-muted-foreground tabular-nums">{derivedKpis.overdue}</div>
                            <p className="text-[10px] text-muted-foreground mt-1 flex items-center uppercase tracking-wider">
                                Escalated Signals
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* 3. ALERTS QUEUE */}
                <Card className="bg-card border-border overflow-hidden">
                    <CardHeader className="border-b border-border bg-muted/30 py-4">
                        <CardTitle className="text-lg font-bold text-foreground">Active Alerts Queue</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow className="border-border hover:bg-transparent">
                                    <TableHead className="text-muted-foreground w-[100px] text-[10px] uppercase font-bold tracking-widest h-10">Priority</TableHead>
                                    <TableHead className="text-muted-foreground w-[120px] text-[10px] uppercase font-bold tracking-widest h-10">Type</TableHead>
                                    <TableHead className="text-muted-foreground text-[10px] uppercase font-bold tracking-widest h-10">Description</TableHead>
                                    <TableHead className="text-muted-foreground w-[120px] text-[10px] uppercase font-bold tracking-widest h-10">Store</TableHead>
                                    <TableHead className="text-muted-foreground w-[120px] text-[10px] uppercase font-bold tracking-widest h-10">Time</TableHead>
                                    <TableHead className="text-muted-foreground w-[150px] text-[10px] uppercase font-bold tracking-widest h-10">SLA</TableHead>
                                    <TableHead className="text-muted-foreground w-[120px] text-[10px] uppercase font-bold tracking-widest h-10">Status</TableHead>
                                    <TableHead className="text-muted-foreground w-[150px] text-[10px] uppercase font-bold tracking-widest h-10">Owner</TableHead>
                                    <TableHead className="w-[50px] h-10"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                    {filteredAlerts.map((alert) => (
                                        <TableRow
                                            key={alert.id}
                                            className={`border-b border-border hover:bg-muted transition-colors cursor-pointer group ${alert.id === selectedAlert?.id ? 'bg-muted' : ''}`}
                                            onClick={() => setSelectedAlert(alert)}
                                        >
                                            <TableCell>
                                                <Badge variant="outline" className={`
                                                    ${alert.priority === 'Critical' ? 'text-red-600 border-red-500/30 bg-red-100 dark:bg-red-900/10' :
                                                        alert.priority === 'High' ? 'text-yellow-600 border-yellow-500/30 bg-yellow-100 dark:bg-yellow-900/10' :
                                                            'text-blue-600 border-blue-500/30 bg-blue-100 dark:bg-blue-900/10'}
                                                    text-[10px] h-5
                                                `}>
                                                    {alert.priority}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="font-semibold text-foreground text-xs">{alert.type}</TableCell>
                                            <TableCell>
                                                <div className="font-medium text-foreground text-sm tracking-tight">{alert.description}</div>
                                                <div className="text-muted-foreground text-[10px] mt-0.5 uppercase tracking-widest font-mono">{alert.source} • {alert.id}</div>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground text-xs">{alert.store}</TableCell>
                                            <TableCell className="text-muted-foreground text-xs tabular-nums">{alert.time}</TableCell>
                                            <TableCell className={`text-xs tabular-nums ${alert.sla === 'Overdue' ? 'text-red-500 font-bold' : 'text-muted-foreground'}`}>
                                                {alert.sla}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-1.5 h-1.5 rounded-full ${alert.status === 'New' ? 'bg-blue-500 animate-pulse' :
                                                        alert.status === 'In Progress' ? 'bg-yellow-500' :
                                                            'bg-green-500'
                                                        }`} />
                                                    <span className="text-foreground text-xs">{alert.status}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground text-xs">
                                                {alert.owner === 'Unassigned' ? (
                                                    <span className="text-muted-foreground/60 italic">Unassigned</span>
                                                ) : (
                                                    <div className="flex items-center gap-1">
                                                        <User className="w-3 h-3" /> {alert.owner}
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-blue-500 transition-colors" />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

            </div>

            {/* 4. DETAIL PANEL (SHEET) */}
            <Sheet open={!!selectedAlert} onOpenChange={(open) => !open && setSelectedAlert(null)}>
                <SheetContent className="bg-background border-l border-border text-foreground w-[500px] sm:max-w-[600px] overflow-y-auto">
                    {selectedAlert && (
                        <div className="space-y-6 pt-4">
                             {/* Header */}
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <Badge variant="outline" className={`
                                        ${selectedAlert.priority === 'Critical' ? 'text-red-600 border-red-500/30 bg-red-500/10' :
                                            selectedAlert.priority === 'High' ? 'text-yellow-600 border-yellow-500/30 bg-yellow-500/10' :
                                                'text-blue-600 border-blue-500/30 bg-blue-500/10'}
                                    `}>
                                        {selectedAlert.priority} Priority
                                    </Badge>
                                    <span className="text-muted-foreground font-mono text-xs">{selectedAlert.id}</span>
                                </div>
                                <h2 className="text-xl font-bold text-foreground mb-2">{selectedAlert.description}</h2>
                                <p className="text-sm text-muted-foreground flex items-center gap-2">
                                    <Clock className="w-4 h-4" /> Detected {selectedAlert.time}
                                    <span className="text-border">|</span>
                                    <Store className="w-4 h-4" /> {selectedAlert.store}
                                </p>
                            </div>

                            <Separator className="bg-border" />

                            {/* Root Cause Stats */}
                            <div className="bg-muted/40 rounded-lg p-4 border border-border">
                                <h3 className="text-[10px] font-bold text-muted-foreground mb-3 uppercase tracking-wider">Analysis Signals</h3>
                                <div className="space-y-2">
                                    {selectedAlert.rootCause.map((cause, idx) => (
                                        <div key={idx} className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                                            <AlertTriangle className="w-4 h-4" /> {cause}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* AI Recommendations */}
                            <div className="bg-blue-900/10 rounded-lg p-4 border border-blue-900/30">
                                <h3 className="text-sm font-semibold text-blue-400 mb-2 uppercase tracking-wider flex items-center">
                                    <Shield className="w-4 h-4 mr-2" /> AI Recommendation
                                </h3>
                                <p className="text-sm text-blue-100 mb-4">{selectedAlert.recommendation}</p>
                                <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700 text-white" onClick={() => {
                                    // Navigate based on type
                                    if (selectedAlert.type === 'Inventory') navigate('/inventory-risk');
                                    if (selectedAlert.type === 'Forecast') navigate('/forecast-engine');
                                    if (selectedAlert.type === 'Checkout') navigate('/live-checkout');
                                    if (selectedAlert.type === 'Model/System') navigate('/model-health');
                                }}>
                                    Take Action <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </div>

                             {/* Human Controls */}
                            <div className="space-y-4">
                                <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Workflow Actions</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    <Button variant="outline" className="border-border hover:border-muted-foreground text-foreground bg-background">
                                        <CheckCircle2 className="w-4 h-4 mr-2" /> Acknowledge
                                    </Button>
                                    <Button variant="outline" className="border-border hover:border-muted-foreground text-foreground bg-background">
                                        <User className="w-4 h-4 mr-2" /> Assign Owner
                                    </Button>
                                </div>
                                <div className="pt-2">
                                    <label className="text-[10px] font-bold text-muted-foreground mb-1 block uppercase">Add Note</label>
                                    <textarea
                                        className="w-full bg-muted/40 border border-border rounded-md p-2 text-sm text-foreground focus:outline-none focus:border-blue-500/50 min-h-[80px]"
                                        placeholder="Enter triage notes..."
                                    />
                                </div>
                            </div>

                        </div>
                    )}
                </SheetContent>
            </Sheet>

            <Sheet open={createSheetOpen} onOpenChange={setCreateSheetOpen}>
                <SheetContent className="bg-background border-l border-border text-foreground w-[520px] sm:max-w-[560px] overflow-y-auto">
                    <div className="space-y-6 pt-4">
                        <SheetHeader className="text-left">
                            <SheetTitle className="text-foreground text-xl">Create Alert</SheetTitle>
                            <SheetDescription className="text-muted-foreground">
                                Add a new operational alert and save it to the shared backend/Supabase flow.
                            </SheetDescription>
                        </SheetHeader>

                        <div className="space-y-5">
                             <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Description</label>
                                <Textarea
                                    value={newAlert.description}
                                    onChange={(e) => handleAlertFieldChange('description', e.target.value)}
                                    placeholder="Describe the issue, impact, and urgency..."
                                    className="min-h-[110px] bg-muted/40 border-border text-foreground"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Priority</label>
                                    <Select value={newAlert.priority} onValueChange={(value) => handleAlertFieldChange('priority', value)}>
                                        <SelectTrigger className="bg-muted/40 border-border text-foreground">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-card border-border">
                                            <SelectItem value="Critical">Critical</SelectItem>
                                            <SelectItem value="High">High</SelectItem>
                                            <SelectItem value="Medium">Medium</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Type</label>
                                    <Select value={newAlert.type} onValueChange={(value) => handleAlertFieldChange('type', value)}>
                                        <SelectTrigger className="bg-muted/40 border-border text-foreground">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-card border-border">
                                            <SelectItem value="Inventory">Inventory</SelectItem>
                                            <SelectItem value="Forecast">Forecast</SelectItem>
                                            <SelectItem value="Checkout">Checkout</SelectItem>
                                            <SelectItem value="Model/System">Model/System</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Store</label>
                                <Input
                                    value={newAlert.store}
                                    onChange={(e) => handleAlertFieldChange('store', e.target.value)}
                                    placeholder="Store 402"
                                    className="bg-muted/40 border-border text-foreground"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Root Causes</label>
                                <Input
                                    value={newAlert.rootCauseText}
                                    onChange={(e) => handleAlertFieldChange('rootCauseText', e.target.value)}
                                    placeholder="Comma separated, e.g. Delay, demand spike"
                                    className="bg-muted/40 border-border text-foreground"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Recommendation</label>
                                <Textarea
                                    value={newAlert.recommendation}
                                    onChange={(e) => handleAlertFieldChange('recommendation', e.target.value)}
                                    placeholder="What should operations do next?"
                                    className="min-h-[96px] bg-muted/40 border-border text-foreground"
                                />
                            </div>

                            {createError && (
                                <div className="rounded-lg border border-red-900/60 bg-red-950/30 px-3 py-2 text-sm text-red-300">
                                    {createError}
                                </div>
                            )}
                        </div>

                         <SheetFooter className="gap-2 sm:justify-end">
                            <Button
                                variant="outline"
                                className="border-border text-muted-foreground bg-transparent"
                                onClick={() => {
                                    setCreateSheetOpen(false);
                                    resetCreateForm();
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                className="bg-purple-600 hover:bg-purple-700 text-white"
                                onClick={handleAddAlert}
                                disabled={isSavingAlert}
                            >
                                {isSavingAlert ? 'Saving...' : 'Save Alert'}
                            </Button>
                        </SheetFooter>
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    );
};

export default OperationalAlertsPage;
