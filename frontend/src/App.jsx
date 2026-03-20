import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';




// Lazy load pages
const LoginPage = React.lazy(() => import('@/app/LoginPage'));
const DashboardPage = React.lazy(() => import('@/app/dashboard/DashboardPage'));

const VendorPage = React.lazy(() => import('@/app/vendor/VendorPage'));

const LogisticsPage = React.lazy(() => import('@/app/logistics/LogisticsPage'));
const ControlTowerPage = React.lazy(() => import('@/app/control-tower/ControlTowerPage'));
const EventIntelligencePage = React.lazy(() => import('@/app/control-tower/EventIntelligence'));
const TrendIntelligencePage = React.lazy(() => import('@/app/control-tower/TrendIntelligence'));
const WeatherIntelligencePage = React.lazy(() => import('@/app/control-tower/WeatherIntelligence'));
const ForecastEnginePage = React.lazy(() => import('@/app/control-tower/ForecastEngine'));
const ScenarioPlanningPage = React.lazy(() => import('@/app/control-tower/ScenarioPlanning'));
const InventoryRiskPage = React.lazy(() => import('@/app/control-tower/InventoryRisk'));
const StoreHealthPage = React.lazy(() => import('@/app/control-tower/StoreHealth'));
const LiveCheckoutPage = React.lazy(() => import('@/app/control-tower/LiveCheckout'));
const CheckoutVisionPage = React.lazy(() => import('@/app/control-tower/CheckoutVision'));
const CheckoutAnalyticsPage = React.lazy(() => import('@/app/control-tower/CheckoutAnalytics'));
const FederatedLearningPage = React.lazy(() => import('@/app/control-tower/FederatedLearning'));
const ModelHealthPage = React.lazy(() => import('@/app/control-tower/ModelHealth'));
const OperationalAlertsPage = React.lazy(() => import('@/app/control-tower/OperationalAlerts'));
const StockRebalancingPage = React.lazy(() => import('@/app/control-tower/StockRebalancing'));
const VendorPortalPage = React.lazy(() => import('@/app/vendor/VendorPage'));








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
                        <Route path="/control-tower/event-intelligence" element={<EventIntelligencePage />} />
                        <Route path="/control-tower/trend-intelligence" element={<TrendIntelligencePage />} />
                        <Route path="/control-tower/weather-intelligence" element={<WeatherIntelligencePage />} />
                        <Route path="/control-tower/forecast-engine" element={<ForecastEnginePage />} />
                        <Route path="/control-tower/scenario-planning" element={<ScenarioPlanningPage />} />
                        <Route path="/control-tower/inventory-risk" element={<InventoryRiskPage />} />
                        <Route path="/control-tower/store-health" element={<StoreHealthPage />} />
                        <Route path="/control-tower/live-checkout" element={<LiveCheckoutPage />} />
                        <Route path="/control-tower/checkout-vision" element={<CheckoutVisionPage />} />
                        <Route path="/control-tower/checkout-analytics" element={<CheckoutAnalyticsPage />} />
                        <Route path="/control-tower/federated-learning" element={<FederatedLearningPage />} />
                        <Route path="/control-tower/model-health" element={<ModelHealthPage />} />
                        <Route path="/control-tower/alerts" element={<OperationalAlertsPage />} />
                        <Route path="/control-tower/stock-rebalancing" element={<StockRebalancingPage />} />

                        <Route path="/login" element={<LoginPage />} />







                        <Route path="/dashboard" element={<DashboardPage />} />


                        <Route path="/vendor" element={<VendorPage />} />
                        <Route path="/vendor/*" element={<VendorPage />} />




                        <Route path="/logistics" element={<LogisticsPage />} />
                        <Route path="/logistics/*" element={<LogisticsPage />} />
                    </Routes>
                </Suspense>

            </Layout>
        </Router>
    );
}
