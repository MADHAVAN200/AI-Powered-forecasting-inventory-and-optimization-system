
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    GitBranch, RefreshCw, Save, Play, AlertTriangle,
    TrendingUp, ArrowRight, Package, Layers, Activity,
    Sliders, Thermometer, Calendar, Home, Clock, ShieldCheck,
    CheckCircle2, Info, ArrowDown, ArrowUp, BarChart3
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
import { Slider } from '@/components/ui/slider';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area,
    BarChart, Bar, PieChart, Pie, Cell, ComposedChart
} from 'recharts';
import {
    Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink,
    BreadcrumbPage, BreadcrumbSeparator
} from '@/components/ui/breadcrumb';

// Services
import { forecastService } from '@/services/forecastService';
import { eventService } from '@/services/eventService';
import { masterDataService } from '@/services/masterDataService';

const ScenarioPlanningPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const fromControlTower = queryParams.get('from') === 'control-tower';
    const eventIdParam = queryParams.get('event_id');

    // --- STATE ---
    const [selectedCity, setSelectedCity] = useState("New York");
    const [loading, setLoading] = useState(true);
    const [cities, setCities] = useState([]);
    const [liveEvents, setLiveEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);
    
    // --- SIMULATION CONTROLS ---
    const [demandModifier, setDemandModifier] = useState([0]); // % shift
    const [leadTimeDelay, setLeadTimeDelay] = useState([0]); // days
    const [serviceLevel, setServiceLevel] = useState([95]); // % target
    const [stockingPolicy, setStockingPolicy] = useState("balanced"); // lean, balanced, buffer
    const [weatherImpact, setWeatherImpact] = useState("normal");
    const [eventScenario, setEventScenario] = useState("Standard_7d");
    const [trendShift, setTrendShift] = useState("none");
    const [promoLift, setPromoLift] = useState([0]); // % lift
    const [bufferDays, setBufferDays] = useState([3]); // days coverage

    // --- DATA ---
    const [baselineData, setBaselineData] = useState([]);
    const [displayedResults, setDisplayedResults] = useState([]);
    const [costResults, setCostResults] = useState([]);
    const [healthResults, setHealthResults] = useState([]);
    const [stats, setStats] = useState({ delta: 0, stockoutProb: 0, peakDemand: 0 });
    const [simulating, setSimulating] = useState(false);
    
    // Initialize Master Data
    useEffect(() => {
        const init = async () => {
            try {
                const cityData = await masterDataService.getCities();
                setCities(cityData);
                
                // Fetch events
                const events = await eventService.getEventSignals(null);
                setLiveEvents(events);
                
                if (eventIdParam) {
                    const event = events.find(e => e.event_id === eventIdParam);
                    if (event) {
                        setSelectedEvent(event);
                        setDemandModifier([Math.round(event.impact_score * 8)]);
                        setEventScenario("Event_Spike");
                    }
                }
            } catch (err) {
                console.error("Initialization error:", err);
            }
        };
        init();
    }, [eventIdParam]);

    // Fetch Baseline
    const fetchBaseline = async () => {
        setLoading(true);
        try {
            const { data: prods } = await masterDataService.getProducts();
            let targetProductId = prods?.[0]?.product_id || 'ec161c94-0820-4107-889a-006263720743';

            const data = await forecastService.getScenarioComparison({
                productId: targetProductId,
                scenarios: [eventScenario, 'Standard_7d']
            });
            
            // Limit to Current Date + 5 Days
            const todayStr = new Date().toISOString().split('T')[0];
            const fiveDaysLater = new Date();
            fiveDaysLater.setDate(fiveDaysLater.getDate() + 5);
            const endDateStr = fiveDaysLater.toISOString().split('T')[0];

            const filtered = data
                .filter(d => d.forecast_date >= todayStr && d.forecast_date <= endDateStr)
                .sort((a,b) => new Date(a.forecast_date) - new Date(b.forecast_date));
            
            setBaselineData(filtered);
            
            // Initial auto-simulation on first load
            calculateSimulation(filtered);
        } catch (err) {
            console.error("Baseline fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (cities.length > 0) {
            fetchBaseline();
        }
    }, [selectedCity, cities, eventScenario]);

    const calculateSimulation = (baseData = baselineData) => {
        if (!baseData.length) return;

        const modifier = 1 + (demandModifier[0] / 100);
        const promoFactor = 1 + (promoLift[0] / 100);
        const policyFactor = stockingPolicy === 'lean' ? 0.85 : stockingPolicy === 'balanced' ? 1.3 : 1.0;
        const trendFactor = trendShift === 'expansion' ? 1.15 : trendShift === 'decline' ? 0.85 : 1.0;
        
        let rollingStock = baseData[0].predicted_units * 2.5; // Initial stock assumption
        let healthCounts = { optimal: 0, risk: 0, stockout: 0 };
        let costTotal = { procurement: 0, transit: 0, holding: 0 };

        const results = baseData.map((d, i) => {
            const base = d.predicted_units;
            const scenarioDemand = Math.round(base * modifier * promoFactor * trendFactor);
            
            const zScore = serviceLevel[0] >= 99 ? 2.33 : serviceLevel[0] >= 95 ? 1.65 : 1.28;
            const variance = base * 0.15;
            const totalLeadTime = bufferDays[0] + leadTimeDelay[0];
            
            const requiredSafetyStock = Math.round(zScore * variance * Math.sqrt(totalLeadTime) * policyFactor);
            
            // Terminology Logic: Actual Required vs Actual Stock
            const actualRequired = scenarioDemand + requiredSafetyStock;
            rollingStock = Math.max(0, rollingStock - scenarioDemand + (i % 3 === 0 ? actualRequired * 0.8 : 0)); // Simulated arrival
            
            const risk = rollingStock < actualRequired ? 'High' : (rollingStock < actualRequired * 1.2 ? 'Moderate' : 'Low');
            if (risk === 'High') healthCounts.stockout++;
            else if (risk === 'Moderate') healthCounts.risk++;
            else healthCounts.optimal++;

            // Cost Simulation (₹)
            costTotal.procurement += actualRequired * 450;
            costTotal.transit += actualRequired * 80;
            costTotal.holding += rollingStock * 30;

            return {
                date: new Date(d.forecast_date).toLocaleDateString('en-US', { month: 'short', day: '2-digit' }),
                baseline: base,
                actualRequired: actualRequired,
                actualStock: Math.round(rollingStock),
                safetyStock: requiredSafetyStock,
                risk: risk
            };
        });

        setDisplayedResults(results);
        setCostResults([
            { name: 'Procurement', value: costTotal.procurement / 100000 },
            { name: 'Transit', value: costTotal.transit / 100000 },
            { name: 'Holding', value: costTotal.holding / 100000 }
        ]);
        setHealthResults([
            { name: 'Optimal', value: healthCounts.optimal, color: '#10b981' },
            { name: 'At Risk', value: healthCounts.risk, color: '#f59e0b' },
            { name: 'Deficit', value: healthCounts.stockout, color: '#ef4444' }
        ]);

        // Update Stats
        const totalBase = results.reduce((acc, d) => acc + d.baseline, 0);
        const totalScan = results.reduce((acc, d) => acc + d.actualRequired, 0);
        const delta = ((totalScan - totalBase) / totalBase) * 100;
        const prob = Math.max(0, (100 - serviceLevel[0]) + (leadTimeDelay[0] * 5));

        setStats({
            delta: delta.toFixed(1),
            stockoutProb: Math.min(prob, 100).toFixed(0),
            peakDemand: Math.max(...results.map(d => d.actualRequired))
        });
    };

    useEffect(() => {
        if (baselineData.length > 0) {
            calculateSimulation();
        }
    }, [demandModifier, leadTimeDelay, serviceLevel, stockingPolicy, weatherImpact, trendShift, promoLift, bufferDays]);

    const runNewSimulation = async () => {
        setSimulating(true);
        await new Promise(resolve => setTimeout(resolve, 800));
        calculateSimulation();
        setSimulating(false);
    };

    const resetToBaseline = () => {
        setDemandModifier([0]);
        setLeadTimeDelay([0]);
        setServiceLevel([95]);
        setStockingPolicy("balanced");
        setWeatherImpact("normal");
        setPromoLift([0]);
        setBufferDays([3]);
        setTrendShift("none");
        setEventScenario("Standard_7d");
        // The above state changes will trigger the useEffect to re-calculate stats immediately
    };

    const handleSaveScenario = () => {
        alert("Scenario parameters committed to ERP sync. Optimization ₹ totals updated.");
    };

    return (
        <div className="min-h-screen bg-background text-foreground pb-20">
            {/* Header */}
            <div className="bg-card border-b border-border px-6 py-4 sticky top-0 z-40 backdrop-blur-md bg-card/90">
                <div className="mb-2">
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink onClick={() => navigate('/')} className="flex items-center gap-1 text-gray-500 hover:text-blue-400 cursor-pointer text-[11px]">
                                    <Home className="w-3 h-3" /> Home
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator className="text-gray-600" />
                            {fromControlTower && (
                                <><BreadcrumbItem>
                                    <BreadcrumbLink onClick={() => navigate('/control-tower')} className="text-gray-500 hover:text-blue-400 cursor-pointer text-[11px]">
                                        Control Tower
                                    </BreadcrumbLink>
                                </BreadcrumbItem><BreadcrumbSeparator className="text-gray-600" /></>
                            )}
                            <BreadcrumbItem>
                                <BreadcrumbPage className="text-blue-400 text-[11px] font-medium">Scenario Planning</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>

                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-purple-500/10 rounded-lg border border-purple-500/20">
                            <GitBranch className="w-6 h-6 text-purple-500" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-foreground tracking-tight">Supply Chain Scenario Planning</h1>
                            <p className="text-muted-foreground text-xs mt-1">Multi-factor ERP simulation engine (₹ Localization).</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" className="h-9 border-border text-muted-foreground hover:text-foreground" onClick={resetToBaseline}>
                            <RefreshCw className="w-4 h-4 mr-2" /> Reset
                        </Button>
                        <Button className="h-9 bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20" onClick={handleSaveScenario}>
                            <Save className="w-4 h-4 mr-2" /> Commit Plan
                        </Button>
                    </div>
                </div>
            </div>

            {/* NEW: Horizontal Command Center */}
            <div className="bg-card/50 border-b border-border p-6 space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-6">
                    <div className="flex-1 min-w-[300px] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {/* Row 1: Primary Sliders */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-muted-foreground font-medium text-[11px] uppercase tracking-wider">Demand Shock</span>
                                <span className="font-bold text-blue-500 dark:text-blue-400">{demandModifier[0]}%</span>
                            </div>
                            <Slider value={demandModifier} onValueChange={setDemandModifier} min={-50} max={100} step={5} className="py-2" />
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-muted-foreground font-medium text-[11px] uppercase tracking-wider">Promotion Lift</span>
                                <span className="font-bold text-purple-600 dark:text-purple-400">{promoLift[0]}%</span>
                            </div>
                            <Slider value={promoLift} onValueChange={setPromoLift} min={0} max={50} step={5} className="py-2" />
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-muted-foreground font-medium text-[11px] uppercase tracking-wider">Lead Time Delay</span>
                                <span className="font-bold text-red-500 dark:text-red-400">+{leadTimeDelay[0]} Days</span>
                            </div>
                            <Slider value={leadTimeDelay} onValueChange={setLeadTimeDelay} min={0} max={10} step={1} className="py-2" />
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-muted-foreground font-medium text-[11px] uppercase tracking-wider">Buffer Coverage</span>
                                <span className="font-bold text-green-600 dark:text-green-400">{bufferDays[0]} Days</span>
                            </div>
                            <Slider value={bufferDays} onValueChange={setBufferDays} min={1} max={14} step={1} className="py-2" />
                        </div>
                    </div>

                    <div className="flex items-center gap-4 border-l border-border pl-6 h-full min-h-[60px]">
                        <div className="space-y-2 min-w-[140px]">
                            <label className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Weather Impact</label>
                            <Select value={weatherImpact} onValueChange={setWeatherImpact}>
                                <SelectTrigger className="bg-card border-border text-xs h-9">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-card border-border text-foreground text-xs">
                                    <SelectItem value="normal">Normal</SelectItem>
                                    <SelectItem value="mild">Mild</SelectItem>
                                    <SelectItem value="severe">Severe</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2 min-w-[140px]">
                            <label className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Event Scenario</label>
                            <Select value={eventScenario} onValueChange={setEventScenario}>
                                <SelectTrigger className="bg-card border-border text-xs h-9">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-card border-border text-foreground text-xs">
                                    <SelectItem value="Standard_7d">Standard</SelectItem>
                                    <SelectItem value="Event_Spike">Event Spike</SelectItem>
                                    <SelectItem value="Weather_Shock">Weather Anomaly</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="pt-6">
                            <Button 
                                className="bg-blue-600 hover:bg-blue-500 text-white font-bold h-10 px-6 shadow-lg shadow-blue-900/40" 
                                onClick={runNewSimulation}
                                disabled={simulating}
                            >
                                {simulating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 mr-2 fill-current" />}
                                {simulating ? 'Processing...' : 'Run Simulation'}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Summary Impact Strip */}
                <div className="flex items-center gap-4 bg-blue-500/5 p-4 rounded-xl border border-blue-500/10 overflow-x-auto custom-scrollbar">
                    <div className="flex items-center gap-3 pr-6 border-r border-blue-500/20">
                        <Activity className="w-5 h-5 text-blue-500" />
                        <div>
                            <p className="text-[10px] text-gray-500 uppercase font-bold">Summary Insights</p>
                            <p className="text-xs text-blue-400 font-medium">Scenario Impact Breakdown</p>
                        </div>
                    </div>
                    
                    <div className="flex gap-8 px-4">
                        <div className="flex flex-col">
                            <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-tight">Demand Delta</span>
                            <span className="text-xl font-bold text-foreground">{stats.delta}%</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-tight">Stockout Prob</span>
                            <span className="text-xl font-bold text-red-500">{stats.stockoutProb}%</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-tight">Peak Demand</span>
                            <span className="text-xl font-bold text-foreground">{Math.round(stats.peakDemand).toLocaleString()} <span className="text-[10px] text-muted-foreground font-normal">Units</span></span>
                        </div>
                    </div>

                    {selectedEvent && (
                        <div className="ml-auto flex items-center gap-3 bg-purple-500/10 px-4 py-2 rounded-lg border border-purple-500/20">
                            <Info className="w-4 h-4 text-purple-400" />
                            <span className="text-xs text-purple-400 font-bold">{selectedEvent.event_name} <span className="text-[10px] text-gray-500 ml-2 font-normal">Active Scenario</span></span>
                        </div>
                    )}
                </div>
            </div>

            {/* Results Output Area (Full Width) */}
            <main className="p-6 space-y-6 min-w-0 bg-[#070707]">
                
                {/* TOP ROW: Large Comparison Chart */}
                <Card className="bg-card border-border overflow-hidden">
                    <CardHeader className="border-b border-border py-4 px-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle className="text-xl text-foreground font-bold tracking-tight">Demand Fulfillment & Inventory Horizon</CardTitle>
                                <CardDescription className="text-xs text-muted-foreground">Comparing Base Demand Requirements vs Actual Required Stock Levels (₹ Localization)</CardDescription>
                            </div>
                            <div className="flex gap-2">
                                <Badge variant="outline" className="text-[10px] border-blue-500/30 text-blue-500 dark:text-blue-400">₹ Operational View</Badge>
                                <Badge variant="secondary" className="text-[10px] bg-green-500/10 text-green-600 dark:text-green-500 border-none">5-Day Forecast Active</Badge>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6 h-[450px]">
                        {loading || simulating ? (
                            <div className="h-full flex flex-col items-center justify-center text-muted-foreground bg-muted/20 rounded-xl border border-dashed border-border">
                                <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center mb-4">
                                    <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
                                </div>
                                <p className="text-sm font-medium">Synthesizing multi-factor scenarios...</p>
                                <p className="text-[11px] text-muted-foreground mt-1">Calculating service levels for {selectedCity}</p>
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={displayedResults}>
                                    <defs>
                                        <linearGradient id="colorStock" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorRequired" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} vertical={false} />
                                    <XAxis dataKey="date" stroke="currentColor" opacity={0.5} fontSize={11} tickLine={false} axisLine={false} dy={10} />
                                    <YAxis stroke="currentColor" opacity={0.5} fontSize={11} tickLine={false} axisLine={false} />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '12px', padding: '12px' }}
                                        itemStyle={{ fontSize: '12px', color: 'hsl(var(--foreground))' }}
                                    />
                                    <Legend verticalAlign="top" height={40} iconType="circle" wrapperStyle={{ fontSize: '11px', paddingBottom: '20px', color: 'hsl(var(--foreground))' }} />
                                    <Area type="monotone" dataKey="actualStock" fill="url(#colorStock)" stroke="#10b981" strokeWidth={2} name="Actual Stock Projection" />
                                    <Area type="monotone" dataKey="actualRequired" fill="url(#colorRequired)" stroke="#3b82f6" strokeWidth={3} name="Actual Required" />
                                    <Line type="monotone" dataKey="baseline" stroke="currentColor" opacity={0.3} strokeWidth={1} strokeDasharray="4 4" dot={false} name="Base Demand" />
                                    <Line type="stepAfter" dataKey="safetyStock" stroke="#ef4444" strokeWidth={1.5} dot={true} name="Safety Stock Buffer" />
                                </ComposedChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>

                {/* MIDDLE ROW: Multi-widgets to fill space */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    
                    {/* Cost Breakdown */}
                    <Card className="bg-card border-border">
                        <CardHeader className="pb-2 border-b border-border/50">
                            <CardTitle className="text-sm font-bold text-muted-foreground flex items-center gap-2">
                                <BarChart3 className="w-4 h-4 text-blue-500" />
                                Cost Distribution (₹ Lakhs)
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="h-[240px] pt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={costResults} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} horizontal={false} />
                                    <XAxis type="number" stroke="currentColor" opacity={0.5} fontSize={10} axisLine={false} tickLine={false} />
                                    <YAxis dataKey="name" type="category" stroke="currentColor" opacity={0.7} fontSize={11} width={80} axisLine={false} tickLine={false} />
                                    <Tooltip cursor={{fill: 'currentColor', opacity: 0.05}} contentStyle={{backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))'}} />
                                    <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} name="Cost" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Stock Health */}
                    <Card className="bg-card border-border">
                        <CardHeader className="pb-2 border-b border-border/50">
                            <CardTitle className="text-sm font-bold text-muted-foreground flex items-center gap-2">
                                <Activity className="w-4 h-4 text-green-500" />
                                Health Status Distribution
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="h-[240px] pt-4 flex items-center">
                            <div className="w-1/2 h-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={healthResults}
                                            innerRadius={45}
                                            outerRadius={65}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {healthResults.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="w-1/2 space-y-3 pl-4">
                                {healthResults.map((item, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                                        <span className="text-[11px] text-muted-foreground">{item.name}:</span>
                                        <span className="text-[11px] font-bold text-foreground">{item.value} Days</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Safety Stock Bars */}
                    <Card className="bg-card border-border">
                        <CardHeader className="pb-2 border-b border-border/50">
                            <CardTitle className="text-sm font-bold text-muted-foreground flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-red-500" />
                                Daily Safety Stock Depth
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 space-y-4 max-h-[240px] overflow-y-auto custom-scrollbar">
                            {displayedResults.map((d, i) => (
                                <div key={i} className="space-y-1">
                                    <div className="flex justify-between text-[10px]">
                                        <span className="text-muted-foreground">{d.date}</span>
                                        <span className="text-foreground font-bold">{d.safetyStock} Units</span>
                                    </div>
                                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-700`} 
                                            style={{ width: `${Math.min(100, (d.safetyStock / 250) * 100)}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                {/* BOTTOM ROW: Detailed Impact Table */}
                <Card className="bg-card border-border shadow-xl">
                    <CardHeader className="border-b border-border py-4">
                        <CardTitle className="text-base text-foreground font-bold tracking-tight">Financial Policy & Risk Assessment (₹ Localization)</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow className="border-border hover:bg-transparent">
                                    <TableHead className="text-muted-foreground text-[10px] font-bold uppercase py-4 pl-6">Metric Performance</TableHead>
                                    <TableHead className="text-muted-foreground text-[10px] font-bold uppercase py-4">Base Demand (Current)</TableHead>
                                    <TableHead className="text-blue-600 dark:text-blue-500 text-[10px] font-bold uppercase py-4">Actual Required (Scenario)</TableHead>
                                    <TableHead className="text-muted-foreground text-[10px] font-bold uppercase py-4">Financial Gap</TableHead>
                                    <TableHead className="text-muted-foreground text-[10px] font-bold uppercase py-4 text-right pr-6">Operational Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow className="border-border hover:bg-accent/40 transition-colors">
                                    <TableCell className="text-[13px] font-bold text-foreground pl-6 py-5">Avg. Inventory Valuation</TableCell>
                                    <TableCell className="text-[13px] text-muted-foreground">₹85.4 Lakhs</TableCell>
                                    <TableCell className="text-[13px] text-blue-600 dark:text-blue-400 font-extrabold">₹{(85.4 * (1 + Number(stats.delta)/100)).toFixed(2)} Lakhs</TableCell>
                                    <TableCell className="text-[11px] text-green-600 dark:text-green-400 font-bold">+{stats.delta}%</TableCell>
                                    <TableCell className="text-right pr-6">
                                        <Badge className="bg-green-500/10 text-green-600 dark:text-green-500 border border-green-500/20 text-[10px] uppercase font-bold px-3">Stable</Badge>
                                    </TableCell>
                                </TableRow>
                                <TableRow className="border-border hover:bg-accent/40 transition-colors">
                                    <TableCell className="text-[13px] font-bold text-foreground pl-6 py-5">Stockout Reliability Risk</TableCell>
                                    <TableCell className="text-[13px] text-muted-foreground">8.2% Nominal</TableCell>
                                    <TableCell className="text-[13px] text-red-600 dark:text-red-500 font-extrabold">{stats.stockoutProb}%</TableCell>
                                    <TableCell className="text-[11px] text-red-600 dark:text-red-400 font-bold">+{Number(stats.stockoutProb) - 8}% Variance</TableCell>
                                    <TableCell className="text-right pr-6">
                                        <Badge className={`text-[10px] uppercase font-bold px-3 border ${Number(stats.stockoutProb) > 30 ? 'bg-red-500/10 text-red-600 dark:text-red-500 border-red-500/20' : 'bg-orange-500/10 text-orange-600 dark:text-orange-500 border-orange-500/20'}`}>
                                            {Number(stats.stockoutProb) > 30 ? 'CRITICAL RISK' : 'ADVISORY MONITORING'}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                                <TableRow className="border-none hover:bg-accent/40 transition-colors">
                                    <TableCell className="text-[13px] font-bold text-foreground pl-6 py-5">ERP Re-allocation Overhead</TableCell>
                                    <TableCell className="text-[13px] text-muted-foreground">₹12.1 Lakhs</TableCell>
                                    <TableCell className="text-[13px] text-foreground font-extrabold">₹{(12.1 * (1.1 + Number(stats.delta)/150)).toFixed(2)} Lakhs</TableCell>
                                    <TableCell className="text-[11px] text-muted-foreground">Auto-Optimized</TableCell>
                                    <TableCell className="text-right pr-6">
                                        <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-500 border border-blue-500/20 text-[10px] uppercase font-bold px-3">Dynamic Reconciled</Badge>
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
};

export default ScenarioPlanningPage;
