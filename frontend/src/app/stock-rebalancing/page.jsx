
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowRightLeft, ArrowRight, Truck, TrendingDown, TrendingUp,
    AlertTriangle, CheckCircle2, XCircle, Clock, MapPin,
    Package, BarChart3, Filter, MoreHorizontal, ChevronDown,
    ChevronRight, Store, Calendar, ShieldCheck, ShoppingCart
} from 'lucide-react';
import {
    Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Separator } from '@/components/ui/separator';
import { Progress } from "@/components/ui/progress";
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { backendModuleService } from '@/services/backendModuleService';
import { toast } from '@/hooks/use-toast';

// --- MOCK DATA ---

const FALLBACK_TRANSFER_RECOMMENDATIONS = [
    {
        id: "TRF-2024-882",
        sku: "Avocados (Hass) - Premium",
        skuId: "SKU-9928",
        sourceStore: "Store 402 (North)",
        destStore: "Store 115 (Downtown)",
        marketingName: "Organic Hass Avocados",
        qty: 150,
        unit: "Units",
        demandGap: "+420 Units",
        riskReduction: "High",
        priority: "Critical",
        confidence: 96,
        distance: "12 miles",
        time: "45 mins",
        feasibility: "Feasible",
        coldChain: true,
        sourceMetrics: {
            overstock: "Severe (+200%)",
            spoilageRisk: "High (<3 days)",
            forecast: "Declining"
        },
        destMetrics: {
            stockoutRisk: "Imminent (2h)",
            forecast: "Spiking (+50%)",
            promoActive: true
        }
    },
    {
        id: "TRF-2024-885",
        sku: "Almond Milk - Unsweetened",
        skuId: "SKU-1029",
        sourceStore: "Store 892 (West)",
        destStore: "Store 402 (North)",
        marketingName: "Silk Almond Milk",
        qty: 40,
        unit: "Cartons",
        demandGap: "+65 Units",
        riskReduction: "Medium",
        priority: "High",
        confidence: 88,
        distance: "8 miles",
        time: "30 mins",
        feasibility: "Feasible",
        coldChain: false,
        sourceMetrics: {
            overstock: "Moderate (+40%)",
            spoilageRisk: "Low",
            forecast: "Flat"
        },
        destMetrics: {
            stockoutRisk: "Medium (24h)",
            forecast: "Stable",
            promoActive: false
        }
    },
    {
        id: "TRF-2024-890",
        sku: "Whole Wheat Bread",
        skuId: "SKU-3321",
        sourceStore: "Store 115 (Downtown)",
        destStore: "Store 892 (West)",
        marketingName: "Nature's Own Wheat",
        qty: 85,
        unit: "Loaves",
        demandGap: "+100 Units",
        riskReduction: "Medium",
        priority: "Medium",
        confidence: 82,
        distance: "15 miles",
        time: "55 mins",
        feasibility: "Risky",
        coldChain: false,
        sourceMetrics: {
            overstock: "High (+80%)",
            spoilageRisk: "Medium (5 days)",
            forecast: "Declining"
        },
        destMetrics: {
            stockoutRisk: "Low",
            forecast: "Rising",
            promoActive: true
        }
    }
];

