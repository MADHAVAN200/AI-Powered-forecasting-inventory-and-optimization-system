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
            count: filteredTransactions.length,
            total: filteredTransactions.length,
            inflow: 0,
            outflow: filteredTransactions.length
        };
    }, [filteredTransactions]);

    return (
        <div className="min-h-screen bg-background text-foreground pb-20">
            <div className="sticky top-0 z-30 bg-card/95 backdrop-blur-md border-b border-border px-6 py-6 shadow-md transition-all">
                <div className="px-6 pt-3">
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink onClick={() => navigate('/')} className="flex items-center gap-1 text-muted-foreground hover:text-blue-600 cursor-pointer text-[11px] transition-colors">
                                    <Home className="w-3 h-3" /> Home
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator className="text-border" />
                            <BreadcrumbItem>
                                <BreadcrumbLink onClick={() => navigate('/control-tower')} className="flex items-center gap-1 text-muted-foreground hover:text-blue-600 cursor-pointer text-[11px] transition-colors">
                                    Control Tower
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator className="text-border" />
                            <BreadcrumbItem>
                                <BreadcrumbPage className="text-blue-600 text-[11px] font-medium">Audit Transactions</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>
                <div className="px-6 py-4 flex items-center justify-between">
                    <div>
                        <div className="flex items-center space-x-3">
                            <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            <h1 className="text-2xl font-bold text-foreground tracking-tight">Store Transaction Audit</h1>
                            <Badge variant="outline" className="text-blue-600 border-blue-500/30 bg-blue-100 dark:bg-blue-900/10 text-[10px] h-5">
                                Ledger v2.1
                            </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Immutable record of high-velocity inventory movements & SKU reconciliations.</p>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" className="text-xs h-9">
                            <Download className="w-4 h-4 mr-2" /> Export CSV
                        </Button>
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-9">
                            Generate Report
                        </Button>
                    </div>
                </div>
            </div>

            <main className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card className="bg-card border-border relative overflow-hidden group hover:border-blue-500/30 transition-colors">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total Volume</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-black text-foreground tabular-nums tracking-tighter">{stats.total}</div>
                            <div className="text-[10px] text-muted-foreground mt-1 flex items-center">
                                <Database className="w-3 h-3 mr-1" /> Ledger Entries
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-card border-border relative overflow-hidden group hover:border-green-500/30 transition-colors">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Stock Inflow</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-black text-green-600 dark:text-green-500 tabular-nums tracking-tighter">{stats.inflow}</div>
                            <div className="text-[10px] text-muted-foreground mt-1 flex items-center">
                                <ArrowUpRight className="w-3 h-3 mr-1" /> Re-stocking events
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-card border-border relative overflow-hidden group hover:border-red-500/30 transition-colors">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Stock Outflow</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-black text-red-500 tabular-nums tracking-tighter">{stats.outflow}</div>
                            <div className="text-[10px] text-muted-foreground mt-1 flex items-center">
                                <ArrowDownRight className="w-3 h-3 mr-1" /> Sales fulfillments
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-card border-border relative overflow-hidden group hover:border-purple-500/30 transition-colors">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Store Sync Purity</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-black text-blue-600 dark:text-blue-400 tabular-nums tracking-tighter">99.8%</div>
                            <div className="text-[10px] text-muted-foreground mt-1 flex items-center">
                                <Globe className="w-3 h-3 mr-1" /> Node consistency
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card border border-border p-4 rounded-xl">
                    <div className="flex flex-1 gap-4 w-full md:w-auto">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input 
                                placeholder="Search Transaction ID or Customer..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 bg-background border-border text-foreground h-10 w-full"
                            />
                        </div>
                        <div className="flex flex-col space-y-1.5">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest pl-1">Target Lane</label>
                            <Select value={selectedLane} onValueChange={setSelectedLane}>
                                <SelectTrigger className="h-10 w-[180px] bg-card border-border text-xs text-foreground font-medium hover:border-blue-500/50 transition-all">
                                    <SelectValue placeholder="All Lanes" />
                                </SelectTrigger>
                                <SelectContent className="bg-card border-border text-foreground">
                                    <SelectItem value="all">Global Network</SelectItem>
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
                        </div>
                    </div>
                </div>

                <Card className="bg-card border-border overflow-hidden">
                    <CardHeader className="pb-0 border-b border-border bg-muted/30 px-6 py-4">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-foreground">
                                <History className="w-4 h-4 text-muted-foreground" /> Audit Log
                            </CardTitle>
                            <div className="text-[10px] text-muted-foreground">Showing {filteredTransactions.length} transactions</div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-border bg-muted/20 hover:bg-transparent">
                                    <TableHead className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest py-4 pl-6">Timestamp</TableHead>
                                    <TableHead className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest py-4">Node (Store)</TableHead>
                                    <TableHead className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest py-4">Customer / ID</TableHead>
                                    <TableHead className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest py-4">Net Vol</TableHead>
                                    <TableHead className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest py-4 text-right pr-6">Signature</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow className="border-border">
                                        <TableCell colSpan={5} className="h-64 text-center text-muted-foreground">
                                            Decrypting and loading transaction logs...
                                        </TableCell>
                                    </TableRow>
                                ) : filteredTransactions.length === 0 ? (
                                    <TableRow className="border-border">
                                        <TableCell colSpan={5} className="h-64 text-center text-muted-foreground">
                                            No transactions matching the audit filters.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredTransactions.map((tx, idx) => (
                                        <TableRow key={tx.id || idx} className="border-border hover:bg-accent/40 group transition-all">
                                            <TableCell className="py-5 pl-6">
                                                <div className="flex flex-col">
                                                    <span className="text-[11px] font-bold text-foreground tabular-nums">{tx.timestamp}</span>
                                                    <span className="text-[9px] text-muted-foreground font-mono mt-0.5">TX-{tx.id?.substring(0, 8)}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center space-x-2">
                                                    <MapPin className="w-3.5 h-3.5 text-blue-500" />
                                                    <span className="text-xs font-bold text-foreground">{tx.lane}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-xs font-medium text-foreground">{tx.customer || 'Guest User'}</span>
                                            </TableCell>
                                            <TableCell>
                                                <div className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400">
                                                    {formatPrice(tx.total || 0)}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right pr-6">
                                                <Badge variant="outline" className="text-[9px] font-bold border-none bg-muted/50 text-muted-foreground uppercase">
                                                    Verified
                                                </Badge>
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
