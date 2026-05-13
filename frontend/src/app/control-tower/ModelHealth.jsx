
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    AreaChart, Area, ScatterChart, Scatter, ZAxis, Cell
} from 'recharts';
import {
    Activity, ShieldCheck, AlertTriangle, AlertOctagon,
    CheckCircle2, TrendingUp, TrendingDown, RefreshCcw,
    Zap, Brain, Microscope, ArrowRight, Filter, Download, Home
} from 'lucide-react';
import {
    Card, CardContent, CardHeader, CardTitle, CardDescription
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Progress } from "@/components/ui/progress";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Separator } from '@/components/ui/separator';
import {
    Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink,
    BreadcrumbPage, BreadcrumbSeparator
} from '@/components/ui/breadcrumb';

// --- MOCK DATA ---

const ACCURACY_TREND_DATA = [
    { date: "Jan 10", forecast: 94.2, vision: 96.5 },
    { date: "Jan 11", forecast: 94.5, vision: 96.2 },
    { date: "Jan 12", forecast: 93.8, vision: 96.0 },
    { date: "Jan 13", forecast: 94.0, vision: 95.8 },
    { date: "Jan 14", forecast: 93.5, vision: 95.2 },
    { date: "Jan 15", forecast: 92.8, vision: 94.8 },
    { date: "Jan 16", forecast: 92.1, vision: 93.5 }, // Drift starting
];

const DRIFT_HEATMAP_DATA = [
    { store: "Store 402", feature: "Temperature", severity: 0.1 },
    { store: "Store 402", feature: "Footfall", severity: 0.8 }, // High drift
    { store: "Store 402", feature: "Inventory", severity: 0.2 },
    { store: "Store 115", feature: "Temperature", severity: 0.3 },
    { store: "Store 115", feature: "Footfall", severity: 0.2 },
    { store: "Store 115", feature: "Inventory", severity: 0.1 },
    { store: "Store 892", feature: "Temperature", severity: 0.7 }, // High drift
    { store: "Store 892", feature: "Footfall", severity: 0.4 },
    { store: "Store 892", feature: "Inventory", severity: 0.3 },
];

const FEATURE_IMPORTANCE_DATA = [
    { feature: "Historical Sales", baseline: 0.45, current: 0.42, delta: -0.03, status: "Stable" },
    { feature: "Local Weather", baseline: 0.15, current: 0.25, delta: +0.10, status: "Shift Detected" },
    { feature: "Promotion Status", baseline: 0.20, current: 0.18, delta: -0.02, status: "Stable" },
    { feature: "Competitor Price", baseline: 0.10, current: 0.05, delta: -0.05, status: "Decaying" },
];

const ALERTS = [
    { id: 1, type: "Critical", message: "Vision Model accuracy dropped below 94% threshold.", time: "2h ago" },
    { id: 2, type: "Warning", message: "Significant data drift detected in 'Footfall' feature for Store 402.", time: "5h ago" },
    { id: 3, type: "Info", message: "Scheduled retraining skipped due to insufficient new data.", time: "1d ago" },
];

import { governanceService } from '@/services/governanceService';

const ModelHealthPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const fromControlTower = queryParams.get('from') === 'control-tower';

    const [modelType, setModelType] = useState("all");
    const [loading, setLoading] = useState(true);
    const [models, setModels] = useState([]);
    const [accuracyData, setAccuracyData] = useState([]);
    const [driftData, setDriftData] = useState([]);
    const [importanceData, setImportanceData] = useState([]);
    const [selectedModelId, setSelectedModelId] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            // 1. Fetch Model Health
            const modelList = await governanceService.getModelHealth();
            setModels(modelList);

            if (modelList.length > 0) {
                const targetModel = modelList.find(m => m.model_name === "Demand Forecast Engine") || modelList[0];
                setSelectedModelId(targetModel.model_id);

                // 2. Fetch Trends for selected model
                const trends = await governanceService.getAccuracyTrends(targetModel.model_id);
                setAccuracyData(trends.map(t => ({
                    date: new Date(t.recorded_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit' }),
                    accuracy: parseFloat(t.accuracy_value) * 100
                })));

                // 3. Importance
                const importance = await governanceService.getFeatureImportance(targetModel.model_id);
                setImportanceData(importance);
            }

            // 4. Fetch Drift
            const drift = await governanceService.getFeatureDrift();
            setDriftData(drift);

        } catch (err) {
            console.error("Governance fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchData();
    }, []);

    // Derived Metrics
    const currentModel = models.find(m => m.model_id === selectedModelId);
    const latestHealth = currentModel?.model_health_logs?.[0] || { reliability_score: 0.85, drift_status: 'Healthy' };
    const reliabilityPercentage = Math.round(latestHealth.reliability_score * 100);

    // Helper for heatmap color
    const getHeatmapColor = (severity) => {
        if (severity >= 0.7) return "#ef4444"; // Red
        if (severity >= 0.4) return "#eab308"; // Yellow
        return "#22c55e"; // Green
    };

    return (
        <div className="min-h-screen bg-background text-foreground pb-20 font-sans w-full flex flex-col">

            {/* 1. HEADER & SUMMARY */}
            <header className="sticky top-0 z-30 bg-sidebar/95 backdrop-blur-md border-b border-sidebar-border shadow-lg">
                {/* Breadcrumb Section */}
                <div className="px-6 pt-3">
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink
                                    onClick={() => navigate('/')}
                                    className="flex items-center gap-1 text-muted-foreground hover:text-blue-400 cursor-pointer text-[11px] transition-colors"
                                >
                                    <Home className="w-3 h-3" />
                                    Home
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator className="text-gray-600" />
                            {fromControlTower && (
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
                                    Model Health
                                </BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>

                <div className="px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center space-x-4">
                        <div className="p-2 bg-purple-900/20 rounded-lg">
                            <ShieldCheck className="w-6 h-6 text-purple-500" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-foreground tracking-tight flex items-center gap-2">
                                Model Health & Drift
                            </h1>
                            <div className="text-xs text-muted-foreground font-mono flex items-center gap-3 mt-1">
                                <span className="flex items-center"><Brain className="w-3 h-3 mr-1" /> AI Reliability Layer</span>
                                <span>•</span>
                                <span className="flex items-center"><Activity className="w-3 h-3 mr-1" /> Monitoring Active</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Select defaultValue="all" onValueChange={setModelType}>
                            <SelectTrigger className="w-[180px] h-9 bg-muted border-border text-sm">
                                <SelectValue placeholder="Model Scope" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Models</SelectItem>
                                <SelectItem value="forecast">Demand Forecast</SelectItem>
                                <SelectItem value="vision">Checkout Vision</SelectItem>
                            </SelectContent>
                        </Select>

                        <Button variant="outline" size="sm" className="h-9 border-border text-muted-foreground hover:text-foreground bg-muted">
                            <Download className="w-4 h-4 mr-2" /> Report
                        </Button>
                    </div>
                </div>
            </header>

            <div className="p-6 w-full max-w-[1800px] mx-auto space-y-6">

                {/* 2. HEALTH SCORECARDS */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="bg-card border-border md:col-span-1">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-medium text-muted-foreground uppercase">Overall Reliability Score</CardTitle>
                        </CardHeader>
                        <CardContent className="flex items-center justify-between">
                            <div>
                                <div className={`text-4xl font-bold ${reliabilityPercentage > 90 ? 'text-green-500' : 'text-yellow-500'}`}>
                                    {loading ? '...' : reliabilityPercentage}%
                                </div>
                                <p className={`text-xs mt-1 font-medium ${reliabilityPercentage > 90 ? 'text-green-600' : 'text-yellow-600'}`}>
                                    {latestHealth.drift_status}
                                </p>
                            </div>
                            <div className={`h-16 w-16 rounded-full border-4 ${reliabilityPercentage > 90 ? 'border-green-500/20 border-t-green-500' : 'border-yellow-500/20 border-t-yellow-500'} flex items-center justify-center`}>
                                <Activity className={`w-6 h-6 ${reliabilityPercentage > 90 ? 'text-green-500' : 'text-yellow-500'}`} />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-card border-border">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-medium text-muted-foreground uppercase">Drift Alerts</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className={`text-2xl font-bold ${driftData.length > 0 ? 'text-red-500' : 'text-green-500'} flex items-center gap-2`}>
                                {driftData.length > 0 ? <AlertOctagon className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
                                {driftData.length > 0 ? 'Critical' : 'Stable'}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">{driftData.length} features showing drift</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-card border-border">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-medium text-muted-foreground uppercase">Accuracy Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-500 flex items-center gap-2">
                                <Activity className="w-5 h-5" /> Federated
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">Global aggregation active</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-card border-border">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-medium text-muted-foreground uppercase">Model Version</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-foreground font-mono">{currentModel?.model_version || 'v2.0'}</div>
                            <p className="text-xs text-muted-foreground mt-1">Depl: {currentModel?.deployment_date}</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* 3. PERFORMANCE TRENDS (2/3 Width) */}
                    <Card className="lg:col-span-2 bg-card border-border">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold text-foreground">Accuracy Stability (Federated Consensus)</CardTitle>
                            <CardDescription className="text-muted-foreground">Tracking global model accuracy targets (Phase 4 Goal: WMAPE &lt; 12%).</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[350px]">
                            {loading ? (
                                <div className="h-full flex items-center justify-center text-muted-foreground">Loading metrics...</div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={accuracyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                                        <XAxis dataKey="date" stroke="#555" tick={{ fill: '#888', fontSize: 12 }} />
                                        <YAxis domain={[80, 100]} stroke="#555" tick={{ fill: '#888', fontSize: 12 }} />
                                        <RechartsTooltip
                                            contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                                            itemStyle={{ color: '#fff' }}
                                        />
                                        <Line type="monotone" dataKey="accuracy" name="Global Consensus" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4, fill: '#3b82f6' }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            )}
                        </CardContent>
                    </Card>

                    {/* 4. ALERTS & ACTIONS (1/3 Width) */}
                    <Card className="bg-card border-border flex flex-col">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold text-foreground flex items-center">
                                <AlertTriangle className="w-5 h-5 mr-2 text-yellow-500" /> Drift Notifications
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 space-y-4">
                            {driftData.slice(0, 3).map((alert, i) => (
                                <div key={i} className="p-3 rounded-lg bg-muted border border-border hover:border-gray-700 transition-colors">
                                    <div className="flex justify-between items-start mb-1">
                                        <Badge variant="outline" className="text-red-400 border-red-900 bg-red-900/10">
                                            Drift Detected
                                        </Badge>
                                        <span className="text-xs text-muted-foreground">{new Date(alert.detected_at).toLocaleTimeString()}</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground leading-snug">
                                        Feature <strong>{alert.feature_name}</strong> at <strong>{alert.stores?.store_name}</strong> showing severity {alert.severity_score}.
                                    </p>
                                </div>
                            ))}
                            {driftData.length === 0 && <p className="text-xs text-muted-foreground italic">No active drift detections.</p>}

                            <Separator className="bg-border my-4" />
                            <div className="space-y-2">
                                <h4 className="text-xs font-bold text-muted-foreground uppercase">Governance Actions</h4>
                                <Button className="w-full bg-purple-600 hover:bg-purple-700 text-foreground justify-start">
                                    <RefreshCcw className="w-4 h-4 mr-2" /> Global Synchronization
                                </Button>
                                <Button variant="outline" className="w-full border-border text-muted-foreground hover:text-foreground justify-start bg-muted">
                                    <Microscope className="w-4 h-4 mr-2" /> Inspect Edge Nodes
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 5. DRIFT METRICS & FEATURE IMPORTANCE */}
                    <Card className="lg:col-span-2 bg-card border-border">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold text-foreground">Edge Node Drift Monitoring</CardTitle>
                            <CardDescription className="text-muted-foreground">Visualizing input feature stability across synchronized edge nodes.</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[300px] flex items-center justify-center p-0">
                            <Table>
                                <TableHeader className="bg-muted">
                                    <TableRow className="border-none">
                                        <TableHead className="text-muted-foreground">Node/Store</TableHead>
                                        <TableHead className="text-muted-foreground">Feature</TableHead>
                                        <TableHead className="text-muted-foreground text-right">Severity</TableHead>
                                        <TableHead className="text-muted-foreground text-right">Detection Time</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {driftData.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center py-20 text-gray-600 italic">No active data drift detected in edge nodes.</TableCell>
                                        </TableRow>
                                    ) : driftData.map((d, i) => (
                                        <TableRow key={i} className="border-b border-border hover:bg-muted/50">
                                            <TableCell className="text-foreground text-xs">{d.stores?.store_name}</TableCell>
                                            <TableCell className="text-muted-foreground text-xs">{d.feature_name}</TableCell>
                                            <TableCell className="text-right">
                                                <Badge variant="outline" className={`text-xs ${parseFloat(d.severity_score) > 0.5 ? 'border-red-900 text-red-400' : 'border-green-900 text-green-400'}`}>
                                                    {d.severity_score}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right text-muted-foreground text-xs">
                                                {new Date(d.detected_at).toLocaleString()}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    <Card className="bg-card border-border">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold text-foreground">Global Feature Importance</CardTitle>
                            <CardDescription className="text-muted-foreground">Consensus signal weights.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader className="bg-muted">
                                    <TableRow className="border-none hover:bg-transparent">
                                        <TableHead className="text-muted-foreground">Feature</TableHead>
                                        <TableHead className="text-muted-foreground text-right">Weight</TableHead>
                                        <TableHead className="text-muted-foreground text-right">Delta</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {importanceData.map((feat, i) => (
                                        <TableRow key={i} className="border-b border-border hover:bg-muted transition-colors">
                                            <TableCell className="font-medium text-muted-foreground text-xs">{feat.feature_name}</TableCell>
                                            <TableCell className="text-right text-blue-400 font-mono text-xs">{(parseFloat(feat.current_importance) * 100).toFixed(1)}%</TableCell>
                                            <TableCell className={`text-right font-mono text-xs ${feat.delta_value > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                {feat.delta_value > 0 ? '+' : ''}{(feat.delta_value * 100).toFixed(1)}%
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                </div>
            </div>
        </div>
    );
};

export default ModelHealthPage;



