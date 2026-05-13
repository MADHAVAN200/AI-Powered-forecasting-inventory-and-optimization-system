import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    AlertTriangle,
    ArrowRight,
    ArrowRightLeft,
    Check,
    ChevronsUpDown,
    Clock,
    FileText,
    Home,
    MapPin,
    Package,
    RefreshCw,
    ShieldAlert,
    ShoppingCart,
    Store,
    Activity,
    CheckCircle2,
    DollarSign,
    History,
} from 'lucide-react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Breadcrumb,
    BreadcrumbList,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
    Sheet,
    SheetContent,
} from '@/components/ui/sheet';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import { cn } from '@/lib/utils';
import Sidebar from '@/components/Sidebar';
import { AlertContent } from '@/components/alert-sidebar';
import { masterDataService } from '@/services/masterDataService';
import { storeHealthService } from '@/services/storeHealthService';
import { useAuth } from '@/context/AuthContext';

const severityRank = { Critical: 0, High: 1, Medium: 2, Low: 3 };

function clampScore(value) {
    return Math.max(0, Math.min(100, Math.round(Number(value) || 0)));
}

function getTimeWindowDays(timeContext) {
    return timeContext === '72h' ? 3 : 1;
}

function formatStoreLabel(store) {
    const cityName = store?.cities?.city_name ? ` (${store.cities.city_name})` : '';
    return `${store?.store_name || 'Store'}${cityName}`;
}

function hashString(value = '') {
    return String(value).split('').reduce((hash, char, index) => {
        const next = hash + (char.charCodeAt(0) * (index + 1));
        return next % 100000;
    }, 17);
}

function buildStoreAlerts(row, timeContext) {
    const storeName = row?.store?.store_name || 'Store';
    const cityName = row?.store?.cities?.city_name || 'Unknown City';
    const cityKey = cityName.toLowerCase();
    const score = clampScore(row?.health?.overallScore);
    const attentionCount = row?.health?.attentionQueue?.length || 0;
    const seed = hashString(`${row?.store?.store_id || ''}-${cityName}-${timeContext}`);

    const citySignals = {
        delhi: 'traffic congestion on the north corridor',
        gurgaon: 'office-hour spikes around the corporate belt',
        noida: 'high order volume from weekday commuter demand',
        mumbai: 'port-side delay and monsoon transport pressure',
        pune: 'rapid weekend inventory pull from tech hubs',
        bangalore: 'fresh category demand from IT cluster replenishment',
        chennai: 'temperature-sensitive stock movement and humidity',
        hyderabad: 'festival prep demand for staples and dairy',
        kolkata: 'weather-adaptive replenishment and lane congestion',
        bhubaneswar: 'regional event uplift and delivery batching',
    };

    const citySignal = citySignals[cityKey] || 'localized replenishment pressure and route variance';
    const minutes = [12, 24, 45, 90, 180];

    const templates = [
        {
            title: 'Inventory Risk Pulse',
            severity: score < 65 ? 'critical' : 'warning',
            time: `${minutes[seed % minutes.length]}m ago`,
            action: 'Review Inventory Risk',
            message: `${storeName} in ${cityName} has a ${score < 65 ? 'low' : 'moderate'} health score and ${attentionCount} linked inventory flags from the Inventory Risk page.`,
        },
        {
            title: 'Logistics Delay Watch',
            severity: seed % 3 === 0 ? 'warning' : 'info',
            time: `${minutes[(seed + 1) % minutes.length]}m ago`,
            action: 'Open Logistics',
            message: `The Logistics page shows ${citySignal}; transfer windows for ${storeName} should be reviewed before dispatch cut-off.`,
        },
        {
            title: 'Billing Anomaly Check',
            severity: seed % 4 === 0 ? 'critical' : 'info',
            time: `${minutes[(seed + 2) % minutes.length]}m ago`,
            action: 'Inspect Smart Billing',
            message: `Checkout feed at ${storeName} suggests ${score < 80 ? 'lane imbalance' : 'stable throughput'} based on the Smart Billing and Checkout Vision views.`,
        },
        {
            title: 'Demand Forecast Shift',
            severity: score < 70 ? 'warning' : 'info',
            time: `${minutes[(seed + 3) % minutes.length]}m ago`,
            action: 'View Forecast Engine',
            message: `The Demand Forecast page indicates ${citySignal}; forecast posture is forcing a rebalancing check for ${storeName}.`,
        },
        {
            title: 'Weather Impact Signal',
            severity: cityKey.includes('mumbai') || cityKey.includes('chennai') ? 'warning' : 'info',
            time: `${minutes[(seed + 4) % minutes.length]}m ago`,
            action: 'Check Weather Intelligence',
            message: `Weather Intelligence is flagging ${citySignal} for ${cityName}, which may affect store readiness and shelf replenishment.`,
        },
        {
            title: 'Vendor Portal Follow-up',
            severity: 'info',
            time: `${minutes[(seed + 5) % minutes.length]}m ago`,
            action: 'Open Vendor Portal',
            message: `Vendor Portal requests for ${storeName} include replenishment follow-ups tied to ${attentionCount} open issues.`,
        },
    ];

    const startIndex = seed % templates.length;
    const alertCount = Math.min(4, Math.max(3, attentionCount + 2));

    return Array.from({ length: alertCount }, (_, index) => {
        const template = templates[(startIndex + index) % templates.length];
        return {
            id: `${row?.store?.store_id || 'store'}-${index}`,
            ...template,
            storeName,
            cityName,
        };
    });
}

const StoreHealthPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { role } = useAuth();
    const queryParams = new URLSearchParams(location.search);
    const fromControlTower = queryParams.get('from') === 'control-tower';

    const [cities, setCities] = useState([]);
    const [selectedCityIds, setSelectedCityIds] = useState([]);
    const [stores, setStores] = useState([]);
    const [selectedStore, setSelectedStore] = useState('all');
    const [timeContext, setTimeContext] = useState('live');
    const [cityPopoverOpen, setCityPopoverOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [loadingLabel, setLoadingLabel] = useState('Loading store health...');
    const [error, setError] = useState('');
    const [storeRows, setStoreRows] = useState([]);
    const [refreshTick, setRefreshTick] = useState(0);
    const [alertsDrawerOpen, setAlertsDrawerOpen] = useState(false);
    const [alertsDrawerTitle, setAlertsDrawerTitle] = useState('Store Alerts');
    const [alertsDrawerSubtitle, setAlertsDrawerSubtitle] = useState('');
    const [alertsDrawerItems, setAlertsDrawerItems] = useState([]);

    useEffect(() => {
        let mounted = true;

        const loadCities = async () => {
            try {
                const cityData = await masterDataService.getCities();
                if (!mounted) return;

                setCities(cityData || []);
                if ((cityData || []).length > 0 && selectedCityIds.length === 0) {
                    setSelectedCityIds([cityData[0].city_id]);
                }
            } catch (err) {
                console.error('Failed to fetch cities:', err);
            }
        };

        loadCities();

        return () => {
            mounted = false;
        };
    }, []);

    useEffect(() => {
        let mounted = true;

        const loadStores = async () => {
            if (selectedCityIds.length === 0) {
                setStores([]);
                setSelectedStore('all');
                return;
            }

            try {
                const storeData = await masterDataService.getStores({ cityIds: selectedCityIds });
                if (!mounted) return;

                setStores(storeData || []);
                if (selectedStore !== 'all' && !(storeData || []).some((store) => store.store_id === selectedStore)) {
                    setSelectedStore('all');
                }
            } catch (err) {
                console.error('Failed to fetch stores:', err);
            }
        };

        loadStores();

        return () => {
            mounted = false;
        };
    }, [selectedCityIds]);

    useEffect(() => {
        let mounted = true;

        const loadHealth = async () => {
            const targetStores = selectedStore === 'all'
                ? stores
                : stores.filter((store) => store.store_id === selectedStore);

            if (targetStores.length === 0) {
                setStoreRows([]);
                setLoading(false);
                setLoadingLabel('No stores match the selected filters');
                return;
            }

            setLoading(true);
            setLoadingLabel('Fetching live health signals...');
            setError('');

            try {
                const daysBack = getTimeWindowDays(timeContext);
                const selectedCityId = selectedCityIds.length === 1 ? selectedCityIds[0] : undefined;

                const rows = await Promise.all(targetStores.map(async (store) => {
                    const [health, summary] = await Promise.all([
                        storeHealthService.getStoreHealth(store.store_id, { cityId: selectedCityId, daysBack }),
                        storeHealthService.getStoreSummary(store.store_id, { cityId: selectedCityId, daysBack }),
                    ]);

                    return {
                        store,
                        health,
                        summary,
                    };
                }));

                if (!mounted) return;
                setStoreRows(rows);
                setLoadingLabel(`Loaded ${rows.length} store${rows.length === 1 ? '' : 's'}`);
            } catch (err) {
                console.error('Failed to fetch health metrics:', err);
                if (mounted) {
                    setError(err.message || 'Failed to load store health data.');
                    setStoreRows([]);
                }
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        if (stores.length > 0) {
            loadHealth();
        }

        return () => {
            mounted = false;
        };
    }, [stores, selectedStore, selectedCityIds, timeContext, refreshTick]);

    const selectedCityNames = cities.filter((city) => selectedCityIds.includes(city.city_id)).map((city) => city.city_name);
    const selectedStoreName = selectedStore === 'all'
        ? 'All Stores'
        : stores.find((store) => store.store_id === selectedStore)?.store_name || 'Selected Store';

    const aggregate = useMemo(() => {
        const rows = storeRows.filter((row) => row.health);
        const scores = rows.map((row) => clampScore(row.health.overallScore));
        const attentionItems = rows.flatMap((row) => (row.health.attentionQueue || []).map((item) => ({
            ...item,
            storeName: row.store.store_name,
            cityName: row.store.cities?.city_name || 'Unknown',
        })));

        attentionItems.sort((a, b) => {
            const severityDelta = (severityRank[a.severity] ?? 4) - (severityRank[b.severity] ?? 4);
            if (severityDelta !== 0) return severityDelta;
            return new Date(a.created_at || 0) - new Date(b.created_at || 0);
        });

        const riskSnapshotCounts = rows.reduce((accumulator, row) => {
            row.health?.riskSnapshots?.forEach((risk) => {
                accumulator[risk.title] = (accumulator[risk.title] || 0) + Number(risk.count || 0);
            });
            return accumulator;
        }, {});

        return {
            averageScore: scores.length ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : 0,
            minScore: scores.length ? Math.min(...scores) : 0,
            maxScore: scores.length ? Math.max(...scores) : 0,
            storeCount: rows.length,
            healthyStores: rows.filter((row) => clampScore(row.health?.overallScore) >= 85).length,
            watchlistStores: rows.filter((row) => {
                const score = clampScore(row.health?.overallScore);
                return score >= 65 && score < 85;
            }).length,
            criticalStores: rows.filter((row) => clampScore(row.health?.overallScore) < 65).length,
            attentionCount: attentionItems.length,
            shortage: riskSnapshotCounts['Shortage Risks'] || 0,
            overstock: riskSnapshotCounts['Overstock Warnings'] || 0,
            attentionItems,
            primaryRow: rows[0] || null,
        };
    }, [storeRows]);

    const selectedStoreRow = selectedStore === 'all'
        ? aggregate.primaryRow
        : storeRows.find((row) => row.store.store_id === selectedStore) || null;

    const focusSummary = selectedStore === 'all'
        ? `Aggregated store health for ${aggregate.storeCount} store${aggregate.storeCount === 1 ? '' : 's'} across ${selectedCityNames.length || 0} selected cities.`
        : selectedStoreRow?.summary?.narrative || '';

    const focusStatus = selectedStore === 'all'
        ? aggregate.averageScore >= 85
            ? 'Healthy'
            : aggregate.averageScore >= 65
                ? 'Acceptable'
                : 'At Risk'
        : selectedStoreRow?.health?.status || 'Active';

    const toggleCity = (cityId) => {
        setSelectedCityIds((current) => (
            current.includes(cityId)
                ? current.filter((id) => id !== cityId)
                : [...current, cityId]
        ));
    };

    const openStoreAlerts = (row) => {
        const alerts = buildStoreAlerts(row, timeContext);

        setSelectedStore(row.store.store_id);
        setAlertsDrawerTitle(formatStoreLabel(row.store));
        setAlertsDrawerSubtitle(`${alerts.length} store and city signals`);
        setAlertsDrawerItems(alerts);
        setAlertsDrawerOpen(true);
    };

    const refresh = () => {
        setRefreshTick((current) => current + 1);
    };

    return (
        <div className="min-h-screen bg-background text-foreground font-sans selection:bg-blue-500/30 pb-20">
            <header className="sticky top-0 z-30 bg-sidebar/95 backdrop-blur-md border-b border-sidebar-border shadow-lg backdrop-blur-md">
                <div className="px-6 pt-3">
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink onClick={() => navigate(role === 'vendor' ? '/vendor' : '/dashboard')} className="flex items-center gap-1 text-muted-foreground hover:text-blue-400 cursor-pointer text-[11px] transition-colors">
                                    <Home className="w-3 h-3" />
                                    {role === 'vendor' ? 'Vendor Portal' : 'Home'}
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator className="text-gray-600" />
                            {fromControlTower && (
                                <>
                                    <BreadcrumbItem>
                                        <BreadcrumbLink onClick={() => navigate('/control-tower')} className="flex items-center gap-1 text-muted-foreground hover:text-blue-400 cursor-pointer text-[11px] transition-colors">
                                            Control Tower
                                        </BreadcrumbLink>
                                    </BreadcrumbItem>
                                    <BreadcrumbSeparator className="text-gray-600" />
                                </>
                            )}
                            <BreadcrumbItem>
                                <BreadcrumbPage className="text-blue-400 text-[11px] font-medium">Store Health</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>

                <div className="px-6 py-3 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex items-center space-x-4">
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                            <Store className="w-6 h-6 text-blue-500" />
                        </div>
                        <div>
                            <div className="flex items-center space-x-3">
                                <h1 className="text-xl font-bold text-foreground tracking-tight">Store Health Overview</h1>
                                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-card border border-border text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                                    <div className={`w-1.5 h-1.5 rounded-full ${loading ? 'bg-blue-500 animate-pulse' : 'bg-green-500'}`}></div>
                                    {loading ? 'Analyzing' : 'Optimized'}
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground">Real-time operational health scores and risk indicators across regions.</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <Popover open={cityPopoverOpen} onOpenChange={setCityPopoverOpen}>
                            <PopoverTrigger asChild>
                                <Button variant="outline" role="combobox" aria-expanded={cityPopoverOpen} className="w-[240px] justify-between h-9 bg-muted border-border text-foreground text-xs shadow-inner hover:bg-border hover:text-foreground transition-all">
                                    <div className="flex items-center gap-2 overflow-hidden">
                                        <MapPin className="w-3 h-3 text-blue-400 shrink-0" />
                                        <span className="truncate">
                                            {selectedCityIds.length === 0 ? 'Select Cities' : selectedCityIds.length === 1 ? selectedCityNames[0] : `${selectedCityIds.length} Cities Selected`}
                                        </span>
                                    </div>
                                    <ChevronsUpDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[240px] p-0 bg-muted border-border">
                                <Command className="bg-muted">
                                    <CommandInput placeholder="Search cities..." className="h-8 text-xs text-foreground" />
                                    <CommandList>
                                        <CommandEmpty className="text-xs text-muted-foreground py-2 px-4">No city found.</CommandEmpty>
                                        <CommandGroup>
                                            {cities.map((city) => (
                                                <CommandItem key={city.city_id} value={city.city_name} onSelect={() => toggleCity(city.city_id)} className="text-xs text-foreground hover:bg-border cursor-pointer">
                                                    <Check className={cn('mr-2 h-3 w-3', selectedCityIds.includes(city.city_id) ? 'opacity-100' : 'opacity-0')} />
                                                    {city.city_name}
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>

                        <Select value={selectedStore} onValueChange={setSelectedStore}>
                            <SelectTrigger className="w-[240px] h-9 bg-muted border-border text-foreground text-xs shadow-inner">
                                <div className="flex items-center gap-2">
                                    <Store className="w-3 h-3 text-blue-400 shrink-0" />
                                    <SelectValue placeholder="Select Store" />
                                </div>
                            </SelectTrigger>
                            <SelectContent className="bg-muted border-border text-foreground">
                                <SelectItem value="all" className="text-xs">All Stores</SelectItem>
                                {stores.map((store) => (
                                    <SelectItem key={store.store_id} value={store.store_id} className="text-xs">
                                        {formatStoreLabel(store)}
                                    </SelectItem>
                                ))}
                                {stores.length === 0 && <SelectItem value="empty" disabled className="text-xs">No stores in selected cities</SelectItem>}
                            </SelectContent>
                        </Select>

                        <ToggleGroup type="single" value={timeContext} onValueChange={(val) => val && setTimeContext(val)} className="bg-muted border border-border rounded-md p-0.5">
                            <ToggleGroupItem value="live" className="h-8 px-3 text-xs text-muted-foreground data-[state=on]:bg-blue-900/40 data-[state=on]:text-blue-400">Live</ToggleGroupItem>
                            <ToggleGroupItem value="72h" className="h-8 px-3 text-xs text-muted-foreground data-[state=on]:bg-gray-800 data-[state=on]:text-foreground">Next 72h</ToggleGroupItem>
                        </ToggleGroup>

                        <Button variant="outline" size="sm" className="h-9 border-border bg-muted text-muted-foreground hover:bg-border hover:text-foreground" onClick={refresh}>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Refresh
                        </Button>
                    </div>
                </div>
            </header>

            <div className="p-6 w-full space-y-6">
                {error && (
                    <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                        {error}
                    </div>
                )}

                {loading && storeRows.length === 0 ? (
                    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                        <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
                        <p className="text-muted-foreground text-sm animate-pulse font-mono tracking-widest">SYNTHESIZING OPERATIONAL SIGNALS...</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
                            <Card className="bg-card border-border hover:border-blue-500/30 transition-colors shadow-sm">
                                <CardContent className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Avg Health Score</p>
                                        <Activity className="w-3.5 h-3.5 text-blue-500" />
                                    </div>
                                    <div className="text-2xl font-bold text-foreground tabular-nums mb-1">{aggregate.averageScore || '--'}</div>
                                    <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">System Normalized</div>
                                </CardContent>
                            </Card>

                            <Card className="bg-card border-border hover:border-blue-500/30 transition-colors shadow-sm">
                                <CardContent className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Stores Monitored</p>
                                        <Store className="w-3.5 h-3.5 text-blue-500" />
                                    </div>
                                    <div className="text-2xl font-bold text-foreground tabular-nums mb-1">{aggregate.storeCount}</div>
                                    <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">{selectedCityNames.length || 'Global'} Analysis</div>
                                </CardContent>
                            </Card>

                            <Card className="bg-card border-border hover:border-green-500/30 transition-colors shadow-sm">
                                <CardContent className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Healthy Zone</p>
                                        <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                                    </div>
                                    <div className="text-2xl font-bold text-green-500 tabular-nums mb-1">{aggregate.healthyStores}</div>
                                    <div className="text-[10px] text-green-500/70 font-medium uppercase tracking-tighter">Above 85% Threshold</div>
                                </CardContent>
                            </Card>

                            <Card className="bg-card border-border hover:border-orange-500/30 transition-colors shadow-sm">
                                <CardContent className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Watchlist</p>
                                        <ShieldAlert className="w-3.5 h-3.5 text-orange-500" />
                                    </div>
                                    <div className="text-2xl font-bold text-orange-500 tabular-nums mb-1">{aggregate.watchlistStores}</div>
                                    <div className="text-[10px] text-orange-500/70 font-medium uppercase tracking-tighter">Requires Review</div>
                                </CardContent>
                            </Card>

                            <Card className="bg-card border-border hover:border-red-500/30 transition-colors shadow-sm">
                                <CardContent className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Priority Alerts</p>
                                        <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                                    </div>
                                    <div className="text-2xl font-bold text-red-500 tabular-nums mb-1">{aggregate.attentionCount}</div>
                                    <div className="text-[10px] text-red-500/70 font-medium uppercase tracking-tighter">Active Escalations</div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                            <Card className="xl:col-span-2 bg-card border-border relative overflow-hidden group shadow-md">
                                <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                                    <FileText className="w-32 h-32 text-foreground" />
                                </div>
                                <CardHeader className="pb-3 border-b border-border/50">
                                    <CardTitle className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                        <ShieldAlert className="w-4 h-4 text-blue-500" />
                                        Operational Intelligence Summary
                                    </CardTitle>
                                    <CardDescription className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                                        {selectedStoreRow?.summary?.lastSync ? `Updated ${selectedStoreRow.summary.lastSync}` : `Context: ${selectedStoreName}`}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="pt-6 pb-4 space-y-6">
                                    <div className="text-base font-semibold text-foreground leading-relaxed border-l-4 border-blue-500 pl-5 bg-blue-500/5 py-4 rounded-r-xl">
                                        {focusSummary || `Synthesizing operational health signals for ${selectedStoreName} over the current ${timeContext === '72h' ? '72-hour' : 'real-time'} window.`}
                                    </div>

                                    {selectedStoreRow?.summary?.highlights?.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            {selectedStoreRow.summary.highlights.map((highlight, idx) => (
                                                <div key={idx} className="bg-muted/30 p-3 rounded-lg border border-border/50 hover:border-blue-500/20 transition-colors">
                                                    <div className="flex items-center gap-2 mb-1.5">
                                                        <div className="w-1 h-1 rounded-full bg-blue-500" />
                                                        <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">Signal {idx + 1}</span>
                                                    </div>
                                                    <p className="text-[11px] text-foreground font-medium leading-normal">{highlight}</p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="bg-muted/30 p-3 rounded-lg border border-border/50">
                                                <div className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">Aggregated Mean</div>
                                                <p className="text-sm font-bold text-foreground tabular-nums mt-1">{aggregate.averageScore}%</p>
                                            </div>
                                            <div className="bg-muted/30 p-3 rounded-lg border border-border/50">
                                                <div className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">Lowest Variance</div>
                                                <p className="text-sm font-bold text-foreground tabular-nums mt-1">{aggregate.minScore}%</p>
                                            </div>
                                            <div className="bg-muted/30 p-3 rounded-lg border border-border/50">
                                                <div className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">Peak Performance</div>
                                                <p className="text-sm font-bold text-foreground tabular-nums mt-1">{aggregate.maxScore}%</p>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                                <div className="px-6 py-3 bg-muted/20 border-t border-border/50 flex items-center justify-between">
                                    <div className="flex items-center gap-6">
                                        <div className="flex items-center gap-1.5">
                                            <Clock className="w-3 h-3 text-muted-foreground" />
                                            <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest">Window: {timeContext === '72h' ? 'Rolling 72H' : 'Live Snapshot'}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Activity className="w-3 h-3 text-muted-foreground" />
                                            <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest">Sample Size: {aggregate.storeCount} Units</span>
                                        </div>
                                    </div>
                                    <Badge variant="outline" className="text-blue-500 border-blue-500/20 bg-blue-500/5 text-[9px] uppercase font-bold px-2 h-5">
                                        Verified AI Narrative
                                    </Badge>
                                </div>
                            </Card>

                            <Card className="bg-card border-border flex flex-col items-center justify-center p-6 relative overflow-hidden h-full shadow-md">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-80" />
                                <h2 className="text-muted-foreground text-[10px] font-bold uppercase tracking-[0.25em] mb-6">Unit Performance Index</h2>
                                <div className="w-full space-y-6">
                                    <div className="bg-muted/30 border border-border rounded-3xl p-6 text-center shadow-inner">
                                        <div className="text-7xl font-black text-foreground tabular-nums tracking-tighter">
                                            {selectedStore === 'all' ? aggregate.averageScore : selectedStoreRow ? clampScore(selectedStoreRow.health?.overallScore) : '--'}
                                        </div>
                                        <Badge className={`mt-4 font-black tracking-widest shadow-lg px-6 py-1.5 text-[11px] uppercase border-none ${focusStatus === 'Healthy' ? 'bg-green-500 text-black hover:bg-green-400' : focusStatus === 'Acceptable' ? 'bg-yellow-400 text-black hover:bg-yellow-300' : 'bg-red-500 text-foreground hover:bg-red-400'}`}>
                                            {focusStatus}
                                        </Badge>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="rounded-2xl border border-border bg-muted/20 p-4 shadow-sm">
                                            <div className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold mb-1">Regional Avg</div>
                                            <div className="text-2xl font-black text-foreground tabular-nums">{aggregate.averageScore}</div>
                                        </div>
                                        <div className="rounded-2xl border border-border bg-muted/20 p-4 shadow-sm">
                                            <div className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold mb-1">Flagged</div>
                                            <div className="text-2xl font-black text-orange-500 tabular-nums">{aggregate.attentionCount}</div>
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground text-center px-4 italic font-medium leading-relaxed opacity-60">
                                        Real-time health coefficient calculated via cross-module inventory and demand analysis.
                                    </p>
                                </div>
                            </Card>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                            <div className="lg:col-span-2 space-y-3">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest border-b border-blue-500 py-1">Store Breakdown</h3>
                                </div>
                                <div className="grid grid-cols-1 gap-3">
                                    {storeRows.map((row) => (
                                        <div key={row.store.store_id} className="bg-muted/50 p-4 rounded-xl border border-border flex items-center justify-between hover:border-border hover:bg-muted transition-all cursor-pointer group" onClick={() => openStoreAlerts(row)}>
                                            <div className="flex items-center space-x-4">
                                                <div className="p-3 rounded-lg bg-card text-blue-400 group-hover:bg-blue-500 group-hover:text-black transition-all border border-border">
                                                    <Store className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-foreground tracking-tight">{formatStoreLabel(row.store)}</div>
                                                    <div className="text-[11px] text-muted-foreground font-mono italic">{row.health?.status || 'Unknown'}</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-6">
                                                <div className="text-right">
                                                    <div className="text-lg font-black text-foreground">{clampScore(row.health?.overallScore)}</div>
                                                    <div className={`text-[10px] font-bold px-1.5 rounded ${clampScore(row.health?.overallScore) >= 80 ? 'text-green-500 bg-green-500/10' : 'text-red-500 bg-red-500/10'}`}>
                                                        {row.health?.attentionQueue?.length || 0} alerts
                                                    </div>
                                                </div>
                                                <ArrowRight className="w-4 h-4 text-gray-700 group-hover:text-foreground group-hover:translate-x-1 transition-all" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="lg:col-span-2 space-y-3">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest border-b border-orange-500 py-1">Critical Risk Snapshot</h3>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    {[
                                        { title: 'Shortage Risks', count: aggregate.shortage, severity: 'High', desc: 'Items below safety stock' },
                                        { title: 'Overstock Warnings', count: aggregate.overstock, severity: 'Medium', desc: 'Low rotation index' },
                                        { title: 'Open Alerts', count: aggregate.attentionCount, severity: 'Critical', desc: 'Current store attention items' },
                                        { title: 'Healthy Stores', count: aggregate.healthyStores, severity: 'Critical', desc: 'Filtered stores in green zone' },
                                    ].map((risk, idx) => (
                                        <div key={idx} className="bg-card p-5 rounded-2xl border border-border flex flex-col justify-between hover:bg-muted/50 hover:scale-[1.02] transition-all cursor-default">
                                            <div className="flex justify-between items-start mb-3">
                                                <Badge variant="outline" className={`${risk.severity === 'Critical' ? 'text-red-400 border-red-900 bg-red-900/10' : risk.severity === 'High' ? 'text-orange-400 border-orange-900 bg-orange-900/10' : 'text-muted-foreground border-gray-800'} text-[10px] h-6 px-2 uppercase font-black tracking-tighter`}>
                                                    {risk.severity}
                                                </Badge>
                                                <div className="text-3xl font-black text-foreground tabular-nums">{risk.count}</div>
                                            </div>
                                            <div>
                                                <div className="text-xs font-bold text-foreground uppercase tracking-wide">{risk.title}</div>
                                                <div className="text-[11px] text-muted-foreground mt-2 leading-relaxed italic border-t border-border pt-2">{risk.desc}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                    </>
                )}
            </div>

            <Sheet open={alertsDrawerOpen} onOpenChange={setAlertsDrawerOpen}>
                <SheetContent side="right" className="w-full sm:max-w-md border-l border-border bg-background p-0 text-foreground">
                    <AlertContent
                        alerts={alertsDrawerItems}
                        title={alertsDrawerTitle}
                        subtitle={alertsDrawerSubtitle}
                        emptyMessage="This store has no open alerts."
                    />
                </SheetContent>
            </Sheet>
        </div>
    );
};

export default StoreHealthPage;



