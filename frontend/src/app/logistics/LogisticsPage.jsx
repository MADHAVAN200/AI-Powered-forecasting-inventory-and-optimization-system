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
    <div className="min-h-screen bg-[#0a0a0a] text-foreground font-sans selection:bg-blue-500/30 pb-20">
        {/* Breadcrumb Section */}
        <div className="px-6 pt-4">
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink
                            onClick={() => navigate('/')}
                            className="flex items-center gap-1 text-gray-500 hover:text-blue-400 cursor-pointer text-[11px] transition-colors"
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
                                    className="flex items-center gap-1 text-gray-500 hover:text-blue-400 cursor-pointer text-[11px] transition-colors"
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

        <div className="p-6 space-y-6">

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 p-4 bg-[#111] border border-[#222] rounded-lg sticky top-6 z-10 shadow-lg">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1">
              <Select value={regionFilter} onValueChange={setRegionFilter}>
                <SelectTrigger className="bg-[#1a1a1a] border-[#333] text-white">
                  <SelectValue placeholder="Region" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a1a] border-[#333] text-white">
                  <SelectItem value="all">All Regions</SelectItem>
                  {regionOptions.map((region) => (
                    <SelectItem key={region} value={region.toLowerCase()}>{region}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="bg-[#1a1a1a] border-[#333] text-white">
                  <SelectValue placeholder="Transfer Type" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a1a] border-[#333] text-white">
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="inter-store">Inter-Store</SelectItem>
                  <SelectItem value="warehouse">Warehouse &rarr; Store</SelectItem>
                  <SelectItem value="vendor">Vendor &rarr; Store</SelectItem>
                  {typeOptions.map((type) => (
                    <SelectItem key={type} value={type.toLowerCase()}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="bg-[#1a1a1a] border-[#333] text-white">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a1a] border-[#333] text-white">
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="planned">Planned</SelectItem>
                  <SelectItem value="dispatched">Dispatched</SelectItem>
                  <SelectItem value="in transit">In Transit</SelectItem>
                  <SelectItem value="delayed">Delayed</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                </SelectContent>
              </Select>

              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search SKU, ID..."
                  className="pl-9 bg-[#1a1a1a] border-[#333] text-white"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                />
              </div>
            </div>
            <Button className="bg-purple-600 hover:bg-purple-700 text-white" onClick={openCreateSheet}>
              <Truck className="w-4 h-4 mr-2" /> Add Transfer
            </Button>
            <Button variant="outline" size="icon" className="border-[#333] text-gray-400 hover:text-white hover:bg-[#222]" onClick={loadLogisticsData} disabled={isLoading}>
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>


          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {kpiMetrics.map((kpi, index) => {
              const Icon = kpi.icon;
              const isCritical = kpi.status === 'critical';
              const isWarning = kpi.status === 'warning';

              return (
                <Card key={index} className="bg-[#111] border-[#333]">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-400">
                      {kpi.label}
                    </CardTitle>
                    <Icon className={`h-4 w-4 ${isCritical ? 'text-red-500' : isWarning ? 'text-orange-500' : 'text-gray-400'}`} />
                  </CardHeader>
                  <CardContent>
                    <div className={`text-2xl font-bold ${isCritical ? 'text-red-500' : 'text-white'}`}>{kpi.value}</div>
                    <p className="text-xs text-gray-500 mt-1">
                      <span className={kpi.trend.startsWith('+') ? 'text-green-500' : 'text-red-500'}>
                        {kpi.trend}
                      </span> vs yesterday
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Active Transfers Table */}
          <Card className="bg-[#111] border-[#333] flex-1">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold text-white">Active Transfer Pipeline</CardTitle>
                  <CardDescription className="text-gray-400">Real-time status of all inventory movements.</CardDescription>
                </div>
                <Button variant="outline" size="sm" className="border-[#333] text-gray-400 hover:text-white hover:bg-[#222]">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-[#222] hover:bg-transparent">
                    <TableHead className="text-gray-400 font-medium">Transfer ID / Product</TableHead>
                    <TableHead className="text-gray-400 font-medium">Route</TableHead>
                    <TableHead className="text-gray-400 font-medium">Type</TableHead>
                    <TableHead className="text-gray-400 font-medium">Status</TableHead>
                    <TableHead className="text-gray-400 font-medium">ETA</TableHead>
                    <TableHead className="text-gray-400 font-medium">Risk / SLA</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransfers.map((transfer) => (
                    <TableRow
                      key={transfer.id}
                      className="border-[#222] hover:bg-[#1a1a1a] cursor-pointer group"
                      onClick={() => handleRowClick(transfer)}
                    >
                      <TableCell>
                        <div className="font-mono text-xs text-gray-500 mb-1">{transfer.id}</div>
                        <div className="font-medium text-white">{transfer.product}</div>
                        <div className="text-xs text-gray-500">{transfer.qty} {transfer.unit} • {transfer.sku}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col text-sm">
                          <span className="text-gray-300 flex items-center"><span className="w-2 h-2 rounded-full bg-blue-500 mr-2"></span> {transfer.source}</span>
                          <div className="h-3 ml-1 border-l border-gray-700 my-0.5"></div>
                          <span className="text-gray-300 flex items-center"><span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span> {transfer.destination}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-gray-700 text-gray-400 font-normal">
                          {transfer.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`${getStatusColor(transfer.status)} border rounded-md`}>
                          {transfer.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-300">{transfer.eta}</div>
                        {transfer.status === 'Delayed' && <span className="text-xs text-red-500 font-medium">+2h delay</span>}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {transfer.cold_chain && <Thermometer className="w-4 h-4 text-blue-400" title="Cold Chain" />}
                          <span className={`text-sm font-medium ${getRiskColor(transfer.risk_level)}`}>
                            {transfer.sla_status}
                          </span>
                        </div>
                        {transfer.risk_level === 'Critical' && (
                          <div className="text-xs text-red-400 mt-1 flex items-center">
                            <AlertTriangle className="w-3 h-3 mr-1" /> {transfer.risk_reason}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-blue-400" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

      {/* Detail Panel Sheet */}
      <Sheet open={detailOpen} onOpenChange={setDetailOpen}>
        <SheetContent className="w-[400px] sm:w-[540px] bg-[#111] border-l border-[#222] text-white overflow-y-auto">
          {selectedTransfer && (
            <>
              <SheetHeader className="mb-6">
                <div className="flex items-center space-x-2 mb-2">
                  <Badge variant="outline" className="border-gray-700 text-gray-400">{selectedTransfer.id}</Badge>
                  <Badge className={getStatusColor(selectedTransfer.status)}>{selectedTransfer.status}</Badge>
                </div>
                <SheetTitle className="text-2xl font-bold text-white">{selectedTransfer.product}</SheetTitle>
                <SheetDescription className="text-gray-400">
                  SKU: {selectedTransfer.sku} • {selectedTransfer.qty} {selectedTransfer.unit}
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-6">
                {/* Route Info */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Route Details</h3>
                  <div className="relative pl-6 border-l border-[#333] space-y-6">
                    <div className="relative">
                      <div className="absolute -left-[31px] bg-[#111] p-1">
                        <div className="w-3 h-3 rounded-full bg-blue-500 shadow-lg shadow-blue-500/50"></div>
                      </div>
                      <div className="text-sm font-medium text-white mb-1">Origin</div>
                      <div className="text-gray-400 text-sm">{selectedTransfer.source}</div>
                    </div>
                    <div className="relative">
                      <div className="absolute -left-[31px] bg-[#111] p-1">
                        <div className="w-3 h-3 rounded-full bg-green-500 shadow-lg shadow-green-500/50"></div>
                      </div>
                      <div className="text-sm font-medium text-white mb-1">Destination</div>
                      <div className="text-gray-400 text-sm">{selectedTransfer.destination}</div>
                    </div>
                  </div>
                </div>

                <Separator className="bg-[#222]" />

                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Update Transfer</h3>
                  <Select value={selectedTransferStatus} onValueChange={setSelectedTransferStatus}>
                    <SelectTrigger className="bg-[#1a1a1a] border-[#333] text-white">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1a1a] border-[#333] text-white">
                      <SelectItem value="Planned">Planned</SelectItem>
                      <SelectItem value="Dispatched">Dispatched</SelectItem>
                      <SelectItem value="In Transit">In Transit</SelectItem>
                      <SelectItem value="Delayed">Delayed</SelectItem>
                      <SelectItem value="Delivered">Delivered</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Timeline */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Timeline & Events</h3>
                  <div className="space-y-4">
                    {(selectedTransfer.events || []).map((event, i) => (
                      <div key={i} className="flex gap-4">
                        <div className="text-xs text-gray-500 w-16 pt-1 text-right">{event.time}</div>
                        <div className="flex-1 bg-[#1a1a1a] p-3 rounded-lg border border-[#333]">
                          <div className="text-sm font-medium text-white">{event.event}</div>
                          <div className="text-xs text-gray-500 mt-1 flex items-center">
                            <MapPin className="w-3 h-3 mr-1" /> {event.location}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator className="bg-[#222]" />

                {/* Inventory Impact */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Projected Inventory Impact</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <Card className="bg-[#1a1a1a] border-[#333]">
                      <CardContent className="p-4">
                        <div className="text-xs text-gray-500 mb-1">Source Store After Dispatch</div>
                        <div className="text-lg font-bold text-white">120 units</div>
                        <div className="text-xs text-yellow-500 mt-1">Low Stock Warning</div>
                      </CardContent>
                    </Card>
                    <Card className="bg-[#1a1a1a] border-[#333]">
                      <CardContent className="p-4">
                        <div className="text-xs text-gray-500 mb-1">Dest. Store Upon Arrival</div>
                        <div className="text-lg font-bold text-white">245 units</div>
                        <div className="text-xs text-green-500 mt-1">Optimal Level</div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-4">
                  <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-3">Actions</h3>
                  <div className="flex gap-3">
                    <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white" onClick={handleUpdateTransfer} disabled={isSavingTransfer}>
                      {isSavingTransfer ? 'Saving...' : 'Save Status'}
                    </Button>
                    <Button variant="outline" className="flex-1 border-red-900/50 text-red-500 hover:bg-red-900/20 bg-transparent">
                      Report Issue
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <Sheet open={createSheetOpen} onOpenChange={setCreateSheetOpen}>
        <SheetContent className="w-[420px] sm:w-[560px] bg-[#111] border-l border-[#222] text-white overflow-y-auto">
          <div className="space-y-6 pt-4">
            <SheetHeader className="text-left">
              <SheetTitle className="text-white text-xl">Add Transfer</SheetTitle>
              <SheetDescription className="text-gray-400">
                Create a new logistics transfer and save it to the backend.
              </SheetDescription>
            </SheetHeader>

            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Product Name</label>
                <Input value={newTransfer.product} onChange={(event) => handleCreateFieldChange('product', event.target.value)} placeholder="Organic Hass Avocados" className="bg-[#1a1a1a] border-[#333] text-white" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Source</label>
                  <Input value={newTransfer.source} onChange={(event) => handleCreateFieldChange('source', event.target.value)} className="bg-[#1a1a1a] border-[#333] text-white" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Destination</label>
                  <Input value={newTransfer.destination} onChange={(event) => handleCreateFieldChange('destination', event.target.value)} className="bg-[#1a1a1a] border-[#333] text-white" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Transfer Type</label>
                  <Select value={newTransfer.type} onValueChange={(value) => handleCreateFieldChange('type', value)}>
                    <SelectTrigger className="bg-[#1a1a1a] border-[#333] text-white"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-[#1a1a1a] border-[#333] text-white">
                      <SelectItem value="Inter-store">Inter-store</SelectItem>
                      <SelectItem value="Warehouse to Store">Warehouse to Store</SelectItem>
                      <SelectItem value="Vendor to Warehouse">Vendor to Warehouse</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Status</label>
                  <Select value={newTransfer.status} onValueChange={(value) => handleCreateFieldChange('status', value)}>
                    <SelectTrigger className="bg-[#1a1a1a] border-[#333] text-white"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-[#1a1a1a] border-[#333] text-white">
                      <SelectItem value="Planned">Planned</SelectItem>
                      <SelectItem value="Dispatched">Dispatched</SelectItem>
                      <SelectItem value="In Transit">In Transit</SelectItem>
                      <SelectItem value="Delayed">Delayed</SelectItem>
                      <SelectItem value="Delivered">Delivered</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Quantity</label>
                  <Input type="number" min="1" value={newTransfer.qty} onChange={(event) => handleCreateFieldChange('qty', event.target.value)} className="bg-[#1a1a1a] border-[#333] text-white" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Unit</label>
                  <Input value={newTransfer.unit} onChange={(event) => handleCreateFieldChange('unit', event.target.value)} className="bg-[#1a1a1a] border-[#333] text-white" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">ETA</label>
                  <Input value={newTransfer.eta} onChange={(event) => handleCreateFieldChange('eta', event.target.value)} className="bg-[#1a1a1a] border-[#333] text-white" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Region</label>
                  <Select value={newTransfer.region} onValueChange={(value) => handleCreateFieldChange('region', value)}>
                    <SelectTrigger className="bg-[#1a1a1a] border-[#333] text-white"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-[#1a1a1a] border-[#333] text-white">
                      <SelectItem value="North">North</SelectItem>
                      <SelectItem value="South">South</SelectItem>
                      <SelectItem value="West">West</SelectItem>
                      <SelectItem value="East">East</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">SLA Status</label>
                  <Select value={newTransfer.sla_status} onValueChange={(value) => handleCreateFieldChange('sla_status', value)}>
                    <SelectTrigger className="bg-[#1a1a1a] border-[#333] text-white"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-[#1a1a1a] border-[#333] text-white">
                      <SelectItem value="On Track">On Track</SelectItem>
                      <SelectItem value="At Risk">At Risk</SelectItem>
                      <SelectItem value="Critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Risk Level</label>
                  <Select value={newTransfer.risk_level} onValueChange={(value) => handleCreateFieldChange('risk_level', value)}>
                    <SelectTrigger className="bg-[#1a1a1a] border-[#333] text-white"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-[#1a1a1a] border-[#333] text-white">
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className={`w-full ${newTransfer.cold_chain ? 'border-blue-500 text-blue-300 bg-blue-950/40' : 'border-[#333] text-gray-300 bg-transparent'}`}
                onClick={() => handleCreateFieldChange('cold_chain', !newTransfer.cold_chain)}
              >
                {newTransfer.cold_chain ? 'Cold Chain On' : 'Cold Chain Off'}
              </Button>

              {createError && <div className="rounded-lg border border-red-900/60 bg-red-950/30 px-3 py-2 text-sm text-red-300">{createError}</div>}
            </div>

            <SheetFooter className="gap-2 sm:justify-end">
              <Button variant="outline" className="border-[#333] text-gray-300 bg-transparent" onClick={() => { setCreateSheetOpen(false); resetCreateForm(); }}>
                Cancel
              </Button>
              <Button className="bg-purple-600 hover:bg-purple-700 text-white" onClick={handleSaveTransfer} disabled={isSavingTransfer}>
                {isSavingTransfer ? 'Saving...' : 'Save Transfer'}
              </Button>
            </SheetFooter>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
