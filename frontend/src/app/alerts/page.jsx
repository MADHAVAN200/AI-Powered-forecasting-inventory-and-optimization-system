
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    AlertTriangle, AlertOctagon, Info, CheckCircle2, Clock,
    Filter, MoreHorizontal, ArrowRight, Activity, Search,
    ChevronDown, ChevronRight, User, Shield, Store, Zap
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from '@/components/ui/separator';

// --- MOCK DATA ---

const ALERTS_DATA = [
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
    const navigate = useNavigate();
    const [selectedAlert, setSelectedAlert] = useState(null);
    const [filterPriority, setFilterPriority] = useState("all");

    // Filter logic
    const filteredAlerts = ALERTS_DATA.filter(alert => {
        if (filterPriority === "all") return true;
        return alert.priority.toLowerCase() === filterPriority;
    });

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-foreground pb-20 font-sans w-full flex flex-col">

            {/* 1. HEADER & CONTROLS */}
            <header className="sticky top-0 z-30 bg-[#111] border-b border-[#222] shadow-lg">
                <div className="px-6 py-4 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="p-2 bg-red-900/20 rounded-lg">
                                <Zap className="w-6 h-6 text-red-500" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                                    Operational Alerts
                                </h1>
                                <div className="text-xs text-gray-500 font-mono flex items-center gap-3 mt-1">
                                    <span className="flex items-center"><Store className="w-3 h-3 mr-1" /> Region: North East</span>
                                    <span>•</span>
                                    <span className="flex items-center text-green-500"><Activity className="w-3 h-3 mr-1" /> Live Monitoring</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3">
                            <Button variant="outline" className="h-9 border-[#333] text-gray-400 hover:text-white bg-[#1a1a1a]">
                                <Clock className="w-4 h-4 mr-2" /> Past 24h
                            </Button>
                            <Button className="h-9 bg-blue-600 hover:bg-blue-700 text-white">
                                <CheckCircle2 className="w-4 h-4 mr-2" /> Acknowledge All
                            </Button>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                            <Input
                                type="search"
                                placeholder="Search alerts..."
                                className="w-64 pl-9 h-9 bg-[#1a1a1a] border-[#333] text-sm text-gray-300 placeholder:text-gray-500"
                            />
                        </div>
                        <Select defaultValue="all" onValueChange={setFilterPriority}>
                            <SelectTrigger className="w-[140px] h-9 bg-[#1a1a1a] border-[#333] text-sm text-gray-300">
                                <SelectValue placeholder="Priority" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Any Priority</SelectItem>
                                <SelectItem value="critical">Critical</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select defaultValue="all">
                            <SelectTrigger className="w-[140px] h-9 bg-[#1a1a1a] border-[#333] text-sm text-gray-300">
                                <SelectValue placeholder="Category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Categories</SelectItem>
                                <SelectItem value="inventory">Inventory</SelectItem>
                                <SelectItem value="forecast">Forecast</SelectItem>
                                <SelectItem value="checkout">Checkout</SelectItem>
                                <SelectItem value="model">Model/System</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select defaultValue="new">
                            <SelectTrigger className="w-[140px] h-9 bg-[#1a1a1a] border-[#333] text-sm text-gray-300">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value="new">New</SelectItem>
                                <SelectItem value="acknowledged">Acknowledged</SelectItem>
                                <SelectItem value="resolved">Resolved</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </header>

            <div className="p-6 w-full max-w-[1800px] mx-auto space-y-6">

                {/* 2. KPI SNAPSHOT */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="bg-[#111] border-[#333] md:col-span-1">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-medium text-gray-500 uppercase">Critical Active</CardTitle>
                        </CardHeader>
                        <CardContent className="flex items-center justify-between">
                            <div>
                                <div className="text-4xl font-bold text-red-500">3</div>
                                <p className="text-xs text-red-400 mt-1 font-medium flex items-center">
                                    <AlertOctagon className="w-3 h-3 mr-1" /> Needs immediate triage
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-[#111] border-[#333] md:col-span-1">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-medium text-gray-500 uppercase">High Priority</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-bold text-yellow-500">12</div>
                            <p className="text-xs text-gray-400 mt-1 flex items-center">
                                +4 since last hour
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="bg-[#111] border-[#333] md:col-span-1">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-medium text-gray-500 uppercase">Avg Response Time</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-bold text-white">8m</div>
                            <p className="text-xs text-green-500 mt-1 flex items-center">
                                Within 15m SLA target
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="bg-[#111] border-[#333] md:col-span-1">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-medium text-gray-500 uppercase">Overdue</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-bold text-gray-400">1</div>
                            <p className="text-xs text-gray-500 mt-1 flex items-center">
                                Escalated to Region Mgr
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* 3. ALERTS QUEUE */}
                <Card className="bg-[#111] border-[#333]">
                    <CardHeader className="border-b border-[#222] py-4">
                        <CardTitle className="text-lg font-bold text-white">Active Alerts Queue</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader className="bg-[#1a1a1a]">
                                <TableRow className="border-none hover:bg-transparent">
                                    <TableHead className="text-gray-400 w-[100px]">Priority</TableHead>
                                    <TableHead className="text-gray-400 w-[120px]">Type</TableHead>
                                    <TableHead className="text-gray-400">Description</TableHead>
                                    <TableHead className="text-gray-400 w-[120px]">Store</TableHead>
                                    <TableHead className="text-gray-400 w-[120px]">Time</TableHead>
                                    <TableHead className="text-gray-400 w-[150px]">SLA</TableHead>
                                    <TableHead className="text-gray-400 w-[120px]">Status</TableHead>
                                    <TableHead className="text-gray-400 w-[150px]">Owner</TableHead>
                                    <TableHead className="w-[50px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredAlerts.map((alert) => (
                                    <TableRow
                                        key={alert.id}
                                        className={`border-b border-[#222] hover:bg-[#1a1a1a] transition-colors cursor-pointer group ${alert.id === selectedAlert?.id ? 'bg-[#1a1a1a]' : ''}`}
                                        onClick={() => setSelectedAlert(alert)}
                                    >
                                        <TableCell>
                                            <Badge variant="outline" className={`
                                                ${alert.priority === 'Critical' ? 'text-red-400 border-red-900 bg-red-900/10' :
                                                    alert.priority === 'High' ? 'text-yellow-400 border-yellow-900 bg-yellow-900/10' :
                                                        'text-blue-400 border-blue-900 bg-blue-900/10'}
                                            `}>
                                                {alert.priority}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="font-semibold text-gray-300 text-xs">{alert.type}</TableCell>
                                        <TableCell className="text-gray-200 font-medium">
                                            {alert.description}
                                            <div className="text-gray-500 text-xs mt-0.5">{alert.source} • {alert.id}</div>
                                        </TableCell>
                                        <TableCell className="text-gray-400 text-sm">{alert.store}</TableCell>
                                        <TableCell className="text-gray-400 text-sm">{alert.time}</TableCell>
                                        <TableCell className={`text-sm ${alert.sla === 'Overdue' ? 'text-red-500 font-bold' : 'text-gray-400'}`}>
                                            {alert.sla}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${alert.status === 'New' ? 'bg-blue-500 animate-pulse' :
                                                    alert.status === 'InProgress' ? 'bg-yellow-500' :
                                                        'bg-green-500'
                                                    }`} />
                                                <span className="text-gray-300 text-xs">{alert.status}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-gray-400 text-xs">
                                            {alert.owner === 'Unassigned' ? (
                                                <span className="text-gray-600 italic">Unassigned</span>
                                            ) : (
                                                <div className="flex items-center gap-1">
                                                    <User className="w-3 h-3" /> {alert.owner}
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-white" />
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
                <SheetContent className="bg-[#111] border-l border-[#222] text-white w-[500px] sm:max-w-[600px] overflow-y-auto">
                    {selectedAlert && (
                        <div className="space-y-6 pt-4">
                            {/* Header */}
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <Badge variant="outline" className={`
                                        ${selectedAlert.priority === 'Critical' ? 'text-red-400 border-red-900 bg-red-900/10' :
                                            selectedAlert.priority === 'High' ? 'text-yellow-400 border-yellow-900 bg-yellow-900/10' :
                                                'text-blue-400 border-blue-900 bg-blue-900/10'}
                                    `}>
                                        {selectedAlert.priority} Priority
                                    </Badge>
                                    <span className="text-gray-500 font-mono text-xs">{selectedAlert.id}</span>
                                </div>
                                <h2 className="text-xl font-bold text-white mb-2">{selectedAlert.description}</h2>
                                <p className="text-sm text-gray-400 flex items-center gap-2">
                                    <Clock className="w-4 h-4" /> Detected {selectedAlert.time}
                                    <span className="text-gray-600">|</span>
                                    <Store className="w-4 h-4" /> {selectedAlert.store}
                                </p>
                            </div>

                            <Separator className="bg-[#222]" />

                            {/* Root Cause Stats */}
                            <div className="bg-[#1a1a1a] rounded-lg p-4 border border-[#222]">
                                <h3 className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wider">Analysis Signals</h3>
                                <div className="space-y-2">
                                    {selectedAlert.rootCause.map((cause, idx) => (
                                        <div key={idx} className="flex items-center gap-2 text-sm text-red-300">
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
                                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Workflow Actions</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    <Button variant="outline" className="border-[#333] hover:border-gray-500 text-gray-300 hover:text-white bg-transparent">
                                        <CheckCircle2 className="w-4 h-4 mr-2" /> Acknowledge
                                    </Button>
                                    <Button variant="outline" className="border-[#333] hover:border-gray-500 text-gray-300 hover:text-white bg-transparent">
                                        <User className="w-4 h-4 mr-2" /> Assign Owner
                                    </Button>
                                </div>
                                <div className="pt-2">
                                    <label className="text-xs text-gray-500 mb-1 block">Add Note</label>
                                    <textarea
                                        className="w-full bg-[#1a1a1a] border border-[#333] rounded-md p-2 text-sm text-white focus:outline-none focus:border-blue-500/50 min-h-[80px]"
                                        placeholder="Enter triage notes..."
                                    />
                                </div>
                            </div>

                        </div>
                    )}
                </SheetContent>
            </Sheet>

        </div>
    );
};

export default OperationalAlertsPage;
