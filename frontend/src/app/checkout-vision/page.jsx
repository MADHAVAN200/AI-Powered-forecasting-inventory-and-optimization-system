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
import {
    Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink,
    BreadcrumbPage, BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import { Home } from 'lucide-react';
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
        <div className="min-h-screen bg-[#0a0a0a] text-foreground font-sans selection:bg-blue-500/30 pb-20">
            {/* Header */}
            <header className="sticky top-0 z-30 bg-[#111] border-b border-[#222]">
                <div className="px-6 pt-3">
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink onClick={() => navigate(role === 'vendor' ? '/vendor' : '/dashboard')} className="flex items-center gap-1 text-gray-500 hover:text-blue-400 cursor-pointer text-[11px] transition-colors">
                                    <Home className="w-3 h-3" /> {role === 'vendor' ? 'Vendor Portal' : 'Home'}
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            {fromControlTower && (
                                <>
                                    <BreadcrumbSeparator className="text-gray-600" />
                                    <BreadcrumbItem>
                                        <BreadcrumbLink onClick={() => navigate('/control-tower')} className="flex items-center gap-1 text-gray-500 hover:text-blue-400 cursor-pointer text-[11px] transition-colors">
                                            Control Tower
                                        </BreadcrumbLink>
                                    </BreadcrumbItem>
                                </>
                            )}
                            <BreadcrumbSeparator className="text-gray-600" />
                            <BreadcrumbItem>
                                <BreadcrumbPage className="text-blue-400 text-[11px] font-medium">Smart Billing</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>
                <div className="px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-purple-600/20 rounded-lg">
                            <ShoppingCart className="w-6 h-6 text-purple-500" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                                Smart Billing System <Badge className="bg-green-500/10 text-green-500 border-green-500/20 ml-2">Live</Badge>
                            </h1>
                            <div className="text-xs text-gray-400 font-mono mt-0.5 flex items-center gap-3">
                                <span className="flex items-center"><Store className="w-3 h-3 mr-1" /> Lane 04 - Store #402</span>
                                <span className="text-gray-600">|</span>
                                <span className="flex items-center"><Clock className="w-3 h-3 mr-1" /> {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-1 p-6 space-y-8 overflow-y-auto">
                <div className="flex w-full flex-col gap-6">
                    {/* KPI Snapshot */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {checkoutKpis.map((kpi, idx) => (
                            <Card key={idx} className="bg-[#111] border-[#333] hover:border-blue-500/30 transition-all duration-300">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                        {kpi.icon === 'ShoppingCart' && <ShoppingCart className="w-3 h-3" />}
                                        {kpi.icon === 'Clock' && <Clock className="w-3 h-3" />}
                                        {kpi.icon === 'Package' && <Package className="w-3 h-3" />}
                                        {kpi.icon === 'ShieldCheck' && <ShieldCheck className="w-3 h-3" />}
                                        {kpi.label}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-end justify-between">
                                        <div className="text-2xl font-bold text-white leading-none">{kpi.value}</div>
                                        <div className={`text-[11px] font-bold px-1.5 py-0.5 rounded ${kpi.status === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-blue-500/10 text-blue-500'}`}>
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
                            <Card className="bg-[#111] border-[#333] overflow-hidden relative">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 blur-3xl pointer-events-none"></div>
                                <CardHeader className="border-b border-[#222]">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="text-lg text-white flex items-center gap-2">
                                                <Camera className="w-4 h-4 text-blue-400" /> AI Lane Scanner
                                            </CardTitle>
                                            <CardDescription className="text-xs text-gray-500">Capture or upload checkout image for auto-billing</CardDescription>
                                        </div>
                                        <Badge variant="outline" className="text-[10px] border-[#333] text-gray-400 uppercase tracking-tighter">
                                            v2.4 Multimodal
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="flex flex-col gap-4">
                                        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 items-center">
                                            <Input
                                                id="checkout-image"
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFileChange}
                                                className="h-10 p-0 border-[#333] bg-[#0a0a0a] text-white file:mr-4 file:rounded-md file:border-0 file:bg-[#222] file:px-4 file:h-full file:text-sm file:font-medium file:text-white hover:file:bg-[#333] cursor-pointer"
                                            />
                                            <Button
                                                onClick={() => handleAnalyze()}
                                                disabled={isAnalyzing || !selectedFile}
                                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 h-10 shadow-lg shadow-blue-600/20"
                                            >
                                                {isAnalyzing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Scanning...</> : <><ScanSearch className="mr-2 h-4 w-4" /> Scan & Bill</>}
                                            </Button>
                                        </div>

                                        <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-[#222] bg-[#0a0a0a] flex items-center justify-center group">
                                            {result?.annotated_base64 ? (
                                                <img src={result.annotated_base64} alt="Annotated" className="w-full h-full object-contain" />
                                            ) : previewUrl ? (
                                                <img src={previewUrl} alt="Preview" className="w-full h-full object-contain opacity-50" />
                                            ) : (
                                                <div className="flex flex-col items-center gap-3 text-gray-600 text-center">
                                                    <ImageIcon className="w-12 h-12 opacity-20" />
                                                    <p className="text-sm">Select the image or click the photos</p>
                                                </div>
                                            )}
                                            {isAnalyzing && (
                                                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center z-20">
                                                    <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
                                                    <div className="text-blue-400 font-mono text-sm animate-pulse">RUNNING AI INFERENCE...</div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Detection Logic / Evidence */}
                            {result?.detections && (
                                <Card className="bg-[#111] border-[#333]">
                                    <CardHeader className="border-b border-[#222] py-3">
                                        <CardTitle className="text-sm font-bold text-gray-400 uppercase tracking-widest">Visual Evidence</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-4">
                                        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                                            {result.detections.slice(0, 6).map((det, idx) => (
                                                <div key={idx} className="flex-shrink-0 w-24 space-y-2">
                                                    <div className="aspect-square rounded-lg border border-[#333] bg-[#0a0a0a] p-1 flex items-center justify-center overflow-hidden">
                                                        <img src={det.crop_base64} alt="Crop" className="w-full h-full object-contain" />
                                                    </div>
                                                    <div className="text-[10px] text-gray-500 truncate font-medium text-center">{det.prediction?.label}</div>
                                                </div>
                                            ))}
                                            {result.detections.length > 6 && (
                                                <div className="flex-shrink-0 w-24 aspect-square rounded-lg border border-dashed border-[#333] flex items-center justify-center text-xs text-gray-500">
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
                            <Card className="bg-[#111] border-[#333] flex flex-col h-full border-t-2 border-t-blue-600">
                                <CardHeader className="border-b border-[#222] bg-[#0d0d0d]">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-lg text-white flex items-center gap-2">
                                            <Receipt className="w-4 h-4 text-blue-400" /> Current Bill
                                        </CardTitle>
                                        <Button variant="ghost" size="sm" onClick={() => setPendingBill([])} className="text-gray-500 hover:text-red-400 h-8">
                                            Clear
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-1 p-0 overflow-hidden flex flex-col min-h-[500px]">
                                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                        {pendingBill.length > 0 ? (
                                            pendingBill.map((item, idx) => (
                                                <div key={idx} className="flex items-center justify-between group">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded bg-[#1a1a1a] flex items-center justify-center text-[10px] font-bold text-blue-400">
                                                            {item.qty}x
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-medium text-white">{item.name}</div>
                                                            <div className="text-[10px] text-gray-500">@ {formatPrice(item.price)} each</div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <div className="text-sm font-bold text-white">{formatPrice(item.price * item.qty)}</div>
                                                        <button onClick={() => removeItem(idx)} className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-600 hover:text-red-400">
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3">
                                                <ShoppingCart className="w-12 h-12 text-gray-700 opacity-10" />
                                                <p className="text-sm text-gray-500">No items detected.<br />Run a scan to start billing.</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Bill Footer */}
                                    <div className="bg-[#0d0d0d] border-t border-[#222] p-6 space-y-4">
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-xs text-gray-400">
                                                <span>Subtotal</span>
                                                <span>{formatPrice(subtotal)}</span>
                                            </div>
                                            <div className="flex justify-between text-xs text-gray-400 italic">
                                                <span>GST (SGST 9% + CGST 9%)</span>
                                                <span>{formatPrice(tax)}</span>
                                            </div>
                                            <div className="flex justify-between text-lg font-bold text-white pt-2 border-t border-[#333]">
                                                <span>Grand Total</span>
                                                <span className="text-green-400">{formatPrice(total)}</span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 pt-4">
                                            <Button 
                                                variant="outline" 
                                                className="border-[#333] bg-transparent text-gray-300 hover:bg-[#1a1a1a] h-12"
                                                onClick={() => handleCompleteCheckout('Cash')}
                                                disabled={pendingBill.length === 0 || isSaving}
                                            >
                                                <Banknote className="mr-2 h-4 w-4" /> Cash
                                            </Button>
                                            <Button 
                                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-12"
                                                onClick={() => handleCompleteCheckout('Credit Card')}
                                                disabled={pendingBill.length === 0 || isSaving}
                                            >
                                                {isSaving ? <Loader2 className="animate-spin h-5 w-5" /> : <><CreditCard className="mr-2 h-4 w-4" /> Card/UPI</>}
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Transaction History Section */}
                    <Card className="bg-[#111] border-[#333]">
                        <CardHeader className="border-b border-[#222] flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-lg text-white">Recent Transactions</CardTitle>
                                <CardDescription className="text-xs text-gray-500">Historical billing activity for the active lane</CardDescription>
                            </div>
                            <Button variant="outline" className="border-[#333] text-xs h-8">View All</Button>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader className="bg-[#0d0d0d]">
                                    <TableRow className="border-[#222] hover:bg-transparent">
                                        <TableHead className="text-gray-500 font-bold uppercase text-[10px]">Transaction ID</TableHead>
                                        <TableHead className="text-gray-500 font-bold uppercase text-[10px]">Customer</TableHead>
                                        <TableHead className="text-gray-500 font-bold uppercase text-[10px]">Timestamp</TableHead>
                                        <TableHead className="text-gray-500 font-bold uppercase text-[10px]">Items</TableHead>
                                        <TableHead className="text-gray-500 font-bold uppercase text-[10px]">Total Amount</TableHead>
                                        <TableHead className="text-gray-500 font-bold uppercase text-[10px]">Payment</TableHead>
                                        <TableHead className="text-gray-500 font-bold uppercase text-[10px]">Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {transactions.map((txn, idx) => (
                                        <TableRow key={idx} className="border-[#222] hover:bg-[#1a1a1a]/50">
                                            <TableCell className="font-mono text-xs text-blue-400">{txn.id}</TableCell>
                                            <TableCell className="text-sm text-gray-300 font-medium">{txn.customer}</TableCell>
                                            <TableCell className="text-xs text-gray-500">{txn.timestamp}</TableCell>
                                            <TableCell className="text-xs text-gray-400">
                                                {txn.items.length} items
                                            </TableCell>
                                            <TableCell className="text-sm font-bold text-white">{formatPrice(txn.total)}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="text-[10px] font-normal border-[#333] text-gray-400">
                                                    {txn.paymentMethod}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1.5 text-xs text-green-500 font-medium">
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
