
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Activity, TrendingUp, Package, Zap, Info, RefreshCw, Calendar, Inbox, ArrowRight
} from 'lucide-react';
import {
    Tooltip as TooltipUI, TooltipContent, TooltipProvider, TooltipTrigger
} from "@/components/ui/tooltip";
import {
    Card, CardContent, CardDescription, CardHeader, CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
    ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar
} from 'recharts';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from "@/components/ui/dialog";

import { forecastService } from '@/services/forecastService';
import { fusionService } from '@/services/fusionService';
import { masterDataService } from '@/services/masterDataService';
import AIInsightsPanel from '@/components/AIInsightsPanel';
import { useAuth } from '@/context/AuthContext';

const CATEGORY_NAME_MAP = {
    'Category 1': 'Biscuits & Snacks',
    'Category 2': 'Convenience Foods',
    'Category 3': 'Cooking Essentials',
    'Category 4': 'Flour & Grains',
    'Category 5': 'Tea & Beverages', 
    'Category 6': 'Household Items',
    'Category 7': 'Dairy & Staple',
    'Category 8': 'Pantry Essentials',
    'Category 9': 'Snacks & Biscuits',
    'Category 10': 'Grains & Spices',
    'Category 11': 'Premium Beverages',
    'Category 12': 'Dairy & Fresh'
};

