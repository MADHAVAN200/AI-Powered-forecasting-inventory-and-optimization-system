
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    AlertTriangle, TrendingDown, TrendingUp, Package, ArrowRight,
    Activity, Filter, Truck, Thermometer, Calendar, Layers,
    Zap, AlertOctagon, MoreHorizontal, ShieldAlert, CheckCircle2
} from 'lucide-react';
import {
    Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
    ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine, Label
} from 'recharts';

// --- MOCK DATA ---

const KPIS = [
    { title: "Critical SKUs", value: "12", sub: "Review Immediately", icon: AlertTriangle, color: "text-red-500", border: "border-red-500/50" },
    { title: "Shortage Risks", value: "8", sub: "Potential Stockouts", icon: TrendingDown, color: "text-orange-500", border: "border-orange-500/50" },
    { title: "Overstock Risks", value: "5", sub: "Capital Tied Up", icon: Package, color: "text-yellow-500", border: "border-yellow-500/50" },
    { title: "Spoilage Risk", value: "3", sub: "Expiring < 48h", icon: Thermometer, color: "text-purple-500", border: "border-purple-500/50" },
];

const RISK_MATRIX_DATA = [
    { id: 1, name: "Cola 12pk", demand: 95, inventory: 15, risk: "Shortage", severity: "Critical", size: 400 },
    { id: 2, name: "Chips Lg", demand: 88, inventory: 20, risk: "Shortage", severity: "High", size: 300 },
    { id: 3, name: "Water 24pk", demand: 85, inventory: 90, risk: "Balanced", severity: "Low", size: 100 },
    { id: 4, name: "Energy Drink", demand: 20, inventory: 95, risk: "Overstock", severity: "High", size: 350 },
    { id: 5, name: "Seasonal Candy", demand: 15, inventory: 80, risk: "Overstock", severity: "Medium", size: 250 },
    { id: 6, name: "Fresh Berries", demand: 60, inventory: 65, risk: "Spoilage", severity: "Critical", size: 380 },
    { id: 7, name: "Milk 1G", demand: 90, inventory: 85, risk: "Balanced", severity: "Low", size: 120 },
    { id: 8, name: "Bread Loaf", demand: 75, inventory: 30, risk: "Shortage", severity: "Medium", size: 200 },
    { id: 9, name: "Ice Cream", demand: 10, inventory: 15, risk: "Watchlist", severity: "Low", size: 80 },
    { id: 10, name: "Pasta Sauce", demand: 45, inventory: 48, risk: "Balanced", severity: "Low", size: 90 },
];

const CRITICAL_QUEUE = [
    { id: 1, sku: "SKU-101 (Cola 12pk)", store: "Store #402", risk: "Shortage", severity: "Critical", impact: "< 24 Hours", confidence: "98%", driver: "Event Surge", action: "Expedite Transfer" },
    { id: 6, sku: "SKU-890 (Berries)", store: "Store #402", risk: "Spoilage", severity: "Critical", impact: "< 48 Hours", confidence: "95%", driver: "Weather Heat", action: "Markdown 20%" },
    { id: 2, sku: "SKU-205 (Chips Lg)", store: "Store #402", risk: "Shortage", severity: "High", impact: "2 Days", confidence: "92%", driver: "Trend Spike", action: "Adjust Order" },
    { id: 4, sku: "SKU-550 (Energy)", store: "Store #402", risk: "Overstock", severity: "High", impact: "Ongoing", confidence: "88%", driver: "Demand Drop", action: "Cancel Inbound" },
];

const DRIVERS = [
    { label: "Forecast Surge", value: 45, color: "bg-blue-500" },
    { label: "Event Overlap", value: 30, color: "bg-purple-500" },
    { label: "Supply Delay", value: 15, color: "bg-orange-500" },
    { label: "Weather", value: 10, color: "bg-green-500" },
];

// --- COMPONENT ---

import { inventoryService } from '@/services/inventoryService';
import { weatherService } from '@/services/weatherService';
import { masterDataService } from '@/services/masterDataService';

