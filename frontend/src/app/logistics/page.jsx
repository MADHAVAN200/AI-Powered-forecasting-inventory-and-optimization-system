import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Truck, MapPin, Calendar, AlertTriangle, Clock, ArrowRight,
  Filter, ChevronDown, MoreHorizontal, Package, Thermometer,
  ShieldAlert, Activity, CheckCircle2, XCircle, Search, LayoutDashboard,
  ArrowRightLeft, Store, Zap, LogOut
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

// --- Mock Data ---

const KPI_METRICS = [
  { label: 'Active Transfers', value: '42', trend: '+5', status: 'neutral', icon: Truck },
  { label: 'In-Transit', value: '28', trend: '+12', status: 'neutral', icon: Activity },
  { label: 'Delayed', value: '3', trend: '-2', status: 'critical', icon: AlertTriangle },
  { label: 'At Risk', value: '5', trend: '+1', status: 'warning', icon: ShieldAlert },
];

const TRANSFERS_DATA = [
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
  const [selectedTransfer, setSelectedTransfer] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const handleRowClick = (transfer) => {
    setSelectedTransfer(transfer);
    setDetailOpen(true);
  };

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
    <div className="min-h-screen bg-[#0a0a0a] text-foreground flex font-sans">
      {/* Sidebar (Copied from Control Tower for consistency) */}
      <aside className="w-16 md:w-64 bg-[#111] border-r border-[#222] flex flex-col hidden md:flex sticky top-0 h-screen overflow-y-auto z-20">
        <div className="p-4 flex items-center space-x-2 border-b border-[#222] h-16">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg text-white hidden md:block">OptiFresh</span>
        </div>

        <nav className="flex-1 py-4 space-y-2 px-2">
          <Button variant="ghost" className="w-full justify-start text-gray-400 hover:text-white hover:bg-[#222]" onClick={() => navigate('/dashboard')}>
            <Store className="w-5 h-5 mr-3" />
            <span className="hidden md:block">Dashboard</span>
          </Button>
          <Button variant="ghost" className="w-full justify-start text-gray-400 hover:text-white hover:bg-[#222]" onClick={() => navigate('/control-tower')}>
            <LayoutDashboard className="w-5 h-5 mr-3" />
            <span className="hidden md:block">Control Tower</span>
          </Button>
          <Button variant="ghost" className="w-full justify-start text-red-500 hover:text-red-400 hover:bg-[#222]" onClick={() => navigate('/alerts')}>
            <Zap className="w-5 h-5 mr-3" />
            <span className="hidden md:block">Operational Alerts</span>
          </Button>
          <Button variant="ghost" className="w-full justify-start text-blue-400 hover:text-blue-300 hover:bg-[#222]" onClick={() => navigate('/stock-rebalancing')}>
            <ArrowRightLeft className="w-5 h-5 mr-3" />
            <span className="hidden md:block">Stock Rebalancing</span>
          </Button>
          <Button variant="ghost" className="w-full justify-start text-gray-400 hover:text-white hover:bg-[#222]" onClick={() => navigate('/vendor')}>
            <Package className="w-5 h-5 mr-3" />
            <span className="hidden md:block">Vendor Portal</span>
          </Button>
          <Button variant="secondary" className="w-full justify-start bg-[#1a1a1a] text-white">
            <MapPin className="w-5 h-5 mr-3" />
            <span className="hidden md:block">Logistics</span>
          </Button>
        </nav>

        <div className="p-4 border-t border-[#222]">
          <Button variant="ghost" className="w-full justify-start text-gray-400 hover:text-white hover:bg-[#222]">
            <LogOut className="w-5 h-5 mr-3" />
            <span className="hidden md:block">Sign Out</span>
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">



        <div className="p-6 space-y-6">

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 p-4 bg-[#111] border border-[#222] rounded-lg sticky top-6 z-10 shadow-lg">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1">
              <Select defaultValue="all-regions">
                <SelectTrigger className="bg-[#1a1a1a] border-[#333] text-white">
                  <SelectValue placeholder="Region" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a1a] border-[#333] text-white">
                  <SelectItem value="all-regions">All Regions</SelectItem>
                  <SelectItem value="na-west">North America / West</SelectItem>
                  <SelectItem value="na-east">North America / East</SelectItem>
                </SelectContent>
              </Select>

              <Select defaultValue="all-types">
                <SelectTrigger className="bg-[#1a1a1a] border-[#333] text-white">
                  <SelectValue placeholder="Transfer Type" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a1a] border-[#333] text-white">
                  <SelectItem value="all-types">All Types</SelectItem>
                  <SelectItem value="inter-store">Inter-Store</SelectItem>
                  <SelectItem value="warehouse">Warehouse &rarr; Store</SelectItem>
                  <SelectItem value="vendor">Vendor &rarr; Store</SelectItem>
                </SelectContent>
              </Select>

              <Select defaultValue="all-status">
                <SelectTrigger className="bg-[#1a1a1a] border-[#333] text-white">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a1a] border-[#333] text-white">
                  <SelectItem value="all-status">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="delayed">Delayed</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                </SelectContent>
              </Select>

              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                <Input placeholder="Search SKU, ID..." className="pl-9 bg-[#1a1a1a] border-[#333] text-white" />
              </div>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <Filter className="w-4 h-4 mr-2" /> Apply
            </Button>
          </div>


          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {KPI_METRICS.map((kpi, index) => {
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
                  {TRANSFERS_DATA.map((transfer) => (
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
      </main>

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

                {/* Timeline */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Timeline & Events</h3>
                  <div className="space-y-4">
                    {selectedTransfer.events.map((event, i) => (
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
                    <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                      Update Status
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
    </div>
  );
}
