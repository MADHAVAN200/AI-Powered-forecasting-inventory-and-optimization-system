
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    AreaChart, Area
} from 'recharts';
import {
    Server, Shield, Activity, RefreshCw, AlertTriangle,
    CheckCircle2, Clock, Play, Pause, RotateCcw,
    Database, Network, Lock, Info, Filter, Download, TrendingUp
} from 'lucide-react';
import {
    Card, CardContent, CardHeader, CardTitle, CardDescription
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { Progress } from "@/components/ui/progress";

// --- MOCK DATA ---

const GLOBAL_ACCURACY_DATA = [
    { round: "R-102", accuracy: 88.2, loss: 0.45 },
    { round: "R-103", accuracy: 89.1, loss: 0.42 },
    { round: "R-104", accuracy: 90.5, loss: 0.38 },
    { round: "R-105", accuracy: 91.2, loss: 0.35 },
    { round: "R-106", accuracy: 91.8, loss: 0.33 },
    { round: "R-107", accuracy: 92.4, loss: 0.31 },
    { round: "R-108", accuracy: 93.1, loss: 0.28 },
];

const EDGE_NODES = [
    { id: "STORE-402", status: "Training", round: 108, accuracy: 94.2, weight: 1.2, drift: "Low", lastUpdate: "2m ago" },
    { id: "STORE-115", status: "Ready", round: 108, accuracy: 92.8, weight: 1.0, drift: "Low", lastUpdate: "5m ago" },
    { id: "STORE-892", status: "Idle", round: 107, accuracy: 89.5, weight: 0.9, drift: "Medium", lastUpdate: "1h ago" },
    { id: "STORE-221", status: "Training", round: 108, accuracy: 93.5, weight: 1.1, drift: "Low", lastUpdate: "1m ago" },
    { id: "STORE-055", status: "Error", round: 106, accuracy: 0.0, weight: 0.0, drift: "High", lastUpdate: "4h ago" },
];

const LOGS = [
    { id: 1, time: "10:45:00", event: "Global Aggregation R-108 started", type: "info" },
    { id: 2, time: "10:44:22", event: "Store-402 submitted local gradients (Size: 45MB)", type: "success" },
    { id: 3, time: "10:30:15", event: "Store-055 connection timeout - dropped from round", type: "error" },
    { id: 4, time: "10:00:00", event: "Global Model V4.2.1 Checkpoint saved", type: "success" },
];

// --- COMPONENT ---

const FederatedLearningPage = () => {
    const navigate = useNavigate();
    const [isAggregating, setIsAggregating] = useState(false);

    const handleAggregation = () => {
        setIsAggregating(true);
        setTimeout(() => setIsAggregating(false), 3000);
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-foreground pb-20 font-sans w-full flex flex-col">

            {/* 1. HEADER & GLOBAL STATUS */}
            <header className="sticky top-0 z-30 bg-[#111] border-b border-[#222] shadow-lg">
                <div className="px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center space-x-4">
                        <div className="p-2 bg-blue-900/20 rounded-lg">
                            <Server className="w-6 h-6 text-blue-500" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                                Federated Learning Panel
                                <Badge variant="outline" className="text-blue-400 border-blue-900 bg-blue-900/10 ml-2">
                                    Admin Access
                                </Badge>
                            </h1>
                            <div className="text-xs text-gray-500 font-mono flex items-center gap-3 mt-1">
                                <span className="flex items-center"><Activity className="w-3 h-3 mr-1" /> Global Model v4.2.2</span>
                                <span>•</span>
                                <span className="flex items-center"><Clock className="w-3 h-3 mr-1" /> Round #108</span>
                                <span>•</span>
                                <span className="text-green-500 font-bold">System Nominal</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            className={`h-9 ${isAggregating ? 'bg-blue-800' : 'bg-blue-600 hover:bg-blue-700'} text-white border-none`}
                            onClick={handleAggregation}
                            disabled={isAggregating}
                        >
                            {isAggregating ? (
                                <><RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Aggregating...</>
                            ) : (
                                <><Play className="w-4 h-4 mr-2" /> Run Aggregation</>
                            )}
                        </Button>
                        <Button variant="outline" size="sm" className="h-9 border-[#333] text-gray-400 hover:text-white bg-[#1a1a1a]">
                            <Pause className="w-4 h-4 mr-2" /> Pause
                        </Button>
                        <Button variant="destructive" size="sm" className="h-9 bg-red-900/30 hover:bg-red-900/50 text-red-200 border border-red-900/50">
                            <AlertTriangle className="w-4 h-4 mr-2" /> Safe Mode
                        </Button>
                    </div>
                </div>
            </header>

            <div className="p-6 w-full max-w-[1800px] mx-auto space-y-6">

                {/* 2. SYSTEM HEALTH INDICATORS */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="bg-[#111] border-[#333]">
                        <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                            <CardTitle className="text-xs font-medium text-gray-500 uppercase">Active Nodes</CardTitle>
                            <Network className="w-4 h-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">42 / 45</div>
                            <p className="text-xs text-gray-500 mt-1">3 nodes offline (maintenance)</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-[#111] border-[#333]">
                        <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                            <CardTitle className="text-xs font-medium text-gray-500 uppercase">Aggregation Health</CardTitle>
                            <Shield className="w-4 h-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-500">Healthy</div>
                            <p className="text-xs text-gray-500 mt-1">Convergence rate optimal</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-[#111] border-[#333]">
                        <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                            <CardTitle className="text-xs font-medium text-gray-500 uppercase">Global Accuracy</CardTitle>
                            <Activity className="w-4 h-4 text-purple-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">93.1%</div>
                            <p className="text-xs text-green-500 flex items-center mt-1">
                                <TrendingUp className="w-3 h-3 mr-1" /> +0.7% this round
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="bg-[#111] border-[#333] relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-2 opacity-10">
                            <Lock className="w-12 h-12 text-white" />
                        </div>
                        <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                            <CardTitle className="text-xs font-medium text-gray-500 uppercase">Governance Mode</CardTitle>
                            <Lock className="w-4 h-4 text-gray-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl font-bold text-white">Secure Aggregation</div>
                            <p className="text-xs text-gray-500 mt-1">Homomorphic Encryption: ON</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* 3. EDGE NODE STATUS TABLE (2/3 Width) */}
                    <Card className="lg:col-span-2 bg-[#111] border-[#333]">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-lg font-bold text-white">Edge Node Training Status</CardTitle>
                                <CardDescription className="text-gray-500">Real-time monitoring of local model training across stores.</CardDescription>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="ghost" size="sm" className="h-8 px-2 text-gray-400 hover:text-white">
                                    <Filter className="w-4 h-4 mr-1" /> Filter
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader className="bg-[#1a1a1a]">
                                    <TableRow className="border-none hover:bg-transparent">
                                        <TableHead className="text-gray-400">Store Node</TableHead>
                                        <TableHead className="text-gray-400">Status</TableHead>
                                        <TableHead className="text-gray-400">Local Accuracy</TableHead>
                                        <TableHead className="text-gray-400">Weight</TableHead>
                                        <TableHead className="text-gray-400">Drift</TableHead>
                                        <TableHead className="text-gray-400">Last Update</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {EDGE_NODES.map((node) => (
                                        <TableRow key={node.id} className="border-b border-[#222] hover:bg-[#1a1a1a] transition-colors">
                                            <TableCell className="font-mono text-gray-300 font-medium">{node.id}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={`
                                                    ${node.status === 'Training' ? 'text-blue-400 border-blue-900 bg-blue-900/10 animate-pulse' :
                                                        node.status === 'Ready' ? 'text-green-400 border-green-900 bg-green-900/10' :
                                                            node.status === 'Error' ? 'text-red-400 border-red-900 bg-red-900/10' :
                                                                'text-gray-400 border-gray-800 bg-gray-800/20'}
                                                `}>
                                                    {node.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-white font-bold">{node.accuracy.toFixed(1)}%</TableCell>
                                            <TableCell className="text-gray-400">{node.weight}</TableCell>
                                            <TableCell>
                                                <span className={`${node.drift === 'High' ? 'text-red-500 font-bold' : node.drift === 'Medium' ? 'text-yellow-500' : 'text-green-500'}`}>
                                                    {node.drift}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-gray-500 text-xs">{node.lastUpdate}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    {/* 4. PERFORMANCE & LOGS (1/3 Width) */}
                    <div className="space-y-6">

                        {/* Global Accuracy Chart */}
                        <Card className="bg-[#111] border-[#333]">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-bold text-white uppercase tracking-wider">Global Model Accuracy</CardTitle>
                            </CardHeader>
                            <CardContent className="h-[200px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={GLOBAL_ACCURACY_DATA}>
                                        <defs>
                                            <linearGradient id="colorAccuracy" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '4px' }}
                                            itemStyle={{ color: '#fff' }}
                                        />
                                        <Area type="monotone" dataKey="accuracy" stroke="#8884d8" fillOpacity={1} fill="url(#colorAccuracy)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        {/* Recent Governance Logs */}
                        <Card className="bg-[#111] border-[#333] flex-1">
                            <CardHeader className="pb-2 flex flex-row items-center justify-between">
                                <CardTitle className="text-sm font-bold text-white uppercase tracking-wider">Governance Logs</CardTitle>
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-gray-500 hover:text-white">
                                    <Download className="w-3 h-3" />
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {LOGS.map((log) => (
                                        <div key={log.id} className="flex gap-3">
                                            <div className="w-16 flex-shrink-0 text-xs font-mono text-gray-500 text-right">{log.time}</div>
                                            <div className="flex-1">
                                                <p className={`text-xs ${log.type === 'error' ? 'text-red-400' :
                                                    log.type === 'success' ? 'text-green-400' :
                                                        'text-gray-300'
                                                    }`}>
                                                    {log.event}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                    </div>
                </div>
            </div>
        </div>
    );
};

// Helper for Recharts Tooltip
import { Tooltip } from 'recharts';

export default FederatedLearningPage;
