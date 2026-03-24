import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, Home, ShoppingCart, Clock, Package, ShieldCheck, 
    Search, Filter, ChartBar, Download, Eye, ArrowRightLeft,
    CheckCircle2, CreditCard, Banknote, MapPin, Store, MoreHorizontal,
    TrendingUp, TrendingDown, Users, DollarSign
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
            count: filteredTransactions.length
        };
    }, [filteredTransactions]);

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-foreground font-sans selection:bg-blue-500/30">
            {/* Header */}
            <header className="sticky top-0 z-30 bg-[#111] border-b border-[#222]">
                <div className="px-6 pt-3">
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink onClick={() => navigate('/')} className="flex items-center gap-1 text-gray-500 hover:text-blue-400 cursor-pointer text-[11px] transition-colors">
                                    <Home className="w-3 h-3" /> Home
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator className="text-gray-600" />
                            <BreadcrumbItem>
                                <BreadcrumbLink onClick={() => navigate('/control-tower')} className="flex items-center gap-1 text-gray-500 hover:text-blue-400 cursor-pointer text-[11px] transition-colors">
                                    Control Tower
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator className="text-gray-600" />
                            <BreadcrumbItem>
                                <BreadcrumbPage className="text-blue-400 text-[11px] font-medium">Audit Transactions</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>
                <div className="px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-blue-600/20 rounded-lg">
                            <ArrowRightLeft className="w-6 h-6 text-blue-500" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                                Store-wide Transaction Audit <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20 ml-2">Admin</Badge>
                            </h1>
                            <div className="text-xs text-gray-400 font-mono mt-0.5 flex items-center gap-3">
                                <span className="flex items-center"><Store className="w-3 h-3 mr-1" /> All Lanes Active</span>
                                <span className="text-gray-600">|</span>
                                <span className="flex items-center"><Clock className="w-3 h-3 mr-1" /> {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" className="border-[#333] hover:bg-[#222] text-xs h-9">
                            <Download className="w-4 h-4 mr-2" /> Export CSV
                        </Button>
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-9">
                            Generate Report
                        </Button>
                    </div>
                </div>
            </header>

            <main className="p-6 space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="bg-[#111] border-[#333]">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                <DollarSign className="w-3 h-3" /> Total Daily Revenue
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-end justify-between">
                                <div className="text-2xl font-bold text-white leading-none">{formatPrice(stats.totalRevenue)}</div>
                                <div className="text-[11px] font-bold px-1.5 py-0.5 rounded bg-green-500/10 text-green-500">+8.4%</div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-[#111] border-[#333]">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                <ShoppingCart className="w-3 h-3" /> Transactions
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-end justify-between">
                                <div className="text-2xl font-bold text-white leading-none">{stats.count}</div>
                                <div className="text-[11px] font-bold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-500">+12 units</div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-[#111] border-[#333]">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                <Package className="w-3 h-3" /> Avg Basket Value
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-end justify-between">
                                <div className="text-2xl font-bold text-white leading-none">{formatPrice(stats.avgBasketSize)}</div>
                                <div className="text-[11px] font-bold px-1.5 py-0.5 rounded bg-green-500/10 text-green-500">+2.1%</div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-[#111] border-[#333]">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                <MapPin className="w-3 h-3" /> Peak Counter
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-end justify-between">
                                <div className="text-2xl font-bold text-white leading-none">{stats.busiestLane}</div>
                                <Badge variant="outline" className="text-[10px] border-blue-500/30 text-blue-400">Bottleneck Zone</Badge>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-[#111] border border-[#333] p-4 rounded-xl">
                    <div className="flex flex-1 gap-4 w-full md:w-auto">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <Input 
                                placeholder="Search Transaction ID or Customer..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 bg-[#0a0a0a] border-[#333] text-white h-10 w-full"
                            />
                        </div>
                        <Select value={selectedLane} onValueChange={setSelectedLane}>
                            <SelectTrigger className="w-[180px] bg-[#0a0a0a] border-[#333] text-white h-10">
                                <Filter className="w-3 h-3 mr-2 text-gray-500" />
                                <SelectValue placeholder="Lane All" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#111] border-[#333] text-white">
                                <SelectItem value="all">All Lanes</SelectItem>
                                <SelectItem value="Lane 01">Lane 01 (Express)</SelectItem>
                                <SelectItem value="Lane 02">Lane 02 (Express)</SelectItem>
                                <SelectItem value="Lane 03">Lane 03 (Express)</SelectItem>
                                <SelectItem value="Lane 04">Lane 04 (Regular)</SelectItem>
                                <SelectItem value="Lane 05">Lane 05 (Regular)</SelectItem>
                                <SelectItem value="Lane 06">Lane 06 (Regular)</SelectItem>
                                <SelectItem value="Lane 07">Lane 07 (Bulk)</SelectItem>
                                <SelectItem value="Lane 08">Lane 08 (Bulk)</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={selectedPayment} onValueChange={setSelectedPayment}>
                            <SelectTrigger className="w-[160px] bg-[#0a0a0a] border-[#333] text-white h-10">
                                <CreditCard className="w-3 h-3 mr-2 text-gray-500" />
                                <SelectValue placeholder="Payment Method" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#111] border-[#333] text-white">
                                <SelectItem value="all">All Methods</SelectItem>
                                <SelectItem value="UPI">UPI / Digital</SelectItem>
                                <SelectItem value="Card">Credit/Debit Card</SelectItem>
                                <SelectItem value="Cash">Cash</SelectItem>
                                <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Audit Table */}
                <Card className="bg-[#111] border-[#333] overflow-hidden">
                    <CardHeader className="border-b border-[#222]">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-lg text-white">Transaction Audit Trail</CardTitle>
                                <CardDescription className="text-xs text-gray-500 font-mono italic">Showing records with non-uniform density across counters</CardDescription>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="text-[10px] text-gray-500">Live Updates</div>
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader className="bg-[#0d0d0d]">
                                <TableRow className="border-[#222] hover:bg-transparent">
                                    <TableHead className="text-gray-500 font-bold uppercase text-[10px]">LANE ID</TableHead>
                                    <TableHead className="text-gray-500 font-bold uppercase text-[10px]">TXN ID</TableHead>
                                    <TableHead className="text-gray-500 font-bold uppercase text-[10px]">Customer / Account</TableHead>
                                    <TableHead className="text-gray-500 font-bold uppercase text-[10px]">Timestamp</TableHead>
                                    <TableHead className="text-gray-500 font-bold uppercase text-[10px]">Qty</TableHead>
                                    <TableHead className="text-gray-500 font-bold uppercase text-[10px]">Net Vol</TableHead>
                                    <TableHead className="text-gray-500 font-bold uppercase text-[10px]">Method</TableHead>
                                    <TableHead className="text-right text-gray-500 font-bold uppercase text-[10px]">Audit</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow className="border-[#222]">
                                        <TableCell colSpan={8} className="h-64 text-center text-gray-500">
                                            Decrypting and loading transaction logs...
                                        </TableCell>
                                    </TableRow>
                                ) : filteredTransactions.length === 0 ? (
                                    <TableRow className="border-[#222]">
                                        <TableCell colSpan={8} className="h-64 text-center text-gray-500">
                                            No transactions matching the audit filters.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredTransactions.map((txn, idx) => (
                                        <TableRow key={idx} className="border-[#222] hover:bg-[#1a1a1a]/50 group transition-colors">
                                            <TableCell>
                                                <Badge variant="outline" className={`text-[10px] font-bold ${
                                                    txn.lane?.includes('Express') || ['Lane 01', 'Lane 02', 'Lane 03'].includes(txn.lane)
                                                    ? 'border-orange-500/30 text-orange-400 bg-orange-500/5' 
                                                    : 'border-blue-500/30 text-blue-400 bg-blue-500/5'
                                                }`}>
                                                    {txn.lane}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="font-mono text-xs text-blue-400">{txn.id}</TableCell>
                                            <TableCell className="text-sm text-gray-300 font-medium">
                                                {txn.customer || 'Guest User'}
                                            </TableCell>
                                            <TableCell className="text-[11px] text-gray-500 font-mono">
                                                {txn.timestamp}
                                            </TableCell>
                                            <TableCell className="text-xs text-gray-400">
                                                {txn.items?.length || 0}
                                            </TableCell>
                                            <TableCell className="text-sm font-bold text-white">
                                                {formatPrice(txn.total)}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2 text-xs text-gray-400">
                                                    {txn.paymentMethod === 'Cash' ? <Banknote className="w-3 h-3" /> : <CreditCard className="w-3 h-3" />}
                                                    {txn.paymentMethod}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-600 hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
};

export default AdminTransactionsPage;
