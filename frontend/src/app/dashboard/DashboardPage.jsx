import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  ArrowRightLeft,
  Bell,
  Calendar,
  Cloud,
  Clock,
  LineChart,
  Moon,
  Package,
  ShieldCheck,
  ShoppingCart,
  Store,
  TrendingUp,
  Truck,
  Sun,
  Zap,
} from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Sidebar from '@/components/Sidebar';
import { backendModuleService } from '@/services/backendModuleService';
import { checkoutVisionService } from '@/services/checkoutVisionService';
import { eventService } from '@/services/eventService';
import { forecastService } from '@/services/forecastService';
import { inventoryService } from '@/services/inventoryService';
import { masterDataService } from '@/services/masterDataService';
import { storeHealthService } from '@/services/storeHealthService';
import { trendService } from '@/services/trendService';
import { weatherService } from '@/services/weatherService';

const currency = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });

function asNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatCurrency(value) {
  return `Rs. ${currency.format(asNumber(value))}`;
}

function firstText(...values) {
  return values.find((value) => value !== undefined && value !== null && String(value).trim() !== '') || '—';
}

const DashboardPage = () => {
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState('');
  const [cities, setCities] = useState([]);
  const [stores, setStores] = useState([]);
  const [selectedCityId, setSelectedCityId] = useState('');
  const [selectedStoreId, setSelectedStoreId] = useState('');
  const [selectedCityName, setSelectedCityName] = useState('All Cities');

  const [dashboardData, setDashboardData] = useState({
    vendorPortal: { products: [], requests: [] },
    logistics: { transfers: [] },
    stockRebalancing: { recommendations: [], summary: null },
    alerts: { alerts: [], kpis: {} },
    checkout: { kpis: [], transactions: [] },
    forecasts: [],
    events: [],
    trends: [],
    weather: [],
    inventoryRisks: [],
    storeHealth: null,
    storeSummary: null,
  });

  useEffect(() => {
    let mounted = true;

    const loadMasterData = async () => {
      try {
        const cityData = await masterDataService.getCities();
        if (!mounted) return;

        setCities(cityData || []);
        if (cityData?.length > 0) {
          setSelectedCityId((current) => current || cityData[0].city_id);
          setSelectedCityName((current) => current || cityData[0].city_name || 'All Cities');
        }
      } catch (loadError) {
        console.error('Failed to load cities:', loadError);
      }
    };

    loadMasterData();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    const loadStores = async () => {
      if (!selectedCityId) {
        setStores([]);
        setSelectedStoreId('');
        return;
      }

      try {
        const storeData = await masterDataService.getStores({ cityId: selectedCityId });
        if (!mounted) return;

        setStores(storeData || []);
        setSelectedStoreId((current) => {
          if (current && storeData?.some((store) => store.store_id === current)) {
            return current;
          }
          return storeData?.[0]?.store_id || '';
        });
        setSelectedCityName(cities.find((city) => city.city_id === selectedCityId)?.city_name || 'All Cities');
      } catch (loadError) {
        console.error('Failed to load stores:', loadError);
        if (mounted) {
          setStores([]);
          setSelectedStoreId('');
        }
      }
    };

    loadStores();

    return () => {
      mounted = false;
    };
  }, [cities, selectedCityId]);

  useEffect(() => {
    let mounted = true;

    const loadDashboardData = async () => {
      setIsLoading(true);
      setError('');

      try {
        const [vendorPortal, logistics, stockRebalancing, alerts, checkout, forecasts, events, trends, weather, inventoryRisks, storeHealth, storeSummary] = await Promise.allSettled([
          backendModuleService.getModuleData('vendorPortal'),
          backendModuleService.getModuleData('logistics'),
          backendModuleService.getModuleData('stockRebalancing', selectedCityName !== 'All Cities' ? { city: selectedCityName } : {}),
          backendModuleService.getModuleData('alerts'),
          checkoutVisionService.getCheckoutData(),
          forecastService.getForecasts({ productId: 'all', cityId: selectedCityId || 'all', categoryId: 'all', horizon: 7, modelVersion: 'varied_v1' }),
          eventService.getEventSignals(selectedCityId || null),
          trendService.getTrendSignals(),
          weatherService.getWeatherImpact(selectedCityId || cities[0]?.city_id || '', 7),
          inventoryService.getInventoryRisksFiltered({ cityId: selectedCityId || 'all' }),
          selectedStoreId ? storeHealthService.getStoreHealth(selectedStoreId) : Promise.resolve(null),
          selectedStoreId ? storeHealthService.getStoreSummary(selectedStoreId) : Promise.resolve(null),
        ]);

        if (!mounted) return;

        setDashboardData({
          vendorPortal: vendorPortal.status === 'fulfilled' ? vendorPortal.value || { products: [], requests: [] } : { products: [], requests: [] },
          logistics: logistics.status === 'fulfilled' ? logistics.value || { transfers: [] } : { transfers: [] },
          stockRebalancing: stockRebalancing.status === 'fulfilled' ? stockRebalancing.value || { recommendations: [], summary: null } : { recommendations: [], summary: null },
          alerts: alerts.status === 'fulfilled' ? alerts.value || { alerts: [], kpis: {} } : { alerts: [], kpis: {} },
          checkout: checkout.status === 'fulfilled' ? checkout.value || { kpis: [], transactions: [] } : { kpis: [], transactions: [] },
          forecasts: forecasts.status === 'fulfilled' ? forecasts.value || [] : [],
          events: events.status === 'fulfilled' ? events.value || [] : [],
          trends: trends.status === 'fulfilled' ? trends.value || [] : [],
          weather: weather.status === 'fulfilled' ? weather.value || [] : [],
          inventoryRisks: inventoryRisks.status === 'fulfilled' ? inventoryRisks.value || [] : [],
          storeHealth: storeHealth.status === 'fulfilled' ? storeHealth.value : null,
          storeSummary: storeSummary.status === 'fulfilled' ? storeSummary.value : null,
        });

        setLastUpdated(new Date());
      } catch (loadError) {
        console.error('Failed to load dashboard data:', loadError);
        if (mounted) {
          setError('Some dashboard modules could not be loaded.');
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    if (selectedCityId) {
      loadDashboardData();
    }

    return () => {
      mounted = false;
    };
  }, [selectedCityId, selectedStoreId, selectedCityName, cities]);

  const logisticsKpis = useMemo(() => {
    const transfers = Array.isArray(dashboardData?.logistics?.transfers) ? dashboardData.logistics.transfers : [];
    return {
      total: transfers.length,
      inTransit: transfers.filter((transfer) => transfer?.status === 'In Transit').length,
      delayed: transfers.filter((transfer) => transfer?.status === 'Delayed').length,
      atRisk: transfers.filter((transfer) => String(transfer?.risk_level || '').toLowerCase() === 'high' || String(transfer?.risk_level || '').toLowerCase() === 'critical').length,
      topTransfer: transfers[0] || null,
    };
  }, [dashboardData]);

  const stockKpis = useMemo(() => {
    const recommendations = Array.isArray(dashboardData?.stockRebalancing?.recommendations) ? dashboardData.stockRebalancing.recommendations : [];
    return {
      total: recommendations.length,
      highPriority: recommendations.filter((recommendation) => ['high', 'critical'].includes(String(recommendation?.priority || '').toLowerCase())).length,
      topRecommendation: recommendations[0] || null,
      summary: dashboardData?.stockRebalancing?.summary || null,
    };
  }, [dashboardData]);

  const checkoutKpis = useMemo(() => {
    const transactions = Array.isArray(dashboardData?.checkout?.transactions) ? dashboardData.checkout.transactions : [];
    const totalSales = transactions.reduce((sum, transaction) => sum + asNumber(transaction?.total), 0);
    const topLane = transactions.reduce((counts, transaction) => {
      const lane = transaction?.lane || 'Unknown';
      counts[lane] = (counts[lane] || 0) + 1;
      return counts;
    }, {});
    const busiestLane = Object.entries(topLane).sort((a, b) => b[1] - a[1])[0] || [];

    return {
      transactionCount: transactions.length,
      totalSales,
      avgTransaction: transactions.length ? totalSales / transactions.length : 0,
      busiestLane: busiestLane[0] || 'Lane 01',
      topTransaction: transactions[0] || null,
      latestTransactions: transactions.slice(0, 4),
    };
  }, [dashboardData]);

  const vendorKpis = useMemo(() => {
    const products = Array.isArray(dashboardData?.vendorPortal?.products) ? dashboardData.vendorPortal.products : [];
    const requests = Array.isArray(dashboardData?.vendorPortal?.requests) ? dashboardData.vendorPortal.requests : [];
    const pendingRequests = requests.filter((request) => String(request?.status || '').toLowerCase() === 'pending');

    return {
      productCount: products.length,
      requestCount: requests.length,
      pendingRequests: pendingRequests.length,
      topRequest: pendingRequests[0] || requests[0] || null,
      topProduct: products[0] || null,
    };
  }, [dashboardData]);

  const alertKpis = useMemo(() => {
    const alerts = Array.isArray(dashboardData?.alerts?.alerts) ? dashboardData.alerts.alerts : [];
    return {
      total: alerts.length,
      critical: alerts.filter((alert) => alert.priority === 'Critical').length,
      high: alerts.filter((alert) => alert.priority === 'High').length,
      topAlert: alerts[0] || null,
    };
  }, [dashboardData]);

  const inventoryKpis = useMemo(() => {
    const risks = Array.isArray(dashboardData?.inventoryRisks) ? dashboardData.inventoryRisks : [];
    return {
      total: risks.length,
      shortage: risks.filter((risk) => risk.risk_type === 'Shortage').length,
      overstock: risks.filter((risk) => risk.risk_type === 'Overstock').length,
      spoilage: risks.filter((risk) => risk.risk_type === 'Spoilage').length,
      topRisk: risks[0] || null,
    };
  }, [dashboardData]);

  const forecastKpis = useMemo(() => {
    const forecasts = Array.isArray(dashboardData?.forecasts) ? dashboardData.forecasts : [];
    const byDate = forecasts.reduce((accumulator, forecast) => {
      const dateKey = forecast?.forecast_date || 'Unknown';
      accumulator[dateKey] = (accumulator[dateKey] || 0) + asNumber(forecast?.predicted_units);
      return accumulator;
    }, {});
    const peakDay = Object.entries(byDate).sort((a, b) => b[1] - a[1])[0] || [];

    return {
      totalPredicted: forecasts.reduce((sum, forecast) => sum + asNumber(forecast?.predicted_units), 0),
      recordCount: forecasts.length,
      peakDay: peakDay[0] || '—',
      peakVolume: peakDay[1] || 0,
    };
  }, [dashboardData]);

  const eventKpis = useMemo(() => {
    const events = Array.isArray(dashboardData?.events) ? dashboardData.events : [];
    const topEvent = events[0] || null;
    const impactedCategories = topEvent?.event_category_impact || [];

    return {
      total: events.length,
      topEvent,
      impactedCategories: impactedCategories.length,
    };
  }, [dashboardData]);

  const trendKpis = useMemo(() => {
    const trends = Array.isArray(dashboardData?.trends) ? dashboardData.trends : [];
    const topTrend = [...trends].sort((a, b) => asNumber(b?.trend_score) - asNumber(a?.trend_score))[0] || null;
    const avgScore = trends.length ? trends.reduce((sum, trend) => sum + asNumber(trend?.trend_score), 0) / trends.length : 0;

    return {
      total: trends.length,
      avgScore,
      topTrend,
    };
  }, [dashboardData]);

  const weatherKpis = useMemo(() => {
    const weather = Array.isArray(dashboardData?.weather) ? dashboardData.weather : [];
    const hottest = weather.reduce((current, entry) => (asNumber(entry?.temp_max) > asNumber(current?.temp_max) ? entry : current), weather[0] || null);
    const wettest = weather.reduce((current, entry) => (asNumber(entry?.precipitation) > asNumber(current?.precipitation) ? entry : current), weather[0] || null);

    return {
      total: weather.length,
      hottest,
      wettest,
      advisory: weather.length > 0
        ? asNumber(wettest?.precipitation) > 30
          ? 'Logistics delay risk'
          : asNumber(hottest?.temp_max) > 35
            ? 'Spoilage and cooling risk'
            : 'Weather neutral'
        : 'No weather data',
    };
  }, [dashboardData]);

  const healthKpis = useMemo(() => {
    const health = dashboardData?.storeHealth;
    const summary = dashboardData?.storeSummary;
    const attentionQueue = Array.isArray(health?.attentionQueue) ? health.attentionQueue : [];

    return {
      score: health?.overallScore ?? 0,
      status: health?.status || 'Unknown',
      attentionCount: attentionQueue.length,
      summary: summary?.narrative || '',
      topAttention: attentionQueue[0] || null,
    };
  }, [dashboardData]);

  const moduleCards = useMemo(() => {
    const firstRecentTransaction = checkoutKpis.topTransaction;
    const recentAlert = alertKpis.topAlert;
    const recentRisk = inventoryKpis.topRisk;

    return [
      {
        title: 'Vendor Portal',
        icon: Store,
        accent: 'text-emerald-400',
        border: 'border-emerald-500/30',
        badge: 'Summary',
        route: null,
        summary: `${vendorKpis.pendingRequests} pending request${vendorKpis.pendingRequests === 1 ? '' : 's'} and ${vendorKpis.productCount} active product${vendorKpis.productCount === 1 ? '' : 's'}.`,
        metrics: [
          { label: 'Requests', value: vendorKpis.requestCount },
          { label: 'Pending', value: vendorKpis.pendingRequests },
          { label: 'Top request', value: firstText(vendorKpis.topRequest?.product, vendorKpis.topRequest?.reason) },
        ],
      },
      {
        title: 'Logistics',
        icon: Truck,
        accent: 'text-cyan-400',
        border: 'border-cyan-500/30',
        badge: 'Live',
        route: '/logistics',
        summary: `${logisticsKpis.inTransit} in transit, ${logisticsKpis.delayed} delayed, ${logisticsKpis.atRisk} high-risk transfers.`,
        metrics: [
          { label: 'Transfers', value: logisticsKpis.total },
          { label: 'Delayed', value: logisticsKpis.delayed },
          { label: 'Top lane', value: firstText(logisticsKpis.topTransfer?.destination, logisticsKpis.topTransfer?.type) },
        ],
      },
      {
        title: 'Billing',
        icon: ShoppingCart,
        accent: 'text-blue-400',
        border: 'border-blue-500/30',
        badge: 'Live',
        route: '/checkout-vision',
        summary: `${checkoutKpis.transactionCount} transactions with ${formatCurrency(checkoutKpis.totalSales)} total sales.`,
        metrics: [
          { label: 'Transactions', value: checkoutKpis.transactionCount },
          { label: 'Avg bill', value: formatCurrency(checkoutKpis.avgTransaction) },
          { label: 'Busiest lane', value: checkoutKpis.busiestLane },
        ],
      },
      {
        title: 'Store Health',
        icon: ShieldCheck,
        accent: 'text-green-400',
        border: 'border-green-500/30',
        badge: 'Live',
        route: '/control-tower/store-health',
        summary: healthKpis.summary || `Health score ${healthKpis.score}/100 with ${healthKpis.attentionCount} attention items.`,
        metrics: [
          { label: 'Score', value: `${healthKpis.score}/100` },
          { label: 'Status', value: healthKpis.status },
          { label: 'Attention', value: healthKpis.attentionCount },
        ],
      },
      {
        title: 'Stock Rebalancing',
        icon: ArrowRightLeft,
        accent: 'text-yellow-400',
        border: 'border-yellow-500/30',
        badge: 'Priority',
        route: '/control-tower/stock-rebalancing',
        summary: stockKpis.summary?.insight || firstText(stockKpis.topRecommendation?.explanation, 'No active rebalancing recommendation.'),
        metrics: [
          { label: 'Recommendations', value: stockKpis.total },
          { label: 'High priority', value: stockKpis.highPriority },
          { label: 'Top SKU', value: firstText(stockKpis.topRecommendation?.marketingName, stockKpis.topRecommendation?.sku) },
        ],
      },
      {
        title: 'Operational Alerts',
        icon: Bell,
        accent: 'text-red-400',
        border: 'border-red-500/30',
        badge: 'Live',
        route: '/control-tower/alerts',
        summary: firstText(recentAlert?.description, 'No active operational alerts.'),
        metrics: [
          { label: 'Alerts', value: alertKpis.total },
          { label: 'Critical', value: alertKpis.critical },
          { label: 'Source', value: firstText(recentAlert?.source, recentAlert?.type) },
        ],
      },
      {
        title: 'Inventory Risks',
        icon: AlertTriangle,
        accent: 'text-orange-400',
        border: 'border-orange-500/30',
        badge: 'Risk',
        route: '/control-tower/inventory-risk',
        summary: firstText(recentRisk?.ai_insight, recentRisk?.driver_reason, 'No inventory risk loaded yet.'),
        metrics: [
          { label: 'Risks', value: inventoryKpis.total },
          { label: 'Shortage', value: inventoryKpis.shortage },
          { label: 'Spoilage', value: inventoryKpis.spoilage },
        ],
      },
      {
        title: 'Demand Forecast',
        icon: LineChart,
        accent: 'text-indigo-400',
        border: 'border-indigo-500/30',
        badge: '7-Day',
        route: '/control-tower/forecast-engine',
        summary: `${forecastKpis.recordCount} forecast rows with peak demand on ${forecastKpis.peakDay}.`,
        metrics: [
          { label: 'Predicted units', value: currency.format(forecastKpis.totalPredicted) },
          { label: 'Peak day', value: forecastKpis.peakDay },
          { label: 'Peak volume', value: currency.format(forecastKpis.peakVolume) },
        ],
      },
      {
        title: 'Event Intelligence',
        icon: Calendar,
        accent: 'text-purple-400',
        border: 'border-purple-500/30',
        badge: 'Signal',
        route: '/control-tower/event-intelligence',
        summary: firstText(eventKpis.topEvent?.title, eventKpis.topEvent?.event_name, 'No upcoming events loaded.'),
        metrics: [
          { label: 'Active events', value: eventKpis.total },
          { label: 'Category links', value: eventKpis.impactedCategories },
          { label: 'Location', value: firstText(eventKpis.topEvent?.cities?.city_name, selectedCityName) },
        ],
      },
      {
        title: 'Trend Intelligence',
        icon: TrendingUp,
        accent: 'text-pink-400',
        border: 'border-pink-500/30',
        badge: 'Momentum',
        route: '/control-tower/trend-intelligence',
        summary: firstText(trendKpis.topTrend?.categories?.category_name, trendKpis.topTrend?.trend_memo, 'Trend momentum loaded from live signals.'),
        metrics: [
          { label: 'Signals', value: trendKpis.total },
          { label: 'Avg score', value: Math.round(trendKpis.avgScore) },
          { label: 'Top score', value: asNumber(trendKpis.topTrend?.trend_score) },
        ],
      },
      {
        title: 'Weather Intelligence',
        icon: Cloud,
        accent: 'text-sky-400',
        border: 'border-sky-500/30',
        badge: 'Forecast',
        route: '/control-tower/weather-intelligence',
        summary: weatherKpis.advisory,
        metrics: [
          { label: 'Forecast days', value: weatherKpis.total },
          { label: 'Hotspot', value: firstText(weatherKpis.hottest?.weather_condition, weatherKpis.hottest?.forecast_date) },
          { label: 'Rain risk', value: firstText(weatherKpis.wettest?.precipitation, '0') },
        ],
      },
      {
        title: 'Store Transactions',
        icon: Clock,
        accent: 'text-fuchsia-400',
        border: 'border-fuchsia-500/30',
        badge: 'Feed',
        route: null,
        summary: `${checkoutKpis.latestTransactions.length} recent transactions from ${checkoutKpis.busiestLane}.`,
        metrics: [
          { label: 'Recent txns', value: checkoutKpis.latestTransactions.length },
          { label: 'Top lane', value: checkoutKpis.busiestLane },
          { label: 'Latest total', value: formatCurrency(checkoutKpis.topTransaction?.total) },
        ],
      },
    ];
  }, [alertKpis, checkoutKpis, eventKpis, forecastKpis, healthKpis, inventoryKpis, logisticsKpis, selectedCityName, stockKpis, trendKpis, vendorKpis, weatherKpis]);

  const overviewKpis = useMemo(() => {
    return [
      {
        label: 'Operations Health',
        value: healthKpis.score ? `${healthKpis.score}/100` : 'N/A',
        note: healthKpis.status,
        icon: Activity,
        accent: 'text-green-400',
      },
      {
        label: 'Open Alerts',
        value: alertKpis.total,
        note: `${alertKpis.critical} critical`,
        icon: Bell,
        accent: 'text-red-400',
      },
      {
        label: 'Rebalance Queue',
        value: stockKpis.total,
        note: `${stockKpis.highPriority} high priority`,
        icon: ArrowRightLeft,
        accent: 'text-yellow-400',
      },
      {
        label: 'Billing Volume',
        value: checkoutKpis.transactionCount,
        note: formatCurrency(checkoutKpis.totalSales),
        icon: ShoppingCart,
        accent: 'text-blue-400',
      },
      {
        label: 'Demand Forecast',
        value: currency.format(forecastKpis.totalPredicted),
        note: `${forecastKpis.recordCount} rows`,
        icon: LineChart,
        accent: 'text-indigo-400',
      },
      {
        label: 'Inventory Risks',
        value: inventoryKpis.total,
        note: `${inventoryKpis.shortage} shortage`,
        icon: AlertTriangle,
        accent: 'text-orange-400',
      },
    ];
  }, [alertKpis, checkoutKpis, forecastKpis, healthKpis, inventoryKpis, stockKpis]);

  return (
    <div className="flex min-h-screen bg-background text-foreground font-sans selection:bg-blue-500/30">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur-md">
          <div className="flex h-16 items-center justify-between gap-4 px-4 md:px-6">
            <h1 className="text-xl font-bold tracking-tight text-foreground md:text-2xl">Warehouse Operations Dashboard</h1>

            <ThemeToggle />
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1700px] space-y-8 p-6 pt-8 lg:pt-10">
          <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {overviewKpis.map((item) => {
              const Icon = item.icon;
              return (
                <Card key={item.label} className="border-[#333] bg-[#111]">
                  <CardContent className="p-5">
                    <div className="mb-2 flex items-start justify-between">
                      <p className="text-xs font-bold uppercase tracking-wider text-gray-500">{item.label}</p>
                      <Icon className={`h-4 w-4 ${item.accent}`} />
                    </div>
                    <div className="text-3xl font-bold text-white">{item.value}</div>
                    <div className="mt-1 text-xs text-gray-400">{item.note}</div>
                  </CardContent>
                </Card>
              );
            })}
          </section>

          <section className="grid grid-cols-1 gap-4 xl:grid-cols-[1.4fr_0.9fr]">
            <Card className="border-[#333] bg-[#111]">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-white">Live Operational Focus</CardTitle>
                    <CardDescription className="text-gray-400">The most important recommendations and signals are surfaced here.</CardDescription>
                  </div>
                  <Badge className="border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/10">
                    {isLoading ? 'Syncing' : 'Live'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {moduleCards.slice(0, 4).map((card) => {
                  const Icon = card.icon;
                  const clickable = Boolean(card.route);
                  return (
                    <div
                      key={card.title}
                      className={`rounded-xl border ${card.border} bg-[#151515] p-4 transition-colors ${clickable ? 'cursor-pointer hover:border-blue-500/40' : ''}`}
                      onClick={clickable ? () => navigate(card.route) : undefined}
                    >
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <Icon className={`h-4 w-4 ${card.accent}`} />
                          <h3 className="font-semibold text-white">{card.title}</h3>
                        </div>
                        <Badge variant="outline" className="border-[#333] text-[10px] text-gray-400">
                          {card.badge}
                        </Badge>
                      </div>
                      <p className="mb-4 text-sm leading-6 text-gray-400">{card.summary}</p>
                      <div className="space-y-2">
                        {card.metrics.map((metric) => (
                          <div key={metric.label} className="flex items-center justify-between text-xs">
                            <span className="text-gray-500">{metric.label}</span>
                            <span className="max-w-[60%] truncate font-semibold text-gray-100">{String(metric.value)}</span>
                          </div>
                        ))}
                      </div>
                      {clickable && (
                        <div className="mt-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-400">
                          Open module
                          <ArrowRight className="h-3.5 w-3.5" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card className="border-[#333] bg-[#111]">
              <CardHeader className="pb-3">
                <CardTitle className="flex flex-col gap-3 text-white sm:flex-row sm:items-center sm:justify-between">
                  <span>Store Health Snapshot</span>
                  <Badge className="w-fit border border-green-500/30 bg-green-500/10 text-green-300 hover:bg-green-500/10">
                    {healthKpis.status}
                  </Badge>
                </CardTitle>
                <CardDescription className="text-gray-400">Selected store: {selectedStoreId ? stores.find((store) => store.store_id === selectedStoreId)?.store_name || 'Store' : 'No store selected'}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-xl border border-[#222] bg-[#151515] p-4">
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-xs uppercase tracking-wider text-gray-500">Health score</div>
                      <div className="text-4xl font-bold text-white">{healthKpis.score || '—'}</div>
                    </div>
                    <ShieldCheck className="h-7 w-7 text-green-400" />
                  </div>
                  <div className="mt-2 text-sm text-gray-400">{healthKpis.summary || 'No store health summary available yet.'}</div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="rounded-lg border border-[#222] bg-[#151515] p-3">
                    <div className="text-[10px] uppercase tracking-wider text-gray-500">Attention queue</div>
                    <div className="mt-1 text-2xl font-bold text-white">{healthKpis.attentionCount}</div>
                  </div>
                  <div className="rounded-lg border border-[#222] bg-[#151515] p-3">
                    <div className="text-[10px] uppercase tracking-wider text-gray-500">Top risk</div>
                    <div className="mt-1 text-sm font-semibold text-white">{firstText(healthKpis.topAttention?.issue, healthKpis.topAttention?.severity)}</div>
                  </div>
                  <div className="rounded-lg border border-[#222] bg-[#151515] p-3">
                    <div className="text-[10px] uppercase tracking-wider text-gray-500">Last sync</div>
                    <div className="mt-1 text-sm font-semibold text-white">{lastUpdated ? lastUpdated.toLocaleTimeString() : '—'}</div>
                  </div>
                </div>

                {error && <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</div>}
              </CardContent>
            </Card>
          </section>

          <section>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">Module Highlights</h2>
                <p className="text-sm text-gray-400">Short summaries from the modules the team asked to see together.</p>
              </div>
              <Badge variant="outline" className="border-[#333] text-gray-400">
                {isLoading ? 'Loading module data' : 'Module data ready'}
              </Badge>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 2xl:grid-cols-3">
              {moduleCards.slice(4).map((card) => {
                const Icon = card.icon;
                const clickable = Boolean(card.route);

                return (
                  <Card
                    key={card.title}
                    className={`border-[#333] bg-[#111] ${clickable ? 'cursor-pointer transition-colors hover:border-blue-500/40' : ''}`}
                    onClick={clickable ? () => navigate(card.route) : undefined}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Icon className={`h-4 w-4 ${card.accent}`} />
                            <CardTitle className="text-base text-white">{card.title}</CardTitle>
                          </div>
                          <CardDescription className="text-gray-400">{card.summary}</CardDescription>
                        </div>
                        <Badge variant="outline" className="border-[#333] text-[10px] text-gray-400">
                          {card.badge}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {card.metrics.map((metric) => (
                        <div key={metric.label} className="flex items-center justify-between rounded-lg border border-[#222] bg-[#151515] px-3 py-2 text-sm">
                          <span className="text-gray-400">{metric.label}</span>
                          <span className="max-w-[65%] truncate font-semibold text-white">{String(metric.value)}</span>
                        </div>
                      ))}
                      {clickable && (
                        <div className="pt-1 text-xs font-semibold uppercase tracking-wider text-blue-400">
                          Open module <ArrowRight className="inline-block h-3.5 w-3.5" />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>

          <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
            <Card className="border-[#333] bg-[#111]">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-white">
                  <Truck className="h-4 w-4 text-cyan-400" /> Logistics Pipeline
                </CardTitle>
                <CardDescription className="text-gray-400">Active transfer summary and latest lane signal.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">In transit</span>
                  <span className="font-semibold text-white">{logisticsKpis.inTransit}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Delayed</span>
                  <span className="font-semibold text-red-400">{logisticsKpis.delayed}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Top transfer</span>
                  <span className="max-w-[60%] truncate font-semibold text-white">{firstText(logisticsKpis.topTransfer?.product, logisticsKpis.topTransfer?.destination)}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-[#333] bg-[#111]">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-white">
                  <Package className="h-4 w-4 text-yellow-400" /> Inventory Risk
                </CardTitle>
                <CardDescription className="text-gray-400">Current shortage, overstock, and spoilage exposure.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Shortage</span>
                  <span className="font-semibold text-orange-400">{inventoryKpis.shortage}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Overstock</span>
                  <span className="font-semibold text-yellow-400">{inventoryKpis.overstock}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Top insight</span>
                  <span className="max-w-[60%] truncate font-semibold text-white">{firstText(inventoryKpis.topRisk?.ai_insight, inventoryKpis.topRisk?.driver_reason)}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-[#333] bg-[#111]">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-white">
                  <Clock className="h-4 w-4 text-fuchsia-400" /> Store Transactions
                </CardTitle>
                <CardDescription className="text-gray-400">Latest checkout feed from the selected site.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {checkoutKpis.latestTransactions.length > 0 ? checkoutKpis.latestTransactions.map((transaction) => (
                  <div key={transaction.id} className="rounded-lg border border-[#222] bg-[#151515] p-3 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-semibold text-white">{transaction.id}</span>
                      <span className="text-gray-400">{transaction.lane}</span>
                    </div>
                    <div className="mt-1 flex items-center justify-between gap-3 text-xs text-gray-400">
                      <span className="truncate">{firstText(transaction.customer, transaction.paymentMethod)}</span>
                      <span className="font-semibold text-blue-300">{formatCurrency(transaction.total)}</span>
                    </div>
                  </div>
                )) : (
                  <div className="rounded-lg border border-[#222] bg-[#151515] p-3 text-sm text-gray-400">No transaction feed available yet.</div>
                )}
              </CardContent>
            </Card>
          </section>
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;
