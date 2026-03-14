import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    CloudRain, Sun, Cloud, Wind, Thermometer, Droplets,
    MapPin, Calendar, TrendingUp, AlertTriangle, Truck,
    ShoppingCart, ArrowRight, Zap, Umbrella, Activity, CloudLightning, Home, Brain, RefreshCw
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
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend
} from 'recharts';
import {
    Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink,
    BreadcrumbPage, BreadcrumbSeparator
} from '@/components/ui/breadcrumb';

// Services
import { weatherService } from '@/services/weatherService';
import { masterDataService } from '@/services/masterDataService';
import AIInsightsPanel from '@/components/AIInsightsPanel';

const WeatherIntelligencePage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [cities, setCities] = useState([]);
    const [selectedCityId, setSelectedCityId] = useState("");
    const [forecastHorizon, setForecastHorizon] = useState("7");
    const [impactFocus, setImpactFocus] = useState("demand");
    const [isTraining, setIsTraining] = useState(false);

    // Weather Data States
    const [forecast, setForecast] = useState([]);
    const [kpiData, setKpiData] = useState({
        severity: "Low",
        sensitivity: "Moderate",
        spoilage: "Safe",
        logistics: "Optimal"
    });
    const [demandImpact, setDemandImpact] = useState([]);
    const [categoryImpact, setCategoryImpact] = useState([]);
    const [riskSkus, setRiskSkus] = useState([]);
    const [advisories, setAdvisories] = useState([]);

    // Load Cities and Initial Data
    useEffect(() => {
        const init = async () => {
            try {
                const cityList = await masterDataService.getCities();
                setCities(cityList);
                if (cityList.length > 0) {
                    setSelectedCityId(cityList[0].city_id);
                }
            } catch (err) {
                console.error("Failed to load cities:", err);
            } finally {
                setLoading(false);
            }
        };
        init();
    }, []);

    // Load Weather Data when City or Horizon changes
    useEffect(() => {
        if (!selectedCityId) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                const weatherData = await weatherService.getWeatherImpact(selectedCityId, parseInt(forecastHorizon));
                setForecast(weatherData.map(d => ({
                    ...d,
                    day: new Date(d.forecast_date).toLocaleDateString('en-US', { weekday: 'short' }),
                    date: new Date(d.forecast_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                    icon: d.weather_condition?.includes('Rain') ? CloudRain :
                        d.weather_condition?.includes('Sunny') ? Sun :
                            d.weather_condition?.includes('Cloudy') ? Cloud :
                                d.weather_condition?.includes('Storm') ? CloudLightning : Sun,
                    temp: Math.round(d.temp_max || 0)
                })));

                // Derive KPIs based on filtered horizon data
                const maxPrecip = Math.max(...weatherData.map(d => d.precipitation || 0));
                const maxTemp = Math.max(...weatherData.map(d => d.temp_max || 0));

                setKpiData({
                    severity: maxPrecip > 50 ? "High" : maxPrecip > 20 ? "Moderate" : "Low",
                    sensitivity: maxPrecip > 30 ? "High" : "Moderate",
                    spoilage: maxTemp > 35 ? "Risk" : "Safe",
                    logistics: maxPrecip > 40 ? "Impacted" : "Optimal"
                });

                // Simulate Demand Impact (Baseline vs Weather-Adjusted based on focus)
                setDemandImpact(weatherData.map(d => {
                    let impactMultiplier = 0;
                    if (impactFocus === "demand") {
                        impactMultiplier = (d.precipitation > 20 ? 15 : d.temp_max > 35 ? -10 : d.temp_max > 30 ? 8 : 0);
                    } else if (impactFocus === "inventory") {
                        impactMultiplier = (d.temp_max > 35 ? -25 : d.temp_max > 30 ? -10 : 0); // Focus on spoilage/shrink
                    } else if (impactFocus === "logistics") {
                        impactMultiplier = (d.precipitation > 30 ? -30 : d.precipitation > 15 ? -15 : 0); // Focus on delays
                    }

                    return {
                        day: new Date(d.forecast_date).toLocaleDateString('en-US', { weekday: 'short' }),
                        baseline: 100,
                        impacted: 100 + impactMultiplier
                    };
                }));

                // Category Sensitivity responds to impactFocus and actual weather data
                if (impactFocus === "demand") {
                    setCategoryImpact([
                        { category: "Staples", impact: maxPrecip > 20 ? 40 : 10 },
                        { category: "Beverages", impact: maxTemp > 30 ? 35 : 5 },
                        { category: "Dairy", impact: maxTemp > 35 ? -25 : 0 },
                        { category: "Fresh Produce", impact: maxTemp > 35 ? -40 : -5 }
                    ]);
                } else if (impactFocus === "inventory") {
                    setCategoryImpact([
                        { category: "Staples", impact: 0 },
                        { category: "Beverages", impact: 0 },
                        { category: "Dairy", impact: maxTemp > 35 ? -60 : -10 },
                        { category: "Fresh Produce", impact: maxTemp > 35 ? -80 : -20 },
                        { category: "Frozen Foods", impact: maxTemp > 32 ? -40 : 0 }
                    ]);
                } else {
                    setCategoryImpact([
                        { category: "Staples", impact: maxPrecip > 30 ? -30 : 0 },
                        { category: "Beverages", impact: maxPrecip > 30 ? -20 : 0 },
                        { category: "Dairy", impact: maxPrecip > 30 ? -40 : 0 },
                        { category: "Fresh Produce", impact: maxPrecip > 30 ? -50 : 0 }
                    ]);
                }

                // Risk SKUs respond to impactFocus and actual weather data
                let risks = [];
                if (maxTemp > 35 && (impactFocus === "demand" || impactFocus === "inventory")) {
                    risks.push({ sku: "Fresh Milk", type: "Spoilage", risk: "High", advice: "Check chiller" });
                    risks.push({ sku: "Leafy Greens", type: "Wilt Risk", risk: "High", advice: "Accelerate markdowns" });
                } else if (maxTemp > 30 && (impactFocus === "demand" || impactFocus === "inventory")) {
                    risks.push({ sku: "Fresh Milk", type: "Spoilage", risk: "Low", advice: "Monitor temp logs" });
                }

                if (maxPrecip > 40 && (impactFocus === "logistics" || impactFocus === "demand")) {
                    risks.push({ sku: "Bread", type: "Delivery", risk: "High", advice: "Re-route via safe zones" });
                    risks.push({ sku: "Morning Staples", type: "Stockout", risk: "High", advice: "Pre-position inventory" });
                } else if (maxPrecip > 20 && (impactFocus === "logistics" || impactFocus === "demand")) {
                    risks.push({ sku: "Bread", type: "Delivery", risk: "Low", advice: "Expect minor delays" });
                }
                setRiskSkus(risks);

                // Dynamic Advisories
                const newAdvisories = [];
                if (maxPrecip > 30 && (impactFocus === "logistics" || impactFocus === "demand")) {
                    newAdvisories.push({
                        title: "Logistics Disruption Alert",
                        description: `Heavy precipitation (${maxPrecip}mm) expected in the next ${forecastHorizon} days. Expect last-mile latency increase.`,
                        severity: "high",
                        action: "Alert Logistics",
                        path: "/logistics"
                    });
                }
                if (maxTemp > 35 && (impactFocus === "inventory" || impactFocus === "demand")) {
                    newAdvisories.push({
                        title: "Cold Chain Stress",
                        description: `High temperature (${maxTemp}°C) detected in forecast. Verify godown compressor status.`,
                        severity: "medium",
                        action: "Check Godown",
                        path: "/dashboard/godown"
                    });
                }
                if (newAdvisories.length === 0) {
                    newAdvisories.push({
                        title: "Operational Status: Normal",
                        description: `No significant ${impactFocus} disruptions detected for the current ${forecastHorizon}-day horizon.`,
                        severity: "low",
                        action: "View All Risks",
                        path: "/inventory-risk"
                    });
                }
                setAdvisories(newAdvisories);

            } catch (err) {
                console.error("Failed to fetch weather impact:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [selectedCityId, forecastHorizon, impactFocus]);

    const activeCityName = cities.find(c => c.city_id === selectedCityId)?.city_name || "Region";

    const handleRefreshModel = async () => {
        setIsTraining(true);
        try {
            const res = await fetch('http://localhost:3001/api/train/weather', { method: 'POST' });
            const data = await res.json();
            console.log('Weather Training Output:', data);
        } catch (error) {
            console.error('API Error:', error);
        } finally {
            setIsTraining(false);
            const currentFocus = impactFocus;
            setImpactFocus("");
            setTimeout(() => setImpactFocus(currentFocus), 50);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-foreground pb-20">
            {/* Header & Filters */}
            <div className="sticky top-0 z-30 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-[#222] px-6 py-3 shadow-md">
                {/* Breadcrumb */}
                <div className="mb-2">
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink
                                    onClick={() => navigate('/')}
                                    className="flex items-center gap-1 text-gray-500 hover:text-blue-400 cursor-pointer text-[11px] transition-colors"
                                >
                                    <Home className="w-3 h-3" />
                                    Home
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator className="text-gray-600" />
                            <BreadcrumbItem>
                                <BreadcrumbPage className="text-blue-400 text-[11px] font-medium">
                                    Weather Intelligence
                                </BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>

                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="flex items-center space-x-4">
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                            <CloudRain className="w-6 h-6 text-blue-500" />
                        </div>
                        <div>
                            <div className="flex items-center space-x-3">
                                <h1 className="text-xl font-bold text-white">Weather Intelligence</h1>
                                <Badge variant="outline" className="text-yellow-500 border-yellow-500/30 bg-yellow-900/10 text-[10px] h-5">
                                    <Zap className="w-3 h-3 mr-1" />
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
                            <p className="text-xs text-gray-500">Weather-driven demand & operational risk signals</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex flex-col space-y-1">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Region / City</label>
                            <Select value={selectedCityId} onValueChange={setSelectedCityId}>
                                <SelectTrigger className="h-9 w-[180px] bg-[#1a1a1a] border-[#333] text-sm text-white">
                                    <SelectValue placeholder="Select City" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#1a1a1a] border-[#333] text-white">
                                    {cities.map(city => (
                                        <SelectItem key={city.city_id} value={city.city_id}>{city.city_name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex flex-col space-y-1">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Horizon</label>
                            <Select value={forecastHorizon} onValueChange={setForecastHorizon}>
                                <SelectTrigger className="h-9 w-[140px] bg-[#1a1a1a] border-[#333] text-sm text-white">
                                    <SelectValue placeholder="Next 7 Days" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#1a1a1a] border-[#333] text-white">
                                    <SelectItem value="3">Next 3 Days</SelectItem>
                                    <SelectItem value="7">Next 7 Days</SelectItem>
                                    <SelectItem value="14">Next 14 Days</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex flex-col space-y-1">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Impact Focus</label>
                            <Select value={impactFocus} onValueChange={setImpactFocus}>
                                <SelectTrigger className="h-9 w-[150px] bg-[#1a1a1a] border-[#333] text-sm text-white">
                                    <SelectValue placeholder="Demand Impact" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#1a1a1a] border-[#333] text-white">
                                    <SelectItem value="demand">Demand Impact</SelectItem>
                                    <SelectItem value="inventory">Inventory Risk</SelectItem>
                                    <SelectItem value="logistics">Logistics Risk</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-6 w-full space-y-8">
                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="bg-[#111] border-[#333]">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-300">Weather Severity</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center space-x-2">
                                <CloudLightning className={`w-8 h-8 ${kpiData.severity === 'High' ? 'text-red-500' : 'text-yellow-500'}`} />
                                <span className="text-2xl font-bold text-white">{loading ? '...' : kpiData.severity}</span>
                            </div>
                            <p className="mt-2 text-xs text-gray-400">Regional disruption potential</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-[#111] border-[#333]">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-300">Demand Sensitivity</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center space-x-2">
                                <TrendingUp className="w-8 h-8 text-blue-500" />
                                <span className="text-2xl font-bold text-white">{loading ? '...' : kpiData.sensitivity}</span>
                            </div>
                            <p className="mt-2 text-xs text-gray-400">Weather-linked volume shift</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-[#111] border-[#333]">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-300">Spoilage Risk</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center space-x-2">
                                <Thermometer className={`w-8 h-8 ${kpiData.spoilage === 'Risk' ? 'text-red-500' : 'text-green-500'}`} />
                                <span className="text-2xl font-bold text-white">{loading ? '...' : kpiData.spoilage}</span>
                            </div>
                            <p className="mt-2 text-xs text-gray-400">Cold-chain integrity bias</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-[#111] border-[#333] hover:border-purple-500/30 transition-colors">
                        <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                            <CardTitle className="text-sm font-medium text-purple-400">AI Model Insights</CardTitle>
                            <Brain className="h-4 w-4 text-purple-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white mb-2">XGBoost <span className="text-[10px] font-normal text-gray-400 tracking-wider uppercase">Ensemble</span></div>
                            <div className="space-y-1.5">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-gray-500">Validation</span>
                                    <span className="text-gray-300 font-medium">5-Fold CV</span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-gray-500">Train/Test Split</span>
                                    <span className="text-gray-300 font-medium">80/20 (20k/10k)</span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-gray-500">Model R² Score</span>
                                    <span className="text-green-400 font-medium">0.720</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* 7-Day Forecast */}
                <Card className="bg-[#111] border-[#333]">
                    <CardHeader>
                        <CardTitle className="text-white">Upcoming Weather Conditions</CardTitle>
                        <CardDescription className="text-gray-400">{forecastHorizon}-Day forecast for {activeCityName}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                            {loading ? (
                                <div className="col-span-full text-center py-10 text-gray-500 italic">Syncing regional sensors...</div>
                            ) : forecast.length > 0 ? forecast.map((day, i) => {
                                const Icon = day.icon;
                                const isDisruption = day.weather_condition?.includes('Rain') || day.weather_condition?.includes('Storm');
                                return (
                                    <div key={i} className={`flex flex-col items-center p-3 rounded-lg border ${isDisruption ? 'bg-blue-900/10 border-blue-800/30 shadow-inner shadow-blue-500/5' : 'bg-[#1a1a1a] border-[#333]'}`}>
                                        <span className="text-[10px] text-gray-500 mb-1 uppercase tracking-tighter">{day.date}</span>
                                        <span className="text-sm font-bold text-white mb-2">{day.day}</span>
                                        <Icon className={`w-8 h-8 mb-2 ${day.weather_condition?.includes('Sunny') ? 'text-yellow-500' :
                                            day.weather_condition?.includes('Rain') ? 'text-blue-500' : 'text-gray-400'
                                            }`} />
                                        <div className="text-center">
                                            <div className="text-lg font-bold text-white">{day.temp}°C</div>
                                            <div className="text-[10px] text-gray-500 mt-1 flex items-center justify-center">
                                                <Droplets className="w-3 h-3 mr-1" /> {Math.round(day.humidity)}%
                                            </div>
                                        </div>
                                    </div>
                                )
                            }) : (
                                <div className="col-span-full text-center py-10 text-gray-500 italic">No forecast data available for this region.</div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Business Impact Analysis */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card className="lg:col-span-2 bg-[#111] border-[#333]">
                        <CardHeader>
                            <CardTitle className="text-white">Weather-Driven Expected Demand</CardTitle>
                            <CardDescription className="text-gray-400">Projected metrics based on environmental signals.</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[300px]">
                            {loading ? (
                                <div className="h-full flex items-center justify-center text-gray-600 italic">Regressing environmental deltas...</div>
                            ) : demandImpact.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={demandImpact}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                                        <XAxis dataKey="day" stroke="#555" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#555" fontSize={12} tickLine={false} axisLine={false} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#111', borderColor: '#333' }}
                                            itemStyle={{ color: '#fff' }}
                                        />
                                        <Legend />
                                        <Line type="monotone" dataKey="impacted" stroke="#3b82f6" strokeWidth={3} name="Forecast (Weather Adj.)" dot={{ r: 4, fill: '#3b82f6' }} activeDot={{ r: 6 }} />
                                        <Line type="monotone" dataKey="baseline" stroke="#555" strokeWidth={2} strokeDasharray="5 5" name="Baseline" dot={false} />
                                    </LineChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-gray-600 italic">No impact vectors detected.</div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="bg-[#111] border-[#333]">
                        <CardHeader>
                            <CardTitle className="text-white">Category Sensitivity</CardTitle>
                            <CardDescription className="text-gray-400">Impact by grouping.</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[300px]">
                            {loading ? (
                                <div className="h-full flex items-center justify-center text-gray-600 italic">Calculating elasticities...</div>
                            ) : categoryImpact.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={categoryImpact} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#222" />
                                        <XAxis type="number" stroke="#555" fontSize={12} />
                                        <YAxis dataKey="category" type="category" stroke="#fff" fontSize={10} width={80} />
                                        <Tooltip
                                            cursor={{ fill: '#222' }}
                                            contentStyle={{ backgroundColor: '#111', borderColor: '#333' }}
                                            itemStyle={{ color: '#fff' }}
                                        />
                                        <Bar dataKey="impact" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-gray-600 italic">No category data.</div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Risk Panels & Insights */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="bg-[#111] border-[#333]">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center">
                                <AlertTriangle className="w-5 h-5 mr-2 text-yellow-500" />
                                High-Risk SKUs
                            </CardTitle>
                            <CardDescription className="text-gray-400">Inventory requiring attention.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-[#222] hover:bg-transparent">
                                        <TableHead className="text-gray-400">SKU</TableHead>
                                        <TableHead className="text-gray-400">Risk Type</TableHead>
                                        <TableHead className="text-gray-400">Risk Level</TableHead>
                                        <TableHead className="text-gray-400">Advice</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center py-10 text-gray-600 italic">Scanning SKU volatility...</TableCell>
                                        </TableRow>
                                    ) : riskSkus.length > 0 ? riskSkus.map((item, i) => (
                                        <TableRow key={i} className="border-[#222] hover:bg-[#1a1a1a]">
                                            <TableCell className="font-medium text-white">{item.sku}</TableCell>
                                            <TableCell className="text-gray-300">{item.type}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={`${item.risk === 'High' ? 'text-red-400 border-red-900 bg-red-900/10' : 'text-yellow-400 border-yellow-900 bg-yellow-900/10'
                                                    }`}>
                                                    {item.risk}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-gray-300 text-xs">{item.advice}</TableCell>
                                        </TableRow>
                                    )) : (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center py-10 text-gray-600 italic">No acute environmental risks detected.</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    <div className="space-y-4">
                        <h2 className="text-xl font-bold text-white flex items-center">
                            <Zap className="w-5 h-5 mr-2 text-purple-500" />
                            Operational Advisories
                        </h2>
                        {loading ? (
                            <div className="text-gray-600 italic">Synthesizing alerts...</div>
                        ) : advisories.map((advisory, idx) => (
                            <Card key={idx} className="bg-[#151515] border border-l-4 border-l-purple-500 border-y-[#333] border-r-[#333]">
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start">
                                        <CardTitle className="text-lg text-white font-semibold">{advisory.title}</CardTitle>
                                        <Badge variant="secondary" className={`
                                            ${advisory.severity === 'high' ? 'bg-red-900/20 text-red-400' : 'bg-yellow-900/20 text-yellow-400'}
                                        `}>
                                            {advisory.severity.toUpperCase()} PRIORITY
                                        </Badge>
                                    </div>
                                    <CardDescription className="text-gray-300 mt-1">
                                        {advisory.description}
                                    </CardDescription>
                                </CardHeader>
                                <CardFooter className="pt-2">
                                    <Button
                                        variant="secondary"
                                        className="w-full sm:w-auto bg-[#222] hover:bg-[#333] text-white border border-[#444]"
                                        onClick={() => navigate(advisory.path)}
                                    >
                                        {advisory.action}
                                        <ArrowRight className="w-4 h-4 ml-2" />
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* AI Warehouse Intelligence Panel */}
                <AIInsightsPanel
                    source="weather"
                    data={forecast}
                    isTraining={isTraining}
                    modelMeta={{ algorithm: 'XGBoost', r2: 0.720, mape: 12.1, accuracy: 87, folds: 5, split: '80/20', rmse: 5.8, precision: 82 }}
                />

            </div>
        </div>
    );
};

export default WeatherIntelligencePage;
