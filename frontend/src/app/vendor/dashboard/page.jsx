"use client";

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, Truck, FileText, Bell, Settings,
  Search, CheckCircle2, AlertTriangle, Clock, ArrowRight,
  Filter, MoreHorizontal, Download, ChevronRight, ShieldCheck,
  LogOut, UserCircle, BarChart3, MessageSquare, ArrowUpRight, ArrowDownRight, Minus,
  Calendar, Upload
} from 'lucide-react';
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";

// --- MOCK DATA ---
const PRODUCTS_DATA = [
  { id: "P-101", name: "Organic Hass Avocados", sku: "SKU-9928", category: "Produce", activeStores: 142, trend: "up", stockStatus: "Low", lastUpdated: "2h ago" },
  { id: "P-102", name: "Premium Almond Milk", sku: "SKU-1029", category: "Dairy Altern.", activeStores: 89, trend: "flat", stockStatus: "Healthy", lastUpdated: "5h ago" },
  { id: "P-103", name: "Artisan Sourdough", sku: "SKU-3321", category: "Bakery", activeStores: 56, trend: "down", stockStatus: "Excess", lastUpdated: "1d ago" },
  { id: "P-104", name: "Free-Range Eggs (12ct)", sku: "SKU-5512", category: "Dairy", activeStores: 200, trend: "up", stockStatus: "Healthy", lastUpdated: "30m ago" },
];

const INVENTORY_DATA = [
  { product: "Organic Hass Avocados", commitment: "5000 kg/week", fulfillment: "92%", adjustments: "None", nextDelivery: "Oct 24, 2025", status: "On-time" },
  { product: "Premium Almond Milk", commitment: "2000 units/week", fulfillment: "100%", adjustments: "+500 units", nextDelivery: "Oct 25, 2025", status: "Delayed" },
  { product: "Artisan Sourdough", commitment: "1000 loaves/day", fulfillment: "95%", adjustments: "-100 loaves", nextDelivery: "Oct 23, 2025", status: "Adjustment Requested" },
];

const REQUESTS_DATA = [
  { id: "REQ-001", type: "Supply Increase", product: "Organic Hass Avocados", reason: "Projected Demand Spike (Holiday)", date: "Oct 19, 2025", status: "Pending", urgency: "High" },
  { id: "REQ-002", type: "Quality Check", product: "Artisan Sourdough", reason: "Customer Complaints (Texture)", date: "Oct 18, 2025", status: "In Progress", urgency: "Medium" },
  { id: "REQ-003", type: "Packaging Update", product: "Premium Almond Milk", reason: "New Regulatory Compliance", date: "Oct 15, 2025", status: "Completed", urgency: "Low" },
];

const COMPLIANCE_DATA = [
  { id: "C-001", metric: "Quality Check Pass Rate", status: "Healthy", value: "98.5%", target: "98.0%" },
  { id: "C-002", metric: "Expiry Compliance", status: "Healthy", value: "99.2%", target: "99.0%" },
  { id: "C-003", metric: "Packaging Compliance", status: "Warning", value: "92.0%", target: "95.0%" },
  { id: "C-004", metric: "Certification Validity", status: "Healthy", value: "100%", target: "100%" },
];

const NOTIFICATIONS_DATA = [
  { id: "N-1", type: "action", title: "Action Required: Supply Request", desc: "Please confirm +500 units for Premium Almond Milk.", date: "2 hours ago", due: "Oct 24, 2025" },
  { id: "N-2", type: "warning", title: "Document Expiring Soon", desc: "Your Organic Produce Certificate expires in 30 days.", date: "1 day ago", due: "Nov 22, 2025" },
  { id: "N-3", type: "info", title: "Quality Report Available", desc: "Q3 Quality Assessment report is now available for download.", date: "3 days ago", due: null },
];

