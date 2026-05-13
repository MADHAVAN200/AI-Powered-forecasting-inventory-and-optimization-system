import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Truck, MapPin, AlertTriangle, ArrowRight,
  MoreHorizontal, Package, Thermometer,
  ShieldAlert, Activity, Search, LayoutDashboard,
  ArrowRightLeft, Store, Zap, LogOut, Home, RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Progress } from "@/components/ui/progress";
import { Separator } from '@/components/ui/separator';
import { backendModuleService } from '@/services/backendModuleService';
import { toast } from '@/hooks/use-toast';
import {
    Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink,
    BreadcrumbPage, BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import { useAuth } from '@/context/AuthContext';
import Sidebar from '@/components/Sidebar';

// --- Mock Data ---

const FALLBACK_KPI_METRICS = [
  { label: 'Active Transfers', value: '42', trend: '+5', status: 'neutral', icon: Truck },
  { label: 'In-Transit', value: '28', trend: '+12', status: 'neutral', icon: Activity },
  { label: 'Delayed', value: '3', trend: '-2', status: 'critical', icon: AlertTriangle },
  { label: 'At Risk', value: '5', trend: '+1', status: 'warning', icon: ShieldAlert },
];

const FALLBACK_TRANSFERS_DATA = [
  {
    id: 'TRF-2024-001',
    sku: 'APP-ORG-001',
    product: 'Organic Honeycrisp Apples',
    qty: 500,
    unit: 'kg',
    source: 'DC-North (Warehouse)',
    destination: 'Store #104 (Downtown)',
    type: 'Warehouse -> Store',
    status: 'In Transit',
    eta: 'Today, 14:00',
    sla_status: 'On Track',
    cold_chain: true,
    risk_level: 'Low',
    events: [
      { time: '10:00 AM', event: 'Departed DC-North', location: 'Seattle, WA' },
      { time: '08:30 AM', event: 'Loaded via Dock 4', location: 'Seattle, WA' },
      { time: '07:00 AM', event: 'Pick & Pack Completed', location: 'Seattle, WA' }
    ]
  },
  {
    id: 'TRF-2024-002',
    sku: 'DAI-MLK-202',
    product: 'Whole Milk 2L',
    qty: 200,
    unit: 'units',
    source: 'Store #201 (Westside)',
    destination: 'Store #104 (Downtown)',
    type: 'Inter-store',
    status: 'Delayed',
    eta: 'Today, 18:30',
    sla_status: 'At Risk',
    cold_chain: true,
    risk_level: 'High',
    events: [
      { time: '11:15 AM', event: 'Delay Alert: Traffic Congestion', location: 'I-5 South' },
      { time: '09:45 AM', event: 'Departed Store #201', location: 'Portland, OR' }
    ]
  },
  {
    id: 'TRF-2024-003',
    sku: 'ELE-TAB-009',
    product: 'Samsung Galaxy Tab S9',
    qty: 15,
    unit: 'units',
    source: 'Vendor (Samsung)',
    destination: 'DC-Central',
    type: 'Vendor -> Warehouse',
    status: 'Planned',
    eta: 'Tomorrow, 09:00',
    sla_status: 'On Track',
    cold_chain: false,
    risk_level: 'None',
    events: [
      { time: 'Yesterday', event: 'Order Confirmed by Vendor', location: 'System' }
    ]
  },
  {
    id: 'TRF-2024-004',
    sku: 'BAK-BRD-101',
    product: 'Artisan Sourdough',
    qty: 100,
    unit: 'loaves',
    source: 'Bakery Central',
    destination: 'Store #105 (Suburban)',
    type: 'Warehouse -> Store',
    status: 'Dispatched',
    eta: 'Today, 12:00',
    sla_status: 'On Track',
    cold_chain: false,
    risk_level: 'Low',
    events: [
      { time: '11:00 AM', event: 'Dispatched', location: 'Bakery Central' }
    ]
  },
  {
    id: 'TRF-2024-005',
    sku: 'FRZ-IC-505',
    product: 'Vanilla Bean Ice Cream',
    qty: 50,
    unit: 'cases',
    source: 'DC-ColdStorage',
    destination: 'Store #102 (Northgate)',
    type: 'Warehouse -> Store',
    status: 'In Transit',
    eta: 'Today, 15:45',
    sla_status: 'Critical',
    cold_chain: true,
    risk_level: 'Critical',
    risk_reason: 'Temp Fluctuation',
    events: [
      { time: '12:30 PM', event: 'Temp Alert: +4°C variance', location: 'En route' },
      { time: '11:00 AM', event: 'Departed Cold Storage', location: 'Tacoma, WA' }
    ]
  }
];

export default function LogisticsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const fromControlTower = queryParams.get('from') === 'control-tower';
  const { role } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [transfersData, setTransfersData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [regionFilter, setRegionFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedTransfer, setSelectedTransfer] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedTransferStatus, setSelectedTransferStatus] = useState('');
  const [createSheetOpen, setCreateSheetOpen] = useState(false);
  const [isSavingTransfer, setIsSavingTransfer] = useState(false);
  const [createError, setCreateError] = useState('');
  const [newTransfer, setNewTransfer] = useState({
    product: '',
    source: 'Store 100 (Delhi)',
    destination: 'Store 400 (Noida)',
    type: 'Inter-store',
    qty: '100',
    unit: 'units',
    status: 'Planned',
    eta: '2026-04-22 10:00',
    sla_status: 'On Track',
    risk_level: 'Low',
    cold_chain: false,
    region: 'North',
  });

  const loadLogisticsData = async () => {
    setIsLoading(true);
    try {
      const data = await backendModuleService.getModuleData('logistics');
      setTransfersData(Array.isArray(data?.transfers) ? data.transfers : []);
    } catch (error) {
      console.error('Failed to load logistics data:', error);
      toast({
        title: 'Unable to load logistics data',
        description: error.message || 'Please check backend connectivity.',
        variant: 'destructive',
      });
      setTransfersData(FALLBACK_TRANSFERS_DATA);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLogisticsData();
  }, []);

  const resetCreateForm = () => {
    setNewTransfer({
      product: '',
      source: 'Store 100 (Delhi)',
      destination: 'Store 400 (Noida)',
      type: 'Inter-store',
      qty: '100',
      unit: 'units',
      status: 'Planned',
      eta: '2026-04-22 10:00',
      sla_status: 'On Track',
      risk_level: 'Low',
      cold_chain: false,
      region: 'North',
    });
    setCreateError('');
  };

  const openCreateSheet = () => {
    resetCreateForm();
    setCreateSheetOpen(true);
  };

  const handleCreateFieldChange = (field, value) => {
    setNewTransfer((prev) => ({ ...prev, [field]: value }));
  };

  const handleRowClick = (transfer) => {
    setSelectedTransfer(transfer);
    setSelectedTransferStatus(transfer.status || 'Planned');
    setDetailOpen(true);
  };

  const handleSaveTransfer = async () => {
    if (!newTransfer.product.trim()) {
      setCreateError('Product name is required.');
      return;
    }

    setIsSavingTransfer(true);
    setCreateError('');

    const transfer = {
      id: `TRF-${Date.now()}`,
      sku: `SKU-${Math.floor(Math.random() * 10000)}`,
      product: newTransfer.product.trim(),
      qty: Number(newTransfer.qty) || 100,
      unit: newTransfer.unit,
      source: newTransfer.source.trim(),
      destination: newTransfer.destination.trim(),
      type: newTransfer.type,
      status: newTransfer.status,
      eta: newTransfer.eta.trim(),
      sla_status: newTransfer.sla_status,
      cold_chain: newTransfer.cold_chain,
      risk_level: newTransfer.risk_level,
      region: newTransfer.region,
      risk_reason: newTransfer.risk_level === 'Critical' ? 'Route capacity constraint' : '',
      events: [{ time: 'Now', event: 'Transfer created', location: newTransfer.source.trim() }],
      updatedAt: new Date().toISOString(),
    };

    try {
      await backendModuleService.addModuleItem('logistics', 'transfers', transfer);
      await loadLogisticsData();
      setCreateSheetOpen(false);
      resetCreateForm();
      toast({
        title: 'Transfer saved',
        description: 'The logistics transfer has been added successfully.',
      });
    } catch (error) {
      console.error('Failed to save transfer:', error);
      setCreateError(error.message || 'Could not save transfer.');
      toast({
        title: 'Save failed',
        description: error.message || 'Could not save transfer.',
        variant: 'destructive',
      });
    } finally {
      setIsSavingTransfer(false);
    }
  };

  const handleUpdateTransfer = async () => {
    if (!selectedTransfer) return;

    setIsSavingTransfer(true);
    try {
      const updatedTransfer = {
        ...selectedTransfer,
        status: selectedTransferStatus,
        updatedAt: new Date().toISOString(),
        events: [
          { time: 'Now', event: `Status updated to ${selectedTransferStatus}`, location: selectedTransfer.destination || selectedTransfer.source },
          ...(selectedTransfer.events || []),
        ],
      };

      await backendModuleService.updateModuleItem('logistics', 'transfers', updatedTransfer.id, updatedTransfer);
      await loadLogisticsData();
      setSelectedTransfer(updatedTransfer);
      toast({
        title: 'Transfer updated',
        description: `${updatedTransfer.id} status saved as ${selectedTransferStatus}.`,
      });
    } catch (error) {
      toast({
        title: 'Update failed',
        description: error.message || 'Could not update the transfer.',
        variant: 'destructive',
      });
    } finally {
      setIsSavingTransfer(false);
    }
  };

  const filteredTransfers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return transfersData.filter((transfer) => {
      const matchesSearch = !query || [transfer.id, transfer.sku, transfer.product, transfer.source, transfer.destination]
        .some((value) => String(value || '').toLowerCase().includes(query));
      const matchesRegion = regionFilter === 'all' || String(transfer.region || '').toLowerCase() === regionFilter;
      const matchesType = typeFilter === 'all' || String(transfer.type || '').toLowerCase() === typeFilter;
      const matchesStatus = statusFilter === 'all' || String(transfer.status || '').toLowerCase() === statusFilter;
      return matchesSearch && matchesRegion && matchesType && matchesStatus;
    });
  }, [searchQuery, transfersData, regionFilter, typeFilter, statusFilter]);

  const kpiMetrics = useMemo(() => {
    const active = transfersData.filter((transfer) => ['Planned', 'Dispatched', 'In Transit'].includes(transfer.status)).length;
    const inTransit = transfersData.filter((transfer) => transfer.status === 'In Transit').length;
    const delayed = transfersData.filter((transfer) => transfer.status === 'Delayed').length;
    const atRisk = transfersData.filter((transfer) => ['High', 'Critical'].includes(transfer.risk_level)).length;

    return [
      { label: 'Active Transfers', value: String(active), trend: '+5', status: 'neutral', icon: Truck },
      { label: 'In-Transit', value: String(inTransit), trend: '+12', status: 'neutral', icon: Activity },
      { label: 'Delayed', value: String(delayed), trend: '-2', status: 'critical', icon: AlertTriangle },
      { label: 'At Risk', value: String(atRisk), trend: '+1', status: 'warning', icon: ShieldAlert },
    ];
  }, [transfersData]);

  const regionOptions = useMemo(() => {
    return [...new Set(transfersData.map((transfer) => String(transfer.region || '').trim()).filter(Boolean))];
  }, [transfersData]);

  const typeOptions = useMemo(() => {
    return [...new Set(transfersData.map((transfer) => String(transfer.type || '').trim()).filter(Boolean))];
  }, [transfersData]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'In Transit': return 'bg-blue-900/20 text-blue-400 border-blue-800';
      case 'Delayed': return 'bg-red-900/20 text-red-400 border-red-800';
      case 'Planned': return 'bg-gray-800 text-gray-400 border-gray-700';
      case 'Dispatched': return 'bg-yellow-900/20 text-yellow-400 border-yellow-800';
      case 'Delivered': return 'bg-green-900/20 text-green-400 border-green-800';
      default: return 'bg-gray-800 text-gray-400';
    }
  };

  const getRiskColor = (level) => {
    switch (level) {
      case 'Critical': return 'text-red-500';
      case 'High': return 'text-orange-500';
      case 'Medium': return 'text-yellow-500';
      case 'Low': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };
  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-blue-500/30 pb-20 flex flex-col">
            {/* Header Section */}
            <header className="sticky top-0 z-30 bg-sidebar/95 backdrop-blur-md border-b border-sidebar-border shadow-lg">
                {/* Breadcrumb Section */}
                <div className="px-6 pt-3">
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink
                                    onClick={() => navigate(role === 'vendor' ? '/vendor' : '/dashboard')}
                                    className="flex items-center gap-1 text-muted-foreground hover:text-blue-400 cursor-pointer text-[11px] transition-colors"
                                >
                                    <Home className="w-3 h-3" />
                                    {role === 'vendor' ? 'Vendor Portal' : 'Home'}
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
                                    Logistics
                                </BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>

                <div className="px-6 py-3 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex items-center space-x-4">
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                            <Truck className="w-6 h-6 text-blue-500" />
                        </div>
                        <div>
                            <div className="flex items-center space-x-3">
                                <h1 className="text-xl font-bold text-foreground tracking-tight uppercase">Logistics & Transfers</h1>
                                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-card border border-border text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                                    Real-time Feed
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground">Monitoring active inventory movements and inter-store replenishment lanes.</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-9 border-border bg-muted text-muted-foreground hover:bg-border hover:text-foreground shadow-inner"
                            onClick={loadLogisticsData}
                            disabled={isLoading}
                        >
                            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                            Sync Feed
                        </Button>
                        <Button
                            className="h-9 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-widest shadow-lg shadow-blue-600/20"
                            onClick={openCreateSheet}
                        >
                            <Truck className="w-4 h-4 mr-2" /> Add Transfer
                        </Button>
                    </div>
                </div>
            </header>

            <main className="p-6 space-y-6 overflow-y-auto">
                {/* Search & Filters Bar */}
                <Card className="bg-card/50 border-border shadow-sm">
                    <CardContent className="p-3">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                                <Input
                                    placeholder="Search SKU, ID, or Product..."
                                    className="pl-9 h-9 bg-muted/50 border-border text-xs focus-visible:ring-blue-500/50"
                                    value={searchQuery}
                                    onChange={(event) => setSearchQuery(event.target.value)}
                                />
                            </div>

                            <Select value={regionFilter} onValueChange={setRegionFilter}>
                                <SelectTrigger className="h-9 bg-muted/50 border-border text-xs">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                                        <SelectValue placeholder="Region" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent className="bg-popover border-border">
                                    <SelectItem value="all" className="text-xs">All Regions</SelectItem>
                                    {regionOptions.map((region) => (
                                        <SelectItem key={region} value={region.toLowerCase()} className="text-xs">{region}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select value={typeFilter} onValueChange={setTypeFilter}>
                                <SelectTrigger className="h-9 bg-muted/50 border-border text-xs">
                                    <div className="flex items-center gap-2">
                                        <ArrowRightLeft className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                                        <SelectValue placeholder="Transfer Type" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent className="bg-popover border-border">
                                    <SelectItem value="all" className="text-xs">All Types</SelectItem>
                                    <SelectItem value="inter-store" className="text-xs">Inter-Store</SelectItem>
                                    <SelectItem value="warehouse" className="text-xs">Warehouse &rarr; Store</SelectItem>
                                    <SelectItem value="vendor" className="text-xs">Vendor &rarr; Store</SelectItem>
                                    {typeOptions.map((type) => (
                                        <SelectItem key={type} value={type.toLowerCase()} className="text-xs">{type}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="h-9 bg-muted/50 border-border text-xs">
                                    <div className="flex items-center gap-2">
                                        <Activity className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                                        <SelectValue placeholder="Status" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent className="bg-popover border-border">
                                    <SelectItem value="all" className="text-xs">All Statuses</SelectItem>
                                    <SelectItem value="planned" className="text-xs">Planned</SelectItem>
                                    <SelectItem value="dispatched" className="text-xs">Dispatched</SelectItem>
                                    <SelectItem value="in transit" className="text-xs">In Transit</SelectItem>
                                    <SelectItem value="delayed" className="text-xs">Delayed</SelectItem>
                                    <SelectItem value="delivered" className="text-xs">Delivered</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>


                {/* KPI Cards Section */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {kpiMetrics.map((kpi, index) => {
                        const Icon = kpi.icon;
                        const isCritical = kpi.status === 'critical';
                        const isWarning = kpi.status === 'warning';

                        return (
                            <Card key={index} className="bg-card border-border hover:border-blue-500/30 transition-colors shadow-sm overflow-hidden group">
                                <div className={`absolute top-0 left-0 w-1 h-full ${isCritical ? 'bg-red-500' : isWarning ? 'bg-orange-500' : 'bg-blue-500'}`} />
                                <CardContent className="flex items-center justify-between p-4">
                                    <div>
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{kpi.label}</p>
                                        <p className={`text-2xl font-black mt-1 tabular-nums tracking-tighter ${isCritical ? 'text-red-500' : 'text-foreground'}`}>{kpi.value}</p>
                                        <p className="text-[10px] font-medium mt-1">
                                            <span className={kpi.trend.startsWith('+') ? 'text-green-500' : 'text-red-500'}>
                                                {kpi.trend}
                                            </span>
                                            <span className="text-muted-foreground ml-1">vs yesterday</span>
                                        </p>
                                    </div>
                                    <div className={`p-2.5 bg-muted rounded-xl border border-border shadow-inner group-hover:scale-110 transition-transform ${isCritical ? 'text-red-500' : isWarning ? 'text-orange-500' : 'text-blue-500'}`}>
                                        <Icon className="w-5 h-5" />
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>


                {/* Main Table Section */}
                <Card className="bg-card border-border shadow-md overflow-hidden">
                    <CardHeader className="py-4 px-6 border-b border-border/50 bg-muted/10">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-base font-bold text-foreground uppercase tracking-tight">Active Transfer Pipeline</CardTitle>
                                <CardDescription className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Real-time telemetry from all inventory movement lanes.</CardDescription>
                            </div>
                            <Button variant="outline" size="sm" className="h-8 text-[10px] font-bold uppercase tracking-widest border-border bg-muted/50">
                                Export Batch <MoreHorizontal className="w-3.5 h-3.5 ml-2" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-muted/50">
                                    <TableRow className="border-border/50 hover:bg-transparent">
                                        <TableHead className="text-[10px] font-black text-muted-foreground uppercase tracking-widest py-3 px-6">Identifier / Product</TableHead>
                                        <TableHead className="text-[10px] font-black text-muted-foreground uppercase tracking-widest py-3">Logistics Route</TableHead>
                                        <TableHead className="text-[10px] font-black text-muted-foreground uppercase tracking-widest py-3">Classification</TableHead>
                                        <TableHead className="text-[10px] font-black text-muted-foreground uppercase tracking-widest py-3">Status Index</TableHead>
                                        <TableHead className="text-[10px] font-black text-muted-foreground uppercase tracking-widest py-3">Arrival Window</TableHead>
                                        <TableHead className="text-[10px] font-black text-muted-foreground uppercase tracking-widest py-3 text-right pr-6">Risk Profile</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredTransfers.map((transfer) => (
                                        <TableRow
                                            key={transfer.id}
                                            className="border-border/30 hover:bg-muted/30 cursor-pointer group transition-colors"
                                            onClick={() => handleRowClick(transfer)}
                                        >
                                            <TableCell className="px-6 py-4">
                                                <div className="font-bold text-[10px] text-blue-500 tabular-nums tracking-widest mb-1">{transfer.id}</div>
                                                <div className="font-bold text-foreground text-sm tracking-tight">{transfer.product}</div>
                                                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter mt-0.5">
                                                    <span className="tabular-nums">{transfer.qty}</span> {transfer.unit} • {transfer.sku}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col space-y-1">
                                                    <div className="flex items-center text-[11px] font-medium text-foreground">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2 shrink-0" />
                                                        {transfer.source}
                                                    </div>
                                                    <div className="h-2 ml-[3px] border-l border-border/50" />
                                                    <div className="flex items-center text-[11px] font-medium text-foreground">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 mr-2 shrink-0" />
                                                        {transfer.destination}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest border-border bg-muted/30 text-muted-foreground px-2 h-5">
                                                    {transfer.type}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={`text-[9px] font-black uppercase tracking-widest px-2 h-5 shadow-sm border ${getStatusColor(transfer.status)}`}>
                                                    {transfer.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-[11px] font-bold text-foreground tabular-nums">{transfer.eta}</div>
                                                {transfer.status === 'Delayed' && (
                                                    <div className="text-[9px] font-black text-red-500 uppercase tracking-tighter mt-0.5">+2H VARIANCE</div>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right pr-6">
                                                <div className="flex items-center justify-end space-x-2">
                                                    {transfer.cold_chain && (
                                                        <div className="p-1 bg-blue-500/10 rounded border border-blue-500/20">
                                                            <Thermometer className="w-3 h-3 text-blue-500" />
                                                        </div>
                                                    )}
                                                    <span className={`text-[10px] font-black uppercase tracking-widest ${getRiskColor(transfer.risk_level)}`}>
                                                        {transfer.sla_status}
                                                    </span>
                                                </div>
                                                {transfer.risk_level === 'Critical' && (
                                                    <div className="text-[9px] font-bold text-red-500 mt-1 flex items-center justify-end uppercase tracking-tighter">
                                                        <AlertTriangle className="w-2.5 h-2.5 mr-1" /> {transfer.risk_reason}
                                                    </div>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {filteredTransfers.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={6} className="h-40 text-center text-muted-foreground italic text-sm">
                                                No active transfers found matching current criteria.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </main>

      {/* Detail Panel Sheet */}
      <Sheet open={detailOpen} onOpenChange={setDetailOpen}>
        <SheetContent className="w-full sm:max-w-xl bg-card border-l border-border text-foreground overflow-y-auto p-0">
          {selectedTransfer && (
            <div className="flex flex-col h-full">
              <SheetHeader className="p-8 border-b border-border/50 bg-muted/20">
                <div className="flex items-center space-x-3 mb-4">
                  <Badge variant="outline" className="text-[10px] font-black tabular-nums border-border bg-card text-blue-500 px-3 h-6 uppercase tracking-widest">{selectedTransfer.id}</Badge>
                  <Badge variant="outline" className={`text-[10px] font-black px-3 h-6 uppercase tracking-widest shadow-sm border ${getStatusColor(selectedTransfer.status)}`}>{selectedTransfer.status}</Badge>
                </div>
                <SheetTitle className="text-3xl font-black text-foreground tracking-tighter uppercase leading-none">{selectedTransfer.product}</SheetTitle>
                <SheetDescription className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em] mt-2">
                  SKU: {selectedTransfer.sku} • {selectedTransfer.qty} {selectedTransfer.unit}
                </SheetDescription>
              </SheetHeader>

              <div className="p-8 space-y-10">
                {/* Route Info */}
                <div className="space-y-6">
                  <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] border-b border-border pb-2">Logistics Routing</h3>
                  <div className="relative pl-8 border-l-2 border-dashed border-border space-y-10">
                    <div className="relative">
                      <div className="absolute -left-[41px] bg-card p-1">
                        <div className="w-4 h-4 rounded-full bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.5)] border-2 border-card"></div>
                      </div>
                      <div className="text-[11px] font-black text-muted-foreground uppercase tracking-widest mb-1">Point of Origin</div>
                      <div className="text-lg font-bold text-foreground tracking-tight">{selectedTransfer.source}</div>
                    </div>
                    <div className="relative">
                      <div className="absolute -left-[41px] bg-card p-1">
                        <div className="w-4 h-4 rounded-full bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.5)] border-2 border-card"></div>
                      </div>
                      <div className="text-[11px] font-black text-muted-foreground uppercase tracking-widest mb-1">Final Destination</div>
                      <div className="text-lg font-bold text-foreground tracking-tight">{selectedTransfer.destination}</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] border-b border-border pb-2">Modify Transfer Status</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                      <div className="space-y-2">
                          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Update State</label>
                          <Select value={selectedTransferStatus} onValueChange={setSelectedTransferStatus}>
                            <SelectTrigger className="bg-muted/50 border-border text-foreground font-bold text-xs h-10">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent className="bg-popover border-border">
                              <SelectItem value="Planned" className="text-xs">Planned</SelectItem>
                              <SelectItem value="Dispatched" className="text-xs">Dispatched</SelectItem>
                              <SelectItem value="In Transit" className="text-xs">In Transit</SelectItem>
                              <SelectItem value="Delayed" className="text-xs">Delayed</SelectItem>
                              <SelectItem value="Delivered" className="text-xs">Delivered</SelectItem>
                            </SelectContent>
                          </Select>
                      </div>
                      <Button className="h-10 bg-blue-600 hover:bg-blue-700 text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-600/20" onClick={handleUpdateTransfer} disabled={isSavingTransfer}>
                        {isSavingTransfer ? 'Updating Intelligence...' : 'Commit Status Change'}
                      </Button>
                  </div>
                </div>

                {/* Timeline */}
                <div className="space-y-6">
                  <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] border-b border-border pb-2">Telemetry Events</h3>
                  <div className="space-y-4">
                    {(selectedTransfer.events || []).map((event, i) => (
                      <div key={i} className="flex gap-4 group">
                        <div className="text-[10px] font-bold text-muted-foreground w-20 pt-3 text-right tabular-nums tracking-tighter uppercase">{event.time}</div>
                        <div className="flex-1 bg-muted/30 p-4 rounded-xl border border-border group-hover:border-blue-500/20 transition-colors">
                          <div className="text-xs font-bold text-foreground uppercase tracking-tight">{event.event}</div>
                          <div className="text-[10px] text-muted-foreground mt-1.5 flex items-center font-medium">
                            <MapPin className="w-3 h-3 mr-1.5 text-blue-500" /> {event.location}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Inventory Impact */}
                <div className="space-y-6">
                  <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] border-b border-border pb-2">Projected Inventory Drift</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <Card className="bg-muted/30 border-border shadow-inner">
                      <CardContent className="p-5 text-center">
                        <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Origin Delta</div>
                        <div className="text-2xl font-black text-foreground tabular-nums tracking-tighter">120 <span className="text-xs text-muted-foreground font-bold">UNITS</span></div>
                        <div className="text-[9px] font-black text-orange-500 mt-2 uppercase tracking-tighter bg-orange-500/10 py-1 rounded">Near Safety Stock</div>
                      </CardContent>
                    </Card>
                    <Card className="bg-muted/30 border-border shadow-inner">
                      <CardContent className="p-5 text-center">
                        <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Target Inflow</div>
                        <div className="text-2xl font-black text-foreground tabular-nums tracking-tighter">245 <span className="text-xs text-muted-foreground font-bold">UNITS</span></div>
                        <div className="text-[9px] font-black text-green-500 mt-2 uppercase tracking-tighter bg-green-500/10 py-1 rounded">Optimal Level Reached</div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Secondary Actions */}
                <div className="pt-6 border-t border-border flex gap-4">
                    <Button variant="outline" className="flex-1 h-10 border-red-500/20 text-red-500 font-black text-[10px] uppercase tracking-widest hover:bg-red-500/10 bg-transparent">
                      <AlertTriangle className="w-3.5 h-3.5 mr-2" /> Report Lane Issue
                    </Button>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <Sheet open={createSheetOpen} onOpenChange={setCreateSheetOpen}>
        <SheetContent className="w-full sm:max-w-xl bg-card border-l border-border text-foreground overflow-y-auto p-0">
          <div className="flex flex-col h-full">
            <SheetHeader className="p-8 border-b border-border/50 bg-muted/20">
              <SheetTitle className="text-3xl font-black text-foreground tracking-tighter uppercase leading-none">Initialize Transfer</SheetTitle>
              <SheetDescription className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em] mt-2">
                Register a new inventory movement lane within the logistics network.
              </SheetDescription>
            </SheetHeader>

            <div className="p-8 space-y-8 flex-1">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Product Catalog Item</label>
                <Input value={newTransfer.product} onChange={(event) => handleCreateFieldChange('product', event.target.value)} placeholder="Organic Hass Avocados" className="h-11 bg-muted/50 border-border text-foreground font-bold text-sm focus-visible:ring-blue-500/50" />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Source Node</label>
                  <Input value={newTransfer.source} onChange={(event) => handleCreateFieldChange('source', event.target.value)} className="h-10 bg-muted/50 border-border text-foreground font-bold text-xs" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Destination Node</label>
                  <Input value={newTransfer.destination} onChange={(event) => handleCreateFieldChange('destination', event.target.value)} className="h-10 bg-muted/50 border-border text-foreground font-bold text-xs" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Lane Classification</label>
                  <Select value={newTransfer.type} onValueChange={(value) => handleCreateFieldChange('type', value)}>
                    <SelectTrigger className="h-10 bg-muted/50 border-border text-foreground font-bold text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      <SelectItem value="Inter-store" className="text-xs">Inter-store</SelectItem>
                      <SelectItem value="Warehouse to Store" className="text-xs">Warehouse to Store</SelectItem>
                      <SelectItem value="Vendor to Warehouse" className="text-xs">Vendor to Warehouse</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Initial Status</label>
                  <Select value={newTransfer.status} onValueChange={(value) => handleCreateFieldChange('status', value)}>
                    <SelectTrigger className="h-10 bg-muted/50 border-border text-foreground font-bold text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      <SelectItem value="Planned" className="text-xs">Planned</SelectItem>
                      <SelectItem value="Dispatched" className="text-xs">Dispatched</SelectItem>
                      <SelectItem value="In Transit" className="text-xs">In Transit</SelectItem>
                      <SelectItem value="Delayed" className="text-xs">Delayed</SelectItem>
                      <SelectItem value="Delivered" className="text-xs">Delivered</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Transfer Qty</label>
                  <Input type="number" min="1" value={newTransfer.qty} onChange={(event) => handleCreateFieldChange('qty', event.target.value)} className="h-10 bg-muted/50 border-border text-foreground font-bold text-xs tabular-nums" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">UoM</label>
                  <Input value={newTransfer.unit} onChange={(event) => handleCreateFieldChange('unit', event.target.value)} className="h-10 bg-muted/50 border-border text-foreground font-bold text-xs" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Est. Completion</label>
                  <Input value={newTransfer.eta} onChange={(event) => handleCreateFieldChange('eta', event.target.value)} className="h-10 bg-muted/50 border-border text-foreground font-bold text-xs tabular-nums" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Operation Region</label>
                  <Select value={newTransfer.region} onValueChange={(value) => handleCreateFieldChange('region', value)}>
                    <SelectTrigger className="h-10 bg-muted/50 border-border text-foreground font-bold text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      <SelectItem value="North" className="text-xs">North</SelectItem>
                      <SelectItem value="South" className="text-xs">South</SelectItem>
                      <SelectItem value="West" className="text-xs">West</SelectItem>
                      <SelectItem value="East" className="text-xs">East</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">SLA Priority</label>
                  <Select value={newTransfer.sla_status} onValueChange={(value) => handleCreateFieldChange('sla_status', value)}>
                    <SelectTrigger className="h-10 bg-muted/50 border-border text-foreground font-bold text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      <SelectItem value="On Track" className="text-xs">On Track</SelectItem>
                      <SelectItem value="At Risk" className="text-xs">At Risk</SelectItem>
                      <SelectItem value="Critical" className="text-xs">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Neural Risk Assessment</label>
                  <Select value={newTransfer.risk_level} onValueChange={(value) => handleCreateFieldChange('risk_level', value)}>
                    <SelectTrigger className="h-10 bg-muted/50 border-border text-foreground font-bold text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      <SelectItem value="Low" className="text-xs">Low</SelectItem>
                      <SelectItem value="Medium" className="text-xs">Medium</SelectItem>
                      <SelectItem value="High" className="text-xs">High</SelectItem>
                      <SelectItem value="Critical" className="text-xs">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className={`w-full h-11 font-black text-[10px] uppercase tracking-widest transition-all ${newTransfer.cold_chain ? 'border-blue-500 text-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/20' : 'border-border text-muted-foreground bg-transparent'}`}
                  onClick={() => handleCreateFieldChange('cold_chain', !newTransfer.cold_chain)}
                >
                  {newTransfer.cold_chain ? 'Cold Chain Protocol: ACTIVE' : 'Cold Chain Protocol: DISABLED'}
                </Button>
              </div>

              {createError && (
                  <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs font-bold text-red-500 uppercase tracking-tight flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-2" /> {createError}
                  </div>
              )}
            </div>

            <SheetFooter className="p-8 border-t border-border/50 bg-muted/10 gap-3 sm:justify-end">
              <Button variant="outline" className="h-11 px-8 border-border text-muted-foreground font-black text-[10px] uppercase tracking-widest hover:bg-muted" onClick={() => { setCreateSheetOpen(false); resetCreateForm(); }}>
                Cancel
              </Button>
              <Button className="h-11 px-8 bg-blue-600 hover:bg-blue-700 text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-600/20" onClick={handleSaveTransfer} disabled={isSavingTransfer}>
                {isSavingTransfer ? 'Syncing Network...' : 'Confirm Transfer'}
              </Button>
            </SheetFooter>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
