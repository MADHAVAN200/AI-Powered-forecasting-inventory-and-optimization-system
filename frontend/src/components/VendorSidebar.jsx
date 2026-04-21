import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FileText, Home, LogOut, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';

const VendorSidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { signOut } = useAuth();

    const navItems = [
        { label: 'Overview', path: '/vendor', icon: Home },
        { label: 'Products', path: '/vendor/products', icon: Package },
        { label: 'Requests', path: '/vendor/requests', icon: FileText },
    ];

    const isActive = (path) => {
        if (path === '/vendor') {
            return location.pathname === '/vendor';
        }

        return location.pathname.startsWith(path);
    };

    return (
        <aside className="w-16 md:w-64 bg-sidebar border-r border-sidebar-border hidden md:flex md:flex-col sticky top-0 h-screen overflow-y-auto shrink-0 text-sidebar-foreground">
            <div className="h-16 px-4 flex items-center space-x-2 border-b border-sidebar-border">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <Package className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-lg hidden md:block">Vendor Hub</span>
            </div>
            <nav className="flex-1 py-4 space-y-2 px-2">


                {navItems.map((item) => (
                    <Button
                        key={item.path}
                        variant={isActive(item.path) ? 'secondary' : 'ghost'}
                        className={`w-full justify-start ${isActive(item.path) ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-accent'}`}
                        onClick={() => navigate(item.path)}
                    >
                        <item.icon className="w-5 h-5 mr-3" />
                        <span className="hidden md:block">{item.label}</span>
                    </Button>
                ))}
            </nav>

            <div className="p-4 border-t border-sidebar-border">
                <Button
                    variant="ghost"
                    className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-accent"
                    onClick={signOut}
                >
                    <LogOut className="w-5 h-5 mr-3" />
                    <span className="hidden md:block">Sign Out</span>
                </Button>
            </div>
        </aside>
    );
};

export default VendorSidebar;
