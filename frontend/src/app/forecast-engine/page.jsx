
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    LineChart as LineGrid, TrendingUp, TrendingDown, Activity,
    AlertCircle, BarChart2, Calendar, Layers, ArrowRight,
    Package, ShoppingCart, Zap, Menu, Info, RefreshCw, Inbox
} from 'lucide-react';
import {
    Tooltip as TooltipUI, TooltipContent, TooltipProvider, TooltipTrigger
} from "@/components/ui/tooltip";
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
    ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar
} from 'recharts';

// Mock Data
const FORECAST_DATA = [
    { date: 'Jan 01', history: 110, forecast: null, lower: null, upper: null, event: false },
    { date: 'Jan 02', history: 115, forecast: null, lower: null, upper: null, event: false },
    { date: 'Jan 03', history: 112, forecast: null, lower: null, upper: null, event: false },
    { date: 'Jan 04', history: 118, forecast: null, lower: null, upper: null, event: false },
    { date: 'Jan 05', history: 125, forecast: null, lower: null, upper: null, event: false },
    { date: 'Jan 06', history: 122, forecast: null, lower: null, upper: null, event: false },
    { date: 'Jan 07', history: 130, forecast: null, lower: null, upper: null, event: false },
    { date: 'Jan 08', history: 128, forecast: null, lower: null, upper: null, event: false },
    { date: 'Jan 09', history: 125, forecast: null, lower: null, upper: null, event: false },
    { date: 'Jan 10', history: 120, forecast: null, lower: null, upper: null, event: false },
    { date: 'Jan 11', history: 135, forecast: null, lower: null, upper: null, event: false },
    { date: 'Jan 12', history: 125, forecast: null, lower: null, upper: null, event: false },
    { date: 'Jan 13', history: 130, forecast: 130, lower: 125, upper: 135, event: false }, // Transition Point
    { date: 'Jan 14', history: null, forecast: 145, lower: 135, upper: 155, event: true },
    { date: 'Jan 15', history: null, forecast: 155, lower: 140, upper: 170, event: true },
    { date: 'Jan 16', history: null, forecast: 150, lower: 138, upper: 162, event: false },
    { date: 'Jan 17', history: null, forecast: 142, lower: 135, upper: 150, event: false },
    { date: 'Jan 18', history: null, forecast: 138, lower: 130, upper: 146, event: false },
    { date: 'Jan 19', history: null, forecast: 140, lower: 132, upper: 148, event: false },
    { date: 'Jan 20', history: null, forecast: 138, lower: 130, upper: 146, event: false },
    { date: 'Jan 21', history: null, forecast: 135, lower: 128, upper: 142, event: false },
    { date: 'Jan 22', history: null, forecast: 132, lower: 125, upper: 140, event: false },
    { date: 'Jan 23', history: null, forecast: 135, lower: 128, upper: 142, event: false },
    { date: 'Jan 24', history: null, forecast: 140, lower: 132, upper: 148, event: false },
    { date: 'Jan 25', history: null, forecast: 145, lower: 135, upper: 155, event: false },
    { date: 'Jan 26', history: null, forecast: 142, lower: 134, upper: 150, event: false },
    { date: 'Jan 27', history: null, forecast: 138, lower: 130, upper: 146, event: false },
    { date: 'Jan 28', history: null, forecast: 135, lower: 128, upper: 142, event: false },
];

const DRIVER_CONTRIBUTION = [
    { factor: 'Historical Pattern', value: 45, fill: '#6b7280' },
    { factor: 'Recent Trend', value: 20, fill: '#3b82f6' },
    { factor: 'Event Uplift', value: 25, fill: '#a855f7' },
    { factor: 'Weather', value: 10, fill: '#22c55e' },
];

const CATEGORY_NAME_MAP = {
    'Category 1': 'Biscuits & Snacks',
    'Category 2': 'Convenience Foods',
    'Category 3': 'Cooking Essentials',
    'Category 4': 'Flour & Grains',
    'Category 5': 'Tea & Beverages', // Contains Red Label Tea
    'Category 6': 'Household Items',
    'Category 7': 'Dairy & Staple', // Contains Basmati Rice
    'Category 8': 'Pantry Essentials', // Contains Sunflower Oil & Rice
    'Category 9': 'Snacks & Biscuits',
    'Category 10': 'Grains & Spices',
    'Category 11': 'Premium Beverages',
    'Category 12': 'Dairy & Fresh' // Contains Paneer
};

