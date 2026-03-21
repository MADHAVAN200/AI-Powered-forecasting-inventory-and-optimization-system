import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import { Toaster } from '@/components/ui/toaster';
import PlatformShell from '@/components/platform-shell';

// Lazy load pages
const LogisticsPage = React.lazy(() => import('@/app/logistics/page'));
const EventIntelligencePage = React.lazy(() => import('@/app/control-tower/EventIntelligence'));
const TrendIntelligencePage = React.lazy(() => import('@/app/control-tower/TrendIntelligence'));
const WeatherIntelligencePage = React.lazy(() => import('@/app/control-tower/WeatherIntelligence'));
const FederatedLearningPage = React.lazy(() => import('@/app/federated-learning/page'));
const OperationalAlertsPage = React.lazy(() => import('@/app/alerts/page'));
const StockRebalancingPage = React.lazy(() => import('@/app/stock-rebalancing/page'));
const CheckoutVisionPage = React.lazy(() => import('@/app/checkout-vision/page'));

const PlaceholderPage = ({ title }) => (
  <div className="flex min-h-[70vh] items-center justify-center px-6">
    <div className="max-w-xl rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-center shadow-2xl">
      <p className="mb-3 text-xs uppercase tracking-[0.22em] text-slate-500">Upcoming Module</p>
      <h1 className="text-3xl font-bold text-white">{title}</h1>
      <p className="mt-3 text-slate-400">
        This workspace is intentionally hidden from the main navigation until the underlying workflows are ready.
      </p>
    </div>
  </div>
);

// Layout wrapper
const Layout = ({ children }) => {
    return (
    <div className="min-h-screen bg-background font-sans antialiased">
        <main>{children}</main>
    </div>
    );
};

// Loading fallback
const Loading = () => (
    <div className="flex items-center justify-center min-h-screen">
    Loading...
    </div>
);

export default function App() {
  return (
    <Router>
      <Layout>
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route element={<PlatformShell />}>
            <Route path="/" element={<OperationalAlertsPage />} />
            <Route path="/control-tower" element={<OperationalAlertsPage />} />
            <Route path="/event-intelligence" element={<EventIntelligencePage />} />
            <Route path="/trend-intelligence" element={<TrendIntelligencePage />} />
            <Route path="/weather-intelligence" element={<WeatherIntelligencePage />} />
            <Route path="/forecast-engine" element={<PlaceholderPage title="Forecast Engine" />} />
            <Route path="/scenario-planning" element={<PlaceholderPage title="Scenario Planning" />} />
            <Route path="/inventory-risk" element={<PlaceholderPage title="Inventory Risk" />} />
            <Route path="/store-health" element={<PlaceholderPage title="Store Health" />} />
            <Route path="/live-checkout" element={<PlaceholderPage title="Live Checkout" />} />
            <Route path="/checkout-vision" element={<CheckoutVisionPage />} />
            <Route path="/checkout-analytics" element={<PlaceholderPage title="Checkout Analytics" />} />
            <Route path="/federated-learning" element={<FederatedLearningPage />} />
            <Route path="/model-health" element={<PlaceholderPage title="Model Health" />} />
            <Route path="/alerts" element={<OperationalAlertsPage />} />
            <Route path="/stock-rebalancing" element={<StockRebalancingPage />} />
            <Route path="/login" element={<PlaceholderPage title="Login" />} />
            <Route path="/dashboard" element={<PlaceholderPage title="Dashboard" />} />
            <Route path="/vendor" element={<PlaceholderPage title="Vendor" />} />
            <Route path="/vendor/*" element={<PlaceholderPage title="Vendor" />} />

            <Route path="/logistics" element={<LogisticsPage />} />
            <Route path="/logistics/*" element={<LogisticsPage />} />
            </Route>
          </Routes>
        </Suspense>

        {/* Global Components */}
        <Toaster />
      </Layout>
    </Router>
  );
}
