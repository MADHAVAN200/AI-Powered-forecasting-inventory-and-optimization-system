
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    ShieldCheck, AlertTriangle, CheckCircle2, XCircle,
    ZoomIn, ZoomOut, Check, ScanLine, Eye,
    Maximize2, FileText, BadgeCheck, HelpCircle, Home
} from 'lucide-react';
import {
    Card, CardContent, CardHeader, CardTitle, CardFooter
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { Progress } from "@/components/ui/progress";
import {
    Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink,
    BreadcrumbPage, BreadcrumbSeparator
} from '@/components/ui/breadcrumb';

// --- MOCK DATA ---

const SESSION_METADATA = {
    lane: "Lane 4",
    session: "S-559210",
    time: "10:42:15 AM",
    status: "Verification Pending",
    trustScore: 82,
};

const DETECTED_ITEMS = [
    { id: 1, name: "Cola 12pk", confidence: 98, ocr: "COLA 12", boxColor: "border-green-500", status: "Matched" },
    { id: 2, name: "Potato Chips Lg", confidence: 95, ocr: "CRUNCH", boxColor: "border-green-500", status: "Matched" },
    { id: 3, name: "Unknown Item", confidence: 45, ocr: "???", boxColor: "border-red-500", status: "Unscanned" },
    { id: 4, name: "Candy Bar", confidence: 92, ocr: "SWEET", boxColor: "border-green-500", status: "Matched" },
];

const SCANNED_ITEMS = [
    { id: 101, name: "Cola 12pk", pid: "012000", price: 5.99 },
    { id: 102, name: "Potato Chips Lg", pid: "028400", price: 4.29 },
    { id: 103, name: "Candy Bar", pid: "034000", price: 1.29 },
];

// --- COMPONENT ---

const CheckoutVisionPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const fromControlTower = queryParams.get('from') === 'control-tower';

    const [zoomLevel, setZoomLevel] = useState(1);
    const [showOCR, setShowOCR] = useState(true);
    const [resolution, setResolution] = useState(null); // 'confirmed', 'corrected', 'escalated'

    return (
        <div className="min-h-screen bg-background text-foreground pb-20 font-sans w-full flex flex-col">

            {/* 1. HEADER */}
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
                                    Vision Verification
                                </BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>

                <div className="px-6 py-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center space-x-4">
                        <div className="p-2 bg-orange-500/10 rounded-lg">
                            <Eye className="w-6 h-6 text-orange-500" />
                        </div>
                        <div>
                            <div className="flex items-center space-x-3">
                                <h1 className="text-xl font-bold text-foreground tracking-tight uppercase">Vision Verification</h1>
                                <Badge variant="outline" className="text-[10px] font-bold bg-orange-500/10 text-orange-500 border-orange-500/20 uppercase tracking-widest h-5">
                                    {SESSION_METADATA.status}
                                </Badge>
                            </div>
                            <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.1em] flex items-center gap-3 mt-1">
                                <span className="flex items-center"><Store className="w-3 h-3 mr-1.5 text-blue-500" /> Store #402</span>
                                <span className="text-border">|</span>
                                <span className="flex items-center"><MapPin className="w-3 h-3 mr-1.5 text-blue-500" /> {SESSION_METADATA.lane}</span>
                                <span className="text-border">|</span>
                                <span className="flex items-center"><History className="w-3 h-3 mr-1.5 text-blue-500" /> Session: {SESSION_METADATA.session}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Trust Confidence</div>
                            <div className={`text-xl font-black tabular-nums ${SESSION_METADATA.trustScore > 80 ? 'text-green-500' : 'text-yellow-500'}`}>
                                {SESSION_METADATA.trustScore}%
                            </div>
                        </div>
                        <div className="h-10 w-[1px] bg-border mx-2 hidden sm:block"></div>
                        <Button variant="outline" size="sm" className="h-9 border-border text-muted-foreground hover:text-foreground bg-muted shadow-sm px-4">
                            <FileText className="w-4 h-4 mr-2 text-blue-500" /> <span className="text-[10px] font-bold uppercase tracking-widest">Logs</span>
                        </Button>
                    </div>
                </div>
            </header>

            <div className="p-6 w-full max-w-[1800px] mx-auto flex-1 flex flex-col lg:flex-row gap-6">

                {/* 2. VISION EVIDENCE PANEL (Left - 60%) */}
                <div className="lg:w-[60%] flex flex-col gap-4">
                    <Card className="bg-card border-border flex-1 flex flex-col relative overflow-hidden group shadow-lg">
                        <CardHeader className="py-2.5 px-4 border-b border-border/50 bg-muted/10 flex flex-row items-center justify-between">
                            <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center">
                                <Eye className="w-3.5 h-3.5 mr-2 text-blue-500" /> Active Optical Sensor Stream
                            </CardTitle>
                            <div className="flex items-center gap-2">
                                <Button size="sm" variant="ghost" className={`h-7 px-2 text-[10px] font-bold uppercase tracking-tighter transition-all ${showOCR ? 'text-blue-500 bg-blue-500/10' : 'text-muted-foreground'}`} onClick={() => setShowOCR(!showOCR)}>
                                    Overlay
                                </Button>
                                <Separator orientation="vertical" className="h-3 bg-border" />
                                <div className="flex items-center bg-muted/50 rounded-md border border-border px-1.5 h-7">
                                    <Button size="icon" variant="ghost" className="h-5 w-5 text-muted-foreground hover:text-foreground" onClick={() => setZoomLevel(Math.max(1, zoomLevel - 0.5))}><ZoomOut className="w-3 h-3" /></Button>
                                    <span className="text-[9px] font-bold text-muted-foreground w-10 text-center tabular-nums">{Math.round(zoomLevel * 100)}%</span>
                                    <Button size="icon" variant="ghost" className="h-5 w-5 text-muted-foreground hover:text-foreground" onClick={() => setZoomLevel(Math.min(3, zoomLevel + 0.5))}><ZoomIn className="w-3 h-3" /></Button>
                                </div>
                            </div>
                        </CardHeader>

                        {/* Mock Image Area */}
                        <div className="relative flex-1 bg-background flex items-center justify-center overflow-hidden min-h-[500px] shadow-inner">
                            <div
                                className="relative w-full h-full bg-muted/20 flex items-center justify-center transition-transform duration-300"
                                style={{ transform: `scale(${zoomLevel})` }}
                            >
                                <div className="absolute inset-0 flex flex-col items-center justify-center opacity-10 pointer-events-none">
                                    <ScanLine className="w-24 h-24 text-muted-foreground mb-4" />
                                    <p className="text-muted-foreground font-black text-xl uppercase tracking-[0.5em]">Vision Sensor Hub</p>
                                </div>

                                {/* Mock Bounding Boxes (Absolute Positioned) */}
                                <div className="absolute top-[30%] left-[20%] w-[120px] h-[180px] border-2 border-green-500 bg-green-500/10 flex flex-col justify-end p-1 shadow-[0_0_15px_rgba(34,197,94,0.3)]">
                                    <span className="text-[9px] bg-green-500 text-black px-1.5 py-0.5 font-bold w-fit uppercase tracking-tighter">Matched (98%)</span>
                                </div>

                                <div className="absolute top-[40%] left-[50%] w-[100px] h-[140px] border-2 border-green-500 bg-green-500/10 flex flex-col justify-end p-1 shadow-[0_0_15px_rgba(34,197,94,0.3)]">
                                    <span className="text-[9px] bg-green-500 text-black px-1.5 py-0.5 font-bold w-fit uppercase tracking-tighter">Matched (95%)</span>
                                </div>

                                {/* The Problem Item */}
                                <div className="absolute top-[35%] left-[70%] w-[90px] h-[90px] border-2 border-red-500 bg-red-500/10 flex flex-col justify-end p-1 animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.4)]">
                                    <span className="text-[9px] bg-red-500 text-white px-1.5 py-0.5 font-bold w-fit uppercase tracking-tighter">UNSCANNED!</span>
                                </div>

                            </div>
                        </div>

                        <div className="p-3 bg-muted/30 border-t border-border/50">
                            <p className="text-[10px] text-muted-foreground font-medium flex items-center tracking-tight">
                                <AlertTriangle className="w-3.5 h-3.5 text-red-500 mr-2" />
                                <span className="text-foreground font-black mr-2 uppercase tracking-widest">SIGNAL ALERT:</span> 
                                Anomaly detected at lane terminal. Possibility of unscanned item in checkout volume.
                            </p>
                        </div>
                    </Card>
                </div>

                {/* 3. COMPARISON & ACTIONS (Right - 40%) */}
                <div className="lg:w-[40%] flex flex-col gap-6">

                    {/* Detected vs Scanned */}
                    <Card className="bg-card border-border flex-1 shadow-lg">
                        <CardHeader className="py-2.5 px-4 border-b border-border/50 bg-muted/20">
                            <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Live Session Manifest</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="grid grid-cols-2 text-[9px] font-black text-muted-foreground border-b border-border/50 uppercase tracking-widest">
                                <div className="p-3 border-r border-border/50 bg-muted/30">AI Detected (Optical)</div>
                                <div className="p-3 bg-muted/30">POS Scanned (System)</div>
                            </div>

                            <div className="divide-y divide-border/30">
                                {/* Matched Row */}
                                <div className="grid grid-cols-2 min-h-[50px] group hover:bg-muted/30 transition-colors">
                                    <div className="p-3 border-r border-border/50 flex justify-between items-center text-[11px] text-muted-foreground font-bold">
                                        <span className="uppercase">Cola 12pk</span>
                                        <Badge variant="secondary" className="bg-green-500/10 text-green-500 text-[9px] h-5 font-bold">98%</Badge>
                                    </div>
                                    <div className="p-3 flex justify-between items-center text-[11px] text-muted-foreground font-bold">
                                        <span className="uppercase">Cola 12pk</span>
                                        <Check className="w-3.5 h-3.5 text-green-500" />
                                    </div>
                                </div>

                                {/* Matched Row */}
                                <div className="grid grid-cols-2 min-h-[50px] group hover:bg-muted/30 transition-colors">
                                    <div className="p-3 border-r border-border/50 flex justify-between items-center text-[11px] text-muted-foreground font-bold">
                                        <span className="uppercase">Potato Chips Lg</span>
                                        <Badge variant="secondary" className="bg-green-500/10 text-green-500 text-[9px] h-5 font-bold">95%</Badge>
                                    </div>
                                    <div className="p-3 flex justify-between items-center text-[11px] text-muted-foreground font-bold">
                                        <span className="uppercase">Potato Chips Lg</span>
                                        <Check className="w-3.5 h-3.5 text-green-500" />
                                    </div>
                                </div>

                                {/* Matched Row */}
                                <div className="grid grid-cols-2 min-h-[50px] group hover:bg-muted/30 transition-colors">
                                    <div className="p-3 border-r border-border/50 flex justify-between items-center text-[11px] text-muted-foreground font-bold">
                                        <span className="uppercase">Candy Bar</span>
                                        <Badge variant="secondary" className="bg-green-500/10 text-green-500 text-[9px] h-5 font-bold">92%</Badge>
                                    </div>
                                    <div className="p-3 flex justify-between items-center text-[11px] text-muted-foreground font-bold">
                                        <span className="uppercase">Candy Bar</span>
                                        <Check className="w-3.5 h-3.5 text-green-500" />
                                    </div>
                                </div>

                                {/* MISMATCH ROW */}
                                <div className="grid grid-cols-2 min-h-[60px] bg-red-500/5 animate-pulse">
                                    <div className="p-3 border-r border-red-500/20 flex justify-between items-center text-[11px] text-red-500 font-black uppercase">
                                        <div className="flex flex-col">
                                            <span>Unknown Item</span>
                                            <span className="text-[8px] text-muted-foreground font-bold">OB-ID: #8821</span>
                                        </div>
                                        <Badge variant="destructive" className="bg-red-500/20 text-red-500 border-red-500/20 text-[9px] h-5 font-black">MISSING SCAN</Badge>
                                    </div>
                                    <div className="p-3 flex items-center justify-center text-[10px] text-muted-foreground font-black uppercase italic relative tracking-widest opacity-40">
                                        -- NULL SIGNAL --
                                        <div className="absolute bottom-2 right-2 text-[8px] text-red-500 flex items-center font-bold">
                                            <XCircle className="w-2.5 h-2.5 mr-1" /> VOLATILITY
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Reasoning Panel */}
                    <Card className="bg-muted/30 border border-border shadow-sm">
                        <CardHeader className="py-2 px-4 border-b border-border/50 bg-muted/10">
                            <CardTitle className="text-[10px] font-black text-blue-500 uppercase flex items-center tracking-[0.2em]">
                                <ScanLine className="w-3 h-3 mr-2" /> Neural Engine Inference
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-4 py-3">
                            <p className="text-[11px] text-muted-foreground font-medium leading-relaxed">
                                Vision system detected an object entered the bagging area at <span className="font-bold text-foreground tabular-nums">10:42:05</span> that does not correspond to any recent scan event. Confidence is low <span className="text-orange-500 font-bold">(45%)</span> due to label occlusion, but object dimensions match <span className="text-foreground font-black uppercase tracking-tighter">"Fresh Produce / Bulk SKU"</span> profile.
                            </p>
                        </CardContent>
                    </Card>

                    {/* Action Panel */}
                    <div className="mt-auto space-y-4">
                        <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">Protocol Resolution</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <Button className="bg-green-600 hover:bg-green-700 text-white font-black uppercase text-[10px] tracking-widest h-12 shadow-lg shadow-green-600/20" onClick={() => setResolution('confirmed')}>
                                <CheckCircle2 className="w-4 h-4 mr-2" /> Confirm & Post
                            </Button>
                            <Button variant="outline" className="border-border bg-card text-muted-foreground hover:text-foreground h-12 font-black uppercase text-[10px] tracking-widest shadow-sm" onClick={() => setResolution('corrected')}>
                                <BadgeCheck className="w-4 h-4 mr-2 text-blue-500" /> Force Valid
                            </Button>
                        </div>
                        <Button variant="destructive" className="w-full bg-red-600 hover:bg-red-700 text-white font-black uppercase text-[10px] tracking-widest h-12 shadow-lg shadow-red-600/20" onClick={() => setResolution('escalated')}>
                            <ShieldCheck className="w-4 h-4 mr-2" /> Escalate to LP Protocol
                        </Button>

                        {resolution && (
                            <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-center animate-in zoom-in-95 duration-300">
                                <span className="text-[11px] font-black text-green-500 uppercase tracking-widest flex items-center justify-center">
                                    <Check className="w-3.5 h-3.5 mr-2" /> Resolution Stored: {resolution}
                                </span>
                            </div>
                        )}
                    </div>

                </div>

            </div>
        </div>
    );
};

export default CheckoutVisionPage;