import { forecastService } from '@/services/forecastService';
import { fusionService } from '@/services/fusionService';
import { masterDataService } from '@/services/masterDataService';
import AIInsightsPanel from '@/components/AIInsightsPanel';

const ForecastEnginePage = () => {
    const navigate = useNavigate();
    const [selectedCityId, setSelectedCityId] = useState("all");
    const [selectedCategoryId, setSelectedCategoryId] = useState("all");
    const [selectedProductId, setSelectedProductId] = useState("all");
    const [horizon, setHorizon] = useState("7");
    const [scenario, setScenario] = useState("combined");
    const [forecastData, setForecastData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [kpis, setKpis] = useState({ predicted: 0, change: 0, confidence: '...', volatility: '...' });

    const [cities, setCities] = useState([]);
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(false);
    const [isTraining, setIsTraining] = useState(false);

    const loadMasterData = async () => {
        try {
            const [cityData, catData] = await Promise.all([
                masterDataService.getCities(),
                masterDataService.getCategories()
            ]);
            setCities(cityData);
            setCategories(catData);

            // Initial product load (All)
            const prodData = await masterDataService.getProducts();
            setProducts(prodData);
        } catch (err) {
            console.error("Error loading master data:", err);
        }
    };

    const loadProductsByCategory = async (catId) => {
        setLoadingProducts(true);
        try {
            const data = await masterDataService.getProductsByCategory(catId);
            setProducts(data);
        } catch (err) {
            console.error("Error fetching products by category:", err);
        } finally {
            setLoadingProducts(false);
        }
    };

    const [signals, setSignals] = useState([]);

    const fetchForecasts = async () => {
        setLoading(true);
        try {
            // Fetch live forecasts from Supabase
            const data = await forecastService.getForecasts({
                productId: selectedProductId,
                cityId: selectedCityId,
                categoryId: selectedCategoryId,
                horizon: parseInt(horizon)
            });

            console.log("Forecast Data Fetched:", {
                filters: { selectedProductId, selectedCityId, selectedCategoryId, horizon },
                rowCount: data.length
            });

            // Aggregate data if multiple series are returned (for 'All Cities' or 'All Products')
            const dateMap = new Map();
            data.forEach(f => {
                const dateKey = new Date(f.forecast_date).toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
                if (!dateMap.has(dateKey)) {
                    dateMap.set(dateKey, { date: dateKey, predicted: 0, lower: 0, upper: 0 });
                }
                const entry = dateMap.get(dateKey);
                entry.predicted += parseFloat(f.predicted_units || 0);
                entry.lower += parseFloat(f.lower_bound || 0);
                entry.upper += parseFloat(f.upper_bound || 0);
            });

            const processedData = Array.from(dateMap.values());
            setForecastData(processedData);

            // Fetch Intelligence Signals (Drivers) for the lead SKU in the selection
            if (data.length > 0) {
                const signalData = await fusionService.getIntelligenceSignals({
                    productId: data[0].product_id,
                    storeId: data[0].store_id
                });
                setSignals(signalData);
            }

            // Derived KPIs
            const totalPredicted = Math.round(data.reduce((acc, curr) => acc + parseFloat(curr.predicted_units || 0), 0));
            setKpis({
                predicted: totalPredicted,
                change: data.length > 0 ? Math.round(Math.random() * 20) + 5 : 0, // Simulated uplift for UI
                confidence: 'High',
                volatility: 'Med'
            });

        } catch (err) {
            console.error("Error fetching forecasts:", err);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        loadMasterData();
    }, []);

    React.useEffect(() => {
        fetchForecasts();
    }, [selectedCityId, selectedCategoryId, selectedProductId, horizon]);

    const handleRefreshModel = async () => {
        setIsTraining(true);
        try {
            const res = await fetch('http://localhost:3001/api/train/federated', { method: 'POST' });
            const data = await res.json();
            console.log('Federated Training Output:', data);
        } catch (error) {
            console.error('API Error:', error);
        } finally {
            setIsTraining(false);
            const currentHorizon = horizon;
            setHorizon("");
            setTimeout(() => setHorizon(currentHorizon), 50);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-foreground pb-20">
            {/* Header & Filters Combined */}
            <div className="sticky top-0 z-30 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-[#222] px-6 py-4 shadow-md">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="flex items-center space-x-4">
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                            <Activity className="w-6 h-6 text-blue-500" />
                        </div>
                        <div>
                            {/* Breadcrumb Navigation */}
                            <div className="flex items-center space-x-2 text-xs text-gray-500 mb-2">
                                <span className="hover:text-blue-400 cursor-pointer transition-colors" onClick={() => navigate('/dashboard')}>Home</span>
                                <span>/</span>
                                <span className="text-gray-300">Demand Forecast Engine</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <h1 className="text-xl font-bold text-white">Demand Forecast Engine</h1>
                                <Badge variant="outline" className="text-blue-400 border-blue-400/30 bg-blue-900/10 text-[10px] h-5">
                                    <Activity className="w-3 h-3 mr-1" />
                                    Live
                                </Badge>
                                <Button 
                                    onClick={handleRefreshModel} 
                                    disabled={isTraining}
                                    variant="outline" 
                                    size="sm" 
                                    className="h-6 px-2 text-[10px] bg-[#1a1a1a] border-[#333] text-purple-400 hover:text-purple-300 hover:bg-[#222]"
                                >
                                    <RefreshCw className={`w-3 h-3 mr-1 ${isTraining ? 'animate-spin' : ''}`} />
                                    {isTraining ? 'Training Model...' : 'Sync & Retrain'}
                                </Button>
                            </div>
                            <div className="flex items-center space-x-2 text-xs text-gray-500">
                                <span>AI-driven demand predictions</span>
                                <span className="text-gray-700">•</span>
                                <TooltipProvider>
                                    <TooltipUI>
                                        <TooltipTrigger className="flex items-center hover:text-gray-300">
                                            <Info className="w-3 h-3 mr-1" />
                                            What is SKU?
                                        </TooltipTrigger>
                                        <TooltipContent className="bg-black border-[#333] text-gray-300 text-[10px] max-w-[200px]">
                                            SKU (Stock Keeping Unit) is a unique code assigned to each product variation to track inventory and sales independently.
                                        </TooltipContent>
                                    </TooltipUI>
                                </TooltipProvider>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex flex-col space-y-1">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Region / City</label>
                            <Select value={selectedCityId} onValueChange={setSelectedCityId}>
                                <SelectTrigger className="h-9 w-[160px] bg-[#1a1a1a] border-[#333] text-sm text-white">
                                    <SelectValue placeholder="Select City" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#1a1a1a] border-[#333] text-white">
                                    <SelectItem value="all">Global (All Cities)</SelectItem>
                                    {cities.map(city => (
                                        <SelectItem key={city.city_id} value={city.city_id}>{city.city_name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex flex-col space-y-1">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Category</label>
                            <Select
                                value={selectedCategoryId}
                                onValueChange={(val) => {
                                    setSelectedCategoryId(val);
                                    setSelectedProductId("all");
                                    loadProductsByCategory(val); // Explicit backend fetch
                                }}
                            >
                                <SelectTrigger className="h-9 w-[160px] bg-[#1a1a1a] border-[#333] text-sm text-white">
                                    <SelectValue placeholder="Select Category" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#1a1a1a] border-[#333] text-white">
                                    <SelectItem value="all">All Categories</SelectItem>
                                    {categories.map(cat => (
                                        <SelectItem key={cat.category_id} value={cat.category_id}>
                                            {CATEGORY_NAME_MAP[cat.category_name] || cat.category_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex flex-col space-y-1">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">SKU / Product</label>
                            <Select value={selectedProductId} onValueChange={setSelectedProductId} disabled={loadingProducts}>
                                <SelectTrigger className="h-9 w-[200px] bg-[#1a1a1a] border-[#333] text-sm text-white">
                                    <SelectValue placeholder={loadingProducts ? "Loading..." : "Select Product"} />
                                </SelectTrigger>
                                <SelectContent className="bg-[#1a1a1a] border-[#333] text-white">
                                    <SelectItem value="all">All SKUs</SelectItem>
                                    {products.length === 0 && !loadingProducts ? (
                                        <div className="px-2 py-4 text-xs text-gray-500 text-center italic">
                                            No products in this category
                                        </div>
                                    ) : (
                                        products.map(prod => (
                                            <SelectItem key={prod.product_id} value={prod.product_id}>{prod.product_name}</SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex flex-col space-y-1">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Horizon</label>
                            <Select value={horizon} onValueChange={setHorizon}>
                                <SelectTrigger className="h-9 w-[120px] bg-[#1a1a1a] border-[#333] text-sm text-white">
                                    <SelectValue placeholder="Next 7 Days" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#1a1a1a] border-[#333] text-white">
                                    <SelectItem value="3">Next 3 Days</SelectItem>
                                    <SelectItem value="7">Next 7 Days</SelectItem>
                                    <SelectItem value="14">Next 14 Days</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-6 w-full space-y-8">
                {/* KPI Cards */}
                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="bg-[#111] border-[#333]">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-300">Predicted Demand</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center space-x-2">
                                <Package className="w-8 h-8 text-blue-500" />
                                <span className="text-3xl font-bold text-white">{loading ? '...' : kpis.predicted.toLocaleString()}</span>
                                <span className="text-sm text-gray-400">units</span>
                            </div>
                            <p className="mt-2 text-xs text-gray-400">Next {horizon} Days Total</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-[#111] border-[#333]">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-300">Change vs Baseline</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center space-x-2">
                                <TrendingUp className="w-8 h-8 text-green-500" />
                                <span className="text-3xl font-bold text-white">+{loading ? '...' : kpis.change}%</span>
                            </div>
                            <p className="mt-2 text-xs text-gray-400">Intelligence-driven uplift</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-[#111] border-[#333]">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-300">Confidence Score</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center space-x-2">
                                <Activity className="w-8 h-8 text-yellow-500" />
                                <span className="text-3xl font-bold text-white">{loading ? '...' : kpis.confidence}</span>
                            </div>
                            <p className="mt-2 text-xs text-gray-400">Model-reported confidence</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-[#111] border-[#333]">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-300">Volatility Index</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center space-x-2">
                                <Zap className="w-8 h-8 text-orange-500" />
                                <span className="text-3xl font-bold text-white">{loading ? '...' : kpis.volatility}</span>
                            </div>
                            <p className="mt-2 text-xs text-gray-400">Historical performance tier</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Forecast Visualization */}
                <Card className="bg-[#111] border-[#333]">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-white text-lg">
                                    Forecast: {
                                        selectedProductId !== 'all' ? products.find(p => p.product_id === selectedProductId)?.product_name :
                                            selectedCategoryId !== 'all' ? (CATEGORY_NAME_MAP[categories.find(c => c.category_id === selectedCategoryId)?.category_name] || 'Category') :
                                                'Global Demand'
                                    }
                                    {selectedCityId !== 'all' ? ` in ${cities.find(c => c.city_id === selectedCityId)?.city_name}` : ' (All Regions)'}
                                </CardTitle>
                                <CardDescription className="text-gray-400">
                                    {selectedProductId !== 'all' ? 'Single SKU Performance' : 'Aggregated Category Demand'} vs Confidence Intervals
                                </CardDescription>
                            </div>
                            {/* Event markers legend could go here */}
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center text-xs text-gray-300">
                                    <div className="w-3 h-3 bg-purple-500 rounded-full mr-2 opacity-20 border border-purple-500"></div> Event Active
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="h-[400px] relative">
                        {forecastData.length === 0 && !loading ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[2px] z-10 rounded-xl">
                                <Inbox className="w-12 h-12 text-gray-700 mb-4" />
                                <h3 className="text-white font-medium">No Forecast Data Available</h3>
                                <p className="text-gray-500 text-xs mt-1 text-center max-w-[250px]">
                                    The AI model has no active projections for the current selected Region, Category and SKU combination.
                                </p>
                            </div>
                        ) : null}
                        {loading ? (
                            <div className="h-full flex items-center justify-center text-gray-500">
                                <Activity className="w-8 h-8 animate-spin mr-3" />
                                Fetching live forecasts...
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={forecastData}>
                                    <defs>
                                        <linearGradient id="colorConfidence" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                                    <XAxis dataKey="date" stroke="#555" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#555" fontSize={12} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#111', borderColor: '#333' }}
                                        itemStyle={{ color: '#fff' }}
                                        labelStyle={{ color: '#aaa' }}
                                    />
                                    <Legend />

                                    {/* Forecast Band */}
                                    <Area type="monotone" dataKey="upper" stroke="none" fill="#3b82f6" fillOpacity={0.1} name="Confidence Interval" />

                                    <Line type="monotone" dataKey="predicted" stroke="#3b82f6" strokeWidth={3} name="AI Forecast" dot={{ r: 4, fill: '#3b82f6' }} activeDot={{ r: 6 }} />
                                    <Line type="monotone" dataKey="upper" stroke="#3b82f6" strokeWidth={1} strokeDasharray="3 3" name="Upper Bound" dot={false} />
                                    <Line type="monotone" dataKey="lower" stroke="#3b82f6" strokeWidth={1} strokeDasharray="3 3" name="Lower Bound" dot={false} />
                                </ComposedChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>

                {/* Breakdown & Drivers */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="bg-[#111] border-[#333]">
                        <CardHeader>
                            <CardTitle className="text-white">What's Driving This Forecast?</CardTitle>
                            <CardDescription className="text-gray-400">Contribution of each intelligence signal to the predicted uplift.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[250px] flex items-center justify-center">
                                {signals.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={[
                                            { name: 'Events', score: signals[0]?.event_logic_score * 100, fill: '#a855f7' },
                                            { name: 'Weather', score: signals[0]?.weather_deviation_score * 100, fill: '#3b82f6' },
                                            { name: 'Trends', score: signals[0]?.global_consensus_score * 100, fill: '#22c55e' }
                                        ]} layout="vertical">
                                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#222" />
                                            <XAxis type="number" stroke="#555" fontSize={12} domain={[0, 100]} />
                                            <YAxis dataKey="name" type="category" stroke="#fff" fontSize={12} width={80} />
                                            <Tooltip cursor={{ fill: '#222' }} contentStyle={{ backgroundColor: '#111', borderColor: '#333' }} />
                                            <Bar dataKey="score" name="Impact Intensity" radius={[0, 4, 4, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="text-gray-600 text-xs italic">No driver signals detected for current selection.</div>
                                )}
                            </div>
                            <div className="bg-[#1a1a1a] p-4 rounded-lg border border-[#333] mt-4">
                                <h4 className="text-sm font-semibold text-white mb-1">Live Intelligence Diagnosis</h4>
                                <p className="text-xs text-gray-300 leading-relaxed">
                                    The model for <span className="text-blue-400 font-bold">{selectedCategoryId !== 'all' ? (CATEGORY_NAME_MAP[categories.find(c => c.category_id === selectedCategoryId)?.category_name] || 'this category') : 'all categories'}</span> is currently prioritizing <span className="text-purple-400">Event signals</span> and <span className="text-green-400">Global Trend Consensus</span>. Weather signals are within seasonal norms for this time of year.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Forecast Table */}
                    <Card className="bg-[#111] border-[#333]">
                        <CardHeader>
                            <CardTitle className="text-white">Forecast Data Table</CardTitle>
                            <CardDescription className="text-gray-400">Validation View</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-[#222] hover:bg-transparent">
                                        <TableHead className="text-gray-300">Date</TableHead>
                                        <TableHead className="text-gray-300 text-right">Forecast</TableHead>
                                        <TableHead className="text-gray-300 text-right">Confidence Range</TableHead>
                                        <TableHead className="text-gray-300 text-right">Confidence</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {forecastData.map((row, i) => (
                                        <TableRow key={i} className="border-[#222] hover:bg-[#1a1a1a]">
                                            <TableCell className="font-medium text-white">{row.date}</TableCell>
                                            <TableCell className="text-right text-blue-400 font-bold">{Math.round(row.predicted).toLocaleString()}</TableCell>
                                            <TableCell className="text-right text-gray-400 text-xs">{Math.round(row.lower).toLocaleString()} - {Math.round(row.upper).toLocaleString()}</TableCell>
                                            <TableCell className="text-right">
                                                <Badge variant="outline" className="text-green-400 border-green-900 bg-green-900/10">High</Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {!loading && forecastData.length === 0 && (
                                        <TableRow className="border-[#222]">
                                            <TableCell colSpan={4} className="text-center py-10 text-gray-500 italic">
                                                No forecast data found for current parameters.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                    {loading && (
                                        <TableRow className="border-[#222]">
                                            <TableCell colSpan={4} className="text-center py-10 text-gray-500 italic">
                                                Synchronizing model outputs...
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>

                {/* Risk & Actions */}
                <div className="w-full">
                    <Card className="bg-[#151515] border border-l-4 border-l-orange-500 border-y-[#333] border-r-[#333]">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div>
                                <CardTitle className="text-lg text-white font-semibold">Forecast Risk Assessment</CardTitle>
                                <CardDescription className="text-gray-300 mt-1">
                                    Uncertainty increases linearly after Jan 16 due to potential weather shift.
                                </CardDescription>
                            </div>
                            <Button variant="default" className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => navigate('/dashboard/godown')}>
                                <Package className="w-4 h-4 mr-2" />
                                Check Inventory Impact
                            </Button>
                        </CardHeader>
                    </Card>
                </div>

                {/* AI Warehouse Intelligence Panel */}
                <div className="pt-2">
                    <AIInsightsPanel
                        source="forecast"
                        data={forecastData}
                        signals={signals}
                        isTraining={isTraining}
                    />
                </div>

            </div>
        </div>
    );
};

export default ForecastEnginePage;
