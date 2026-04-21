
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Package, FileText, Bell,
  AlertTriangle, ArrowLeft, ArrowRight,
  MoreHorizontal, Download, ChevronRight,
  RefreshCw, Moon, Sun
} from 'lucide-react';
import {
  Card, CardContent, CardHeader, CardTitle, CardFooter
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle,
} from '@/components/ui/sheet';
import VendorSidebar from '@/components/VendorSidebar';
import ThemeToggle from '@/components/ThemeToggle';
import { backendModuleService } from '@/services/backendModuleService';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/use-toast';

const PAGE_SIZE = 25;

function titleCase(value = '') {
  if (!value) return '';
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatDate(dateValue) {
  if (!dateValue) return '-';
  const d = new Date(dateValue);
  if (Number.isNaN(d.getTime())) return dateValue;
  return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
}

function toTitle(label) {
  if (!label) return '';
  return label
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

const THEME_STORAGE_KEY = 'warehouse-theme';

const VendorPortalPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { role } = useAuth();
  const activeTab = useMemo(() => {
    if (location.pathname.startsWith('/vendor/requests')) return 'requests';
    if (location.pathname.startsWith('/vendor/products')) return 'products';
    return 'dashboard';
  }, [location.pathname]);

  const adminBackPath = useMemo(() => {
    const stateFrom = location.state?.from;
    if (typeof stateFrom === 'string' && stateFrom.startsWith('/')) {
      return stateFrom;
    }

    const searchFrom = new URLSearchParams(location.search).get('from');
    if (searchFrom === 'control-tower') {
      return '/control-tower';
    }

    return '/dashboard';
  }, [location.state, location.search]);

  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);

  const [products, setProducts] = useState([]);
  const [requests, setRequests] = useState([]);

  const [productSearch, setProductSearch] = useState('');
  const [productStockFilter, setProductStockFilter] = useState('all');
  const [productTrendFilter, setProductTrendFilter] = useState('all');
  const [productCategoryFilter, setProductCategoryFilter] = useState('all');

  const [requestSearch, setRequestSearch] = useState('');
  const [requestStatusFilter, setRequestStatusFilter] = useState('all');
  const [requestUrgencyFilter, setRequestUrgencyFilter] = useState('all');
  const [requestTypeFilter, setRequestTypeFilter] = useState('all');

  const [selectedEntry, setSelectedEntry] = useState(null);
  const [selectedEntryType, setSelectedEntryType] = useState('');
  const [detailOpen, setDetailOpen] = useState(false);
  const [isSavingRequestAction, setIsSavingRequestAction] = useState(false);

  const loadVendorData = async () => {
    setIsLoading(true);
    try {
      const data = await backendModuleService.getModuleData('vendorPortal');
      setProducts(Array.isArray(data?.products) ? data.products : []);
      setRequests(Array.isArray(data?.requests) ? data.requests : []);
    } catch (err) {
      console.error('Failed to load vendor portal data:', err);
      toast({
        title: 'Unable to load vendor data',
        description: err.message || 'Please check backend and Supabase connectivity.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadVendorData();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [
    activeTab,
    productSearch, productStockFilter, productTrendFilter, productCategoryFilter,
    requestSearch, requestStatusFilter, requestUrgencyFilter, requestTypeFilter,
  ]);

  const openDetails = (entryType, entry) => {
    setSelectedEntryType(entryType);
    setSelectedEntry(entry);
    setDetailOpen(true);
  };

  const closeDetails = () => {
    setDetailOpen(false);
    setSelectedEntry(null);
    setSelectedEntryType('');
  };

  const saveRequestAction = async (decision) => {
    if (!selectedEntry || selectedEntryType !== 'request') return;

    setIsSavingRequestAction(true);
    try {
      await backendModuleService.recordVendorRequestDecision(
        selectedEntry.id,
        decision,
        selectedEntry,
        decision === 'Accepted' ? 'Accepted from Vendor Portal' : 'Rejected from Vendor Portal'
      );

      toast({
        title: `Request ${decision.toLowerCase()}`,
        description: `${selectedEntry.id} has been marked as ${decision.toLowerCase()}.`,
      });

      await loadVendorData();
      closeDetails();
    } catch (error) {
      toast({
        title: 'Action failed',
        description: error.message || 'Could not update the request.',
        variant: 'destructive',
      });
    } finally {
      setIsSavingRequestAction(false);
    }
  };

  const productCategories = useMemo(() => {
    return [...new Set(products.map((p) => p.category).filter(Boolean))];
  }, [products]);

  const requestTypes = useMemo(() => {
    return [...new Set(requests.map((r) => r.type).filter(Boolean))];
  }, [requests]);

  const filteredProducts = useMemo(() => {
    const q = productSearch.trim().toLowerCase();
    return products.filter((prod) => {
      const matchesSearch = !q ||
        String(prod.name || '').toLowerCase().includes(q) ||
        String(prod.sku || '').toLowerCase().includes(q);
      const matchesStock = productStockFilter === 'all' || prod.stockStatus === productStockFilter;
      const matchesTrend = productTrendFilter === 'all' || prod.trend === productTrendFilter;
      const matchesCategory = productCategoryFilter === 'all' || prod.category === productCategoryFilter;
      return matchesSearch && matchesStock && matchesTrend && matchesCategory;
    });
  }, [products, productSearch, productStockFilter, productTrendFilter, productCategoryFilter]);

  const filteredRequests = useMemo(() => {
    const q = requestSearch.trim().toLowerCase();
    return requests.filter((req) => {
      const matchesSearch = !q ||
        String(req.id || '').toLowerCase().includes(q) ||
        String(req.product || '').toLowerCase().includes(q) ||
        String(req.reason || '').toLowerCase().includes(q);
      const matchesStatus = requestStatusFilter === 'all' || req.status === requestStatusFilter;
      const matchesUrgency = requestUrgencyFilter === 'all' || req.urgency === requestUrgencyFilter;
      const matchesType = requestTypeFilter === 'all' || req.type === requestTypeFilter;
      return matchesSearch && matchesStatus && matchesUrgency && matchesType;
    });
  }, [requests, requestSearch, requestStatusFilter, requestUrgencyFilter, requestTypeFilter]);

  const paginatedProducts = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredProducts.slice(start, start + PAGE_SIZE);
  }, [filteredProducts, page]);

  const paginatedRequests = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredRequests.slice(start, start + PAGE_SIZE);
  }, [filteredRequests, page]);

  const maxPages = useMemo(() => {
    if (activeTab === 'products') return Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
    if (activeTab === 'requests') return Math.max(1, Math.ceil(filteredRequests.length / PAGE_SIZE));
    return 1;
  }, [activeTab, filteredProducts.length, filteredRequests.length]);

  const dashboardMetrics = useMemo(() => {
    const pendingRequests = requests.filter((r) => r.status === 'Pending').length;
    const openRequests = requests.filter((r) => r.status === 'Pending').length;
    const acceptedRequests = requests.filter((r) => r.status === 'Accepted').length;
    const rejectedRequests = requests.filter((r) => r.status === 'Rejected').length;
    const activeStores = products.reduce((max, p) => Math.max(max, Number(p.activeStores || 0)), 0);

    return {
      activeProducts: products.length,
      activeStores,
      pendingRequests,
      openRequests,
      acceptedRequests,
      rejectedRequests,
    };
  }, [products, requests]);

  const renderDetailRows = () => {
    if (!selectedEntry) return null;

    const entries = Object.entries(selectedEntry).filter(([key]) => key !== 'id');
    return entries.map(([key, value]) => (
      <div key={key} className="rounded-lg border border-border bg-muted/50 p-3">
        <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{toTitle(key)}</div>
        <div className="mt-1 text-sm text-foreground break-words">
          {Array.isArray(value) ? value.join(', ') : typeof value === 'object' && value !== null ? JSON.stringify(value, null, 2) : String(value)}
        </div>
      </div>
    ));
  };

  const headerTitle = useMemo(() => {
    if (activeTab === 'products') return 'Product Performance';
    if (activeTab === 'requests') return 'Requests & Actions';
    return 'Vendor Portal';
  }, [activeTab]);

  return (
    <div className="flex min-h-screen bg-background text-foreground font-sans selection:bg-blue-500/30">
      <VendorSidebar />

      <div className="flex min-w-0 flex-1 flex-col pb-20">
        <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur-md">
          <div className="flex min-h-16 items-center justify-between gap-4 px-4 py-3 md:px-6">
            <h1 className="text-xl font-bold tracking-tight text-foreground md:text-2xl">{headerTitle}</h1>

            <div className="flex items-center gap-2">
              {role === 'admin' && (
                <Button
                  variant="outline"
                  className="border-border bg-background text-foreground hover:bg-accent"
                  onClick={() => navigate(adminBackPath)}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Inventory Dashboard
                </Button>
              )}

              <Button variant="outline" size="icon" className="relative border-border text-muted-foreground bg-background hover:bg-muted hover:text-foreground">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-background"></span>
              </Button>
              <Button variant="outline" size="icon" className="border-border text-muted-foreground bg-background hover:bg-muted hover:text-foreground" onClick={loadVendorData} disabled={isLoading}>
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-900/20">
                <Download className="w-4 h-4 mr-2" /> Export
              </Button>

              <ThemeToggle />
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1700px] space-y-6 p-4 md:p-6">

        {isLoading && (
          <div className="mb-6 rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground shadow-sm">
            Loading vendor portal data from Supabase...
          </div>
        )}

        {/* DASHBOARD CONTENT */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-card border-border shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Active Products</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">{dashboardMetrics.activeProducts}</div>
                  <p className="text-xs text-green-500 mt-1 flex items-center font-medium">
                    <ArrowRight className="w-3 h-3 mr-1" /> 100% Availability
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-card border-border shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Active Stores</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">{dashboardMetrics.activeStores}</div>
                  <p className="text-xs text-muted-foreground mt-1 font-medium">
                    Across 3 Regions
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-card border-border shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Pending Requests</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-indigo-400">{dashboardMetrics.pendingRequests}</div>
                  <p className="text-xs text-orange-500 mt-1 flex items-center font-medium">
                    <AlertTriangle className="w-3 h-3 mr-1" /> Action Required
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Requests Preview */}
            <Card className="bg-card border-border shadow-sm">
              <CardHeader className="border-b border-border py-4">
                <CardTitle className="text-lg font-bold text-foreground">Action Items</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="font-semibold text-muted-foreground">Request Type</TableHead>
                      <TableHead className="font-semibold text-muted-foreground">Product</TableHead>
                      <TableHead className="font-semibold text-muted-foreground">Reason</TableHead>
                      <TableHead className="font-semibold text-muted-foreground">Urgency</TableHead>
                      <TableHead className="text-right font-semibold text-muted-foreground">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRequests.filter(r => r.status !== 'Completed').slice(0, 8).map((req) => (
                      <TableRow key={req.id} className="border-border hover:bg-muted/60 cursor-pointer" onClick={() => openDetails('request', req)}>
                        <TableCell className="font-medium text-foreground">{req.type}</TableCell>
                        <TableCell className="text-muted-foreground">{req.product}</TableCell>
                        <TableCell className="text-muted-foreground">{req.reason}</TableCell>
                        <TableCell>
                          <Badge className={`${req.urgency === 'High' ? 'bg-red-900/20 text-red-400 hover:bg-red-900/30' : 'bg-yellow-900/20 text-yellow-400 hover:bg-yellow-900/30'}`}>
                            {req.urgency}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="outline" className="text-indigo-400 border-border hover:bg-muted bg-transparent">
                            Review
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter className="py-3 border-t border-border bg-muted/40">
                <Button variant="link" className="text-indigo-400 p-0 h-auto font-medium" onClick={() => navigate('/vendor/requests')}>
                  View all requests <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}

        {/* PRODUCTS CONTENT */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <Input
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="Search products, SKUs..."
                className="max-w-md bg-background border-border text-foreground placeholder:text-muted-foreground"
              />
              <Select value={productStockFilter} onValueChange={setProductStockFilter}>
                <SelectTrigger className="w-[180px] bg-background border-border text-foreground"><SelectValue placeholder="Stock Status" /></SelectTrigger>
                <SelectContent className="bg-background border-border text-foreground">
                  <SelectItem value="all">All Stock Status</SelectItem>
                  <SelectItem value="Healthy">Healthy</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Excess">Excess</SelectItem>
                </SelectContent>
              </Select>
              <Select value={productTrendFilter} onValueChange={setProductTrendFilter}>
                <SelectTrigger className="w-[160px] bg-background border-border text-foreground"><SelectValue placeholder="Trend" /></SelectTrigger>
                <SelectContent className="bg-background border-border text-foreground">
                  <SelectItem value="all">All Trends</SelectItem>
                  <SelectItem value="up">Rising</SelectItem>
                  <SelectItem value="flat">Stable</SelectItem>
                  <SelectItem value="down">Declining</SelectItem>
                </SelectContent>
              </Select>
              <Select value={productCategoryFilter} onValueChange={setProductCategoryFilter}>
                <SelectTrigger className="w-[180px] bg-background border-border text-foreground"><SelectValue placeholder="Category" /></SelectTrigger>
                <SelectContent className="bg-background border-border text-foreground">
                  <SelectItem value="all">All Categories</SelectItem>
                  {productCategories.map((category) => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Badge variant="outline" className="border-[#333] text-gray-400">{filteredProducts.length} results</Badge>
            </div>

            <Card className="bg-card border-border shadow-sm">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border bg-muted/50 hover:bg-transparent">
                      <TableHead className="font-semibold text-muted-foreground">Product / SKU</TableHead>
                      <TableHead className="font-semibold text-muted-foreground">Active Stores</TableHead>
                      <TableHead className="font-semibold text-muted-foreground">Inventory Status</TableHead>
                      <TableHead className="font-semibold text-muted-foreground">Sales Trend</TableHead>
                      <TableHead className="font-semibold text-muted-foreground">Last Synced</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedProducts.map((prod) => (
                      <TableRow key={prod.id} className="border-border hover:bg-muted/60 cursor-pointer" onClick={() => openDetails('product', prod)}>
                        <TableCell>
                          <div className="font-medium text-foreground">{prod.name}</div>
                          <div className="text-xs text-muted-foreground">{prod.sku}</div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{prod.activeStores}</TableCell>
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
                        <TableCell className="text-muted-foreground text-sm">{prod.lastUpdated}</TableCell>
                        <TableCell>
                          <ChevronRight className="w-4 h-4 text-gray-600" />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter className="border-t border-border bg-muted/30 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Page {page} of {maxPages}</span>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" className="border-border bg-transparent" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</Button>
                  <Button size="sm" variant="outline" className="border-border bg-transparent" disabled={page >= maxPages} onClick={() => setPage((p) => Math.min(maxPages, p + 1))}>Next</Button>
                </div>
              </CardFooter>
            </Card>
          </div>
        )}

        {/* REQUESTS CONTENT */}
        {activeTab === 'requests' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <Input
                value={requestSearch}
                onChange={(e) => setRequestSearch(e.target.value)}
                placeholder="Search ID, product, reason..."
                className="max-w-md bg-background border-border text-foreground placeholder:text-muted-foreground"
              />
              <Select value={requestStatusFilter} onValueChange={setRequestStatusFilter}>
                <SelectTrigger className="w-[180px] bg-background border-border text-foreground"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent className="bg-background border-border text-foreground">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={requestUrgencyFilter} onValueChange={setRequestUrgencyFilter}>
                <SelectTrigger className="w-[180px] bg-background border-border text-foreground"><SelectValue placeholder="Urgency" /></SelectTrigger>
                <SelectContent className="bg-background border-border text-foreground">
                  <SelectItem value="all">All Urgency</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
              <Select value={requestTypeFilter} onValueChange={setRequestTypeFilter}>
                <SelectTrigger className="w-[220px] bg-background border-border text-foreground"><SelectValue placeholder="Request Type" /></SelectTrigger>
                <SelectContent className="bg-background border-border text-foreground">
                  <SelectItem value="all">All Types</SelectItem>
                  {requestTypes.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Badge variant="outline" className="border-[#333] text-gray-400">{filteredRequests.length} results</Badge>
            </div>

            <Card className="bg-card border-border shadow-sm">
              <CardHeader className="border-b border-border py-4">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg font-bold text-foreground">Collaboration Inbox</CardTitle>
                  <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                    <FileText className="w-4 h-4 mr-2" /> New Request
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border bg-muted/50 hover:bg-transparent">
                      <TableHead className="font-semibold text-muted-foreground">ID</TableHead>
                      <TableHead className="font-semibold text-muted-foreground">Request Type</TableHead>
                      <TableHead className="font-semibold text-muted-foreground">Product</TableHead>
                      <TableHead className="font-semibold text-muted-foreground">Reason</TableHead>
                      <TableHead className="font-semibold text-muted-foreground">Date</TableHead>
                      <TableHead className="font-semibold text-muted-foreground">Status</TableHead>
                      <TableHead className="text-right font-semibold text-muted-foreground">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedRequests.map((req) => (
                      <TableRow key={req.id} className="border-border hover:bg-muted/60 cursor-pointer" onClick={() => openDetails('request', req)}>
                        <TableCell className="font-mono text-xs text-muted-foreground">{req.id}</TableCell>
                        <TableCell className="font-medium text-foreground">{req.type}</TableCell>
                        <TableCell className="text-muted-foreground">{req.product}</TableCell>
                        <TableCell className="text-muted-foreground max-w-xs truncate">{req.reason}</TableCell>
                        <TableCell className="text-muted-foreground">{formatDate(req.date)}</TableCell>
                        <TableCell>
                          <Badge className={`
                                                        ${req.status === 'Accepted' ? 'bg-green-900/20 text-green-400 hover:bg-green-900/30' :
                              req.status === 'Rejected' ? 'bg-red-900/20 text-red-400 hover:bg-red-900/30' :
                              req.status === 'Completed' ? 'bg-gray-800 text-gray-300 hover:bg-gray-800' :
                              req.status === 'In Progress' ? 'bg-blue-900/20 text-blue-400 hover:bg-blue-900/30' :
                                'bg-orange-900/20 text-orange-400 hover:bg-orange-900/30'}
                                                    `}>
                            {req.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          {req.status === 'Pending' && (
                            <>
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  openDetails('request', req);
                                }}
                              >
                                Accept
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-border text-muted-foreground hover:bg-muted bg-transparent"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  openDetails('request', req);
                                }}
                              >
                                Reject
                              </Button>
                            </>
                          )}
                          <Button size="sm" variant="outline" className="border-border text-muted-foreground hover:bg-muted bg-transparent" onClick={(event) => { event.stopPropagation(); openDetails('request', req); }}>Details</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter className="border-t border-border bg-muted/30 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Page {page} of {maxPages}</span>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" className="border-border bg-transparent" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</Button>
                  <Button size="sm" variant="outline" className="border-border bg-transparent" disabled={page >= maxPages} onClick={() => setPage((p) => Math.min(maxPages, p + 1))}>Next</Button>
                </div>
              </CardFooter>
            </Card>
          </div>
        )}

        <Sheet open={detailOpen} onOpenChange={(open) => (open ? setDetailOpen(true) : closeDetails())}>
          <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto bg-background border-border text-foreground">
            <SheetHeader className="text-left">
              <SheetTitle className="text-foreground">
                {selectedEntryType ? `${toTitle(selectedEntryType)} Details` : 'Entry Details'}
              </SheetTitle>
              <SheetDescription className="text-muted-foreground">
                Review the full record and take action where available.
              </SheetDescription>
            </SheetHeader>

            {selectedEntry && (
              <div className="mt-6 space-y-3">
                <div className="rounded-lg border border-border bg-muted/40 p-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Record ID</div>
                  <div className="mt-1 text-lg font-semibold text-foreground">{selectedEntry.id}</div>
                </div>
                {renderDetailRows()}
              </div>
            )}

            {selectedEntryType === 'request' && selectedEntry && (
              <SheetFooter className="mt-6 gap-3 sm:justify-start">
                <Button
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => saveRequestAction('Accepted')}
                  disabled={isSavingRequestAction || selectedEntry.status !== 'Pending'}
                >
                  Accept Request
                </Button>
                <Button
                  variant="outline"
                  className="border-border bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground"
                  onClick={() => saveRequestAction('Rejected')}
                  disabled={isSavingRequestAction || selectedEntry.status !== 'Pending'}
                >
                  Reject Request
                </Button>
              </SheetFooter>
            )}
          </SheetContent>
        </Sheet>
        </main>
      </div>
    </div>
  );
};

export default VendorPortalPage;