export default function VendorDashboardPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");

  const NAV_ITEMS = [
    { id: 'dashboard', label: 'Vendor Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Product Performance', icon: BarChart3 },
    { id: 'inventory', label: 'Inventory & Supply', icon: Package },
    { id: 'requests', label: 'Requests & Actions', icon: MessageSquare },
    { id: 'quality', label: 'Quality & Compliance', icon: ShieldCheck },
    { id: 'notifications', label: 'Notifications & Alerts', icon: Bell },
    { id: 'profile', label: 'Profile & Documents', icon: UserCircle },
  ];

  const renderTrendIcon = (trend) => {
    if (trend === 'up') return <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />;
    if (trend === 'down') return <ArrowDownRight className="w-4 h-4 text-red-500 mr-1" />;
    return <Minus className="w-4 h-4 text-gray-400 mr-1" />;
  };

  const renderStockBadge = (status) => {
    const styles = {
      'Healthy': 'bg-green-900/20 text-green-400 border-green-800 hover:bg-green-900/30',
      'Low': 'bg-red-900/20 text-red-400 border-red-800 hover:bg-red-900/30',
      'Excess': 'bg-blue-900/20 text-blue-400 border-blue-800 hover:bg-blue-900/30'
    };
    return <Badge variant="outline" className={`${styles[status]} font-medium`}>{status}</Badge>;
  };

  return (
    <div className="flex min-h-screen bg-[#0a0a0a] text-foreground font-sans">
      
      {/* Sidebar Navigation */}
      <aside className="w-16 md:w-64 bg-[#111] border-r border-[#222] flex flex-col hidden md:flex sticky top-0 h-screen overflow-y-auto z-40">
        <div className="p-6 flex items-center space-x-3 border-b border-[#222]">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
            <Package className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg text-white tracking-tight hidden md:block">Flux Vendor</span>
        </div>

        <nav className="flex-1 py-6 px-2 md:px-4 space-y-2">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 px-2 hidden md:block">Vendor Portal</div>
          {NAV_ITEMS.map((item) => (
            <Button
              key={item.id}
              variant={activeTab === item.id ? "secondary" : "ghost"}
              className={`w-full justify-start font-medium transition-colors ${
                activeTab === item.id 
                  ? "bg-[#1a1a1a] text-white" 
                  : "text-gray-400 hover:text-white hover:bg-[#222]"
              }`}
              onClick={() => setActiveTab(item.id)}
            >
              <item.icon className="w-5 h-5 mr-3" />
              <span className="hidden md:block">{item.label}</span>
            </Button>
          ))}
        </nav>

        <div className="p-4 border-t border-[#222]">
          <div className="flex items-center space-x-3 mb-4 px-2 hidden md:flex">
            <div className="w-8 h-8 rounded-full bg-[#1a1a1a] border border-[#333] flex items-center justify-center">
              <span className="text-sm font-bold text-gray-300">GV</span>
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-white truncate">Green Valley Farms</p>
              <p className="text-xs text-gray-500 truncate">VN-8274</p>
            </div>
          </div>
          <Button variant="ghost" className="w-full justify-start text-gray-400 hover:text-white hover:bg-[#222]" onClick={() => navigate('/login')}>
            <LogOut className="w-5 h-5 mr-3" />
            <span className="hidden md:block">Sign Out</span>
          </Button>
        </div>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto min-h-screen max-w-7xl mx-auto">

        {/* Top Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              {NAV_ITEMS.find(i => i.id === activeTab)?.label}
            </h1>
            <p className="text-gray-400 mt-2 text-sm max-w-2xl">
              {activeTab === 'dashboard' && 'Welcome back. Here is the operational summary of your products across our network.'}
              {activeTab === 'products' && 'Aggregated performance insights and distribution footprint for your active SKUs.'}
              {activeTab === 'inventory' && 'Collaborate on supply planning and track fulfillment status.'}
              {activeTab === 'requests' && 'Respond to supply requests, product withdrawals, and other required actions.'}
              {activeTab === 'quality' && 'Monitor regulatory compliance, quality metrics, and document validity.'}
              {activeTab === 'notifications' && 'Review alerts and upcoming deadlines requiring your attention.'}
              {activeTab === 'profile' && 'Manage your company profile, contacts, and uploaded documentation.'}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="icon" className="relative bg-[#1a1a1a] border-[#333] text-gray-400 hover:text-white hover:bg-[#222]" onClick={() => setActiveTab('notifications')}>
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-[#1a1a1a]"></span>
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#0a0a0a] border-0">
              <Download className="w-4 h-4 mr-2" /> Export Data
            </Button>
          </div>
        </div>

        {/* DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-[#111] border-[#333] shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-bold text-gray-500 uppercase tracking-wider">Active Products</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white">24</div>
                  <p className="text-xs text-gray-400 mt-1">Across 4 categories</p>
                </CardContent>
              </Card>
              <Card className="bg-[#111] border-[#333] shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-bold text-gray-500 uppercase tracking-wider">Stores Carrying</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white">412</div>
                  <p className="text-xs text-gray-400 mt-1">Active distribution locations</p>
                </CardContent>
              </Card>
              <Card className="bg-[#111] border-[#333] shadow-sm ring-1 ring-amber-500/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-bold text-gray-500 uppercase tracking-wider">Pending Requests</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-amber-500">3</div>
                  <p className="text-xs text-amber-500 mt-1 flex items-center font-medium bg-amber-900/20 inline-flex px-1.5 py-0.5 rounded border border-amber-900/50">
                    Action Required
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-[#111] border-[#333] shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-bold text-gray-500 uppercase tracking-wider">Compliance Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-500">OK</div>
                  <p className="text-xs text-green-500 mt-1 font-medium bg-green-900/20 inline-flex px-1.5 py-0.5 rounded border border-green-900/50">
                    All metrics healthy
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Action Required Panel (Preview) */}
            <Card className="bg-[#111] border-[#333] shadow-sm">
              <CardHeader className="border-b border-[#222] py-4 bg-[#1a1a1a]/50">
                <CardTitle className="text-lg font-bold text-white flex items-center">
                  <AlertTriangle className="w-5 h-5 text-amber-500 mr-2" />
                  Action Required Panel
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-[#222] hover:bg-transparent bg-[#1a1a1a]/50">
                      <TableHead className="font-semibold text-gray-400">Request Type</TableHead>
                      <TableHead className="font-semibold text-gray-400">Product</TableHead>
                      <TableHead className="font-semibold text-gray-400">Reason</TableHead>
                      <TableHead className="text-right font-semibold text-gray-400">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {REQUESTS_DATA.filter(r => r.status !== 'Completed').map((req) => (
                      <TableRow key={req.id} className="border-[#222] hover:bg-[#1a1a1a] cursor-pointer">
                        <TableCell className="font-medium text-white">{req.type}</TableCell>
                        <TableCell className="text-gray-300">{req.product}</TableCell>
                        <TableCell className="text-gray-300">{req.reason}</TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" onClick={() => setActiveTab('requests')} variant="outline" className="text-blue-400 border-[#333] hover:bg-[#222] hover:text-blue-300 bg-transparent">
                            Review Request
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter className="py-3 border-t border-[#222] bg-[#1a1a1a]/20 justify-center">
                <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300 hover:bg-[#1a1a1a]" onClick={() => setActiveTab('requests')}>
                  View all requests <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}

        {/* PRODUCTS TAB */}
        {activeTab === 'products' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center space-x-4 mb-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
                <Input placeholder="Search products or SKUs..." className="pl-9 bg-[#1a1a1a] border-[#333] text-white focus-visible:ring-blue-500 focus-visible:ring-offset-0 placeholder:text-gray-500" />
              </div>
              <Button variant="outline" className="bg-[#1a1a1a] border-[#333] text-gray-300 hover:text-white hover:bg-[#222]">
                <Filter className="w-4 h-4 mr-2" /> Filter
              </Button>
            </div>

            <Card className="bg-[#111] border-[#333] shadow-sm overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-[#222] bg-[#1a1a1a]/50 hover:bg-transparent">
                    <TableHead className="font-semibold text-gray-400">Product / SKU</TableHead>
                    <TableHead className="font-semibold text-gray-400">Category</TableHead>
                    <TableHead className="font-semibold text-gray-400 text-center">Active Stores</TableHead>
                    <TableHead className="font-semibold text-gray-400">Sales Trend</TableHead>
                    <TableHead className="font-semibold text-gray-400">Stock Status</TableHead>
                    <TableHead className="font-semibold text-gray-400 text-right">Last Updated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {PRODUCTS_DATA.map((prod) => (
                    <TableRow key={prod.id} className="border-[#222] hover:bg-[#1a1a1a] transition-colors">
                      <TableCell>
                        <div className="font-bold text-white">{prod.name}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{prod.sku}</div>
                      </TableCell>
                      <TableCell className="text-gray-300">{prod.category}</TableCell>
                      <TableCell className="text-white font-medium text-center">{prod.activeStores}</TableCell>
                      <TableCell>
                        <div className="flex items-center capitalize text-gray-300 font-medium">
                          {renderTrendIcon(prod.trend)} {prod.trend}
                        </div>
                      </TableCell>
                      <TableCell>
                        {renderStockBadge(prod.stockStatus)}
                      </TableCell>
                      <TableCell className="text-gray-500 text-sm text-right">{prod.lastUpdated}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>
        )}

        {/* INVENTORY & SUPPLY TAB */}
        {activeTab === 'inventory' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <Card className="bg-[#111] border-[#333] shadow-sm overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-[#222] bg-[#1a1a1a]/50 hover:bg-transparent">
                    <TableHead className="font-semibold text-gray-400">Product</TableHead>
                    <TableHead className="font-semibold text-gray-400">Supply Commitment</TableHead>
                    <TableHead className="font-semibold text-gray-400">Fulfillment Status</TableHead>
                    <TableHead className="font-semibold text-gray-400">Recent Adjustments</TableHead>
                    <TableHead className="font-semibold text-gray-400">Next Expected Delivery</TableHead>
                    <TableHead className="font-semibold text-gray-400 text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {INVENTORY_DATA.map((inv, idx) => (
                    <TableRow key={idx} className="border-[#222] hover:bg-[#1a1a1a] transition-colors">
                      <TableCell className="font-bold text-white">{inv.product}</TableCell>
                      <TableCell className="text-gray-300">{inv.commitment}</TableCell>
                      <TableCell className="text-white font-medium">{inv.fulfillment}</TableCell>
                      <TableCell className="text-gray-300">{inv.adjustments}</TableCell>
                      <TableCell className="text-gray-300">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2 text-gray-500"/>
                          {inv.nextDelivery}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="outline" className={`
                          ${inv.status === 'On-time' ? 'bg-green-900/20 text-green-400 border-green-800' : 
                            inv.status === 'Delayed' ? 'bg-red-900/20 text-red-400 border-red-800' : 
                            'bg-amber-900/20 text-amber-400 border-amber-800'} font-medium
                        `}>
                          {inv.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
            <div className="bg-blue-900/10 border border-blue-900/30 rounded-lg p-4 flex items-start">
              <Clock className="w-5 h-5 text-blue-400 mr-3 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-400">Note on Supply Adjustments</h4>
                <p className="text-sm text-blue-200 mt-1 opacity-80">Vendors cannot initiate stock movement directly. All adjustments must be requested and approved through the Orders team via the Requests & Actions tab.</p>
              </div>
            </div>
          </div>
        )}

        {/* REQUESTS & ACTIONS TAB */}
        {activeTab === 'requests' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <Card className="bg-[#111] border-[#333] shadow-sm overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-[#222] bg-[#1a1a1a]/50 hover:bg-transparent">
                    <TableHead className="font-semibold text-gray-400">Request Type</TableHead>
                    <TableHead className="font-semibold text-gray-400">Product</TableHead>
                    <TableHead className="font-semibold text-gray-400">Reason</TableHead>
                    <TableHead className="font-semibold text-gray-400">Requested Date</TableHead>
                    <TableHead className="font-semibold text-gray-400">Status</TableHead>
                    <TableHead className="text-right font-semibold text-gray-400">Action Required</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {REQUESTS_DATA.map((req) => (
                    <TableRow key={req.id} className="border-[#222] hover:bg-[#1a1a1a] transition-colors">
                      <TableCell className="font-bold text-white">{req.type}</TableCell>
                      <TableCell className="text-gray-300">{req.product}</TableCell>
                      <TableCell className="text-gray-300 max-w-xs truncate" title={req.reason}>{req.reason}</TableCell>
                      <TableCell className="text-gray-500">{req.date}</TableCell>
                      <TableCell>
                         <Badge variant="outline" className={`
                          ${req.status === 'Completed' ? 'bg-[#1a1a1a] text-gray-400 border-[#333]' : 
                            req.status === 'Pending' ? 'bg-amber-900/20 text-amber-400 border-amber-800' : 
                            'bg-blue-900/20 text-blue-400 border-blue-800'} font-medium
                        `}>
                          {req.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {req.status !== 'Completed' ? (
                          <div className="flex justify-end space-x-2">
                             <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white shadow-none border-0">Accept</Button>
                             <Button size="sm" variant="outline" className="text-gray-300 border-[#333] hover:text-white hover:bg-[#222] bg-transparent">Propose Alt.</Button>
                          </div>
                        ) : (
                          <span className="text-gray-500 text-sm font-medium">No actions pending</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>
        )}

        {/* QUALITY TAB */}
        {activeTab === 'quality' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {COMPLIANCE_DATA.map((item) => (
                <Card key={item.id} className="bg-[#111] border-[#333] shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold text-gray-400">{item.metric}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-end mb-2">
                      <span className="text-2xl font-bold text-white">{item.value}</span>
                      <span className="text-xs text-gray-500 mb-1">Target: {item.target}</span>
                    </div>
                    <Progress value={parseFloat(item.value)} className="h-2 bg-[#222]" indicatorClassName={item.status === 'Healthy' ? 'bg-green-500' : 'bg-amber-500'} />
                    <div className="mt-4">
                      {item.status === 'Healthy' ? (
                        <span className="inline-flex items-center text-xs font-bold text-green-400 bg-green-900/20 px-2 py-1 rounded border border-green-900/50">
                          <CheckCircle2 className="w-3 h-3 mr-1" /> Passed
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-xs font-bold text-amber-400 bg-amber-900/20 px-2 py-1 rounded border border-amber-900/50">
                          <AlertTriangle className="w-3 h-3 mr-1" /> Action Required
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="bg-[#111] border-[#333] shadow-sm mt-6">
              <CardHeader className="border-b border-[#222]">
                <CardTitle className="text-lg font-bold text-white">Required Documents</CardTitle>
                <CardDescription className="text-gray-400">Manage certificates, quality reports, and packaging updates. Ensure all documents are valid to maintain compliance.</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {[
                    { name: 'ISO 9001 Certification', validUntil: 'Dec 2025', status: 'Active' },
                    { name: 'Organic Produce Certificate', validUntil: 'Nov 2025', status: 'Expiring Soon' },
                    { name: 'Liability Insurance Policy', validUntil: 'Mar 2026', status: 'Active' }
                  ].map((doc, i) => (
                    <div key={i} className="flex items-center justify-between p-4 border border-[#333] rounded-lg hover:border-[#444] transition-colors bg-[#1a1a1a]/50">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-[#111] border border-[#333] rounded shadow-sm flex items-center justify-center mr-4">
                          <FileText className="w-5 h-5 text-gray-400" />
                        </div>
                        <div>
                          <p className="font-bold text-white">{doc.name}</p>
                          <p className="text-xs text-gray-500 mt-0.5">Valid until: {doc.validUntil}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge variant="outline" className={`${doc.status === 'Active' ? 'bg-green-900/20 text-green-400 border-green-800' : 'bg-amber-900/20 text-amber-400 border-amber-800'}`}>
                          {doc.status}
                        </Badge>
                        <Button variant="outline" size="sm" className="bg-[#111] border-[#333] text-gray-300 hover:text-white hover:bg-[#222]">
                          <Upload className="w-4 h-4 mr-2" /> Update
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* NOTIFICATIONS TAB */}
        {activeTab === 'notifications' && (
          <div className="space-y-4 animate-in fade-in duration-300 max-w-4xl">
             {NOTIFICATIONS_DATA.map((note) => (
                <div key={note.id} className={`p-4 border rounded-lg flex items-start space-x-4 bg-[#111] shadow-sm ${
                  note.type === 'action' ? 'border-amber-500/30' : 'border-[#333]'
                }`}>
                  <div className={`mt-1 p-2 rounded-full ${
                    note.type === 'action' ? 'bg-amber-900/20 text-amber-400' : 
                    note.type === 'warning' ? 'bg-orange-900/20 text-orange-400' : 'bg-blue-900/20 text-blue-400'
                  }`}>
                    <Bell className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-white">{note.title}</h4>
                      <span className="text-xs text-gray-500">{note.date}</span>
                    </div>
                    <p className="text-gray-400 text-sm mt-1">{note.desc}</p>
                    {note.due && (
                      <div className="mt-3 flex items-center">
                        <Badge variant="outline" className="text-amber-400 border-amber-800 bg-amber-900/10">
                          Due: {note.due}
                        </Badge>
                        <Button variant="link" size="sm" className="ml-2 text-blue-400 hover:text-blue-300">
                          Resolve Action <ArrowRight className="w-3 h-3 ml-1" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
             ))}
          </div>
        )}

        {/* PROFILE TAB */}
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
             <Card className="bg-[#111] border-[#333] shadow-sm col-span-2">
              <CardHeader className="border-b border-[#222]">
                <CardTitle className="text-lg font-bold text-white">Company Profile</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Company Name</label>
                    <p className="text-white font-medium mt-1">Green Valley Farms LLC</p>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Vendor ID</label>
                    <p className="text-white font-mono mt-1">VN-8274</p>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Primary Contact</label>
                    <p className="text-white font-medium mt-1">Jane Doe (Operations Director)</p>
                    <p className="text-gray-500 text-sm">jane.doe@greenvalley.example.com</p>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Support Contact</label>
                    <p className="text-white font-medium mt-1">Vendor Support Team</p>
                    <p className="text-gray-500 text-sm">support@greenvalley.example.com</p>
                  </div>
                </div>
              </CardContent>
             </Card>

             <Card className="bg-[#111] border-[#333] shadow-sm h-fit">
              <CardHeader className="border-b border-[#222]">
                <CardTitle className="text-lg font-bold text-white">Bank & Settlement (Read-Only)</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Bank Name</label>
                  <p className="text-white font-medium mt-1">Chase Commercial Bank</p>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Account Number (Last 4)</label>
                  <p className="text-white font-medium mt-1">**** 4432</p>
                </div>
                <div className="pt-4 border-t border-[#222]">
                  <p className="text-xs text-gray-500">To update bank information, please contact the Retailer Vendor Management office.</p>
                </div>
              </CardContent>
             </Card>
          </div>
        )}

      </main>
    </div>
  );
}
