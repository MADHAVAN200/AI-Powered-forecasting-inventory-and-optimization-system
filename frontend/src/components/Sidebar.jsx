import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Activity, ArrowRightLeft, Eye, FileText, LayoutDashboard,
    LogOut, MapPin, Package, Store, Zap, User, Home
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { signOut, role } = useAuth();

    const isActive = (path) => location.pathname === path;
    const isVendorRoute = location.pathname.startsWith('/vendor');

    const allNavItems = [
        {
            label: 'Dashboard',
            icon: Store,
            path: '/dashboard',
            roles: ['staff', 'admin'],
            variant: isActive('/dashboard') ? 'secondary' : 'ghost',
            className: isActive('/dashboard') ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-accent'
        },
        {
            label: 'Control Tower',
            icon: LayoutDashboard,
            path: '/control-tower',
            roles: ['admin'],
            variant: isActive('/control-tower') ? 'secondary' : 'ghost',
            className: isActive('/control-tower') ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-accent'
        },
        {
            label: 'Demand Forecast',
            icon: Zap,
            path: '/control-tower/forecast-engine',
            roles: ['admin'],
            variant: isActive('/control-tower/forecast-engine') ? 'secondary' : 'ghost',
            className: isActive('/control-tower/forecast-engine') ? 'bg-muted text-indigo-500' : 'text-indigo-500/80 hover:text-indigo-500 hover:bg-accent'
        },
        {
            label: 'Inventory Risk',
            icon: Activity,
            path: '/control-tower/inventory-risk',
            roles: ['admin'],
            variant: isActive('/control-tower/inventory-risk') ? 'secondary' : 'ghost',
            className: isActive('/control-tower/inventory-risk') ? 'bg-muted text-orange-500' : 'text-orange-500/80 hover:text-orange-500 hover:bg-accent'
        },
        {
            label: 'Operational Alerts',
            icon: Zap,
            path: '/control-tower/alerts',
            roles: ['staff', 'admin'],
            variant: isActive('/control-tower/alerts') ? 'secondary' : 'ghost',
            className: isActive('/control-tower/alerts') ? 'bg-muted text-red-500' : 'text-red-500 hover:text-red-500 hover:bg-accent'
        },
        {
            label: 'Stock Rebalancing',
            icon: ArrowRightLeft,
            path: '/control-tower/stock-rebalancing',
            roles: ['admin'],
            variant: isActive('/control-tower/stock-rebalancing') ? 'secondary' : 'ghost',
            className: isActive('/control-tower/stock-rebalancing') ? 'bg-muted text-blue-500' : 'text-blue-500 hover:text-blue-500 hover:bg-accent'
        },
        {
            label: 'Store Health',
            icon: Store,
            path: '/control-tower/store-health',
            roles: ['admin'],
            variant: isActive('/control-tower/store-health') ? 'secondary' : 'ghost',
            className: isActive('/control-tower/store-health') ? 'bg-muted text-green-500' : 'text-green-500 hover:text-green-500 hover:bg-accent'
        },
        {
            label: 'Smart Billing',
            icon: Eye,
            path: '/checkout-vision',
            roles: ['staff', 'admin'],
            variant: isActive('/checkout-vision') ? 'secondary' : 'ghost',
            className: isActive('/checkout-vision') ? 'bg-muted text-purple-500' : 'text-purple-500 hover:text-purple-500 hover:bg-accent'
        },
        {
            label: 'Logistics',
            icon: MapPin,
            path: '/logistics',
            roles: ['admin'],
            variant: isActive('/logistics') ? 'secondary' : 'ghost',
            className: isActive('/logistics') ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-accent'
        },
    ];

    const filteredNavItems = allNavItems.filter(item => item.roles.includes(role));

    return (
        <aside className="w-16 md:w-64 bg-sidebar border-r border-sidebar-border hidden md:flex md:flex-col sticky top-0 h-screen overflow-y-auto shrink-0 text-sidebar-foreground">
            <div className="h-16 px-4 flex items-center space-x-2 border-b border-sidebar-border">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <Activity className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-lg hidden md:block">DemandIQ</span>
            </div>

            <nav className="flex-1 py-4 space-y-2 px-2">
                {filteredNavItems.map((item) => (
                    <Button
                        key={item.path}
                        variant={item.variant}
                        className={`w-full justify-start ${item.className}`}
                        onClick={() => navigate(item.path)}
                    >
                        <item.icon className="w-5 h-5 mr-3" />
                        <span className="hidden md:block">{item.label}</span>
                    </Button>
                ))}

                {(role === 'admin' || role === 'vendor') && (
                    <Button
                        variant={isActive('/vendor') ? 'secondary' : 'ghost'}
                        className={`w-full justify-start ${isActive('/vendor') ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-accent'}`}
                        onClick={() => navigate('/vendor')}
                    >
                        <Package className="w-5 h-5 mr-3" />
                        <span className="hidden md:block">Vendor Portal</span>
                    </Button>
                )}

                {role === 'vendor' && isVendorRoute && (
                    <div className="pt-2 space-y-1">

                        <Button
                            variant={isActive('/vendor') ? 'secondary' : 'ghost'}
                            className={`w-full justify-start ${isActive('/vendor') ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-accent'}`}
                            onClick={() => navigate('/vendor')}
                        >
                            <Home className="w-5 h-5 mr-3" />
                            <span className="hidden md:block">Overview</span>
                        </Button>

                        <Button
                            variant={isActive('/vendor/products') ? 'secondary' : 'ghost'}
                            className={`w-full justify-start ${isActive('/vendor/products') ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-accent'}`}
                            onClick={() => navigate('/vendor/products')}
                        >
                            <Package className="w-5 h-5 mr-3" />
                            <span className="hidden md:block">Products</span>
                        </Button>

                        <Button
                            variant={isActive('/vendor/requests') ? 'secondary' : 'ghost'}
                            className={`w-full justify-start ${isActive('/vendor/requests') ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-accent'}`}
                            onClick={() => navigate('/vendor/requests')}
                        >
                            <FileText className="w-5 h-5 mr-3" />
                            <span className="hidden md:block">Requests</span>
                        </Button>
                    </div>
                )}
            </nav>

            <div className="p-4 border-t border-sidebar-border">
                <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-accent" onClick={signOut}>
                    <LogOut className="w-5 h-5 mr-3" />
                    <span className="hidden md:block">Sign Out</span>
                </Button>
            </div>
        </aside>
    );
};

export default Sidebar;
