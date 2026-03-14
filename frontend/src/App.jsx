import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';


import Chatbot from './components/Chatbot';

// Lazy load pages
const LoginPage = React.lazy(() => import('@/app/page'));
const DashboardPage = React.lazy(() => import('@/app/dashboard/page'));

const VendorPage = React.lazy(() => import('@/app/vendor/page'));

const LogisticsPage = React.lazy(() => import('@/app/logistics/page'));
const ControlTowerPage = React.lazy(() => import('@/app/control-tower/page'));
const EventIntelligencePage = React.lazy(() => import('@/app/event-intelligence/page'));
const TrendIntelligencePage = React.lazy(() => import('@/app/trend-intelligence/page'));
const WeatherIntelligencePage = React.lazy(() => import('@/app/weather-intelligence/page'));
const ForecastEnginePage = React.lazy(() => import('@/app/forecast-engine/page'));
const ScenarioPlanningPage = React.lazy(() => import('@/app/scenario-planning/page'));
const InventoryRiskPage = React.lazy(() => import('@/app/inventory-risk/page'));
const StoreHealthPage = React.lazy(() => import('@/app/store-health/page'));
const LiveCheckoutPage = React.lazy(() => import('@/app/live-checkout/page'));
const CheckoutVisionPage = React.lazy(() => import('@/app/checkout-vision/page'));
const CheckoutAnalyticsPage = React.lazy(() => import('@/app/checkout-analytics/page'));
const FederatedLearningPage = React.lazy(() => import('@/app/federated-learning/page'));
const ModelHealthPage = React.lazy(() => import('@/app/model-health/page'));
const OperationalAlertsPage = React.lazy(() => import('@/app/alerts/page'));
const StockRebalancingPage = React.lazy(() => import('@/app/stock-rebalancing/page'));
const VendorPortalPage = React.lazy(() => import('@/app/vendor/page'));








// Layout wrapper
const Layout = ({ children }) => {
    return (
        <div className="min-h-screen bg-background font-sans antialiased">
            <main>
                {children}
            </main>
        </div>
    );
};

// Loading fallback
const Loading = () => <div className="flex items-center justify-center min-h-screen">Loading...</div>;

export default function App() {
    return (
        <Router>
            <Layout>
                <Suspense fallback={<Loading />}>
                    <Routes>
                        <Route path="/" element={<ControlTowerPage />} />
                        <Route path="/control-tower" element={<ControlTowerPage />} />
                        <Route path="/event-intelligence" element={<EventIntelligencePage />} />
                        <Route path="/trend-intelligence" element={<TrendIntelligencePage />} />
                        <Route path="/weather-intelligence" element={<WeatherIntelligencePage />} />
                        <Route path="/forecast-engine" element={<ForecastEnginePage />} />
                        <Route path="/scenario-planning" element={<ScenarioPlanningPage />} />
                        <Route path="/inventory-risk" element={<InventoryRiskPage />} />
                        <Route path="/store-health" element={<StoreHealthPage />} />
                        <Route path="/live-checkout" element={<LiveCheckoutPage />} />
                        <Route path="/checkout-vision" element={<CheckoutVisionPage />} />
                        <Route path="/checkout-analytics" element={<CheckoutAnalyticsPage />} />
                        <Route path="/federated-learning" element={<FederatedLearningPage />} />
                        <Route path="/model-health" element={<ModelHealthPage />} />
                        <Route path="/alerts" element={<OperationalAlertsPage />} />
                        <Route path="/stock-rebalancing" element={<StockRebalancingPage />} />

                        <Route path="/login" element={<LoginPage />} />







                        <Route path="/dashboard" element={<DashboardPage />} />


                        <Route path="/vendor" element={<VendorPage />} />
                        <Route path="/vendor/*" element={<VendorPage />} />




                        <Route path="/logistics" element={<LogisticsPage />} />
                        <Route path="/logistics/*" element={<LogisticsPage />} />
                    </Routes>
                </Suspense>
                <Chatbot />
            </Layout>
        </Router>
    );
}
