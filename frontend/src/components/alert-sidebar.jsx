import React from 'react';
import { Bell, AlertTriangle, AlertOctagon, Info, Check, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const DEFAULT_ALERTS = [
    {
        id: 1,
        title: "Critical Stock Low",
        message: "Avocados (Hass) at Store #402 are below safety stock.",
        severity: "critical",
        time: "10m ago",
        action: "Order Now"
    },
    {
        id: 2,
        title: "Model Drift Detected",
        message: "Vision Model accuracy dropped by 1.5% in the last hour.",
        severity: "warning",
        time: "45m ago",
        action: "View Health"
    },
    {
        id: 3,
        title: "Flash Freeze Alert",
        message: "Weather warning: Temperature drop expected in Region East.",
        severity: "info",
        time: "2h ago",
        action: "Dismiss"
    },
    {
        id: 4,
        title: "Lane Blocked",
        message: "Checkout Lane 03 at Store #115 reporting camera obstruction.",
        severity: "warning",
        time: "3h ago",
        action: "View Cam"
    }
];

export const AlertContent = ({
    alerts = DEFAULT_ALERTS,
    title = 'Live Alerts',
    subtitle = '',
    emptyMessage = 'No alerts for the selected store.',
}) => (
    <div className="flex flex-col h-full">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#222] bg-[#111] p-4">
            <div className="flex items-center space-x-2">
                <Bell className="w-4 h-4 text-white" />
                <div className="flex flex-col">
                    <span className="font-bold text-sm text-white">{title}</span>
                    {subtitle ? <span className="text-[10px] text-gray-500">{subtitle}</span> : null}
                </div>
            </div>
            <Badge variant="destructive" className="bg-red-900/40 text-red-400 border-red-900/50 text-xs">
                {alerts.length} Active
            </Badge>
        </div>

        <div className="flex-1 p-4 space-y-4 overflow-y-auto">
            {alerts.length > 0 ? alerts.map((alert) => (
                <div key={alert.id} className="bg-[#161616] border border-[#222] rounded-lg p-3 hover:border-[#333] transition-colors group">
                    <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center space-x-2">
                            {alert.severity === 'critical' && <AlertOctagon className="w-3 h-3 text-red-500" />}
                            {alert.severity === 'warning' && <AlertTriangle className="w-3 h-3 text-yellow-500" />}
                            {alert.severity === 'info' && <Info className="w-3 h-3 text-blue-500" />}
                            <span className={`text-xs font-semibold uppercase ${alert.severity === 'critical' ? 'text-red-400' :
                                    alert.severity === 'warning' ? 'text-yellow-400' :
                                        'text-blue-400'
                                }`}>
                                {alert.severity}
                            </span>
                        </div>
                        <span className="text-[10px] text-gray-500">{alert.time}</span>
                    </div>

                    <h4 className="text-sm font-medium text-gray-200 mb-1 leading-snug">{alert.title}</h4>
                    <p className="text-xs text-gray-400 leading-relaxed mb-2">{alert.message}</p>

                    {(alert.storeName || alert.cityName) && (
                        <div className="text-[10px] uppercase tracking-[0.16em] text-gray-500 mb-3">
                            {[alert.storeName, alert.cityName].filter(Boolean).join(' • ')}
                        </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-[#222/50]">
                        <button className="text-[10px] text-blue-400 hover:text-blue-300 font-medium transition-colors">
                            {alert.action}
                        </button>
                        <button className="text-gray-600 hover:text-white transition-colors">
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                </div>
            )) : (
                <div className="rounded-lg border border-[#222] bg-[#161616] p-4 text-sm text-gray-400">
                    {emptyMessage}
                </div>
            )}
        </div>

        <div className="p-4 border-t border-[#222] bg-[#111] sticky bottom-0">
            <Button variant="outline" className="w-full text-xs h-8 border-[#333] text-gray-400 hover:text-white bg-[#1a1a1a]">
                View All Notifications
            </Button>
        </div>
    </div>
);

const AlertSidebar = ({ alerts, title, subtitle, emptyMessage }) => {
    return (
        <aside className="w-80 bg-[#0f0f0f] border-l border-[#222] flex-col h-screen sticky top-0 overflow-y-auto hidden xl:flex">
            <AlertContent alerts={alerts} title={title} subtitle={subtitle} emptyMessage={emptyMessage} />
        </aside>
    );
};

export default AlertSidebar;
