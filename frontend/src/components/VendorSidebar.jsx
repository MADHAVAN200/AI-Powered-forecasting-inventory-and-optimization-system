import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Activity, LayoutDashboard, Zap, ArrowRightLeft,
    Package, MapPin, LogOut, Store, ShieldCheck, FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const VendorSidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    const navItems = [
        { label: 'Vendor Operations Dashboard', icon: LayoutDashboard, path: '/vendor/operations', color: 'text-blue-500' },
        { label: 'Quality & Compliance Center', icon: ShieldCheck, path: '/vendor/quality', color: 'text-green-500' },
        { label: 'Staff Review Panel', icon: FileText, path: '/vendor/approval', color: 'text-purple-500' },
    ];

    return (
        <aside className="w-16 md:w-64 bg-[#111] border-r border-[#222] flex flex-col hidden md:flex sticky top-0 h-screen overflow-y-auto z-40 shadow-xl">
            <div className="p-4 flex items-center space-x-2 border-b border-[#222]">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
                    <Package className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-lg text-white hidden md:block tracking-tight">Flux Vendor</span>
            </div>

            <nav className="flex-1 py-6 px-2 md:px-4 space-y-2">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 px-2 hidden md:block">Vendor Portal</div>
                {navItems.map((item) => (
                    <Button
                        key={item.path}
                        variant={isActive(item.path) ? "secondary" : "ghost"}
                        className={`w-full justify-start font-medium transition-colors ${
                            isActive(item.path) 
                            ? "bg-[#1a1a1a] text-white" 
                            : "text-gray-400 hover:text-white hover:bg-[#222]"
                        }`}
                        onClick={() => navigate(item.path)}
                    >
                        <item.icon className={`w-5 h-5 mr-3 ${isActive(item.path) ? item.color : ''}`} />
                        <span className="hidden md:block truncate">{item.label}</span>
                    </Button>
                ))}
            </nav>

            <div className="p-4 border-t border-[#222]">
                <div className="flex items-center space-x-3 mb-4 px-2 hidden md:flex">
                    <div className="w-8 h-8 rounded-full bg-[#1a1a1a] border border-[#333] flex items-center justify-center">
                        <span className="text-sm font-bold text-gray-300">GV</span>
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-sm font-bold text-white truncate">Green Valley Farms</p>
                        <p className="text-xs text-gray-500 truncate">VN-8274</p>
                    </div>
                </div>
                <Button variant="ghost" className="w-full justify-start text-gray-400 hover:text-white hover:bg-[#222]" onClick={() => navigate('/')}>
                    <LogOut className="w-5 h-5 mr-3" />
                    <span className="hidden md:block">Sign Out</span>
                </Button>
            </div>
        </aside>
    );
};

export default VendorSidebar;
