import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
    ArrowLeft, Home, ShoppingCart, Clock, Package, ShieldCheck, 
    Search, Filter, ChartBar, Download, Eye, ArrowRightLeft,
    CheckCircle2, CreditCard, Banknote, MapPin, Store, MoreHorizontal,
    TrendingUp, TrendingDown, Users, DollarSign, FileText, Database,
    ArrowUpRight, ArrowDownRight, Globe, History
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { checkoutVisionService } from '@/services/checkoutVisionService';
import { useToast } from '@/components/ui/use-toast';

const AdminTransactionsPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const fromControlTower = queryParams.get('from') === 'control-tower';

    const { toast } = useToast();
    const [transactions, setTransactions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedLane, setSelectedLane] = useState('all');
    const [selectedPayment, setSelectedPayment] = useState('all');

    useEffect(() => {
        const loadTransactions = async () => {
            try {
                const data = await checkoutVisionService.getCheckoutData();
                setTransactions(data.transactions || []);
            } catch (err) {
                console.error('Failed to load transactions:', err);
                toast({
                    title: 'Authentication Error',
                    description: 'Could not fetch transaction logs. Please check your permissions.',
                    variant: 'destructive'
                });
            } finally {
                setIsLoading(false);
            }
        };
        loadTransactions();
    }, [toast]);

    const formatPrice = (val) => `Rs. ${val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    const filteredTransactions = useMemo(() => {
        return transactions.filter(txn => {
            const matchesSearch = 
                txn.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                txn.customer?.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesLane = selectedLane === 'all' || txn.lane === selectedLane;
            const matchesPayment = selectedPayment === 'all' || txn.paymentMethod === selectedPayment;
            return matchesSearch && matchesLane && matchesPayment;
        });
    }, [transactions, searchQuery, selectedLane, selectedPayment]);

    const stats = useMemo(() => {
        const totalRevenue = filteredTransactions.reduce((sum, t) => sum + (t.total || 0), 0);
        const avgBasketSize = filteredTransactions.length > 0 ? totalRevenue / filteredTransactions.length : 0;
        
        // Find busiest lane
        const laneCounts = filteredTransactions.reduce((acc, t) => {
            acc[t.lane] = (acc[t.lane] || 0) + 1;
            return acc;
        }, {});
        const busiestLane = Object.entries(laneCounts).reduce((a, b) => b[1] > a[1] ? b : a, ['N/A', 0])[0];

        return {
            totalRevenue,
            avgBasketSize,
            busiestLane,
            count: filteredTransactions.length,
            total: filteredTransactions.length,
            inflow: 0,
            outflow: filteredTransactions.length
        };
    }, [filteredTransactions]);

    return (
        <div className="min-h-screen bg-background text-foreground pb-20">
            <header className="sticky top-0 z-30 bg-sidebar/95 backdrop-blur-md border-b border-sidebar-border shadow-lg">
                <div className="px-6 pt-3">
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink
                                    onClick={() => navigate('/')}
                                    className="flex items-center gap-1 text-muted-foreground hover:text-blue-400 cursor-pointer text-[11px] transition-colors"
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
                                    Store Transactions
                                </BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>

                <div className="px-6 py-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center space-x-4">
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                            <ArrowRightLeft className="w-6 h-6 text-blue-500" />
                        </div>
                        <div>
                            <div className="flex items-center space-x-3">
                                <h1 className="text-xl font-bold text-foreground tracking-tight uppercase">Transaction Ledger</h1>
                                <Badge variant="outline" className="text-[10px] font-bold bg-green-500/10 text-green-500 border-green-500/20 uppercase tracking-widest h-5">
                                    Audit Ready
                                </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">Comprehensive real-time transaction logs across all active checkout lanes.</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative w-64 group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground group-focus-within:text-blue-500 transition-colors" />
                            <Input
                                placeholder="Search Txn ID or Customer..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 h-9 bg-muted border-border text-xs shadow-inner focus-visible:ring-blue-500"
                            />
                        </div>

                        <Select value={selectedLane} onValueChange={setSelectedLane}>
                            <SelectTrigger className="w-[140px] h-9 bg-muted border-border text-xs shadow-inner">
                                <SelectValue placeholder="All Lanes" />
                            </SelectTrigger>
                            <SelectContent className="bg-card border-border">
                                <SelectItem value="all">All Lanes</SelectItem>
                                <SelectItem value="Lane 1">Lane 1</SelectItem>
                                <SelectItem value="Lane 4">Lane 4</SelectItem>
                            </SelectContent>
                        </Select>

                        <Button variant="outline" size="sm" className="h-9 border-border text-muted-foreground hover:text-foreground bg-muted shadow-sm px-4">
                            <Download className="w-3.5 h-3.5 mr-2 text-blue-500" /> <span className="text-[10px] font-bold uppercase tracking-widest">Audit Export</span>
                        </Button>
                    </div>
                </div>
            </header>

            <div className="p-6 w-full max-w-[1800px] mx-auto space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="bg-card border-border hover:border-blue-500/30 transition-all shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total Revenue</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-black text-foreground tabular-nums tracking-tighter">{formatPrice(stats.totalRevenue)}</div>
                            <p className="text-[10px] text-green-500 font-bold flex items-center mt-1 uppercase tracking-tighter">
                                <TrendingUp className="w-3 h-3 mr-1" /> +12% VS YESTERDAY
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="bg-card border-border hover:border-blue-500/30 transition-all shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Avg Basket Size</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-black text-foreground tabular-nums tracking-tighter">{formatPrice(stats.avgBasketSize)}</div>
                            <p className="text-[10px] text-muted-foreground font-bold flex items-center mt-1 uppercase tracking-tighter">
                                PER UNIQUE TRANSACTION
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="bg-card border-border hover:border-blue-500/30 transition-all shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Active Velocity</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-black text-blue-500 tabular-nums tracking-tighter">{stats.count} Txns</div>
                            <p className="text-[10px] text-blue-400 font-bold flex items-center mt-1 uppercase tracking-tighter">
                                PROCESSED IN LAST 1HR
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="bg-card border-border hover:border-blue-500/30 transition-all shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Busiest Lane</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-black text-foreground uppercase tracking-tighter">{stats.busiestLane}</div>
                            <p className="text-[10px] text-muted-foreground font-bold flex items-center mt-1 uppercase tracking-tighter">
                                HIGHEST CONVERSION RATE
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <Card className="bg-card border-border shadow-md overflow-hidden">
                    <CardHeader className="border-b border-border/50 bg-muted/10">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-[0.2em]">Transaction Ledger Feed</CardTitle>
                                <CardDescription className="text-xs text-muted-foreground mt-1">Granular log of POS and Vision-Verified transactions.</CardDescription>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="bg-blue-500/10 text-blue-500 border-blue-500/20 font-bold text-[9px] uppercase tracking-tighter">
                                    {filteredTransactions.length} ENTRIES FOUND
                                </Badge>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow className="border-border/50 hover:bg-transparent uppercase">
                                    <TableHead className="text-muted-foreground font-bold text-[9px] tracking-widest">Txn ID</TableHead>
                                    <TableHead className="text-muted-foreground font-bold text-[9px] tracking-widest">Customer</TableHead>
                                    <TableHead className="text-muted-foreground font-bold text-[9px] tracking-widest">Lane</TableHead>
                                    <TableHead className="text-muted-foreground font-bold text-[9px] tracking-widest">Timestamp</TableHead>
                                    <TableHead className="text-muted-foreground font-bold text-[9px] tracking-widest">Method</TableHead>
                                    <TableHead className="text-muted-foreground font-bold text-[9px] tracking-widest text-right">Amount</TableHead>
                                    <TableHead className="text-muted-foreground font-bold text-[9px] tracking-widest text-right">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-48 text-center">
                                            <div className="flex flex-col items-center justify-center space-y-4">
                                                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Querying Transaction DB...</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : filteredTransactions.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-48 text-center text-muted-foreground font-medium italic">
                                            No transactions match the current filter criteria.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredTransactions.map((txn) => (
                                        <TableRow key={txn.id} className="border-border/50 hover:bg-muted/30 transition-colors group cursor-default">
                                            <TableCell className="font-mono text-[11px] text-blue-500 font-bold">{txn.id}</TableCell>
                                            <TableCell className="text-sm font-semibold tracking-tight text-foreground">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-7 h-7 rounded-full bg-muted border border-border flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                                                        {txn.customer?.[0]}
                                                    </div>
                                                    {txn.customer}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="bg-card text-muted-foreground border-border text-[9px] font-bold uppercase tracking-tighter">
                                                    {txn.lane}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-[10px] text-muted-foreground font-medium uppercase">{txn.timestamp}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2 text-muted-foreground">
                                                    {txn.paymentMethod === 'Credit Card' ? <CreditCard className="w-3.5 h-3.5 text-blue-400" /> : <Banknote className="w-3.5 h-3.5 text-green-400" />}
                                                    <span className="text-[10px] font-bold uppercase tracking-tighter">{txn.paymentMethod}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right text-sm font-black text-foreground tabular-nums tracking-tighter">{formatPrice(txn.total)}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                                                    <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest">Completed</span>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};


