
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    ArrowRightLeft, ArrowRight, Truck, TrendingDown, TrendingUp,
    AlertTriangle, CheckCircle2, XCircle, Clock, MapPin,
    Package, BarChart3, Filter, MoreHorizontal, ChevronDown,
    ChevronRight, Store, Calendar as CalendarIcon, ShieldCheck, ShoppingCart,
    Brain
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
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
import {
    Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink,
    BreadcrumbPage, BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import { Home } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import { useAuth } from '@/context/AuthContext';
import { backendModuleService } from '@/services/backendModuleService';
import { toast } from '@/hooks/use-toast';

// --- MOCK DATA ---

const INDIAN_CITIES = [
    'Delhi', 'Gurgaon', 'Noida', 'Ludhiana', 'Chandigarh',
    'Bangalore', 'Chennai', 'Hyderabad', 'Kochi', 'Coimbatore',
    'Mumbai', 'Pune', 'Ahmedabad', 'Surat', 'Nagpur',
    'Kolkata', 'Bhubaneswar', 'Guwahati', 'Patna', 'Ranchi'
];

const FALLBACK_TRANSFER_RECOMMENDATIONS = [
    {
        id: "TRF-2024-882",
        sku: "Ashirvaad Shudh Atta (5kg)",
        skuId: "SKU-IN-001",
        sourceStore: "Store 402 (Delhi)",
        destStore: "Store 115 (Gurgaon)",
        marketingName: "Ashirvaad Shudh Atta",
        qty: 150,
        unit: "Units",
        demandGap: "+420 Units",
        riskReduction: "High",
        priority: "Critical",
        confidence: 96,
        distance: "12 km",
        time: "45 mins",
        feasibility: "Feasible",
        coldChain: false,
        sourceMetrics: {
            overstock: "Severe (+200%)",
            spoilageRisk: "Medium",
            forecast: "Declining"
        },
        destMetrics: {
            stockoutRisk: "Imminent (2h)",
            forecast: "Spiking (+50%)",
            promoActive: true
        }
    }
];

const StockRebalancingPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { role } = useAuth();
    const queryParams = new URLSearchParams(location.search);
    const fromControlTower = queryParams.get('from') === 'control-tower';
    const [selectedTransfer, setSelectedTransfer] = useState(null);
    const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
    const [transferRecommendations, setTransferRecommendations] = useState(FALLBACK_TRANSFER_RECOMMENDATIONS);
    const [createSheetOpen, setCreateSheetOpen] = useState(false);
    const [isSavingRecommendation, setIsSavingRecommendation] = useState(false);
    const [createError, setCreateError] = useState('');
    const [date, setDate] = useState(new Date());
    const [selectedCity, setSelectedCity] = useState("Delhi");
    const [selectedSourceStore, setSelectedSourceStore] = useState("all");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [isLoading, setIsLoading] = useState(false);
    const [summary, setSummary] = useState({
        excessStockUnits: 2450,
        spoilageRisk: 'High',
        lowDemandConfidence: '42%',
        insight: 'Store 402 has a surplus of perishable goods due to a cancelled local event. Store 115 is facing shortages for the same items.'
    });
    const [newRecommendation, setNewRecommendation] = useState({
        marketingName: '',
        sourceStore: 'Store 402 (Delhi)',
        destStore: 'Store 115 (Gurgaon)',
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
        city: 'Delhi',
        destStockoutRisk: 'Medium',
        destForecast: 'Rising',
    });

    React.useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                const dateStr = format(date, 'yyyy-MM-dd');
                const data = await backendModuleService.getModuleData('stockRebalancing', { 
                    date: dateStr, 
                    city: selectedCity,
                    sourceStore: selectedSourceStore === 'all' ? undefined : selectedSourceStore,
                    category: selectedCategory === 'all' ? undefined : selectedCategory
                });
                setTransferRecommendations(data?.recommendations || []);
                if (data?.recommendations && data.recommendations.length > 0) {
                    const topRec = data.recommendations[0];
                    setSummary({
                        excessStockUnits: data.recommendations.reduce((sum, r) => sum + r.qty, 0),
                        spoilageRisk: topRec.sourceMetrics?.spoilageRisk || 'Medium',
                        lowDemandConfidence: topRec.confidence ? `${Math.floor(topRec.confidence * 0.8)}%` : '42%',
                        insight: `Rebalancing critical for ${selectedCity}: ${topRec.explanation}`
                    });
                } else {
                    // Update summary if no data found for the date/region
                    setSummary({
                        excessStockUnits: 0,
                        spoilageRisk: 'None',
                        lowDemandConfidence: '0%',
                        insight: `No active rebalancing recommendations for ${selectedCity} on ${dateStr}.`
                    });
                }
            } catch (err) {
                console.error('Failed to fetch stock rebalancing module data:', err);
                setTransferRecommendations(FALLBACK_TRANSFER_RECOMMENDATIONS);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, [date, selectedCity]);

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
            sourceStore: 'Store 402 (Delhi)',
            destStore: 'Store 115 (Gurgaon)',
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
            city: selectedCity,
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
            sourceStore: newRecommendation.sourceStore.trim() || 'Store 402 (Delhi)',
            destStore: newRecommendation.destStore.trim() || 'Store 115 (Gurgaon)',
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
            },
            city: selectedCity,
            date: format(date, 'yyyy-MM-dd'),
            explanation: `Manual Recommendation: Shift ${newRecommendation.qty} units of ${newRecommendation.marketingName} to address ${newRecommendation.destStockoutRisk} risk.`
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
        <div className="min-h-screen bg-background text-foreground font-sans selection:bg-blue-500/30 pb-20">
            {/* Header & Filters */}
            <div className="sticky top-0 z-30 bg-sidebar/95 backdrop-blur-md border-b border-sidebar-border px-6 py-3 shadow-md">
                {/* Breadcrumb */}
                <div className="mb-2">
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink
                                    onClick={() => navigate(role === 'vendor' ? '/vendor' : '/')}
                                    className="flex items-center gap-1 text-muted-foreground hover:text-blue-400 cursor-pointer text-[11px] transition-colors"
                                >
                                    <Home className="w-3 h-3" />
                                    {role === 'vendor' ? 'Vendor Portal' : 'Home'}
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator className="text-gray-600" />
                            {fromControlTower && role !== 'vendor' && (
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
                                    Stock Rebalancing
                                </BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>

                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="flex items-center space-x-4">
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                            <ArrowRightLeft className="w-6 h-6 text-blue-500" />
                        </div>
                        <div>
                            <div className="flex items-center space-x-3">
                                <h1 className="text-xl font-bold text-foreground tracking-tight">Stock Rebalancing Engine</h1>
                                <Badge variant="outline" className="text-blue-500 border-blue-500/30 bg-blue-100 dark:bg-blue-900/10 text-[10px] h-5">
                                    AI Optimized
                                </Badge>
                                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-card border border-border text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                                    Live Inventory
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground">Inter-store inventory optimization to minimize spoilage and maximize availability.</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex flex-col space-y-1">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Region Focus</label>
                            <Select value={selectedCity} onValueChange={setSelectedCity}>
                                <SelectTrigger className="h-9 w-[130px] bg-card border-border text-sm text-foreground hover:border-blue-500/50 transition-colors">
                                    <SelectValue placeholder="City" />
                                </SelectTrigger>
                                <SelectContent className="bg-card border-border text-foreground">
                                    {INDIAN_CITIES.map(city => (
                                        <SelectItem key={city} value={city}>{city}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex flex-col space-y-1">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Analysis Date</label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant={"outline"} className="w-[150px] h-9 justify-start text-left font-normal bg-card border-border text-foreground text-xs hover:border-blue-500/50 transition-colors">
                                        <CalendarIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                                        {date ? format(date, "MMM dd, yyyy") : <span>Date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0 bg-card border-border text-foreground" align="start">
                                    <Calendar mode="single" selected={date} onSelect={(d) => d && setDate(d)} initialFocus className="bg-card text-foreground" />
                                </PopoverContent>
                            </Popover>
                        </div>

                        <div className="shrink-0 self-end">
                            <Button
                                className="h-9 bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-900/20 px-4 text-xs font-semibold"
                                onClick={() => {
                                    resetRecommendationForm();
                                    setCreateSheetOpen(true);
                                }}
                            >
                                <ShoppingCart className="w-3.5 h-3.5 mr-2" /> Add Recommendation
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-6 w-full space-y-6">

                {/* 2. SOURCE STORE RISK SUMMARY */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="bg-card border-border md:col-span-1 hover:border-blue-500/30 transition-colors">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Excess Stock Units</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-foreground tabular-nums">{summary.excessStockUnits.toLocaleString()}</div>
                            <p className="text-[10px] text-red-500 mt-1 font-semibold uppercase tracking-wider">
                                Distribution Surplus
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="bg-card border-border md:col-span-1 hover:border-orange-500/30 transition-colors">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Spoilage Risk</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-orange-500 tabular-nums">{summary.spoilageRisk}</div>
                            <p className="text-[10px] text-muted-foreground mt-1 flex items-center font-medium uppercase tracking-wider">
                                $1.2k Value Exposed
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="bg-card border-border md:col-span-1 hover:border-blue-500/30 transition-colors">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Demand Confidence</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-foreground tabular-nums">{summary.lowDemandConfidence}</div>
                            <p className="text-[10px] text-muted-foreground mt-1 flex items-center font-medium uppercase tracking-wider">
                                Forecast Alignment
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="bg-card border-border md:col-span-1 hover:border-blue-500/30 transition-colors">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">AI Strategic Insight</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs text-blue-400 font-medium leading-relaxed">"{summary.insight}"</p>
                        </CardContent>
                    </Card>
                </div>

                {/* 3. RECOMMENDATIONS TABLE */}
                <Card className="bg-card border-border overflow-hidden">
                    <CardHeader className="border-b border-border py-4 bg-muted/30">
                        <CardTitle className="text-lg font-bold text-foreground flex items-center">
                            <ShieldCheck className="w-5 h-5 mr-2 text-green-500" />
                            AI Transfer Recommendations
                        </CardTitle>
                        <CardDescription className="text-muted-foreground text-xs">Ranked by highest net inventory risk reduction</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow className="border-border hover:bg-transparent">
                                    <TableHead className="text-muted-foreground text-[10px] uppercase font-bold tracking-widest h-10">Product / SKU</TableHead>
                                    <TableHead className="text-muted-foreground text-[10px] uppercase font-bold tracking-widest h-10">Source</TableHead>
                                    <TableHead className="text-muted-foreground text-[10px] uppercase font-bold tracking-widest h-10">Destination</TableHead>
                                    <TableHead className="text-muted-foreground text-[10px] uppercase font-bold tracking-widest h-10">Transfer Qty</TableHead>
                                    <TableHead className="text-muted-foreground text-[10px] uppercase font-bold tracking-widest h-10">Demand Gap</TableHead>
                                    <TableHead className="text-muted-foreground text-[10px] uppercase font-bold tracking-widest h-10">Risk Reduction</TableHead>
                                    <TableHead className="text-muted-foreground text-[10px] uppercase font-bold tracking-widest h-10">Confidence</TableHead>
                                    <TableHead className="text-muted-foreground text-[10px] uppercase font-bold tracking-widest h-10">Logistics</TableHead>
                                    <TableHead className="w-[50px] h-10"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {transferRecommendations.map((rec) => (
                                    <React.Fragment key={rec.id}>
                                        <TableRow
                                            className={`border-b border-border hover:bg-muted transition-colors cursor-pointer group ${rec.id === selectedTransfer?.id ? 'bg-muted' : ''}`}
                                            onClick={() => setSelectedTransfer(selectedTransfer?.id === rec.id ? null : rec)}
                                        >
                                            <TableCell>
                                                <div className="font-semibold text-foreground text-sm tracking-tight">{rec.marketingName}</div>
                                                <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-mono mt-0.5">{rec.skuId}</div>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground text-xs">{rec.sourceStore}</TableCell>
                                            <TableCell className="text-blue-500 font-medium text-xs flex items-center">
                                                {rec.destStore} <ArrowRight className="w-3 h-3 ml-1" />
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="bg-card text-foreground border-border text-[10px] h-5">
                                                    {rec.qty} {rec.unit}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-red-500 text-xs font-bold tabular-nums">{rec.demandGap}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={`
                                                    ${rec.riskReduction === 'High' ? 'text-green-600 border-green-500/30 bg-green-100 dark:bg-green-900/10' :
                                                        'text-yellow-600 border-yellow-500/30 bg-yellow-100 dark:bg-yellow-900/10'}
                                                    text-[10px] h-5
                                                `}>
                                                    {rec.riskReduction}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Progress value={rec.confidence} className="w-12 h-1 bg-muted" />
                                                    <span className="text-[11px] text-muted-foreground tabular-nums">{rec.confidence}%</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-0.5">
                                                    <div className="flex items-center text-[11px] text-muted-foreground">
                                                        <Truck className="w-3 h-3 mr-1" /> {rec.time}
                                                    </div>
                                                    {rec.feasibility === 'Risky' && (
                                                        <span className="text-[9px] text-red-500 font-bold uppercase tracking-tighter">Logistics Risk</span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <ChevronDown className={`w-4 h-4 text-muted-foreground/40 transition-transform ${selectedTransfer?.id === rec.id ? 'rotate-180 text-blue-500' : ''}`} />
                                            </TableCell>
                                        </TableRow>

                                        {/* EXPANDED SIMULATION VIEW */}
                                        {selectedTransfer?.id === rec.id && (
                                            <TableRow className="bg-muted/30 hover:bg-muted/30 border-b border-border">
                                                <TableCell colSpan={9} className="p-6">
                                                    <div className="flex flex-col space-y-6">
                                                        {/* AI Logic / Explanation Section */}
                                                        <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-4">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <Brain className="w-4 h-4 text-blue-500" />
                                                                <h3 className="text-xs font-bold text-blue-500 uppercase tracking-widest">AI Strategic Rationale</h3>
                                                            </div>
                                                            <p className="text-sm text-foreground/80 leading-relaxed italic">
                                                                "{rec.explanation || "System generated recommendation based on real-time inventory levels and demand forecasting models. This shift optimizes regional availability and minimizes spoilage risk."}"
                                                            </p>
                                                        </div>

                                                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                                            {/* Simulation: Before/After */}
                                                            <div className="col-span-2 space-y-4">
                                                                <h3 className="text-xs font-bold text-foreground uppercase tracking-widest flex items-center">
                                                                    <BarChart3 className="w-4 h-4 mr-2 text-blue-500" /> Transfer Impact Simulation
                                                                </h3>

                                                                <div className="grid grid-cols-2 gap-4">
                                                                    <div className="bg-card border border-border rounded-lg p-4 relative overflow-hidden shadow-sm">
                                                                        <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
                                                                        <h4 className="text-muted-foreground text-[10px] font-bold uppercase mb-2 tracking-wider">Source: {rec.sourceStore}</h4>
                                                                        <div className="flex justify-between items-end">
                                                                            <div className="text-muted-foreground line-through text-xs font-medium">Overstocked</div>
                                                                            <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/30" />
                                                                            <div className="text-green-500 font-bold text-sm">Balanced</div>
                                                                        </div>
                                                                        <div className="mt-3 text-[11px] text-muted-foreground">
                                                                            Current: <span className="text-red-500 font-semibold">Excess (+{rec.sourceMetrics?.overstock || '20%'})</span>
                                                                        </div>
                                                                        <div className="mt-1 text-[11px] text-muted-foreground">
                                                                            Result: <span className="text-green-500 font-semibold tracking-tight">Optimal Par Level</span>
                                                                        </div>
                                                                    </div>

                                                                    <div className="bg-card border border-border rounded-lg p-4 relative overflow-hidden shadow-sm">
                                                                        <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
                                                                        <h4 className="text-muted-foreground text-[10px] font-bold uppercase mb-2 tracking-wider">Destination: {rec.destStore}</h4>
                                                                        <div className="flex justify-between items-end">
                                                                            <div className="text-red-500 text-xs font-bold">Stockout Risk</div>
                                                                            <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/30" />
                                                                            <div className="text-green-500 font-bold text-sm">Covered</div>
                                                                        </div>
                                                                        <div className="mt-3 text-[11px] text-muted-foreground">
                                                                            Forecast: <span className="text-blue-500 font-semibold">{rec.destMetrics?.forecast || 'High'}</span>
                                                                        </div>
                                                                        <div className="mt-1 text-[11px] text-muted-foreground">
                                                                            Result: <span className="text-green-500 font-semibold tracking-tight">Safety Stock Restored</span>
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
                                                            <div className="bg-muted/50 border border-border rounded-lg p-5 flex flex-col justify-between shadow-sm">
                                                                <div>
                                                                    <h3 className="text-xs font-bold text-foreground uppercase tracking-widest mb-4">Execution Plan</h3>
                                                                    <div className="space-y-3">
                                                                        <div className="flex justify-between text-[13px]">
                                                                            <span className="text-muted-foreground">Logistics Cost:</span>
                                                                            <span className="text-foreground font-semibold tabular-nums">$12.50</span>
                                                                        </div>
                                                                        <div className="flex justify-between text-[13px]">
                                                                            <span className="text-muted-foreground">Est. Arrival:</span>
                                                                            <span className="text-foreground font-semibold">Today, 2:30 PM</span>
                                                                        </div>
                                                                        <div className="flex justify-between text-[13px]">
                                                                            <span className="text-muted-foreground">Environment:</span>
                                                                            <span className={rec.coldChain ? "text-blue-500 font-semibold" : "text-muted-foreground font-medium"}>
                                                                                {rec.coldChain ? "Cold Chain Required" : "Standard Ambient"}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                <div className="flex flex-col gap-3 mt-8">
                                                                    <Button
                                                                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-md shadow-blue-500/10 h-10"
                                                                        onClick={() => setApprovalDialogOpen(true)}
                                                                    >
                                                                        <CheckCircle2 className="w-4 h-4 mr-2" /> Approve & Dispatch
                                                                    </Button>
                                                                    <Button variant="outline" className="w-full border-border text-muted-foreground hover:text-foreground bg-card h-10 text-xs font-semibold uppercase tracking-wider">
                                                                        Modify Parameters
                                                                    </Button>
                                                                </div>
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
                <DialogContent className="bg-card border-border text-foreground sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-bold">Confirm Stock Transfer</DialogTitle>
                        <DialogDescription className="text-muted-foreground text-sm">
                            You are approving the transfer of <b className="text-foreground">{selectedTransfer?.qty} {selectedTransfer?.unit}</b> of <b className="text-foreground">{selectedTransfer?.marketingName}</b> from <b className="text-foreground">{selectedTransfer?.sourceStore}</b> to <b className="text-foreground">{selectedTransfer?.destStore}</b>.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-2 space-y-4">
                        <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-md">
                            <h4 className="text-[10px] font-bold text-blue-500 uppercase mb-1 tracking-widest">Expected Outcome</h4>
                            <p className="text-xs text-blue-500/80 font-medium leading-tight">Reduces source overstock impact and restores safety stock at destination.</p>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Approval Rationale</label>
                            <Select defaultValue="demand">
                                <SelectTrigger className="w-full bg-muted/50 border-border text-sm text-foreground">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-card border-border text-foreground">
                                    <SelectItem value="demand">Address Demand Mismatch</SelectItem>
                                    <SelectItem value="spoilage">Prevent Spoilage</SelectItem>
                                    <SelectItem value="space">Space Constraints</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Logistics Notes</label>
                            <Textarea placeholder="Add dispatch instructions..." className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground/50 resize-none min-h-[80px]" />
                        </div>
                    </div>
                    <DialogFooter className="gap-2 sm:gap-0 mt-4">
                        <Button variant="ghost" onClick={() => setApprovalDialogOpen(false)} className="text-muted-foreground hover:text-foreground">Cancel</Button>
                        <Button onClick={handleApprove} className="bg-green-600 hover:bg-green-500 text-white font-bold px-6 shadow-md shadow-green-500/10">Confirm & Execute</Button>
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