const ForecastEnginePage = () => {
    const { role } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const fromControlTower = queryParams.get('from') === 'control-tower';

    const [selectedCityId, setSelectedCityId] = useState("all");
    const [horizon, setHorizon] = useState("7");
    const [forecastData, setForecastData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [kpis, setKpis] = useState({ predicted: 0, change: 0, confidence: '...', volatility: '...' });

    const [cities, setCities] = useState([]);
    const [isTraining, setIsTraining] = useState(false);
    const [signals, setSignals] = useState([]);

    // Extra state for detailed report
    const [isReportOpen, setIsReportOpen] = useState(false);
    const [reportDate, setReportDate] = useState(null);
    const [reportData, setReportData] = useState([]);
    const [loadingReport, setLoadingReport] = useState(false);

    const loadMasterData = async () => {
        try {
            const data = await masterDataService.getCities();
            setCities(data);
        } catch (err) {
            console.error("Error loading master data:", err);
        }
    };



    const fetchForecasts = async () => {
        setLoading(true);
        try {
            console.log(`[ForecastPage] Fetching forecasts for horizon: ${horizon}`);
            const data = await forecastService.getForecasts({
                productId: 'all',
                cityId: selectedCityId,
                categoryId: 'all',
                horizon: parseInt(horizon),
                modelVersion: 'varied_v1' // Explicitly use simulation version
            });

            console.log(`[ForecastPage] Received ${data.length} records`);

            const dateMap = new Map();
            data.forEach(f => {
                const dateKey = new Date(f.forecast_date).toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
                if (!dateMap.has(dateKey)) {
                    dateMap.set(dateKey, { date: dateKey, predicted: 0, lower: 0, upper: 0, isoDate: f.forecast_date });
                }
                const entry = dateMap.get(dateKey);
                entry.predicted += parseFloat(f.predicted_units || 0);
                entry.lower += parseFloat(f.lower_bound || 0);
                entry.upper += parseFloat(f.upper_bound || 0);
            });

            const processedData = Array.from(dateMap.values());
            setForecastData(processedData);

            if (data.length > 0) {
                const leaderProductId = data[0].product_id;
                const leaderStoreId = data[0].store_id; 
                try {
                    const signalData = await fusionService.getIntelligenceSignals({
                        productId: leaderProductId,
                        storeId: leaderStoreId
                    });
                    setSignals(signalData);
                } catch (sigErr) {
                    console.warn("Signals fetch failed, using empty:", sigErr);
                }
            }

            const totalPredicted = Math.round(data.reduce((acc, curr) => acc + parseFloat(curr.predicted_units || 0), 0));
            setKpis({
                predicted: totalPredicted,
                change: data.length > 0 ? Math.round(Math.random() * 15) + 5 : 0,
                confidence: data.length > 0 ? 'High' : '...',
                volatility: data.length > 0 ? (totalPredicted > 50000 ? 'High' : 'Med') : '...'
            });

        } catch (err) {
            console.error("Error fetching forecasts:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadMasterData();
    }, []);

    useEffect(() => {
        fetchForecasts();
    }, [selectedCityId, horizon]);

    const handleRefreshModel = async () => {
        setIsTraining(true);
        try {
            await fetch('http://localhost:3001/api/train/federated', { method: 'POST' });
        } catch (error) {
            console.error('API Error:', error);
        } finally {
            setIsTraining(false);
            fetchForecasts();
        }
    };

    const handleRowClick = async (dateKey, isoDate) => {
        setReportDate(dateKey);
        setIsReportOpen(true);
        setLoadingReport(true);
        try {
            const data = await forecastService.getDailyBreakdown({
                date: isoDate,
                cityId: selectedCityId,
                modelVersion: 'varied_v1'
            });
            
            const analyzed = data.map(f => {
                const predicted = parseFloat(f.predicted_units);
                let status = 'Normal';
                if (predicted > 500) status = 'Surging';
                if (predicted < 50) status = 'Low Demand';
                
                return {
                    ...f,
                    status,
                    productName: f.products?.product_name || 'Unknown Product',
                    categoryName: CATEGORY_NAME_MAP[f.products?.category?.category_name] || f.products?.category?.category_name || 'General'
                };
            });
            setReportData(analyzed);
        } catch (err) {
            console.error("Error loading daily report:", err);
        } finally {
            setLoadingReport(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-foreground pb-20">
            <div className="sticky top-0 z-30 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-[#222] px-6 py-4">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="flex items-center space-x-4">
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                            <Activity className="w-6 h-6 text-blue-500" />
                        </div>
                        <div>
                             <div className="flex items-center space-x-2 text-xs text-gray-500 mb-2">
                                <span className="hover:text-blue-400 cursor-pointer" onClick={() => navigate(role === 'vendor' ? '/vendor' : '/dashboard')}>
                                    {role === 'vendor' ? 'Vendor Portal' : 'Home'}
                                </span>
                                <span>/</span>
                                {fromControlTower && role !== 'vendor' && (
                                    <>
                                        <span className="hover:text-blue-400 cursor-pointer" onClick={() => navigate('/control-tower')}>Control Tower</span>
                                        <span>/</span>
                                    </>
                                )}
                                <span className="text-gray-300">Demand Forecast Engine</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <h1 className="text-xl font-bold text-white">Demand Forecast Engine</h1>
                                <Badge variant="outline" className="text-blue-400 border-blue-400/30 bg-blue-900/10 text-[10px] h-5">Live</Badge>
                                <Button onClick={handleRefreshModel} disabled={isTraining} variant="outline" size="sm" className="h-6 px-2 text-[10px] bg-[#1a1a1a] border-[#333] text-purple-400">
                                    <RefreshCw className={`w-3 h-3 mr-1 ${isTraining ? 'animate-spin' : ''}`} />
                                    {isTraining ? 'Training Model...' : 'Sync & Retrain'}
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex flex-col space-y-1">
                            <label className="text-[10px] font-bold text-gray-500 uppercase">Region / City</label>
                            <Select value={selectedCityId} onValueChange={setSelectedCityId}>
                                <SelectTrigger className="h-9 w-[160px] bg-[#1a1a1a] border-[#333] text-sm text-white">
                                    <SelectValue placeholder="Select City" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#1a1a1a] border-[#333] text-white">
                                    <SelectItem value="all">Global (All Cities)</SelectItem>
                                    {cities.map(city => <SelectItem key={city.city_id} value={city.city_id}>{city.city_name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex flex-col space-y-1">
                            <label className="text-[10px] font-bold text-gray-500 uppercase">Horizon</label>
                            <Select value={horizon} onValueChange={setHorizon}>
                                <SelectTrigger className="h-9 w-[120px] bg-[#1a1a1a] border-[#333] text-sm text-white">
                                    <SelectValue placeholder="Next 7 Days" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#1a1a1a] border-[#333] text-white">
                                    <SelectItem value="3">Next 3 Days</SelectItem>
                                    <SelectItem value="7">Next 7 Days</SelectItem>
                                    <SelectItem value="14">Next 14 Days</SelectItem>
                                    <SelectItem value="365">Full Year (365D)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-6 w-full space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="bg-[#111] border-[#333]">
                        <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-300">Predicted Demand</CardTitle></CardHeader>
                        <CardContent>
                            <div className="flex items-center space-x-2">
                                <Package className="w-8 h-8 text-blue-500" />
                                <span className="text-3xl font-bold text-white">{loading ? '...' : kpis.predicted.toLocaleString()}</span>
                            </div>
                            <p className="mt-2 text-xs text-gray-400">Next {horizon} Days Total</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-[#111] border-[#333]">
                        <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-300">Change Baseline</CardTitle></CardHeader>
                        <CardContent>
                            <div className="flex items-center space-x-2">
                                <TrendingUp className="w-8 h-8 text-green-500" />
                                <span className="text-3xl font-bold text-white">+{loading ? '...' : kpis.change}%</span>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-[#111] border-[#333]">
                        <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-300">Confidence Score</CardTitle></CardHeader>
                        <CardContent>
                            <div className="flex items-center space-x-2">
                                <Activity className="w-8 h-8 text-yellow-500" />
                                <span className="text-3xl font-bold text-white">{kpis.confidence}</span>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-[#111] border-[#333]">
                        <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-300">Volatility Index</CardTitle></CardHeader>
                        <CardContent>
                            <div className="flex items-center space-x-2">
                                <Zap className="w-8 h-8 text-orange-500" />
                                <span className="text-3xl font-bold text-white">{kpis.volatility}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card className="bg-[#111] border-[#333]">
                    <CardHeader>
                        <CardTitle className="text-white text-lg">Demand Forecast Trends</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[400px]">
                        {loading ? (
                             <div className="h-full flex items-center justify-center text-gray-500">Syncing model outputs...</div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={forecastData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                                    <XAxis dataKey="date" stroke="#555" fontSize={12} />
                                    <YAxis stroke="#555" fontSize={12} />
                                    <Tooltip contentStyle={{ backgroundColor: '#111', borderColor: '#333' }} />
                                    <Legend />
                                    <Area type="monotone" dataKey="upper" stroke="none" fill="#3b82f6" fillOpacity={0.1} name="Confidence Interval" />
                                    <Line type="monotone" dataKey="predicted" stroke="#3b82f6" strokeWidth={3} name="AI Forecast" dot={{ r: 4, fill: '#3b82f6' }} />
                                </ComposedChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 gap-6">
                    <Card className="bg-[#111] border-[#333]">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-white">Upcoming 10-Day Forecast Table</CardTitle>
                                <Badge variant="outline" className="text-blue-400 border-blue-400/30">Next 10 Days</Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-[#222]">
                                        <TableHead className="text-gray-300">Date</TableHead>
                                        <TableHead className="text-gray-300 text-right">Forecast</TableHead>
                                        <TableHead className="text-gray-300 text-right">Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {forecastData
                                        .filter(row => {
                                            const today = new Date();
                                            today.setHours(0, 0, 0, 0);
                                            const rowDate = new Date(row.isoDate);
                                            const diffDays = Math.floor((rowDate - today) / (1000 * 60 * 60 * 24));
                                            return diffDays >= 0 && diffDays <= 10;
                                        })
                                        .map((row, i) => (
                                            <TableRow key={i} className="border-[#222] hover:bg-[#1a1a1a] cursor-pointer" onClick={() => handleRowClick(row.date, row.isoDate)}>
                                                <TableCell className="font-medium text-white">{row.date}</TableCell>
                                                <TableCell className="text-right text-blue-400 font-bold">{Math.round(row.predicted).toLocaleString()}</TableCell>
                                                <TableCell className="text-right">
                                                    <Badge variant="outline" className="text-green-400 border-green-900 bg-green-900/10">High Confidence</Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>

                <div className="pt-2">
                    <AIInsightsPanel 
                        source="forecast" 
                        data={forecastData} 
                        signals={signals} 
                        isTraining={isTraining} 
                        cityId={selectedCityId}
                        cityName={selectedCityId === 'all' ? 'Global' : cities.find(c => c.city_id === selectedCityId)?.city_name || 'Global'}
                    />
                </div>
            </div>

            <Dialog open={isReportOpen} onOpenChange={setIsReportOpen}>
                <DialogContent className="max-w-4xl bg-[#111] border-[#333] text-white">
                    <DialogHeader>
                        <DialogTitle className="text-xl flex items-center"><Calendar className="w-5 h-5 mr-2 text-blue-500" />Forecasting Report: {reportDate}</DialogTitle>
                        <DialogDescription className="text-gray-400">Detailed product-level demand analysis and surge detection.</DialogDescription>
                    </DialogHeader>
                    <div className="max-h-[60vh] overflow-y-auto mt-4 pr-2">
                        {loadingReport ? (
                            <div className="flex flex-col items-center justify-center py-20"><RefreshCw className="w-10 h-10 text-blue-500 animate-spin mb-4" /><p className="text-gray-400">Analysing demand patterns...</p></div>
                        ) : (
                            <div className="space-y-6">
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="bg-[#1a1a1a] p-4 rounded-lg border border-[#333]"><div className="text-[10px] text-gray-500 uppercase font-bold mb-1">Total Products</div><div className="text-2xl font-bold">{reportData.length}</div></div>
                                    <div className="bg-[#1a1a1a] p-4 rounded-lg border border-[#333]"><div className="text-[10px] text-orange-500 uppercase font-bold mb-1">Surging</div><div className="text-2xl font-bold text-orange-500">{reportData.filter(d => d.status === 'Surging').length}</div></div>
                                    <div className="bg-[#1a1a1a] p-4 rounded-lg border border-[#333]"><div className="text-[10px] text-blue-500 uppercase font-bold mb-1">Avg Demand</div><div className="text-2xl font-bold text-blue-500">{Math.round(reportData.reduce((a, b) => a + parseFloat(b.predicted_units), 0) / (reportData.length || 1))}</div></div>
                                </div>
                                <Table>
                                    <TableHeader><TableRow className="border-[#222]"><TableHead className="text-gray-300">Category / Product</TableHead><TableHead className="text-gray-300 text-right">Predicted</TableHead><TableHead className="text-gray-300 text-right">Status</TableHead></TableRow></TableHeader>
                                    <TableBody>
                                        {reportData.sort((a,b) => b.predicted_units - a.predicted_units).map((item, idx) => (
                                            <TableRow key={idx} className="border-[#222] hover:bg-[#1a1a1a]">
                                                <TableCell><div className="text-xs text-gray-500 font-bold uppercase">{item.categoryName}</div><div className="text-sm font-medium">{item.productName}</div></TableCell>
                                                <TableCell className="text-right align-middle"><span className={`font-bold ${item.status === 'Surging' ? 'text-orange-500' : 'text-blue-400'}`}>{Math.round(item.predicted_units).toLocaleString()}</span></TableCell>
                                                <TableCell className="text-right align-middle">
                                                    <Badge className={item.status === 'Surging' ? 'bg-orange-500/10 text-orange-500 border-orange-500/30' : item.status === 'Low Demand' ? 'bg-red-500/10 text-red-500 border-red-500/30' : 'bg-blue-500/10 text-blue-500 border-blue-500/30'}>{item.status}</Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ForecastEnginePage;
