
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ShieldCheck, AlertTriangle, CheckCircle2, XCircle,
    ZoomIn, ZoomOut, Check, ScanLine, Eye,
    Maximize2, FileText, BadgeCheck, HelpCircle
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
    const [zoomLevel, setZoomLevel] = useState(1);
    const [showOCR, setShowOCR] = useState(true);
    const [resolution, setResolution] = useState(null); // 'confirmed', 'corrected', 'escalated'

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-foreground pb-20 font-sans w-full flex flex-col">

            {/* 1. HEADER */}
            <header className="sticky top-0 z-30 bg-[#111] border-b border-[#222] shadow-lg">
                <div className="px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center space-x-4">
                        <div>
                            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                                Vision Verification
                                <Badge variant="outline" className="text-orange-400 border-orange-900 bg-orange-900/10 ml-2">
                                    {SESSION_METADATA.status}
                                </Badge>
                            </h1>
                            <div className="text-xs text-gray-500 font-mono flex items-center gap-3 mt-1">
                                <span>Store #402</span>
                                <span>•</span>
                                <span>{SESSION_METADATA.lane}</span>
                                <span>•</span>
                                <span>Session #{SESSION_METADATA.session}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="text-right hidden sm:block">
                            <div className="text-xs text-gray-400">Total Confidence</div>
                            <div className={`text-lg font-bold ${SESSION_METADATA.trustScore > 80 ? 'text-green-500' : 'text-yellow-500'}`}>
                                {SESSION_METADATA.trustScore}%
                            </div>
                        </div>
                        <div className="h-8 w-[1px] bg-[#333] mx-2 hidden sm:block"></div>
                        <Button variant="outline" size="sm" className="border-[#333] text-gray-400 hover:text-white bg-[#1a1a1a]">
                            <FileText className="w-4 h-4 mr-2" /> View Logs
                        </Button>
                    </div>
                </div>
            </header>

            <div className="p-6 w-full max-w-[1800px] mx-auto flex-1 flex flex-col lg:flex-row gap-6">

                {/* 2. VISION EVIDENCE PANEL (Left - 60%) */}
                <div className="lg:w-[60%] flex flex-col gap-4">
                    <Card className="bg-[#111] border-[#333] flex-1 flex flex-col relative overflow-hidden group">
                        <CardHeader className="py-3 px-4 border-b border-[#222] flex flex-row items-center justify-between">
                            <CardTitle className="text-sm font-medium text-gray-300 flex items-center">
                                <Eye className="w-4 h-4 mr-2 text-blue-500" /> Camera Feed (Active)
                            </CardTitle>
                            <div className="flex items-center gap-2">
                                <Button size="sm" variant="ghost" className={`h-7 px-2 text-xs ${showOCR ? 'text-blue-400 bg-blue-900/20' : 'text-gray-500'}`} onClick={() => setShowOCR(!showOCR)}>
                                    OCR Overlay
                                </Button>
                                <Separator orientation="vertical" className="h-4 bg-[#333]" />
                                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setZoomLevel(Math.max(1, zoomLevel - 0.5))}><ZoomOut className="w-4 h-4" /></Button>
                                <span className="text-xs text-gray-400 w-8 text-center">{Math.round(zoomLevel * 100)}%</span>
                                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setZoomLevel(Math.min(3, zoomLevel + 0.5))}><ZoomIn className="w-4 h-4" /></Button>
                            </div>
                        </CardHeader>

                        {/* Mock Image Area */}
                        <div className="relative flex-1 bg-[#050505] flex items-center justify-center overflow-hidden">
                            <div
                                className="relative w-full h-[500px] bg-neutral-900 flex items-center justify-center transition-transform duration-300"
                                style={{ transform: `scale(${zoomLevel})` }}
                            >
                                <p className="text-gray-600 font-mono text-sm">[ LIVE CHECKOUT FEED ]</p>

                                {/* Mock Bounding Boxes (Absolute Positioned) */}
                                <div className="absolute top-[30%] left-[20%] w-[120px] h-[180px] border-2 border-green-500 bg-green-500/10 flex flex-col justify-end p-1">
                                    <span className="text-[10px] bg-green-500 text-black px-1 font-bold w-fit">Cola 12pk (98%)</span>
                                </div>

                                <div className="absolute top-[40%] left-[50%] w-[100px] h-[140px] border-2 border-green-500 bg-green-500/10 flex flex-col justify-end p-1">
                                    <span className="text-[10px] bg-green-500 text-black px-1 font-bold w-fit">Chips (95%)</span>
                                </div>

                                {/* The Problem Item */}
                                <div className="absolute top-[35%] left-[70%] w-[90px] h-[90px] border-2 border-red-500 bg-red-500/10 flex flex-col justify-end p-1 animate-pulse">
                                    <span className="text-[10px] bg-red-500 text-white px-1 font-bold w-fit">Unscanned!</span>
                                </div>

                            </div>
                        </div>

                        <div className="p-3 bg-[#151515] border-t border-[#222]">
                            <p className="text-xs text-gray-400 flex items-center">
                                <AlertTriangle className="w-3 h-3 text-red-500 mr-2" />
                                <span className="text-white font-medium mr-1">Alert Trigger:</span> Unscanned item detected in bagging area.
                            </p>
                        </div>
                    </Card>
                </div>

                {/* 3. COMPARISON & ACTIONS (Right - 40%) */}
                <div className="lg:w-[40%] flex flex-col gap-6">

                    {/* Detected vs Scanned */}
                    <Card className="bg-[#111] border-[#333] flex-1">
                        <CardHeader className="py-3 px-4 border-b border-[#222]">
                            <CardTitle className="text-sm font-bold text-white uppercase tracking-wider">Session Manifest</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="grid grid-cols-2 text-xs font-semibold text-gray-500 border-b border-[#222]">
                                <div className="p-3 border-r border-[#222] bg-[#1a1a1a]">AI DETECTED (Vision)</div>
                                <div className="p-3 bg-[#1a1a1a]">POS SCANNED (Transaction)</div>
                            </div>

                            <div className="divide-y divide-[#222]">
                                {/* Matched Row */}
                                <div className="grid grid-cols-2 min-h-[50px] group hover:bg-[#151515]">
                                    <div className="p-3 border-r border-[#222] flex justify-between items-center text-sm text-gray-300">
                                        <span>Cola 12pk</span>
                                        <Badge variant="secondary" className="bg-green-900/20 text-green-500 text-[10px] h-5">98%</Badge>
                                    </div>
                                    <div className="p-3 flex justify-between items-center text-sm text-gray-300">
                                        <span>Cola 12pk</span>
                                        <Check className="w-4 h-4 text-green-500" />
                                    </div>
                                </div>

                                {/* Matched Row */}
                                <div className="grid grid-cols-2 min-h-[50px] group hover:bg-[#151515]">
                                    <div className="p-3 border-r border-[#222] flex justify-between items-center text-sm text-gray-300">
                                        <span>Potato Chips Lg</span>
                                        <Badge variant="secondary" className="bg-green-900/20 text-green-500 text-[10px] h-5">95%</Badge>
                                    </div>
                                    <div className="p-3 flex justify-between items-center text-sm text-gray-300">
                                        <span>Potato Chips Lg</span>
                                        <Check className="w-4 h-4 text-green-500" />
                                    </div>
                                </div>

                                {/* Matched Row */}
                                <div className="grid grid-cols-2 min-h-[50px] group hover:bg-[#151515]">
                                    <div className="p-3 border-r border-[#222] flex justify-between items-center text-sm text-gray-300">
                                        <span>Candy Bar</span>
                                        <Badge variant="secondary" className="bg-green-900/20 text-green-500 text-[10px] h-5">92%</Badge>
                                    </div>
                                    <div className="p-3 flex justify-between items-center text-sm text-gray-300">
                                        <span>Candy Bar</span>
                                        <Check className="w-4 h-4 text-green-500" />
                                    </div>
                                </div>

                                {/* MISMATCH ROW */}
                                <div className="grid grid-cols-2 min-h-[60px] bg-red-900/10 animate-in fade-in duration-500">
                                    <div className="p-3 border-r border-red-900/30 flex justify-between items-center text-sm text-white font-medium">
                                        <div className="flex flex-col">
                                            <span>Unknown Item</span>
                                            <span className="text-[10px] text-gray-400">Box ID: #8821</span>
                                        </div>
                                        <Badge variant="destructive" className="bg-red-500/20 text-red-200 border-red-500/50 text-[10px] h-5">Unscanned</Badge>
                                    </div>
                                    <div className="p-3 flex items-center justify-center text-sm text-gray-500 italic pb-6 relative">
                                        -- No Scan --
                                        <div className="absolute bottom-2 right-2 text-[10px] text-red-400 flex items-center">
                                            <XCircle className="w-3 h-3 mr-1" /> Mismatch
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Reasoning Panel */}
                    <Card className="bg-[#151515] border border-blue-900/30">
                        <CardHeader className="py-2 px-4">
                            <CardTitle className="text-xs font-semibold text-blue-400 uppercase flex items-center">
                                <ScanLine className="w-3 h-3 mr-2" /> AI Reasoning
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-4 py-3">
                            <p className="text-sm text-gray-300 leading-relaxed">
                                Vision system detected an object entered the bagging area at <span className="font-mono text-xs text-white">10:42:05</span> that does not correspond to any recent scan event. Confidence is low (45%) due to label occlusion, but object dimensions match <span className="text-white font-semibold">"Fresh Produce"</span> profile.
                            </p>
                        </CardContent>
                    </Card>

                    {/* Action Panel */}
                    <div className="mt-auto space-y-3">
                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">Supervisor Resolution</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <Button className="bg-green-600 hover:bg-green-700 text-white border-none h-10" onClick={() => setResolution('confirmed')}>
                                <CheckCircle2 className="w-4 h-4 mr-2" /> Confirm & Add
                            </Button>
                            <Button variant="outline" className="border-[#333] bg-[#1a1a1a] text-gray-300 hover:text-white h-10" onClick={() => setResolution('corrected')}>
                                <BadgeCheck className="w-4 h-4 mr-2" /> Mark Correct
                            </Button>
                        </div>
                        <Button variant="destructive" className="w-full bg-red-900/30 hover:bg-red-900/50 text-red-200 border border-red-900/50 h-10" onClick={() => setResolution('escalated')}>
                            <ShieldCheck className="w-4 h-4 mr-2" /> Escalate to Loss Prevention
                        </Button>

                        {resolution && (
                            <div className="p-3 bg-green-900/20 border border-green-900/50 rounded text-center animate-in zoom-in-95 duration-300">
                                <span className="text-sm font-bold text-green-400 flex items-center justify-center">
                                    <Check className="w-4 h-4 mr-2" /> Resolution Logged: {resolution}
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
