
import React, { useState } from 'react';
import {
  LayoutDashboard, Package, Truck, FileText, Bell, Settings,
  Search, CheckCircle2, AlertTriangle, Clock, ArrowRight,
  Filter, MoreHorizontal, Download, ChevronRight, ShieldCheck,
  LogOut, UserCircle
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from '@/components/ui/separator';
import { Progress } from "@/components/ui/progress";

// --- MOCK DATA ---

const PRODUCTS_DATA = [
  { id: "P-101", name: "Organic Hass Avocados", sku: "SKU-9928", activeStores: 142, trend: "up", stockStatus: "Low", lastUpdated: "2h ago" },
  { id: "P-102", name: "Premium Almond Milk", sku: "SKU-1029", activeStores: 89, trend: "flat", stockStatus: "Healthy", lastUpdated: "5h ago" },
  { id: "P-103", name: "Artisan Sourdough", sku: "SKU-3321", activeStores: 56, trend: "down", stockStatus: "Excess", lastUpdated: "1d ago" },
  { id: "P-104", name: "Free-Range Eggs (12ct)", sku: "SKU-5512", activeStores: 200, trend: "up", stockStatus: "Healthy", lastUpdated: "30m ago" },
];

const REQUESTS_DATA = [
  { id: "REQ-2024-001", type: "Supply Increase", product: "Organic Hass Avocados", reason: "Projected Demand Spike", date: "Jan 19, 2024", status: "Pending", urgency: "High" },
  { id: "REQ-2024-002", type: "Quality Check", product: "Artisan Sourdough", reason: "Customer Complaints (Texture)", date: "Jan 18, 2024", status: "In Progress", urgency: "Medium" },
  { id: "REQ-2024-003", type: "Packaging Update", product: "Premium Almond Milk", reason: "New Regulatory Compliance", date: "Jan 15, 2024", status: "Completed", urgency: "Low" },
];

const COMPLIANCE_DATA = [
  { id: "C-001", metric: "Quality Check Pass Rate", status: "Healthy", value: "98.5%", target: "98.0%" },
  { id: "C-002", metric: "On-Time Delivery", status: "Warning", value: "92.0%", target: "95.0%" },
  { id: "C-003", metric: "Documentation Validity", status: "Healthy", value: "100%", target: "100%" },
];

const VendorPortalPage = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-foreground font-sans flex">

      {/* 1. SIDEBAR NAVIGATION */}
      <aside className="w-64 bg-[#111] border-r border-[#222] hidden md:flex flex-col fixed inset-y-0 z-20">
        <div className="p-6 flex items-center space-x-2 border-b border-[#222]">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Package className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg text-white">Partner<span className="text-indigo-400">Portal</span></span>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <Button
            variant={activeTab === "dashboard" ? "secondary" : "ghost"}
            className={`w-full justify-start ${activeTab === "dashboard" ? "bg-indigo-900/20 text-indigo-400" : "text-gray-400 hover:bg-[#222] hover:text-white"}`}
            onClick={() => setActiveTab("dashboard")}
          >
            <LayoutDashboard className="w-5 h-5 mr-3" /> Dashboard
          </Button>
          <Button
            variant={activeTab === "products" ? "secondary" : "ghost"}
            className={`w-full justify-start ${activeTab === "products" ? "bg-indigo-900/20 text-indigo-400" : "text-gray-400 hover:bg-[#222] hover:text-white"}`}
            onClick={() => setActiveTab("products")}
          >
            <Package className="w-5 h-5 mr-3" /> Products
          </Button>
          <Button
            variant={activeTab === "requests" ? "secondary" : "ghost"}
            className={`w-full justify-start ${activeTab === "requests" ? "bg-indigo-900/20 text-indigo-400" : "text-gray-400 hover:bg-[#222] hover:text-white"}`}
            onClick={() => setActiveTab("requests")}
          >
            <FileText className="w-5 h-5 mr-3" /> Requests <Badge className="ml-auto bg-indigo-900/50 text-indigo-300 hover:bg-indigo-900/50 border-indigo-800">3</Badge>
          </Button>
          <Button
            variant={activeTab === "quality" ? "secondary" : "ghost"}
            className={`w-full justify-start ${activeTab === "quality" ? "bg-indigo-900/20 text-indigo-400" : "text-gray-400 hover:bg-[#222] hover:text-white"}`}
            onClick={() => setActiveTab("quality")}
          >
            <ShieldCheck className="w-5 h-5 mr-3" /> Quality & Compliance
          </Button>
        </nav>

        <div className="p-4 border-t border-[#222]">
          <div className="flex items-center p-3 bg-[#1a1a1a] rounded-lg border border-[#333] mb-3">
            <UserCircle className="w-8 h-8 text-gray-400 mr-3" />
            <div>
              <p className="text-sm font-medium text-white">Acme Farms</p>
              <p className="text-xs text-gray-500">Vendor ID: V-4921</p>
            </div>
          </div>
          <Button variant="outline" className="w-full justify-start text-gray-400 border-[#333] hover:bg-[#222] hover:text-white bg-transparent">
            <LogOut className="w-4 h-4 mr-2" /> Sign Out
          </Button>
        </div>
      </aside>

      {/* 2. MAIN CONTENT */}
      <main className="flex-1 md:ml-64 p-8 overflow-y-auto min-h-screen">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">
              {activeTab === 'dashboard' && 'Vendor Dashboard'}
              {activeTab === 'products' && 'Product Performance'}
              {activeTab === 'requests' && 'Requests & Actions'}
              {activeTab === 'quality' && 'Quality & Compliance'}
            </h1>
            <p className="text-gray-400 mt-1">
              {activeTab === 'dashboard' && 'Overview of your operational footprint and pending actions.'}
              {activeTab === 'products' && 'Track inventory status and sales trends across the network.'}
              {activeTab === 'requests' && 'Collaborate on supply adjustments and product updates.'}
              {activeTab === 'quality' && 'Monitor compliance metrics and certification status.'}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="icon" className="relative border-[#333] text-gray-400 bg-[#1a1a1a] hover:bg-[#222]">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-[#1a1a1a]"></span>
            </Button>
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
              <Download className="w-4 h-4 mr-2" /> Export Report
            </Button>
          </div>
        </div>

        {/* DASHBOARD CONTENT */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-[#111] border-[#333] shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-bold text-gray-400 uppercase tracking-wider">Active Products</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white">24</div>
                  <p className="text-xs text-green-500 mt-1 flex items-center font-medium">
                    <ArrowRight className="w-3 h-3 mr-1" /> 100% Availability
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-[#111] border-[#333] shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-bold text-gray-400 uppercase tracking-wider">Active Stores</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white">412</div>
                  <p className="text-xs text-gray-400 mt-1 font-medium">
                    Across 3 Regions
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-[#111] border-[#333] shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-bold text-gray-400 uppercase tracking-wider">Pending Requests</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-indigo-400">3</div>
                  <p className="text-xs text-orange-500 mt-1 flex items-center font-medium">
                    <AlertTriangle className="w-3 h-3 mr-1" /> Action Required
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-[#111] border-[#333] shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-bold text-gray-400 uppercase tracking-wider">Compliance Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-500">98%</div>
                  <p className="text-xs text-gray-400 mt-1 font-medium">
                    Gold Tier Partner
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Requests Preview */}
            <Card className="bg-[#111] border-[#333] shadow-sm">
              <CardHeader className="border-b border-[#222] py-4">
                <CardTitle className="text-lg font-bold text-white">Action Items</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-[#222] hover:bg-transparent">
                      <TableHead className="font-semibold text-gray-400">Request Type</TableHead>
                      <TableHead className="font-semibold text-gray-400">Product</TableHead>
                      <TableHead className="font-semibold text-gray-400">Reason</TableHead>
                      <TableHead className="font-semibold text-gray-400">Urgency</TableHead>
                      <TableHead className="text-right font-semibold text-gray-400">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {REQUESTS_DATA.filter(r => r.status !== 'Completed').map((req) => (
                      <TableRow key={req.id} className="border-[#222] hover:bg-[#1a1a1a]">
                        <TableCell className="font-medium text-white">{req.type}</TableCell>
                        <TableCell className="text-gray-300">{req.product}</TableCell>
                        <TableCell className="text-gray-300">{req.reason}</TableCell>
                        <TableCell>
                          <Badge className={`${req.urgency === 'High' ? 'bg-red-900/20 text-red-400 hover:bg-red-900/30' : 'bg-yellow-900/20 text-yellow-400 hover:bg-yellow-900/30'}`}>
                            {req.urgency}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="outline" className="text-indigo-400 border-[#333] hover:bg-[#222] bg-transparent">
                            Review
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter className="py-3 border-t border-[#222] bg-[#1a1a1a]/50">
                <Button variant="link" className="text-indigo-400 p-0 h-auto font-medium" onClick={() => setActiveTab('requests')}>
                  View all requests <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}

        {/* PRODUCTS CONTENT */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex items-center space-x-4 mb-4">
              <Input placeholder="Search products, SKUs..." className="max-w-md bg-[#1a1a1a] border-[#333] text-white" />
              <Button variant="outline" className="border-[#333] text-gray-300 hover:bg-[#222] bg-[#1a1a1a]">
                <Filter className="w-4 h-4 mr-2" /> Filter
              </Button>
            </div>

            <Card className="bg-[#111] border-[#333] shadow-sm">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-[#222] bg-[#1a1a1a]/50 hover:bg-transparent">
                      <TableHead className="font-semibold text-gray-400">Product / SKU</TableHead>
                      <TableHead className="font-semibold text-gray-400">Active Stores</TableHead>
                      <TableHead className="font-semibold text-gray-400">Inventory Status</TableHead>
                      <TableHead className="font-semibold text-gray-400">Sales Trend</TableHead>
                      <TableHead className="font-semibold text-gray-400">Last Synced</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {PRODUCTS_DATA.map((prod) => (
                      <TableRow key={prod.id} className="border-[#222] hover:bg-[#1a1a1a] cursor-pointer">
                        <TableCell>
                          <div className="font-medium text-white">{prod.name}</div>
                          <div className="text-xs text-gray-500">{prod.sku}</div>
                        </TableCell>
                        <TableCell className="text-gray-300">{prod.activeStores}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`
                                                        ${prod.stockStatus === 'Healthy' ? 'bg-green-900/20 text-green-400 border-green-800' :
                              prod.stockStatus === 'Low' ? 'bg-red-900/20 text-red-400 border-red-800' :
                                'bg-yellow-900/20 text-yellow-400 border-yellow-800'}
                                                    `}>
                            {prod.stockStatus}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            {prod.trend === 'up' && <span className="text-green-500 flex items-center font-medium"><ArrowRight className="w-4 h-4 mr-1 -rotate-45" /> Rising</span>}
                            {prod.trend === 'flat' && <span className="text-gray-400 flex items-center font-medium"><ArrowRight className="w-4 h-4 mr-1" /> Stable</span>}
                            {prod.trend === 'down' && <span className="text-red-500 flex items-center font-medium"><ArrowRight className="w-4 h-4 mr-1 rotate-45" /> Declining</span>}
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-500 text-sm">{prod.lastUpdated}</TableCell>
                        <TableCell>
                          <ChevronRight className="w-4 h-4 text-gray-600" />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}

        {/* REQUESTS CONTENT */}
        {activeTab === 'requests' && (
          <div className="space-y-6">
            <Card className="bg-[#111] border-[#333] shadow-sm">
              <CardHeader className="border-b border-[#222] py-4">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg font-bold text-white">Collaboration Inbox</CardTitle>
                  <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                    <FileText className="w-4 h-4 mr-2" /> New Request
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-[#222] bg-[#1a1a1a]/50 hover:bg-transparent">
                      <TableHead className="font-semibold text-gray-400">ID</TableHead>
                      <TableHead className="font-semibold text-gray-400">Request Type</TableHead>
                      <TableHead className="font-semibold text-gray-400">Product</TableHead>
                      <TableHead className="font-semibold text-gray-400">Reason</TableHead>
                      <TableHead className="font-semibold text-gray-400">Date</TableHead>
                      <TableHead className="font-semibold text-gray-400">Status</TableHead>
                      <TableHead className="text-right font-semibold text-gray-400">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {REQUESTS_DATA.map((req) => (
                      <TableRow key={req.id} className="border-[#222] hover:bg-[#1a1a1a]">
                        <TableCell className="font-mono text-xs text-gray-500">{req.id}</TableCell>
                        <TableCell className="font-medium text-white">{req.type}</TableCell>
                        <TableCell className="text-gray-300">{req.product}</TableCell>
                        <TableCell className="text-gray-300 max-w-xs truncate">{req.reason}</TableCell>
                        <TableCell className="text-gray-500">{req.date}</TableCell>
                        <TableCell>
                          <Badge className={`
                                                        ${req.status === 'Completed' ? 'bg-gray-800 text-gray-300 hover:bg-gray-800' :
                              req.status === 'In Progress' ? 'bg-blue-900/20 text-blue-400 hover:bg-blue-900/30' :
                                'bg-orange-900/20 text-orange-400 hover:bg-orange-900/30'}
                                                    `}>
                            {req.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          {req.status !== 'Completed' && (
                            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white">Accept</Button>
                          )}
                          <Button size="sm" variant="outline" className="border-[#333] text-gray-400 hover:bg-[#222] bg-transparent">Details</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}

        {/* QUALITY CONTENT */}
        {activeTab === 'quality' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {COMPLIANCE_DATA.map((item) => (
                <Card key={item.id} className="bg-[#111] border-[#333] shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-400">{item.metric}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-end mb-2">
                      <span className="text-2xl font-bold text-white">{item.value}</span>
                      <span className="text-xs text-gray-500 mb-1">Target: {item.target}</span>
                    </div>
                    <Progress value={parseFloat(item.value)} className="h-2 bg-[#222]" />
                    <div className="mt-4 flex items-center">
                      {item.status === 'Healthy' ? (
                        <span className="flex items-center text-xs font-semibold text-green-400 bg-green-900/20 px-2 py-1 rounded-full">
                          <CheckCircle2 className="w-3 h-3 mr-1" /> Compliant
                        </span>
                      ) : (
                        <span className="flex items-center text-xs font-semibold text-orange-400 bg-orange-900/20 px-2 py-1 rounded-full">
                          <AlertTriangle className="w-3 h-3 mr-1" /> Attention Needed
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="bg-[#111] border-[#333] shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-white text-base">Required Documents</CardTitle>
                <CardDescription className="text-gray-400">Manage your certifications and compliance documents.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['ISO 9001 Certification', 'Organic Produce Certificate', 'Liability Insurance Policy'].map((doc, i) => (
                    <div key={i} className="flex items-center justify-between p-3 border border-[#333] rounded-lg bg-[#1a1a1a]/50">
                      <div className="flex items-center">
                        <FileText className="w-5 h-5 text-indigo-400 mr-3" />
                        <div>
                          <p className="font-medium text-white">{doc}</p>
                          <p className="text-xs text-gray-500">Valid until Dec 2024</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-green-400 border-green-800 bg-green-900/20">Active</Badge>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hover:bg-[#222]">
                          <MoreHorizontal className="w-4 h-4 text-gray-400" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

      </main>
    </div>
  );
};

export default VendorPortalPage;
