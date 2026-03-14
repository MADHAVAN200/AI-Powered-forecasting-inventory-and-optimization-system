"use client";
import React, { useState, useRef, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { X, Thermometer, TrendingDown, Shield, BarChart3, History, MessageCircle, Truck, Tag, Trash2, Send, MapPin, Package, Calendar, User, Building, Clock, AlertTriangle, CheckCircle, Video, Play, Pause, Volume2, VolumeX, ZoomIn, ZoomOut, Eraser, TrendingUp, ChevronsRight, ChevronsLeft } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
const ultraAdvancedStoreLayout = {
    width: 1200, height: 800,
    keyPoints: { entrance: { id: 'entrance', x: 600, y: 750 } },
    sections: [
        { id: 'produce', name: 'Fresh Produce', x: 50, y: 50, width: 250, height: 700, color: 'fill-green-50/70 stroke-green-200' },
        { id: 'dairy_meat', name: 'Dairy & Meat', x: 900, y: 50, width: 250, height: 700, color: 'fill-blue-50/70 stroke-blue-200' },
        { id: 'bakery', name: 'Bakery', x: 325, y: 50, width: 250, height: 100, color: 'fill-yellow-50/70 stroke-yellow-200' },
        { id: 'frozen', name: 'Frozen Goods', x: 625, y: 50, width: 250, height: 100, color: 'fill-cyan-50/70 stroke-cyan-200' },
        { id: 'main', name: 'Main', x: 325, y: 175, width: 550, height: 575, color: 'fill-gray-50/70 stroke-gray-200' },
    ],
    aisles: [
        { id: 'A1', x: 350, y: 200, width: 50, height: 500, waypoint: { x: 375, y: 700 } }, { id: 'A2', x: 450, y: 200, width: 50, height: 500, waypoint: { x: 475, y: 700 } },
        { id: 'A3', x: 550, y: 200, width: 50, height: 500, waypoint: { x: 575, y: 700 } }, { id: 'A4', x: 650, y: 200, width: 50, height: 500, waypoint: { x: 675, y: 700 } },
        { id: 'A5', x: 750, y: 200, width: 50, height: 500, waypoint: { x: 775, y: 700 } },
    ],
    locations: [
        { id: 'L01', name: "Gala Apples", x: 100, y: 100, category: 'Produce', stockLevel: 'high' }, { id: 'L02', name: "Bananas", x: 120, y: 110, category: 'Produce', stockLevel: 'high' },
        { id: 'L03', name: "Lettuce", x: 105, y: 250, category: 'Produce', stockLevel: 'medium' }, { id: 'L04', name: "Tomatoes", x: 180, y: 105, category: 'Produce', stockLevel: 'low' },
        { id: 'L05', name: "Carrots", x: 185, y: 255, category: 'Produce', stockLevel: 'high' }, { id: 'L06', name: "Baguette", x: 375, y: 100, category: 'Bakery', stockLevel: 'medium' },
        { id: 'L07', name: "Croissants", x: 450, y: 100, category: 'Bakery', stockLevel: 'low' }, { id: 'L08', name: "Ice Cream", x: 675, y: 100, category: 'Frozen', stockLevel: 'high' },
        { id: 'L09', name: "Pizza", x: 750, y: 100, category: 'Frozen', stockLevel: 'medium' }, { id: 'L10', name: "Cereal", x: 375, y: 250, category: 'Pantry', stockLevel: 'high' },
        { id: 'L11', name: "Oats", x: 375, y: 300, category: 'Pantry', stockLevel: 'medium' }, { id: 'L12', name: "Coffee", x: 375, y: 450, category: 'Beverages', stockLevel: 'high' },
        { id: 'L13', name: "Tea", x: 375, y: 500, category: 'Beverages', stockLevel: 'high' }, { id: 'L14', name: "Chips", x: 475, y: 250, category: 'Snacks', stockLevel: 'high' },
        { id: 'L15', name: "Pretzels", x: 475, y: 300, category: 'Snacks', stockLevel: 'low' }, { id: 'L16', name: "Cookies", x: 475, y: 450, category: 'Snacks', stockLevel: 'high' },
        { id: 'L17', name: "Crackers", x: 475, y: 500, category: 'Snacks', stockLevel: 'medium' }, { id: 'L18', name: "Pasta", x: 575, y: 250, category: 'Pantry', stockLevel: 'high' },
        { id: 'L19', name: "Pasta Sauce", x: 575, y: 300, category: 'Pantry', stockLevel: 'medium' }, { id: 'L20', name: "Rice", x: 575, y: 450, category: 'Pantry', stockLevel: 'high' },
        { id: 'L21', name: "Canned Soup", x: 575, y: 500, category: 'Pantry', stockLevel: 'low' }, { id: 'L22', name: "Soda", x: 675, y: 250, category: 'Beverages', stockLevel: 'high' },
        { id: 'L23', name: "Juice", x: 675, y: 300, category: 'Beverages', stockLevel: 'high' }, { id: 'L24', name: "Bottled Water", x: 675, y: 450, category: 'Beverages', stockLevel: 'medium' },
        { id: 'L25', name: "Energy Drinks", x: 675, y: 500, category: 'Beverages', stockLevel: 'low' }, { id: 'L26', name: "Shampoo", x: 775, y: 250, category: 'Health & Beauty', stockLevel: 'medium' },
        { id: 'L27', name: "Soap", x: 775, y: 300, category: 'Health & Beauty', stockLevel: 'high' }, { id: 'L28', name: "Toothpaste", x: 775, y: 450, category: 'Health & Beauty', stockLevel: 'high' },
        { id: 'L29', name: "Paper Towels", x: 775, y: 600, category: 'Household', stockLevel: 'low' }, { id: 'L30', name: "Detergent", x: 775, y: 650, category: 'Household', stockLevel: 'high' },
        { id: 'L31', name: "Milk", x: 950, y: 100, category: 'Dairy & Meat', stockLevel: 'high' }, { id: 'L32', name: "Cheese", x: 950, y: 150, category: 'Dairy & Meat', stockLevel: 'medium' },
        { id: 'L33', name: "Yogurt", x: 950, y: 200, category: 'Dairy & Meat', stockLevel: 'high' }, { id: 'L34', name: "Butter", x: 950, y: 250, category: 'Dairy & Meat', stockLevel: 'low' },
        { id: 'L35', name: "Eggs", x: 950, y: 300, category: 'Dairy & Meat', stockLevel: 'high' }, { id: 'L36', name: "Chicken", x: 1050, y: 100, category: 'Dairy & Meat', stockLevel: 'medium' },
        { id: 'L37', name: "Beef", x: 1050, y: 150, category: 'Dairy & Meat', stockLevel: 'low' }, { id: 'L38', name: "Pork", x: 1050, y: 200, category: 'Dairy & Meat', stockLevel: 'high' },
        { id: 'L39', name: "Fish", x: 1050, y: 250, category: 'Dairy & Meat', stockLevel: 'high' },
    ],
};
// =================================================================================
// ULTRA ADVANCED STORE MAP COMPONENT v2.0
// =================================================================================
const SuperAdvancedStoreMap = ({ product, storeLayout }) => {
    const [transform, setTransform] = useState({ scale: 0.8, translateX: 0, translateY: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [startDrag, setStartDrag] = useState({ x: 0, y: 0 });
    const [activeFilters, setActiveFilters] = useState({ category: null, stock: false });
    const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
    const svgRef = useRef(null);
    const handleWheel = (e) => { e.preventDefault(); const newScale = Math.min(Math.max(0.2, transform.scale - e.deltaY * 0.001), 3); setTransform(t => ({ ...t, scale: newScale })); };
    const handleMouseDown = (e) => { setIsDragging(true); setStartDrag({ x: e.clientX, y: e.clientY }); };
    const handleMouseMove = (e) => { if (!isDragging)
        return; const dx = e.clientX - startDrag.x; const dy = e.clientY - startDrag.y; setTransform(t => ({ ...t, translateX: t.translateX + dx, translateY: t.translateY + dy })); setStartDrag({ x: e.clientX, y: e.clientY }); };
    const handleMouseUp = () => setIsDragging(false);
    const resetView = () => { setTransform({ scale: 0.8, translateX: 0, translateY: 0 }); setActiveFilters({ category: null, stock: false }); };
    const zoom = (dir) => setTransform(t => ({ ...t, scale: Math.min(3, Math.max(0.2, t.scale * (dir === 'in' ? 1.3 : 1 / 1.3))) }));
    const toggleCategoryFilter = (category) => setActiveFilters(f => ({ ...f, category: f.category === category ? null : category }));
    const findAndFocusItem = () => {
        const targetLocation = storeLayout.locations.find(l => l.id === product.locationId);
        if (!targetLocation)
            return;
        const newScale = 1.5;
        const newX = (storeLayout.width / 2) - (targetLocation.x * newScale);
        const newY = (storeLayout.height / 2) - (targetLocation.y * newScale);
        setTransform({ scale: newScale, translateX: newX, translateY: newY });
    };
    useEffect(() => { findAndFocusItem(); }, [product.locationId]);
    const visibleLocations = useMemo(() => storeLayout.locations.filter(l => !activeFilters.category || l.category === activeFilters.category), [storeLayout.locations, activeFilters.category]);
    const clusters = useMemo(() => {
        if (transform.scale > 0.8)
            return [];
        const clusterThreshold = 80 / transform.scale;
        let points = JSON.parse(JSON.stringify(visibleLocations));
        let clusters = [];
        while (points.length > 0) {
            let currentPoint = points.pop();
            let cluster = { x: currentPoint.x, y: currentPoint.y, count: 1, items: [currentPoint] };
            let i = 0;
            while (i < points.length) {
                if (Math.hypot(currentPoint.x - points[i].x, currentPoint.y - points[i].y) < clusterThreshold) {
                    cluster.x = (cluster.x * cluster.count + points[i].x) / (cluster.count + 1);
                    cluster.y = (cluster.y * cluster.count + points[i].y) / (cluster.count + 1);
                    cluster.items.push(points[i]);
                    cluster.count++;
                    points.splice(i, 1);
                }
                else {
                    i++;
                }
            }
            clusters.push(cluster);
        }
        return clusters;
    }, [visibleLocations, transform.scale]);
    const getStockColor = (level) => (!activeFilters.stock) ? null : (level === 'high' ? 'fill-green-500' : level === 'medium' ? 'fill-yellow-400' : 'fill-red-500');
    return (<Card className="bg-white border-0 shadow-sm overflow-hidden h-[700px] flex flex-row">
      <div className={cn("transition-all duration-300 ease-in-out bg-white border-r", isPanelCollapsed ? 'w-0' : 'w-72')}><div className={cn("p-4 flex flex-col h-full", isPanelCollapsed && 'hidden')}><CardTitle>Store Map</CardTitle><div className="mt-4 border-t pt-4"><div className="flex justify-between items-center"><Label className="font-semibold">Category Filters</Label><Button variant="link" size="sm" className="p-0 h-auto" onClick={() => toggleCategoryFilter(null)}>Clear</Button></div><div className="grid grid-cols-2 gap-2 mt-2">{['Produce', 'Bakery', 'Snacks', 'Beverages', 'Dairy & Meat', 'Household'].map(cat => (<Button key={cat} onClick={() => toggleCategoryFilter(cat)} variant={activeFilters.category === cat ? "default" : "outline"} size="sm">{cat}</Button>))}</div></div><div className="mt-4 border-t pt-4"><Label className="font-semibold">Overlays</Label><div className="flex items-center justify-between mt-2 p-2 rounded-lg bg-gray-50"><span className="text-sm font-medium">Stock Levels</span><Switch checked={activeFilters.stock} onCheckedChange={checked => setActiveFilters(f => ({ ...f, stock: checked }))}/></div></div><div className="mt-auto border-t pt-4"><Button onClick={findAndFocusItem} className="w-full"><MapPin className="w-4 h-4 mr-2"/>Find My Item</Button></div></div></div>
      <div className="flex-1 relative bg-gray-100 overflow-hidden cursor-grab" onWheel={handleWheel} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp} ref={svgRef}>
        <TooltipProvider delayDuration={100}><svg viewBox={`0 0 ${storeLayout.width} ${storeLayout.height}`} className="w-full h-full"><g style={{ transform: `translateX(${transform.translateX}px) translateY(${transform.translateY}px) scale(${transform.scale})`, transformOrigin: 'center center', transition: 'transform 0.2s ease-out' }}>
          {storeLayout.sections.map(s => <rect key={s.id} x={s.x} y={s.y} width={s.width} height={s.height} className={cn("stroke-[1px]", s.color)} rx="5"/>)}
          {storeLayout.aisles.map(a => <g key={a.id}><rect x={a.x} y={a.y} width={a.width} height={a.height} className="fill-gray-200/80 stroke-gray-300" rx="3"/><text x={a.x + a.width / 2} y={a.y + 20} textAnchor="middle" className="font-bold text-xl fill-gray-500 pointer-events-none">{a.id}</text></g>)}
          <g><circle cx={storeLayout.keyPoints.entrance.x} cy={storeLayout.keyPoints.entrance.y} r="15" className="fill-blue-500 stroke-white stroke-[2px]"/><text x={storeLayout.keyPoints.entrance.x} y={storeLayout.keyPoints.entrance.y + 35} textAnchor="middle" className="font-semibold text-xl fill-gray-700">Entrance</text></g>
          {transform.scale <= 0.8 ? clusters.map((c, i) => (<Tooltip key={`cluster-${i}`}><TooltipTrigger asChild><g className="cursor-pointer" onClick={() => zoom('in')}><circle cx={c.x} cy={c.y} r={10 + Math.log2(c.count) * 3} className="fill-purple-500/80 stroke-white stroke-[2px]"/><text x={c.x} y={c.y} dy=".3em" textAnchor="middle" className="font-bold text-xs fill-white pointer-events-none">{c.count}</text></g></TooltipTrigger><TooltipContent><p>{c.count} items in this area</p></TooltipContent></Tooltip>))
            : visibleLocations.map(l => { const isProductLocation = product.locationId === l.id; const stockColor = getStockColor(l.stockLevel); return (<Tooltip key={l.id}><TooltipTrigger asChild><circle cx={l.x} cy={l.y} r={isProductLocation ? 8 : 5} className={cn("stroke-white stroke-[1.5px] transition-all", stockColor || (isProductLocation ? "fill-red-500 ring-2 ring-red-300/80 animate-pulse" : "fill-blue-500"))}/></TooltipTrigger><TooltipContent><p className="font-semibold">{l.name} ({l.id})</p><p>Category: {l.category}</p><p>Stock: <span className={cn(l.stockLevel === 'high' && 'text-green-600', l.stockLevel === 'medium' && 'text-yellow-600', l.stockLevel === 'low' && 'text-red-600')}>{l.stockLevel}</span></p></TooltipContent></Tooltip>); })}
        </g></svg></TooltipProvider>
        <Button onClick={() => setIsPanelCollapsed(!isPanelCollapsed)} size="icon" className="absolute top-4 left-4 bg-white/80 text-gray-800 hover:bg-white backdrop-blur-sm shadow-lg z-10">{isPanelCollapsed ? <ChevronsRight className="w-5 h-5"/> : <ChevronsLeft className="w-5 h-5"/>}</Button>
        <div className="absolute top-4 right-4 flex flex-col gap-2 z-10"><Button onClick={() => zoom('in')} variant="secondary" size="icon" className="shadow-lg"><ZoomIn className="w-5 h-5"/></Button><Button onClick={() => zoom('out')} variant="secondary" size="icon" className="shadow-lg"><ZoomOut className="w-5 h-5"/></Button><Button onClick={resetView} variant="secondary" size="icon" className="shadow-lg"><Eraser className="w-5 h-5"/></Button></div>
      </div>
    </Card>);
};
// =================================================================================
// MAIN PRODUCT DETAIL PANEL COMPONENT (Corrected and Merged)
// =================================================================================
export function ProductDetailPanel({ product, onClose }) {
    const [sortConfig, setSortConfig] = useState({ key: 'freshness', direction: 'descending' });
    const chatMessagesEndRef = useRef(null);
    const getGreeting = () => { const hour = new Date().getHours(); if (hour < 12)
        return "Good morning"; if (hour < 17)
        return "Good afternoon"; return "Good evening"; };
    const initialBotMessage = `${getGreeting()}! Analyzing ${product.name}. I can check expiry dates, suggest markdowns, find transfer options, or create a full action plan. How can I help?`;
    const [chatMessages, setChatMessages] = useState([{ id: 1, type: "bot", content: initialBotMessage, timestamp: new Date() }]);
    const [chatInput, setChatInput] = useState("");
    // Auto-scroll to bottom when new messages are added
    useEffect(() => {
        chatMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages]);
    const freshnessData = [{ time: "6 AM", score: 95 }, { time: "9 AM", score: 92 }, { time: "12 PM", score: 88 }, { time: "3 PM", score: 85 }, { time: "6 PM", score: 82 }, { time: "Now", score: product.freshness || product.score }];
    const iotMetrics = [{ label: "Temperature", value: product.temperature || "N/A", status: "optimal", icon: Thermometer }, { label: "Humidity", value: "65%", status: "optimal", icon: TrendingDown }, { label: "Air Quality", value: "Good", status: "optimal", icon: Shield }];
    const actions = [{ time: "2 hours ago", action: "Temperature check", user: "System", status: "completed" }, { time: "4 hours ago", action: "Location updated", user: "Staff #123", status: "completed" }, { time: "6 hours ago", action: "Quality inspection", user: "Manager", status: "completed" }];
    const handleSendMessage = (messageText = chatInput) => {
        if (!messageText.trim())
            return;
        addMessageToChat(messageText, "user");
        setTimeout(() => addMessageToChat(getBotResponse(messageText), "bot"), 500);
        setChatInput("");
    };
    const addMessageToChat = (content, type) => setChatMessages(prev => [...prev, { id: prev.length + 1, type, content, timestamp: new Date() }]);
    const getBotResponse = (question) => {
        const q = question.toLowerCase();
        const today = new Date("2025-08-05T17:03:15");
        const expiryDate = product.expiryDate ? new Date(product.expiryDate) : null;
        const daysUntilExpiry = expiryDate ? Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : null;
        if (q.includes("expiry")) {
            if (daysUntilExpiry === null)
                return "I cannot find an expiry date for this product.";
            if (daysUntilExpiry < 0)
                return `This product expired ${Math.abs(daysUntilExpiry)} days ago on ${expiryDate?.toLocaleDateString()}. It must be removed immediately.`;
            if (daysUntilExpiry <= 3)
                return `Critical: Expires in just ${daysUntilExpiry} days on ${expiryDate?.toLocaleDateString()}. I recommend an immediate flash sale.`;
            return `This product expires in ${daysUntilExpiry} days on ${expiryDate?.toLocaleDateString()}.`;
        }
        if (q.includes("transfer"))
            return "Store #002 (Pune) shows a 40% higher sales velocity. Transferring 50 units could prevent waste and capture an estimated ₹18,000 in additional revenue. I can prepare the transfer order.";
        if (q.includes("sale") || q.includes("price"))
            return `Given freshness of ${product.freshness}% and ${daysUntilExpiry ? `${daysUntilExpiry} days left` : 'its current state'}, a 25% markdown is optimal. This targets a sell-through in the next 2 days. For faster clearance, a 40% flash sale is advised.`;
        if (q.includes("summary") || q.includes("performance"))
            return `Sales Summary for ${product.name}:\n- Weekly Velocity: ${product.salesVelocity || 35} units/week.\n- Peak Hours: Sales data shows a peak between 4 PM - 6 PM.\n- Last Restock: ${product.lastRestocked ? new Date(product.lastRestocked).toLocaleDateString() : 'N/A'}.\n- Recommendation: Stock is healthy. Consider a small feature display during peak hours.`;
        if (q.includes("plan"))
            return `Action Plan for ${product.name}:\n1.  Immediate: Apply a 25% markdown due to freshness of ${product.freshness}%.\n2.  Placement: Move item to a high-traffic end-cap display in Aisle 2.\n3.  Marketing: Add to the store's digital circular for "Daily Deals".\n4.  Monitoring: Re-evaluate sales velocity in 48 hours. If unsold inventory is high, trigger a 40% flash sale.`;
        return "I can help with expiry dates, transfers, pricing, or a full action plan. How can I assist?";
    };
    const getRiskColor = (risk) => { if (risk === "low")
        return "bg-green-50 text-green-700 border-green-200"; if (risk === "medium")
        return "bg-yellow-50 text-yellow-700 border-yellow-200"; if (risk === "critical")
        return "bg-red-50 text-red-700 border-red-200"; return "bg-gray-50 text-gray-700 border-gray-200"; };
    const getRiskIcon = (risk) => { if (risk === "low")
        return <CheckCircle className="w-4 h-4"/>; if (risk === "medium" || risk === "critical")
        return <AlertTriangle className="w-4 h-4"/>; return <CheckCircle className="w-4 h-4"/>; };
    const sortedProducts = useMemo(() => product.isCategory ? [...(product.products || [])].sort((a, b) => { if (a[sortConfig.key] < b[sortConfig.key])
        return sortConfig.direction === 'ascending' ? -1 : 1; if (a[sortConfig.key] > b[sortConfig.key])
        return sortConfig.direction === 'ascending' ? 1 : -1; return 0; }) : [], [product, sortConfig]);
    const requestSort = (key) => { let direction = 'ascending'; if (sortConfig.key === key && sortConfig.direction === 'ascending')
        direction = 'descending';
    else if (sortConfig.key !== key)
        direction = (key === 'freshness' || key === 'price') ? 'descending' : 'ascending'; setSortConfig({ key, direction }); };
    const [isVideoPlaying, setIsVideoPlaying] = useState(true);
    const [isMuted, setIsMuted] = useState(true);
    if (!product)
        return null;
    // ***FIX: The return statement now has a single root <div> element***
    return (<div className="fixed inset-0 bg-black/50 z-50 flex">
      <div className="ml-auto w-full max-w-7xl bg-gray-50 h-full overflow-y-auto">
        <div className="sticky top-0 bg-gray-50/80 backdrop-blur-sm border-b px-6 py-4 flex items-center justify-between z-10">
          <div><h2 className="text-xl font-semibold text-gray-900">{product.isCategory ? `${product.name} Category Details` : product.name}</h2><p className="text-sm text-gray-600">{product.isCategory ? `${sortedProducts.length} items in category` : "Product Details & Analytics"}</p></div>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="w-5 h-5"/></Button>
        </div>
        <div className="p-6"><Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-7 bg-white border rounded-lg p-1">
            <TabsTrigger value="overview" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-md">Overview</TabsTrigger>
            <TabsTrigger value="items" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-md">{product.isCategory ? "All Items" : "Details"}</TabsTrigger>
            <TabsTrigger value="freshness" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-md">Freshness</TabsTrigger>
            <TabsTrigger value="location" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-md">Store Map</TabsTrigger>
            <TabsTrigger value="iot" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-md">IoT Data</TabsTrigger>
            <TabsTrigger value="live" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-md">Live Feed</TabsTrigger>
            <TabsTrigger value="chat" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-md">AI Assistant</TabsTrigger>
          </TabsList>

          <TabsContent value="live" className="mt-6"><div className="grid grid-cols-1 lg:grid-cols-2 gap-6"><Card className="bg-white border-0 shadow-sm"><CardHeader className="border-b"><CardTitle className="flex items-center justify-between"><span className="flex items-center"><Video className="w-5 h-5 mr-2 text-red-600"/>Live Video Feed</span><div className="flex items-center space-x-2"><div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div><span className="text-sm text-red-600 font-medium">LIVE</span></div></CardTitle></CardHeader><CardContent className="p-4"><div className="w-full bg-gray-900 rounded-lg overflow-hidden relative"><video key={product.id} src="/Walmart_Spinach_CCTV_Footage.mp4" autoPlay loop muted={isMuted} className="w-full h-full object-cover"/><div className="absolute bottom-2 left-2 right-2"><div className="flex items-center justify-between bg-black/50 rounded-lg p-2"><div className="flex items-center space-x-2"><Button size="icon" variant="ghost" className="text-white hover:bg-white/20 w-8 h-8" onClick={() => setIsVideoPlaying(p => !p)}>{isVideoPlaying ? <Pause className="w-4 h-4"/> : <Play className="w-4 h-4"/>}</Button><Button size="icon" variant="ghost" className="text-white hover:bg-white/20 w-8 h-8" onClick={() => setIsMuted(m => !m)}>{isMuted ? <VolumeX className="w-4 h-4"/> : <Volume2 className="w-4 h-4"/>}</Button></div><div className="text-white text-xs font-mono">{new Date().toLocaleTimeString()}</div></div></div></div></CardContent></Card><Card className="bg-white border-0 shadow-sm"><CardHeader className="border-b"><CardTitle>Camera Controls & Analytics</CardTitle></CardHeader><CardContent className="p-4 space-y-4"><div className="space-y-2"> <h4 className="font-medium text-sm text-gray-800">Camera Controls</h4><div className="grid grid-cols-2 gap-2"><Button variant="outline" size="sm"><Video className="w-4 h-4 mr-2"/>Record Clip</Button><Button variant="outline" size="sm"><Shield className="w-4 h-4 mr-2"/>Motion Alert</Button><Button variant="outline" size="sm"><BarChart3 className="w-4 h-4 mr-2"/>Analytics</Button><Button variant="outline" size="sm"><History className="w-4 h-4 mr-2"/>History</Button></div></div><div className="space-y-2"><h4 className="font-medium text-sm text-gray-800">Motion Detection</h4><div className="space-y-1 text-sm"><div className="flex justify-between p-2 bg-gray-50 rounded-md"><span>Motion Sensitivity</span><span className="font-semibold">High</span></div><div className="flex justify-between p-2 bg-gray-50 rounded-md"><span>Detection Zone</span><span className="font-semibold">Full Frame</span></div><div className="flex justify-between p-2 bg-gray-50 rounded-md"><span>Alert Frequency</span><span className="font-semibold">Every 5 min</span></div></div></div><div className="space-y-2"><h4 className="font-medium text-sm text-gray-800">Recent Activity</h4><div className="space-y-1 text-sm"><div className="flex items-center justify-between p-2 bg-blue-50/60 rounded-md"><span>Motion detected</span><span className="text-gray-500">2 minutes ago</span></div><div className="flex items-center justify-between p-2 bg-gray-50/60 rounded-md"><span>Staff member checked inventory</span><span className="text-gray-500">15 minutes ago</span></div><div className="flex items-center justify-between p-2 bg-gray-50/60 rounded-md"><span>Temperature alert resolved</span><span className="text-gray-500">1 hour ago</span></div></div></div></CardContent></Card></div></TabsContent>
          <TabsContent value="location" className="mt-6"><SuperAdvancedStoreMap product={product} storeLayout={ultraAdvancedStoreLayout}/></TabsContent>
          <TabsContent value="overview" className="mt-6"><div className="grid grid-cols-1 lg:grid-cols-2 gap-6"><Card className="bg-white border-0 shadow-sm"><CardHeader className="border-b"><CardTitle>{product.isCategory ? "Category Information" : "Product Information"}</CardTitle></CardHeader><CardContent className="p-6 space-y-4"><div className="flex items-center space-x-4"><img src={product.image || "/placeholder.svg?height=120&width=120"} alt={product.name} className="w-24 h-24 rounded-lg object-cover"/><div className="flex-1"><h3 className="font-semibold text-lg text-gray-900">{product.name}</h3><p className="text-gray-600">{product.category || "Category"}</p><div className="flex items-center space-x-2 mt-2"><Badge className={`${getRiskColor(product.risk)} border`}>{getRiskIcon(product.risk)}<span className="ml-1">{product.risk} risk</span></Badge></div></div></div><div className="grid grid-cols-2 gap-x-4 gap-y-5 text-sm"><div><span className="text-gray-600 font-medium block">Current Freshness</span><div className="font-semibold text-xl text-gray-900">{product.freshness || product.score}%</div></div><div><span className="text-gray-600 font-medium block">Sales Velocity</span><div className="font-medium text-gray-900 flex items-center">{product.salesVelocity || 'N/A'} units/week <TrendingUp className="w-4 h-4 ml-1 text-green-500"/></div></div>{!product.isCategory && <><div><span className="text-gray-600 font-medium block">Shelf Life</span><div className="font-medium text-gray-900">{product.shelfLife}</div></div><div><span className="text-gray-600 font-medium block">Last Restocked</span><div className="font-medium text-gray-900">{product.lastRestocked ? new Date(product.lastRestocked).toLocaleDateString() : 'N/A'}</div></div><div><span className="text-gray-600 font-medium block">Batch ID</span><div className="font-medium text-gray-900">{product.batch}</div></div><div><span className="text-gray-600 font-medium block">Location</span><div className="font-medium text-gray-900">{product.location}, Shelf {product.shelf}</div></div></>}
          {product.isCategory && <><div><span className="text-gray-600 font-medium block">Total Items</span><div className="font-medium text-gray-900">{product.items}</div></div><div><span className="text-gray-600 font-medium block">Total Value</span><div className="font-medium text-gray-900">{product.totalValue}</div></div><div><span className="text-gray-600 font-medium block">Items at Risk</span><div className="font-medium text-red-600">{product.criticalItems}</div></div></>}</div></CardContent></Card><Card className="bg-white border-0 shadow-sm"><CardHeader className="border-b"><CardTitle>Quick Actions</CardTitle></CardHeader><CardContent className="p-6 space-y-3"><Button className="w-full justify-start bg-blue-600 hover:bg-blue-700 text-white"><Truck className="w-4 h-4 mr-2"/>Transfer to High-Demand Store</Button><Button className="w-full justify-start bg-green-600 hover:bg-green-700 text-white"><Tag className="w-4 h-4 mr-2"/>Create Flash Sale (30% off)</Button><Button className="w-full justify-start bg-orange-600 hover:bg-orange-700 text-white"><TrendingDown className="w-4 h-4 mr-2"/>Apply Markdown (25% off)</Button><Button variant="outline" className="w-full justify-start text-red-600 border-red-600 hover:bg-red-50 bg-transparent"><Trash2 className="w-4 h-4 mr-2"/>Remove from Inventory</Button><div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200"><p className="text-sm text-blue-700"><strong>AI Recommendation:</strong> Transfer to Store #002 within 6 hours for optimal revenue recovery.</p></div></CardContent></Card></div></TabsContent>
          <TabsContent value="items" className="mt-6">{product.isCategory ? (<div className="space-y-4"><div className="flex items-center justify-between"><h3 className="text-lg font-semibold text-gray-900">All Items in {product.name} ({sortedProducts.length})</h3><div className="flex space-x-2"><Button variant="outline" onClick={() => requestSort('name')}>Name {sortConfig.key === 'name' && (sortConfig.direction === 'ascending' ? '▲' : '▼')}</Button><Button variant="outline" onClick={() => requestSort('freshness')}>Freshness {sortConfig.key === 'freshness' && (sortConfig.direction === 'ascending' ? '▲' : '▼')}</Button><Button variant="outline" onClick={() => requestSort('price')}>Price {sortConfig.key === 'price' && (sortConfig.direction === 'ascending' ? '▲' : '▼')}</Button></div></div><div className="grid grid-cols-1 gap-4">{sortedProducts.map((item) => (<Card key={item.id} className="bg-white border border-gray-200 hover:shadow-sm transition-shadow"><CardContent className="p-4"><div className="flex items-center space-x-4"><img src="/placeholder.svg?height=60&width=60" alt={item.name} className="w-16 h-16 rounded-lg object-cover"/><div className="flex-1"><div className="flex items-start justify-between"><div><h4 className="font-semibold text-gray-900">{item.name}</h4><div className="flex items-center flex-wrap gap-x-4 text-sm text-gray-600 mt-1"><span className="flex items-center"><MapPin className="w-3 h-3 mr-1"/>{item.location}</span><span className="flex items-center"><Package className="w-3 h-3 mr-1"/>Shelf: {item.shelf}</span><span className="flex items-center"><Thermometer className="w-3 h-3 mr-1"/>{item.temperature}</span><span className="flex items-center"><Clock className="w-3 h-3 mr-1"/>{item.shelfLife}</span></div><div className="text-xs text-gray-500 mt-1"><span>Batch: {item.batch}</span></div></div><div className="text-right flex-shrink-0 ml-2"><div className="font-bold text-xl text-gray-900">{item.freshness}%</div><Badge className={`${getRiskColor(item.risk)} border`}>{item.risk}</Badge><div className="text-sm text-gray-600 mt-1">₹{item.price} • {item.quantity} left</div></div></div></div></div></CardContent></Card>))}</div></div>) : (<div className="grid grid-cols-1 lg:grid-cols-2 gap-6"><Card className="bg-white border-0 shadow-sm"><CardHeader className="border-b border-gray-100"><CardTitle className="text-gray-900">Detailed Product Information</CardTitle></CardHeader><CardContent className="p-6"><div className="grid grid-cols-1 md:grid-cols-2 gap-6"><div className="space-y-4"><div className="flex items-center space-x-2"><Calendar className="w-4 h-4 text-gray-500"/><span className="text-sm text-gray-600">Received Date:</span><span className="font-medium text-gray-900">{product.receivedDate}</span></div><div className="flex items-center space-x-2"><Calendar className="w-4 h-4 text-gray-500"/><span className="text-sm text-gray-600">Expiry Date:</span><span className="font-medium text-gray-900">{product.expiryDate}</span></div><div className="flex items-center space-x-2"><User className="w-4 h-4 text-gray-500"/><span className="text-sm text-gray-600">Supplier:</span><span className="font-medium text-gray-900">{product.supplier}</span></div><div className="flex items-center space-x-2"><Package className="w-4 h-4 text-gray-500"/><span className="text-sm text-gray-600">Batch Number:</span><span className="font-medium text-gray-900">{product.batch}</span></div></div><div className="space-y-4"><div className="flex items-center space-x-2"><Building className="w-4 h-4 text-gray-500"/><span className="text-sm text-gray-600">Storage Location:</span><span className="font-medium text-gray-900">{product.location}</span></div><div className="flex items-center space-x-2"><MapPin className="w-4 h-4 text-gray-500"/><span className="text-sm text-gray-600">Shelf Position:</span><span className="font-medium text-gray-900">{product.shelf}</span></div><div className="flex items-center space-x-2"><Thermometer className="w-4 h-4 text-gray-500"/><span className="text-sm text-gray-600">Current Temperature:</span><span className="font-medium text-gray-900">{product.temperature}</span></div><div className="flex items-center space-x-2"><Clock className="w-4 h-4 text-gray-500"/><span className="text-sm text-gray-600">Remaining Shelf Life:</span><span className="font-medium text-gray-900">{product.shelfLife}</span></div></div></div></CardContent></Card><Card className="bg-white border-0 shadow-sm"><CardHeader className="border-b"><CardTitle>Supplier Performance</CardTitle><CardDescription>Metrics for {product.supplier}</CardDescription></CardHeader><CardContent className="p-6 grid grid-cols-2 gap-4"><div className="p-3 bg-gray-50 rounded-lg"><p className="text-sm text-gray-600">On-Time Delivery</p><p className="text-lg font-bold text-green-600">98%</p></div><div className="p-3 bg-gray-50 rounded-lg"><p className="text-sm text-gray-600">Quality Rating</p><p className="text-lg font-bold text-green-600">4.9/5.0</p></div><div className="p-3 bg-gray-50 rounded-lg"><p className="text-sm text-gray-600">Avg. Lead Time</p><p className="text-lg font-bold text-gray-800">2 Days</p></div><div className="p-3 bg-gray-50 rounded-lg"><p className="text-sm text-gray-600">Last Order</p><p className="text-lg font-bold text-gray-800">15 Days Ago</p></div></CardContent></Card></div>)}</TabsContent>
          <TabsContent value="freshness" className="mt-6"><Card className="bg-white border-0 shadow-sm"><CardHeader className="border-b border-gray-100"><CardTitle className="flex items-center text-gray-900"><BarChart3 className="w-5 h-5 mr-2 text-blue-600"/>Freshness Trend Analysis</CardTitle></CardHeader><CardContent className="p-6"><div className="h-64 flex items-end justify-between space-x-2 mb-6">{freshnessData.map((point, index) => (<div key={index} className="flex flex-col items-center flex-1"><div className={`w-full rounded-t-sm ${point.score > 80 ? "bg-green-500" : point.score > 60 ? "bg-yellow-500" : "bg-red-500"}`} style={{ height: `${(point.score / 100) * 200}px` }}></div><div className="text-xs mt-2 text-center"><div className="font-medium text-gray-900">{point.score}%</div><div className="text-gray-500">{point.time}</div></div></div>))}</div><div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="p-4 bg-green-50 rounded-lg text-center border border-green-200"><div className="text-lg font-bold text-green-600">6 hours</div><div className="text-sm text-green-700">Optimal sale window</div></div><div className="p-4 bg-yellow-50 rounded-lg text-center border border-yellow-200"><div className="text-lg font-bold text-yellow-600">-3%/hour</div><div className="text-sm text-yellow-700">Decline rate</div></div><div className="p-4 bg-blue-50 rounded-lg text-center border border-blue-200"><div className="text-lg font-bold text-blue-600">65%</div><div className="text-sm text-blue-700">Predicted (24h)</div></div></div></CardContent></Card></TabsContent>
          <TabsContent value="iot" className="mt-6"><div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">{iotMetrics.map((metric, index) => { const Icon = metric.icon; return (<Card key={index} className="bg-white border-0 shadow-sm"><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-gray-600">{metric.label}</p><p className="text-xl font-semibold text-gray-900">{metric.value}</p></div><div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center"><Icon className={`w-6 h-6 ${metric.status === "optimal" ? "text-green-600" : "text-red-600"}`}/></div></div></CardContent></Card>); })}</div><Card className="bg-white border-0 shadow-sm"><CardHeader className="border-b border-gray-100"><CardTitle className="flex items-center text-gray-900"><History className="w-5 h-5 mr-2 text-blue-600"/>Recent Sensor Readings</CardTitle></CardHeader><CardContent className="p-6"><div className="space-y-3">{actions.map((action, index) => (<div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"><div><p className="font-medium text-gray-900">{action.action}</p><p className="text-sm text-gray-600">by {action.user}</p></div><div className="text-right"><p className="text-sm text-gray-500">{action.time}</p><Badge className="bg-green-50 text-green-700 border-green-200">{action.status}</Badge></div></div>))}</div></CardContent></Card></TabsContent>
          <TabsContent value="chat" className="mt-6"><Card className="h-[600px] flex flex-col bg-white border-0 shadow-sm"><CardHeader className="border-b border-gray-100 bg-gradient-to-r from-blue-50 to-transparent"><CardTitle className="flex items-center text-gray-900"><MessageCircle className="w-5 h-5 mr-2 text-blue-600"/>AI Product Assistant<Badge className="ml-auto bg-green-100 text-green-800 text-xs">Online</Badge></CardTitle></CardHeader><CardContent className="flex-1 flex flex-col p-0"><div className="p-4 border-b border-gray-100 bg-gray-50"><h4 className="text-sm font-medium text-gray-900 mb-3">Quick Questions:</h4><div className="flex flex-wrap gap-2"><Button size="sm" variant="outline" onClick={() => handleSendMessage("When does this expire?")} className="text-xs bg-white hover:bg-blue-50 hover:border-blue-300 border-gray-200">Check Expiry</Button><Button size="sm" variant="outline" onClick={() => handleSendMessage("Suggest a markdown price.")} className="text-xs bg-white hover:bg-blue-50 hover:border-blue-300 border-gray-200">Suggest Price</Button><Button size="sm" variant="outline" onClick={() => handleSendMessage("Give me a full plan")} className="text-xs bg-white hover:bg-blue-50 hover:border-blue-300 border-gray-200">Full Action Plan</Button><Button size="sm" variant="outline" onClick={() => handleSendMessage("Should I transfer this item?")} className="text-xs bg-white hover:bg-blue-50 hover:border-blue-300 border-gray-200">Transfer Options</Button><Button size="sm" variant="outline" onClick={() => handleSendMessage("Show inventory trends")} className="text-xs bg-white hover:bg-blue-50 hover:border-blue-300 border-gray-200">Inventory Trends</Button></div></div><div className="flex-1 overflow-y-auto space-y-4 p-4" style={{ maxHeight: 'calc(600px - 200px)' }}>{chatMessages.map((message) => (<div key={message.id} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}><div className={`flex items-start space-x-2 max-w-[85%]`}>{message.type === "bot" && (<div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1"><MessageCircle className="w-4 h-4 text-blue-600"/></div>)}<div className={`p-3 rounded-lg ${message.type === "user" ? "bg-blue-600 text-white rounded-br-sm" : "bg-gray-100 text-gray-900 border border-gray-200 rounded-bl-sm"}`}><p className="text-sm whitespace-pre-line" dangerouslySetInnerHTML={{ __html: message.content.replace(/\n/g, '<br />') }}></p><p className="text-xs opacity-70 mt-2">{message.timestamp.toLocaleTimeString()}</p></div>{message.type === "user" && (<div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1"><span className="text-white text-sm font-medium">👨🏻‍💼</span></div>)}</div></div>))}<div ref={chatMessagesEndRef}/></div><div className="p-4 border-t border-gray-100 bg-white"><div className="flex space-x-2"><Input value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Ask about actions, pricing, transfers, or freshness predictions..." onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()} className="flex-1 border-gray-200 focus:border-blue-500 focus:ring-blue-500"/><Button onClick={() => handleSendMessage()} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white px-4"><Send className="w-4 h-4"/></Button></div><p className="text-xs text-gray-500 mt-2">💡 Pro tip: Ask specific questions for better recommendations</p></div></CardContent></Card></TabsContent>
        </Tabs></div>
      </div>
    </div>);
}