const InventoryRiskPage = () => {
    const navigate = useNavigate();
    const [selectedCity, setSelectedCity] = useState("New York");
    const [riskFilter, setRiskFilter] = useState("all");
    const [loading, setLoading] = useState(true);
    const [risks, setRisks] = useState([]);
    const [stats, setStats] = useState({ critical: 0, shortage: 0, overstock: 0, spoilage: 0 });

    // Master data
    const [cities, setCities] = useState([]);

    const loadMasterData = async () => {
        try {
            const cityData = await masterDataService.getCities();
            setCities(cityData);
        } catch (err) {
            console.error("Error loading cities:", err);
        }
    };

    const [weatherImpact, setWeatherImpact] = useState(null);

    const fetchInventoryRisks = async () => {
        setLoading(true);
        try {
            // 1. Fetch Inventory Risks
            const data = await inventoryService.getInventoryRisks();

            // 2. Fetch City-specific Weather Impact
            const currentCity = cities.find(c => c.city_name === selectedCity);
            if (currentCity) {
                const weather = await weatherService.getWeatherImpact(currentCity.city_id);
                // Simple logic: if temp_max > 30 or temp_min < 0 (extreme for demo), or alert_level is not null
                const isExtreme = weather.some(w => w.alert_level !== null || parseFloat(w.temp_max) > 30);
                setWeatherImpact(isExtreme ? "Extreme Deviation" : "Seasonal Norm");
            }

            // 3. Map to UI format
            const mappedRisks = data.map(r => ({
                id: r.risk_id,
                sku: `${r.products?.name || 'Unknown SKU'}`,
                risk: r.risk_type,
                severity: r.severity_level,
                driver: r.driver_reason,
                impact: r.severity_level === 'High' ? '< 24 Hours' : '3-5 Days',
                confidence: `${r.confidence_pct}%`,
            }));

            setRisks(mappedRisks);

            // 4. Aggregate Stats
            setStats({
                critical: mappedRisks.filter(r => r.severity === 'High').length,
                shortage: mappedRisks.filter(r => r.risk === 'Shortage').length,
                overstock: mappedRisks.filter(r => r.risk === 'Overstock').length,
                spoilage: mappedRisks.filter(r => r.risk === 'Spoilage').length,
            });

        } catch (err) {
            console.error("Risk fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        loadMasterData();
    }, []);

    React.useEffect(() => {
        fetchInventoryRisks();
    }, [selectedCity]);

    const KPIS = [
        { title: "Critical Risks", value: stats.critical, sub: "Review Immediately", icon: AlertTriangle, color: "text-red-500", border: "border-red-500/50" },
        { title: "Shortage Risks", value: stats.shortage, sub: "Potential Stockouts", icon: TrendingDown, color: "text-orange-500", border: "border-orange-500/50" },
        { title: "Overstock Risks", value: stats.overstock, sub: "Capital Tied Up", icon: Package, color: "text-yellow-500", border: "border-yellow-500/50" },
        { title: "Volatility Risks", value: risks.filter(r => r.risk === 'Demand Volatility').length, sub: "Predictive Uncertainty", icon: Activity, color: "text-blue-500", border: "border-blue-500/50" },
    ];

    const getRiskColor = (risk) => {
        switch (risk) {
            case "Shortage": return "#f97316";
            case "Overstock": return "#eab308";
            case "Spoilage": return "#a855f7";
            case "Demand Volatility": return "#3b82f6";
            default: return "#6b7280";
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-foreground pb-20 font-sans">
            {/* 1. HEADER & GLOBAL FILTERS */}
            <div className="sticky top-0 z-30 bg-[#111] border-b border-[#222] shadow-lg">
                <div className="px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center space-x-3">
                        <ShieldAlert className="w-6 h-6 text-red-500" />
                        <div>
                            <h1 className="text-xl font-bold text-white tracking-tight">Inventory Risk Dashboard</h1>
                            <p className="text-xs text-gray-500 font-mono uppercase tracking-wider">Execution Mode • AI Verified</p>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <Select value={selectedCity} onValueChange={setSelectedCity}>
                            <SelectTrigger className="w-[160px] h-9 bg-[#1a1a1a] border-[#333] text-gray-200 text-xs shadow-inner">
                                <SelectValue placeholder="City" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#1a1a1a] border-[#333] text-white">
                                {cities.map(city => (
                                    <SelectItem key={city.city_id} value={city.city_name}>{city.city_name}</SelectItem>
                                ))}
                                {cities.length === 0 && <SelectItem value="New York">New York</SelectItem>}
                            </SelectContent>
                        </Select>
                        <ToggleGroup type="single" value={riskFilter} onValueChange={(val) => val && setRiskFilter(val)} className="bg-[#1a1a1a] border border-[#333] rounded-md p-0.5">
                            <ToggleGroupItem value="all" className="h-8 px-3 text-xs text-gray-400 data-[state=on]:bg-gray-800 data-[state=on]:text-white">Combined</ToggleGroupItem>
                        </ToggleGroup>
                    </div>
                </div>
            </div>

            <div className="p-6 w-full space-y-6">
                {/* 2. RISK POSTURE SUMMARY (KPIs) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {KPIS.map((kpi, idx) => {
                        const Icon = kpi.icon;
                        return (
                            <Card key={idx} className={`bg-[#111] border-l-4 ${kpi.border} border-y-[#222] border-r-[#222]`}>
                                <CardContent className="pt-6 pb-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">{kpi.title}</div>
                                            <div className="text-3xl font-bold text-white">{loading ? '...' : kpi.value}</div>
                                            <div className={`text-xs mt-1 ${kpi.color} font-medium`}>{kpi.sub}</div>
                                        </div>
                                        <div className={`p-2 rounded-lg bg-[#1a1a1a] ${kpi.color.replace('text-', 'text-opacity-80 ')}`}>
                                            <Icon className="w-5 h-5" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px] lg:h-[550px]">
                    {/* 3. INVENTORY RISK MATRIX */}
                    <Card className="lg:col-span-2 bg-[#111] border-[#333] flex flex-col">
                        <CardHeader className="pb-2 border-b border-[#222]">
                            <CardTitle className="text-white text-lg">Risk Matrix</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 min-h-0 pt-4 flex items-center justify-center text-gray-600">
                            <div className="text-center">
                                <Activity className="w-12 h-12 mb-4 mx-auto opacity-20" />
                                <p className="text-sm">Scatter visualization pending cluster normalization...</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 5. DRIVERS & CONTEXT */}
                    <div className="space-y-6 flex flex-col h-full">
                        <Card className="bg-[#111] border-[#333] flex-1">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-white text-base">Risk Drivers</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {weatherImpact && (
                                    <div className={`p-3 rounded border ${weatherImpact === 'Extreme Deviation' ? 'border-red-900 bg-red-900/10' : 'border-[#333] bg-[#1a1a1a]'}`}>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Weather Intelligence</span>
                                            <Badge variant="outline" className={`${weatherImpact === 'Extreme Deviation' ? 'text-red-400 border-red-900' : 'text-green-400 border-green-900'} text-[10px]`}>
                                                {weatherImpact}
                                            </Badge>
                                        </div>
                                        <div className="text-[10px] text-gray-500 italic leading-snug">
                                            {weatherImpact === 'Extreme Deviation'
                                                ? 'Detected significant temperature shift impacting perishable SKUs.'
                                                : 'Weather signals are currently tracking within seasonal norms.'}
                                        </div>
                                    </div>
                                )}
                                <div className="bg-[#1a1a1a] p-3 rounded border border-[#333]">
                                    <div className="text-xs text-gray-400 leading-relaxed">
                                        Surfaced risks are derived from the <span className="text-blue-400 font-medium">95% uncertainty bands</span> of the Prophet ensemble. Volatility tiering is automated based on variance magnitude.
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-[#151515] border border-blue-900/30">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-semibold text-blue-400 flex items-center">
                                    <Zap className="w-4 h-4 mr-2" /> AI Recommendation
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pb-4">
                                <p className="text-xs text-gray-300 mb-3">Adjusting safety stock to match the 90th percentile demand forecast is recommended for High severity items.</p>
                                <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700 h-8 text-xs">Authorize Rebalancing</Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* 4. CRITICAL SKU QUEUE */}
                <Card className="bg-[#111] border-[#333]">
                    <CardHeader className="py-4 border-b border-[#222]">
                        <CardTitle className="text-white text-lg">Critical Intelligence Alerts</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-[#222] hover:bg-transparent">
                                    <TableHead className="text-gray-400 h-10">SKU Name</TableHead>
                                    <TableHead className="text-gray-400 h-10">Risk Type</TableHead>
                                    <TableHead className="text-gray-400 h-10">Severity</TableHead>
                                    <TableHead className="text-gray-400 h-10">Driver</TableHead>
                                    <TableHead className="text-gray-400 h-10 text-right">Confidence</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow className="border-[#222]">
                                        <TableCell colSpan={5} className="text-center py-20 text-gray-500 italic">Analysing demand volatility signatures...</TableCell>
                                    </TableRow>
                                ) : risks.map((row) => (
                                    <TableRow key={row.id} className="border-[#222] hover:bg-[#1a1a1a]">
                                        <TableCell className="font-medium text-white">{row.sku}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={`border-${getRiskColor(row.risk).replace('#', '')} text-white`}>
                                                {row.risk}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <span className={`${row.severity === 'High' ? 'text-red-500 font-bold' : 'text-yellow-500'} text-xs`}>{row.severity}</span>
                                        </TableCell>
                                        <TableCell className="text-gray-400 text-xs">{row.driver}</TableCell>
                                        <TableCell className="text-right text-blue-400 font-mono text-xs">{row.confidence}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default InventoryRiskPage;
