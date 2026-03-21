import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
  Activity,
  AlertTriangle,
  ArrowRightLeft,
  Camera,
  CloudSun,
  LayoutDashboard,
  PackageCheck,
  Truck,
  Users2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const primaryNav = [
  { label: 'Alerts', to: '/alerts', icon: AlertTriangle },
  { label: 'Stock Rebalancing', to: '/stock-rebalancing', icon: ArrowRightLeft },
  { label: 'Checkout Vision', to: '/checkout-vision', icon: Camera },
  { label: 'Logistics', to: '/logistics', icon: Truck },
  { label: 'Federated Learning', to: '/federated-learning', icon: Users2 },
  { label: 'Event Intelligence', to: '/event-intelligence', icon: Activity },
  { label: 'Trend Intelligence', to: '/trend-intelligence', icon: LayoutDashboard },
  { label: 'Weather Intelligence', to: '/weather-intelligence', icon: CloudSun },
];

function NavItem({ item }) {
  const Icon = item.icon;

  return (
    <NavLink
      to={item.to}
      className={({ isActive }) =>
        [
          'group flex items-center gap-3 rounded-2xl border px-3 py-3 text-sm transition-all',
          isActive
            ? 'border-emerald-500/30 bg-emerald-500/10 text-white shadow-[0_0_0_1px_rgba(16,185,129,0.12)]'
            : 'border-transparent bg-white/[0.03] text-slate-300 hover:border-white/10 hover:bg-white/[0.06] hover:text-white',
        ].join(' ')
      }
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-black/30 text-emerald-300">
        <Icon className="h-4 w-4" />
      </span>
      <span className="font-medium">{item.label}</span>
    </NavLink>
  );
}

export default function PlatformShell() {
  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <div className="flex min-h-screen">
        <aside className="hidden w-[280px] shrink-0 border-r border-white/10 bg-[linear-gradient(180deg,rgba(10,10,10,0.98),rgba(7,7,7,0.95))] px-5 py-6 lg:block">
          <div className="mb-8 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/15 ring-1 ring-emerald-400/20">
                <PackageCheck className="h-5 w-5 text-emerald-300" />
              </div>
              <div>
                <div className="text-lg font-semibold tracking-tight">Smartstock</div>
                <div className="text-xs text-slate-400">Operations workspace</div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="px-1 text-xs uppercase tracking-[0.18em] text-slate-500">Active Modules</div>
            <div className="space-y-2">
              {primaryNav.map((item) => (
                <NavItem key={item.to} item={item} />
              ))}
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="sticky top-0 z-40 border-b border-white/10 bg-[#070707]/90 px-4 py-3 backdrop-blur lg:hidden">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/15">
                <PackageCheck className="h-5 w-5 text-emerald-300" />
              </div>
              <div>
                <div className="text-sm font-semibold">Smartstock</div>
                <div className="text-xs text-slate-400">Active modules</div>
              </div>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {primaryNav.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    [
                      'whitespace-nowrap rounded-full border px-3 py-1.5 text-xs transition',
                      isActive
                        ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
                        : 'border-white/10 bg-white/[0.03] text-slate-400',
                    ].join(' ')
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>

          <main className="min-w-0 flex-1">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
