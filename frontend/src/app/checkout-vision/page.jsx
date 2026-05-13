"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
    Activity, AlertTriangle, ArrowRightLeft, Camera, Eye, Image as ImageIcon,
    LayoutDashboard, Loader2, LogOut, MapPin, Package,
    ScanSearch, Store, Upload, User, Zap, Clock, ShoppingCart, 
    CreditCard, Banknote, Smartphone, Receipt, Trash2, CheckCircle2,
    ShieldCheck, ArrowRight
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { checkoutVisionService } from '@/services/checkoutVisionService';
import Sidebar from '@/components/Sidebar';
import ThemeToggle from '@/components/ThemeToggle';
import { toast } from '@/hooks/use-toast';

const DEFAULT_SAMPLE_IMAGE = '/checkout-vision/multiproduct.png';

function formatPercent(value) {
    return `${(Number(value || 0) * 100).toFixed(2)}%`;
}

export default function CheckoutVisionPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { role } = useAuth();
    const queryParams = new URLSearchParams(location.search);
    const fromControlTower = queryParams.get('from') === 'control-tower';
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [result, setResult] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [checkoutKpis, setCheckoutKpis] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [pendingBill, setPendingBill] = useState([]);

    const TAX_RATE = 0.18; // 18% Total Tax (SGST 9% + CGST 9%)

    const getDummyPrice = (label) => {
        if (!label) return 0;
        let hash = 0;
        for (let i = 0; i < label.length; i++) {
            hash = label.charCodeAt(i) + ((hash << 5) - hash);
        }
        return ((Math.abs(hash) % 40) + 15);
    };

    const formatPrice = (val) => `Rs. ${val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    const { subtotal, tax, total } = useMemo(() => {
        const sub = pendingBill.reduce((sum, item) => sum + (item.price * item.qty), 0);
        const t = sub * TAX_RATE;
        const tot = sub + t;
        return { subtotal: sub, tax: t, total: tot };
    }, [pendingBill]);

    useEffect(() => {
        let isMounted = true;
        async function loadData() {
            try {
                const data = await checkoutVisionService.getCheckoutData();
                if (!isMounted) return;
                setCheckoutKpis(data.kpis || []);
                setTransactions(data.transactions || []);
            } catch (err) {
                console.error('Failed to fetch checkout data:', err);
            } finally {
                if (isMounted) setIsLoadingData(false);
            }
        }
        loadData();

        // Cleanup function when user leaves the module
        return () => {
            isMounted = false;
            // Reset checkout state
            setSelectedFile(null);
            setPreviewUrl(null);
            setResult(null);
            setPendingBill([]);
            setError('');
        };
    }, []);

    const handleAnalyze = async (fileToAnalyze = selectedFile) => {
        if (!fileToAnalyze) {
            setError('Select an image before running checkout vision.');
            return;
        }

        setIsAnalyzing(true);
        setError('');

        try {
            const data = await checkoutVisionService.analyzeImage(fileToAnalyze);
            setResult(data);
            
            // Map detections to pending bill items
            if (data.item_counts) {
                const items = data.item_counts.map(([label, count]) => ({
                    name: label,
                    qty: count,
                    price: getDummyPrice(label)
                }));
                setPendingBill(items);
            }
            
            toast({
                title: 'Scan Successful',
                description: `Detected ${data.detections?.length || 0} items. Bill populated.`
            });
        } catch (err) {
            setError(err.message || 'Checkout vision analysis failed.');
            toast({
                title: 'Analysis Failed',
                description: err.message,
                variant: 'destructive'
            });
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleCompleteCheckout = async (paymentMethod = 'Credit Card') => {
        if (pendingBill.length === 0) return;

        setIsSaving(true);
        const transaction = {
            id: `TXN-${Date.now()}`,
            customer: `Guest #${Math.floor(Math.random() * 9000) + 1000}`,
            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
            items: pendingBill,
            subtotal,
            tax,
            total,
            paymentMethod,
            status: 'Completed'
        };

        try {
            await checkoutVisionService.saveTransaction(transaction);
            setTransactions(prev => [transaction, ...prev]);
            setPendingBill([]);
            setResult(null);
            
            // Re-fetch KPIs to update total sales (simulated refresh)
            const data = await checkoutVisionService.getCheckoutData();
            setCheckoutKpis(data.kpis || []);

            toast({
                title: 'Transaction Successful',
                description: `Bill ${transaction.id} has been saved and printed.`,
            });
        } catch (err) {
            toast({
                title: 'Checkout Failed',
                description: err.message,
                variant: 'destructive'
            });
        } finally {
            setIsSaving(false);
        }
    };

    const removeItem = (index) => {
        setPendingBill(prev => prev.filter((_, i) => i !== index));
    };

    const handleFileChange = (event) => {
        const file = event.target.files?.[0];
        if (previewUrl && previewUrl.startsWith('blob:')) {
            URL.revokeObjectURL(previewUrl);
        }
        setSelectedFile(file || null);
        setResult(null);
        setPendingBill([]);
        setError('');
        
        if (file) {
            setPreviewUrl(URL.createObjectURL(file));
        } else {
            setPreviewUrl(null);
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground font-sans selection:bg-blue-500/30 pb-20">
            {/* Header */}
            <header className="sticky top-0 z-30 bg-sidebar/95 backdrop-blur-md border-b border-sidebar-border h-16 flex items-center shadow-sm">
                <div className="px-6 flex items-center justify-between w-full">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-purple-600/10 rounded-lg border border-purple-500/20">
                            <ShoppingCart className="w-5 h-5 text-purple-500" />
                        </div>
                        <div>
                            <div className="flex items-center space-x-3">
                                <h1 className="text-lg font-bold text-foreground tracking-tight">Smart Billing</h1>
                                <Badge variant="outline" className="text-[10px] bg-green-500/10 text-green-500 border-green-500/20 font-bold uppercase tracking-widest h-5">Live</Badge>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex items-center gap-3 text-[10px] text-muted-foreground font-bold uppercase tracking-wider mr-2">
                             <span className="flex items-center"><Store className="w-3 h-3 mr-1.5 text-blue-500" /> Lane 04</span>
                             <span className="w-1 h-1 rounded-full bg-border" />
                             <span className="flex items-center"><Clock className="w-3 h-3 mr-1.5 text-blue-500" /> {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <ThemeToggle />
                    </div>
                </div>
            </header>

            <main className="flex-1 p-6 space-y-8 overflow-y-auto">
                <div className="flex w-full flex-col gap-6">
                    {/* KPI Snapshot */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {checkoutKpis.map((kpi, idx) => (
                            <Card key={idx} className="bg-card border-border hover:border-blue-500/30 transition-all duration-300 shadow-sm">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                        {kpi.icon === 'ShoppingCart' && <ShoppingCart className="w-3 h-3 text-blue-500" />}
                                        {kpi.icon === 'Clock' && <Clock className="w-3 h-3 text-blue-500" />}
                                        {kpi.icon === 'Package' && <Package className="w-3 h-3 text-blue-500" />}
                                        {kpi.icon === 'ShieldCheck' && <ShieldCheck className="w-3 h-3 text-blue-500" />}
                                        {kpi.label}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-end justify-between">
                                        <div className="text-2xl font-bold text-foreground leading-none tabular-nums">{kpi.value}</div>
                                        <div className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-tighter ${kpi.status === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-blue-500/10 text-blue-500'}`}>
                                            {kpi.trend}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* POS Main Area */}
                    <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                        {/* Left: Scan & Vision */}
                        <div className="space-y-6">
                            <Card className="bg-card border-border overflow-hidden relative shadow-md">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 blur-3xl pointer-events-none"></div>
                                <CardHeader className="border-b border-border/50 bg-muted/20">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="text-lg text-foreground flex items-center gap-2">
                                                <Camera className="w-4 h-4 text-blue-500" /> AI Lane Scanner
                                            </CardTitle>
                                            <CardDescription className="text-xs text-muted-foreground">Capture or upload checkout image for auto-billing</CardDescription>
                                        </div>
                                        <Badge variant="outline" className="text-[9px] border-border text-muted-foreground uppercase tracking-widest font-bold">
                                            v2.4 Multimodal
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="flex flex-col gap-5">
                                        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 items-center">
                                            <Input
                                                id="checkout-image"
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFileChange}
                                                className="h-10 p-0 border-border bg-background text-foreground file:mr-4 file:rounded-md file:border-0 file:bg-muted file:px-4 file:h-full file:text-sm file:font-medium file:text-foreground hover:file:bg-border cursor-pointer shadow-inner"
                                            />
                                            <Button
                                                onClick={() => handleAnalyze()}
                                                disabled={isAnalyzing || !selectedFile}
                                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-10 h-10 shadow-lg shadow-blue-600/20 transition-all"
                                            >
                                                {isAnalyzing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Scanning...</> : <><ScanSearch className="mr-2 h-4 w-4" /> Scan & Bill</>}
                                            </Button>
                                        </div>

                                        <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-border bg-background flex items-center justify-center group shadow-inner">
                                            {result?.annotated_base64 ? (
                                                <img src={result.annotated_base64} alt="Annotated" className="w-full h-full object-contain" />
                                            ) : previewUrl ? (
                                                <img src={previewUrl} alt="Preview" className="w-full h-full object-contain opacity-50" />
                                            ) : (
                                                <div className="flex flex-col items-center gap-4 text-muted-foreground text-center">
                                                    <ImageIcon className="w-12 h-12 opacity-10" />
                                                    <p className="text-sm font-medium opacity-60">Initialize scanner to begin visual verification</p>
                                                </div>
                                            )}
                                            {isAnalyzing && (
                                                <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center z-20">
                                                    <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
                                                    <div className="text-blue-500 font-mono text-xs font-bold animate-pulse tracking-[0.2em]">RUNNING AI INFERENCE...</div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Detection Logic / Evidence */}
                            {result?.detections && (
                                <Card className="bg-card border-border shadow-sm">
                                    <CardHeader className="border-b border-border/50 py-3 bg-muted/10">
                                        <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Visual Signal Verification</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-4">
                                        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                                            {result.detections.slice(0, 6).map((det, idx) => (
                                                <div key={idx} className="flex-shrink-0 w-24 space-y-2">
                                                    <div className="aspect-square rounded-lg border border-border bg-muted/30 p-1 flex items-center justify-center overflow-hidden shadow-inner">
                                                        <img src={det.crop_base64} alt="Crop" className="w-full h-full object-contain" />
                                                    </div>
                                                    <div className="text-[9px] text-muted-foreground truncate font-bold text-center uppercase tracking-tighter">{det.prediction?.label}</div>
                                                </div>
                                            ))}
                                            {result.detections.length > 6 && (
                                                <div className="flex-shrink-0 w-24 aspect-square rounded-lg border border-dashed border-border flex items-center justify-center text-[10px] text-muted-foreground font-bold bg-muted/10 uppercase">
                                                    +{result.detections.length - 6} more
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>

                        {/* Right: Billing Receipt */}
                        <div className="space-y-6">
                            <Card className="bg-card border-border flex flex-col h-full border-t-2 border-t-blue-600 shadow-lg">
                                <CardHeader className="border-b border-border/50 bg-muted/30">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-lg text-foreground flex items-center gap-2">
                                            <Receipt className="w-4 h-4 text-blue-500" /> Current Session Bill
                                        </CardTitle>
                                        <Button variant="ghost" size="sm" onClick={() => setPendingBill([])} className="text-muted-foreground hover:text-red-500 h-8 font-bold text-[10px] uppercase tracking-widest">
                                            Clear
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-1 p-0 overflow-hidden flex flex-col min-h-[500px]">
                                    <div className="flex-1 overflow-y-auto p-5 space-y-5">
                                        {pendingBill.length > 0 ? (
                                            pendingBill.map((item, idx) => (
                                                <div key={idx} className="flex items-center justify-between group">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-8 h-8 rounded-lg bg-muted border border-border flex items-center justify-center text-[10px] font-black text-blue-500 shadow-sm">
                                                            {item.qty}x
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-bold text-foreground tracking-tight">{item.name}</div>
                                                            <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter mt-0.5">Unit: {formatPrice(item.price)}</div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-5">
                                                        <div className="text-sm font-bold text-foreground tabular-nums tracking-tighter">{formatPrice(item.price * item.qty)}</div>
                                                        <button onClick={() => removeItem(idx)} className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-red-500">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
                                                <div className="p-4 rounded-full bg-muted/50 border border-border">
                                                    <ShoppingCart className="w-10 h-10 text-muted-foreground opacity-20" />
                                                </div>
                                                <p className="text-sm text-muted-foreground font-medium opacity-60">Queue empty. Waiting for <br />visual verification scan.</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Bill Footer */}
                                    <div className="bg-muted/40 border-t border-border p-6 space-y-4">
                                        <div className="space-y-3">
                                            <div className="flex justify-between text-[11px] text-muted-foreground font-bold uppercase tracking-wider">
                                                <span>Subtotal</span>
                                                <span className="tabular-nums">{formatPrice(subtotal)}</span>
                                            </div>
                                            <div className="flex justify-between text-[10px] text-muted-foreground italic font-medium opacity-70">
                                                <span>Consolidated Tax (GST 18%)</span>
                                                <span className="tabular-nums">{formatPrice(tax)}</span>
                                            </div>
                                            <div className="flex justify-between text-xl font-black text-foreground pt-4 border-t border-border">
                                                <span className="tracking-tighter">TOTAL AMOUNT</span>
                                                <span className="text-green-500 tabular-nums tracking-tighter">{formatPrice(total)}</span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 pt-4">
                                            <Button 
                                                variant="outline" 
                                                className="border-border bg-background text-muted-foreground hover:bg-muted h-12 font-bold uppercase text-[10px] tracking-widest shadow-sm"
                                                onClick={() => handleCompleteCheckout('Cash')}
                                                disabled={pendingBill.length === 0 || isSaving}
                                            >
                                                <Banknote className="mr-2 h-4 w-4" /> Cash
                                            </Button>
                                            <Button 
                                                className="bg-blue-600 hover:bg-blue-700 text-white font-black h-12 uppercase text-[10px] tracking-widest shadow-lg shadow-blue-600/20"
                                                onClick={() => handleCompleteCheckout('Credit Card')}
                                                disabled={pendingBill.length === 0 || isSaving}
                                            >
                                                {isSaving ? <Loader2 className="animate-spin h-5 w-5" /> : <><CreditCard className="mr-2 h-4 w-4" /> Card/UPI Pay</>}
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Transaction History Section */}
                    <Card className="bg-card border-border shadow-md">
                        <CardHeader className="border-b border-border/50 flex flex-row items-center justify-between bg-muted/10">
                            <div>
                                <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-[0.2em]">Live Transaction Ledger</CardTitle>
                                <CardDescription className="text-xs text-muted-foreground mt-1">Historical billing activity for Lane 04 verification.</CardDescription>
                            </div>
                            <Button variant="outline" className="border-border text-[9px] h-7 font-bold uppercase tracking-widest px-4 hover:bg-muted">View Full Archive</Button>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader className="bg-muted/50">
                                    <TableRow className="border-border/50 hover:bg-transparent">
                                        <TableHead className="text-muted-foreground font-bold uppercase text-[9px] tracking-widest">Transaction ID</TableHead>
                                        <TableHead className="text-muted-foreground font-bold uppercase text-[9px] tracking-widest">Customer</TableHead>
                                        <TableHead className="text-muted-foreground font-bold uppercase text-[9px] tracking-widest">Timestamp</TableHead>
                                        <TableHead className="text-muted-foreground font-bold uppercase text-[9px] tracking-widest">Units</TableHead>
                                        <TableHead className="text-muted-foreground font-bold uppercase text-[9px] tracking-widest text-right">Total (Incl. Tax)</TableHead>
                                        <TableHead className="text-muted-foreground font-bold uppercase text-[9px] tracking-widest">Method</TableHead>
                                        <TableHead className="text-muted-foreground font-bold uppercase text-[9px] tracking-widest text-right">Verification</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {transactions.map((txn, idx) => (
                                        <TableRow key={idx} className="border-border/50 hover:bg-muted/30 transition-colors">
                                            <TableCell className="font-mono text-[11px] text-blue-500 font-bold">{txn.id}</TableCell>
                                            <TableCell className="text-sm text-foreground font-semibold tracking-tight">{txn.customer}</TableCell>
                                            <TableCell className="text-[10px] text-muted-foreground font-medium">{txn.timestamp}</TableCell>
                                            <TableCell className="text-[11px] text-muted-foreground font-bold uppercase tracking-tighter">
                                                {txn.items.length} SKUs
                                            </TableCell>
                                            <TableCell className="text-sm font-black text-foreground tabular-nums text-right tracking-tighter">{formatPrice(txn.total)}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="text-[9px] font-bold border-border text-muted-foreground uppercase bg-muted/20 tracking-tighter">
                                                    {txn.paymentMethod}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-1.5 text-[10px] text-green-500 font-bold uppercase tracking-widest">
                                                    <CheckCircle2 className="w-3.5 h-3.5" /> {txn.status}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