const StockRebalancingPage = () => {
    const navigate = useNavigate();
    const [selectedTransfer, setSelectedTransfer] = useState(null);
    const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
    const [transferRecommendations, setTransferRecommendations] = useState(FALLBACK_TRANSFER_RECOMMENDATIONS);
    const [createSheetOpen, setCreateSheetOpen] = useState(false);
    const [isSavingRecommendation, setIsSavingRecommendation] = useState(false);
    const [createError, setCreateError] = useState('');
    const [summary, setSummary] = useState({
        excessStockUnits: 2450,
        spoilageRisk: 'High',
        lowDemandConfidence: '42%',
        insight: 'Store 402 has a surplus of perishable goods due to a cancelled local event. Store 115 is facing shortages for the same items.'
    });
    const [newRecommendation, setNewRecommendation] = useState({
        marketingName: '',
        sourceStore: 'Store 402 (North)',
        destStore: 'Store 115 (Downtown)',
        qty: '50',
        unit: 'Units',
        demandGap: '+50 Units',
        riskReduction: 'Medium',
        priority: 'High',
        confidence: '85',
        time: '35 mins',
        feasibility: 'Feasible',
        coldChain: false,
        sourceOverstock: 'Moderate',
        sourceSpoilageRisk: 'Low',
        sourceForecast: 'Flat',
        destStockoutRisk: 'Medium',
        destForecast: 'Rising',
    });

    React.useEffect(() => {
        const loadData = async () => {
            try {
                const data = await backendModuleService.getModuleData('stockRebalancing');
                setTransferRecommendations(data?.recommendations || FALLBACK_TRANSFER_RECOMMENDATIONS);
                if (data?.summary) {
                    setSummary(data.summary);
                }
            } catch (err) {
                console.error('Failed to fetch stock rebalancing module data:', err);
            }
        };
        loadData();
    }, []);

    const handleApprove = async () => {
        if (!selectedTransfer?.id) return;
        try {
            await backendModuleService.approveStockTransfer(selectedTransfer.id, 'demand');
            setTransferRecommendations(prev => prev.filter(rec => rec.id !== selectedTransfer.id));
            toast({
                title: 'Transfer approved',
                description: 'The recommendation was approved and synced successfully.',
            });
        } catch (err) {
            console.error('Transfer approval failed:', err);
            toast({
                title: 'Approval failed',
                description: err.message || 'Could not approve transfer.',
                variant: 'destructive',
            });
        } finally {
            setApprovalDialogOpen(false);
            setSelectedTransfer(null);
        }
    };

    const resetRecommendationForm = () => {
        setNewRecommendation({
            marketingName: '',
            sourceStore: 'Store 402 (North)',
            destStore: 'Store 115 (Downtown)',
            qty: '50',
            unit: 'Units',
            demandGap: '+50 Units',
            riskReduction: 'Medium',
            priority: 'High',
            confidence: '85',
            time: '35 mins',
            feasibility: 'Feasible',
            coldChain: false,
            sourceOverstock: 'Moderate',
            sourceSpoilageRisk: 'Low',
            sourceForecast: 'Flat',
            destStockoutRisk: 'Medium',
            destForecast: 'Rising',
        });
        setCreateError('');
    };

    const handleRecommendationFieldChange = (field, value) => {
        setNewRecommendation((prev) => ({ ...prev, [field]: value }));
    };

    const handleAddRecommendation = async () => {
        if (!newRecommendation.marketingName.trim()) {
            setCreateError('Product name is required.');
            return;
        }

        setIsSavingRecommendation(true);
        setCreateError('');

        const recommendation = {
            id: `TRF-${Date.now()}`,
            sku: newRecommendation.marketingName.trim(),
            skuId: `SKU-${Math.floor(Math.random() * 10000)}`,
            sourceStore: newRecommendation.sourceStore.trim() || 'Store 402 (North)',
            destStore: newRecommendation.destStore.trim() || 'Store 115 (Downtown)',
            marketingName: newRecommendation.marketingName.trim(),
            qty: Number(newRecommendation.qty) || 50,
            unit: newRecommendation.unit,
            demandGap: newRecommendation.demandGap.trim() || '+50 Units',
            riskReduction: newRecommendation.riskReduction,
            priority: newRecommendation.priority,
            confidence: Number(newRecommendation.confidence) || 85,
            distance: '10 miles',
            time: newRecommendation.time.trim() || '35 mins',
            feasibility: newRecommendation.feasibility,
            coldChain: newRecommendation.coldChain,
            sourceMetrics: {
                overstock: newRecommendation.sourceOverstock,
                spoilageRisk: newRecommendation.sourceSpoilageRisk,
                forecast: newRecommendation.sourceForecast
            },
            destMetrics: {
                stockoutRisk: newRecommendation.destStockoutRisk,
                forecast: newRecommendation.destForecast,
                promoActive: false
            }
        };

        try {
            await backendModuleService.addModuleItem('stockRebalancing', 'recommendations', recommendation);
            setTransferRecommendations((prev) => [recommendation, ...prev]);
            setCreateSheetOpen(false);
            resetRecommendationForm();
            toast({
                title: 'Recommendation saved',
                description: 'The stock rebalancing recommendation was added successfully.',
            });
        } catch (err) {
            console.error('Failed to add stock recommendation:', err);
            setCreateError(err.message || 'Could not save recommendation.');
            toast({
                title: 'Save failed',
                description: err.message || 'Could not save recommendation.',
                variant: 'destructive',
            });
        } finally {
            setIsSavingRecommendation(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-foreground pb-20 font-sans w-full flex flex-col">

            {/* 1. HEADER & CONTROLS */}
            <header className="sticky top-0 z-30 bg-[#111] border-b border-[#222] shadow-lg">
                <div className="px-6 py-4 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="p-2 bg-blue-900/20 rounded-lg">
                                <ArrowRightLeft className="w-6 h-6 text-blue-500" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                                    Inter-Store Stock Rebalancing
                                </h1>
                                <div className="text-sm text-gray-300 font-mono flex items-center gap-3 mt-1">
                                    <span className="flex items-center"><MapPin className="w-3 h-3 mr-1" /> Region: North East</span>
                                    <span>•</span>
                                    <span className="flex items-center text-blue-300"><Clock className="w-3 h-3 mr-1" /> Horizon: Next 7 Days</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3">
                            <div className="bg-[#1a1a1a] rounded-md px-3 py-1.5 flex items-center border border-[#333]">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse mr-2"></span>
                                <span className="text-xs text-gray-300 font-medium">Inventory Data: Live</span>
                            </div>
                            <Button
                                className="h-9 bg-purple-600 hover:bg-purple-700 text-white"
                                onClick={() => {
                                    resetRecommendationForm();
                                    setCreateSheetOpen(true);
                                }}
                            >
                                <ShoppingCart className="w-4 h-4 mr-2" /> Add Recommendation
                            </Button>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-wrap items-center gap-3">
                        <Select defaultValue="store402">
                            <SelectTrigger className="w-[180px] h-9 bg-[#1a1a1a] border-[#333] text-sm text-gray-200">
                                <SelectValue placeholder="Source Store" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="store402">Store 402 (North)</SelectItem>
                                <SelectItem value="store115">Store 115 (Downtown)</SelectItem>
                                <SelectItem value="store892">Store 892 (West)</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select defaultValue="all">
                            <SelectTrigger className="w-[140px] h-9 bg-[#1a1a1a] border-[#333] text-sm text-gray-200">
                                <SelectValue placeholder="Category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Categories</SelectItem>
                                <SelectItem value="produce">Produce</SelectItem>
                                <SelectItem value="dairy">Dairy</SelectItem>
                                <SelectItem value="bakery">Bakery</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select defaultValue="demand">
                            <SelectTrigger className="w-[160px] h-9 bg-[#1a1a1a] border-[#333] text-sm text-gray-200">
                                <SelectValue placeholder="Optimization Goal" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="demand">Demand Mismatch</SelectItem>
                                <SelectItem value="overstock">Clear Overstock</SelectItem>
                                <SelectItem value="spoilage">Reduce Spoilage</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </header>

            <div className="p-6 w-full max-w-[1800px] mx-auto space-y-6">

                {/* 2. SOURCE STORE RISK SUMMARY */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="bg-[#111] border-[#333] md:col-span-1">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-gray-300 uppercase tracking-wider">Excess Stock Units</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-white">{summary.excessStockUnits.toLocaleString()}</div>
                            <p className="text-xs text-red-400 mt-1 font-medium flex items-center">
                                across 15 SKUs
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="bg-[#111] border-[#333] md:col-span-1">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-gray-300 uppercase tracking-wider">Spoilage Risk</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-orange-500">{summary.spoilageRisk}</div>
                            <p className="text-xs text-gray-300 mt-1 flex items-center font-medium">
                                $1.2k potential loss (48h)
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="bg-[#111] border-[#333] md:col-span-1">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-gray-300 uppercase tracking-wider">Low Demand Confidence</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-white">{summary.lowDemandConfidence}</div>
                            <p className="text-xs text-gray-300 mt-1 flex items-center font-medium">
                                of items have declining forecast
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="bg-[#111] border-[#333] md:col-span-1">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-gray-300 uppercase tracking-wider">Insight</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-blue-300 leading-relaxed">"{summary.insight}"</p>
                        </CardContent>
                    </Card>
                </div>

                {/* 3. RECOMMENDATIONS TABLE */}
                <Card className="bg-[#111] border-[#333]">
                    <CardHeader className="border-b border-[#222] py-4 bg-[#141414]">
                        <CardTitle className="text-lg font-bold text-white flex items-center">
                            <ShieldCheck className="w-5 h-5 mr-2 text-green-500" />
                            AI Transfer Recommendations
                        </CardTitle>
                        <CardDescription className="text-gray-400">Ranked by highest net inventory risk reduction</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader className="bg-[#1a1a1a]">
                                <TableRow className="border-none hover:bg-transparent">
                                    <TableHead className="text-gray-400 font-bold">Product / SKU</TableHead>
                                    <TableHead className="text-gray-400 font-bold">Source</TableHead>
                                    <TableHead className="text-gray-400 font-bold">Destination</TableHead>
                                    <TableHead className="text-gray-400 font-bold">Transfer Qty</TableHead>
                                    <TableHead className="text-gray-400 font-bold">Demand Gap (Dest)</TableHead>
                                    <TableHead className="text-gray-400 font-bold">Risk Reduction</TableHead>
                                    <TableHead className="text-gray-400 font-bold">Confidence</TableHead>
                                    <TableHead className="text-gray-400 font-bold">Logistics</TableHead>
                                    <TableHead className="w-[50px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {transferRecommendations.map((rec) => (
                                    <React.Fragment key={rec.id}>
                                        <TableRow
                                            className={`border-b border-[#222] hover:bg-[#1a1a1a] transition-colors cursor-pointer group ${rec.id === selectedTransfer?.id ? 'bg-[#1a1a1a] border-blue-900/50' : ''}`}
                                            onClick={() => setSelectedTransfer(selectedTransfer?.id === rec.id ? null : rec)}
                                        >
                                            <TableCell>
                                                <div className="font-medium text-white">{rec.marketingName}</div>
                                                <div className="text-xs text-gray-400">{rec.skuId}</div>
                                            </TableCell>
                                            <TableCell className="text-gray-300 text-sm">{rec.sourceStore}</TableCell>
                                            <TableCell className="text-blue-300 font-medium text-sm flex items-center">
                                                {rec.destStore} <ArrowRight className="w-3 h-3 ml-1" />
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="bg-[#222] text-white border-[#444]">
                                                    {rec.qty} {rec.unit}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-red-400 text-sm font-medium">{rec.demandGap}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={`
                                                    ${rec.riskReduction === 'High' ? 'text-green-400 border-green-900 bg-green-900/10' :
                                                        'text-yellow-400 border-yellow-900 bg-yellow-900/10'}
                                                `}>
                                                    {rec.riskReduction}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Progress value={rec.confidence} className="w-16 h-1.5 bg-[#222]" />
                                                    <span className="text-xs text-gray-300">{rec.confidence}%</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center text-xs text-gray-300">
                                                        <Truck className="w-3 h-3 mr-1" /> {rec.time}
                                                    </div>
                                                    {rec.feasibility === 'Risky' && (
                                                        <span className="text-[10px] text-red-500 font-bold uppercase">Risky</span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${selectedTransfer?.id === rec.id ? 'rotate-180' : ''}`} />
                                            </TableCell>
                                        </TableRow>

                                        {/* EXPANDED SIMULATION VIEW */}
                                        {selectedTransfer?.id === rec.id && (
                                            <TableRow className="bg-[#141414] hover:bg-[#141414] border-b border-[#222]">
                                                <TableCell colSpan={9} className="p-6">
                                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                                                        {/* Simulation: Before/After */}
                                                        <div className="col-span-2 space-y-4">
                                                            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center">
                                                                <BarChart3 className="w-4 h-4 mr-2 text-blue-500" /> Transfer Impact Simulation
                                                            </h3>

                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div className="bg-[#0f0f0f] border border-[#222] rounded-lg p-4 relative overflow-hidden">
                                                                    <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
                                                                    <h4 className="text-gray-300 text-xs uppercase mb-2">Source: {rec.sourceStore}</h4>
                                                                    <div className="flex justify-between items-end">
                                                                        <div className="text-gray-400 line-through text-sm">Overstocked</div>
                                                                        <ArrowRight className="w-4 h-4 text-gray-500" />
                                                                        <div className="text-green-400 font-bold">Optimal</div>
                                                                    </div>
                                                                    <div className="mt-2 text-xs text-gray-400">
                                                                        Current: <span className="text-red-400 font-medium">Excess (+{rec.sourceMetrics.overstock})</span>
                                                                    </div>
                                                                    <div className="mt-1 text-xs text-gray-400">
                                                                        Post-Transfer: <span className="text-green-500 font-medium">Balanced</span>
                                                                    </div>
                                                                </div>

                                                                <div className="bg-[#0f0f0f] border border-[#222] rounded-lg p-4 relative overflow-hidden">
                                                                    <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
                                                                    <h4 className="text-gray-300 text-xs uppercase mb-2">Destination: {rec.destStore}</h4>
                                                                    <div className="flex justify-between items-end">
                                                                        <div className="text-red-500 text-sm">Stockout Risk</div>
                                                                        <ArrowRight className="w-4 h-4 text-gray-500" />
                                                                        <div className="text-green-400 font-bold">Covered</div>
                                                                    </div>
                                                                    <div className="mt-2 text-xs text-gray-400">
                                                                        Demand Forecast: <span className="text-blue-400 font-medium">{rec.destMetrics.forecast}</span>
                                                                    </div>
                                                                    <div className="mt-1 text-xs text-gray-400">
                                                                        Impact: <span className="text-green-500 font-medium">Prevents {rec.destMetrics.stockoutRisk} Stockout</span>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center space-x-4 pt-2">
                                                                <Badge variant="outline" className="border-blue-900 bg-blue-900/10 text-blue-300">
                                                                    Forecast Alignment: Strong
                                                                </Badge>
                                                                <Badge variant="outline" className="border-orange-900 bg-orange-900/10 text-orange-300">
                                                                    Spoilage Saved: High
                                                                </Badge>
                                                            </div>
                                                        </div>

                                                        {/* Execution Panel */}
                                                        <div className="bg-[#1a1a1a] border border-[#333] rounded-lg p-5 flex flex-col justify-between">
                                                            <div>
                                                                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Approval & Execution</h3>
                                                                <div className="space-y-3">
                                                                    <div className="flex justify-between text-sm">
                                                                        <span className="text-gray-300">Logistics Cost:</span>
                                                                        <span className="text-white">$12.50</span>
                                                                    </div>
                                                                    <div className="flex justify-between text-sm">
                                                                        <span className="text-gray-300">Est. Arrival:</span>
                                                                        <span className="text-white">Today, 2:30 PM</span>
                                                                    </div>
                                                                    <div className="flex justify-between text-sm">
                                                                        <span className="text-gray-300">Cold Chain:</span>
                                                                        <span className={rec.coldChain ? "text-blue-400" : "text-gray-400"}>
                                                                            {rec.coldChain ? "Required (Active)" : "Not Required"}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="flex flex-col gap-3 mt-6">
                                                                <Button
                                                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                                                                    onClick={() => setApprovalDialogOpen(true)}
                                                                >
                                                                    <CheckCircle2 className="w-4 h-4 mr-2" /> Approve Transfer
                                                                </Button>
                                                                <Button variant="outline" className="w-full border-[#333] text-gray-300 hover:text-white bg-transparent">
                                                                    Modify Quantity
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </React.Fragment>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

            </div>

            {/* APPROVAL DIALOG */}
            <Dialog open={approvalDialogOpen} onOpenChange={setApprovalDialogOpen}>
                <DialogContent className="bg-[#111] border-[#222] text-white sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Confirm Stock Transfer</DialogTitle>
                        <DialogDescription className="text-gray-300">
                            You are approving the transfer of <b>{selectedTransfer?.qty} {selectedTransfer?.unit}</b> of <b>{selectedTransfer?.marketingName}</b> from <b>{selectedTransfer?.sourceStore}</b> to <b>{selectedTransfer?.destStore}</b>.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-2 space-y-4">
                        <div className="p-3 bg-blue-900/10 border border-blue-900/30 rounded-md">
                            <h4 className="text-xs font-bold text-blue-400 uppercase mb-1">Impact</h4>
                            <p className="text-sm text-blue-100">Reduces overstock at source (-40%) and prevents imminent stockout at destination.</p>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-200">Approval Reason</label>
                            <Select defaultValue="demand">
                                <SelectTrigger className="w-full bg-[#1a1a1a] border-[#333] text-sm text-gray-200">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-[#1a1a1a] border-[#333] text-white">
                                    <SelectItem value="demand">Address Demand Mismatch</SelectItem>
                                    <SelectItem value="spoilage">Prevent Spoilage</SelectItem>
                                    <SelectItem value="space">Space Constraints</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-200">Notes (Optional)</label>
                            <Textarea placeholder="Add logistics notes..." className="bg-[#1a1a1a] border-[#333] text-white" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setApprovalDialogOpen(false)} className="border-[#333] text-gray-300">Cancel</Button>
                        <Button onClick={handleApprove} className="bg-green-600 hover:bg-green-700 text-white">Confirm & Execute</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Sheet open={createSheetOpen} onOpenChange={setCreateSheetOpen}>
                <SheetContent className="bg-[#111] border-l border-[#222] text-white w-[540px] sm:max-w-[580px] overflow-y-auto">
                    <div className="space-y-6 pt-4">
                        <SheetHeader className="text-left">
                            <SheetTitle className="text-white text-xl">Add Recommendation</SheetTitle>
                            <SheetDescription className="text-gray-400">
                                Create a new inter-store recommendation and save it through the backend to Supabase.
                            </SheetDescription>
                        </SheetHeader>

                        <div className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Product Name</label>
                                <Input
                                    value={newRecommendation.marketingName}
                                    onChange={(e) => handleRecommendationFieldChange('marketingName', e.target.value)}
                                    placeholder="Organic Hass Avocados"
                                    className="bg-[#1a1a1a] border-[#333] text-white"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Source Store</label>
                                    <Input
                                        value={newRecommendation.sourceStore}
                                        onChange={(e) => handleRecommendationFieldChange('sourceStore', e.target.value)}
                                        className="bg-[#1a1a1a] border-[#333] text-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Destination Store</label>
                                    <Input
                                        value={newRecommendation.destStore}
                                        onChange={(e) => handleRecommendationFieldChange('destStore', e.target.value)}
                                        className="bg-[#1a1a1a] border-[#333] text-white"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Quantity</label>
                                    <Input
                                        type="number"
                                        min="1"
                                        value={newRecommendation.qty}
                                        onChange={(e) => handleRecommendationFieldChange('qty', e.target.value)}
                                        className="bg-[#1a1a1a] border-[#333] text-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Unit</label>
                                    <Select value={newRecommendation.unit} onValueChange={(value) => handleRecommendationFieldChange('unit', value)}>
                                        <SelectTrigger className="bg-[#1a1a1a] border-[#333] text-white">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Units">Units</SelectItem>
                                            <SelectItem value="Cartons">Cartons</SelectItem>
                                            <SelectItem value="Loaves">Loaves</SelectItem>
                                            <SelectItem value="Crates">Crates</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Priority</label>
                                    <Select value={newRecommendation.priority} onValueChange={(value) => handleRecommendationFieldChange('priority', value)}>
                                        <SelectTrigger className="bg-[#1a1a1a] border-[#333] text-white">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Critical">Critical</SelectItem>
                                            <SelectItem value="High">High</SelectItem>
                                            <SelectItem value="Medium">Medium</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Risk Reduction</label>
                                    <Select value={newRecommendation.riskReduction} onValueChange={(value) => handleRecommendationFieldChange('riskReduction', value)}>
                                        <SelectTrigger className="bg-[#1a1a1a] border-[#333] text-white">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="High">High</SelectItem>
                                            <SelectItem value="Medium">Medium</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Demand Gap</label>
                                    <Input
                                        value={newRecommendation.demandGap}
                                        onChange={(e) => handleRecommendationFieldChange('demandGap', e.target.value)}
                                        placeholder="+50 Units"
                                        className="bg-[#1a1a1a] border-[#333] text-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Confidence</label>
                                    <Input
                                        type="number"
                                        min="1"
                                        max="100"
                                        value={newRecommendation.confidence}
                                        onChange={(e) => handleRecommendationFieldChange('confidence', e.target.value)}
                                        className="bg-[#1a1a1a] border-[#333] text-white"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">ETA</label>
                                    <Input
                                        value={newRecommendation.time}
                                        onChange={(e) => handleRecommendationFieldChange('time', e.target.value)}
                                        placeholder="35 mins"
                                        className="bg-[#1a1a1a] border-[#333] text-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Feasibility</label>
                                    <Select value={newRecommendation.feasibility} onValueChange={(value) => handleRecommendationFieldChange('feasibility', value)}>
                                        <SelectTrigger className="bg-[#1a1a1a] border-[#333] text-white">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Feasible">Feasible</SelectItem>
                                            <SelectItem value="Risky">Risky</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="rounded-xl border border-[#222] bg-[#151515] p-4 space-y-4">
                                <h3 className="text-sm font-semibold text-white">Operational Signals</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs uppercase tracking-wider text-gray-400">Source Overstock</label>
                                        <Input
                                            value={newRecommendation.sourceOverstock}
                                            onChange={(e) => handleRecommendationFieldChange('sourceOverstock', e.target.value)}
                                            className="bg-[#1a1a1a] border-[#333] text-white"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs uppercase tracking-wider text-gray-400">Source Spoilage Risk</label>
                                        <Input
                                            value={newRecommendation.sourceSpoilageRisk}
                                            onChange={(e) => handleRecommendationFieldChange('sourceSpoilageRisk', e.target.value)}
                                            className="bg-[#1a1a1a] border-[#333] text-white"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs uppercase tracking-wider text-gray-400">Source Forecast</label>
                                        <Input
                                            value={newRecommendation.sourceForecast}
                                            onChange={(e) => handleRecommendationFieldChange('sourceForecast', e.target.value)}
                                            className="bg-[#1a1a1a] border-[#333] text-white"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs uppercase tracking-wider text-gray-400">Destination Stockout Risk</label>
                                        <Input
                                            value={newRecommendation.destStockoutRisk}
                                            onChange={(e) => handleRecommendationFieldChange('destStockoutRisk', e.target.value)}
                                            className="bg-[#1a1a1a] border-[#333] text-white"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs uppercase tracking-wider text-gray-400">Destination Forecast</label>
                                    <Input
                                        value={newRecommendation.destForecast}
                                        onChange={(e) => handleRecommendationFieldChange('destForecast', e.target.value)}
                                        className="bg-[#1a1a1a] border-[#333] text-white"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-between rounded-xl border border-[#222] bg-[#151515] px-4 py-3">
                                <div>
                                    <div className="text-sm font-medium text-white">Cold Chain Required</div>
                                    <div className="text-xs text-gray-400">Turn this on for temperature-sensitive transfers.</div>
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className={`${newRecommendation.coldChain ? 'border-blue-500 text-blue-300 bg-blue-950/40' : 'border-[#333] text-gray-300 bg-transparent'}`}
                                    onClick={() => handleRecommendationFieldChange('coldChain', !newRecommendation.coldChain)}
                                >
                                    {newRecommendation.coldChain ? 'Enabled' : 'Disabled'}
                                </Button>
                            </div>

                            {createError && (
                                <div className="rounded-lg border border-red-900/60 bg-red-950/30 px-3 py-2 text-sm text-red-300">
                                    {createError}
                                </div>
                            )}
                        </div>

                        <SheetFooter className="gap-2 sm:justify-end">
                            <Button
                                variant="outline"
                                className="border-[#333] text-gray-300 bg-transparent"
                                onClick={() => {
                                    setCreateSheetOpen(false);
                                    resetRecommendationForm();
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                className="bg-purple-600 hover:bg-purple-700 text-white"
                                onClick={handleAddRecommendation}
                                disabled={isSavingRecommendation}
                            >
                                {isSavingRecommendation ? 'Saving...' : 'Save Recommendation'}
                            </Button>
                        </SheetFooter>
                    </div>
                </SheetContent>
            </Sheet>

        </div>
    );
};

export default StockRebalancingPage;
