import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';


import { AuthProvider } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';

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
const CheckoutVisionPage = React.lazy(() => import('@/app/checkout-vision/page'));
const CheckoutAnalyticsPage = React.lazy(() => import('@/app/control-tower/CheckoutAnalytics'));
const FederatedLearningPage = React.lazy(() => import('@/app/federated-learning/page'));
const ModelHealthPage = React.lazy(() => import('@/app/control-tower/ModelHealth'));
const OperationalAlertsPage = React.lazy(() => import('@/app/alerts/page'));
const StockRebalancingPage = React.lazy(() => import('@/app/stock-rebalancing/page'));
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
        <AuthProvider>
            <Router>
                <Layout>
                    <Suspense fallback={<Loading />}>
                        <Routes>
                            <Route path="/" element={<Navigate to="/dashboard" replace />} />
                            
                            {/* Public Route */}
                            <Route path="/login" element={<LoginPage />} />

                            {/* Staff & Admin Routes */}
                            <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['staff']}><DashboardPage /></ProtectedRoute>} />
                            <Route path="/control-tower" element={<ProtectedRoute allowedRoles={['staff']}><ControlTowerPage /></ProtectedRoute>} />
                            <Route path="/control-tower/event-intelligence" element={<ProtectedRoute allowedRoles={['staff']}><EventIntelligencePage /></ProtectedRoute>} />
                            <Route path="/control-tower/trend-intelligence" element={<ProtectedRoute allowedRoles={['staff']}><TrendIntelligencePage /></ProtectedRoute>} />
                            <Route path="/control-tower/weather-intelligence" element={<ProtectedRoute allowedRoles={['staff']}><WeatherIntelligencePage /></ProtectedRoute>} />
                            <Route path="/control-tower/forecast-engine" element={<ProtectedRoute allowedRoles={['staff']}><ForecastEnginePage /></ProtectedRoute>} />
                            <Route path="/control-tower/scenario-planning" element={<ProtectedRoute allowedRoles={['staff']}><ScenarioPlanningPage /></ProtectedRoute>} />
                            <Route path="/control-tower/inventory-risk" element={<ProtectedRoute allowedRoles={['staff']}><InventoryRiskPage /></ProtectedRoute>} />
                            <Route path="/control-tower/store-health" element={<ProtectedRoute allowedRoles={['staff']}><StoreHealthPage /></ProtectedRoute>} />
                            <Route path="/control-tower/live-checkout" element={<ProtectedRoute allowedRoles={['staff']}><LiveCheckoutPage /></ProtectedRoute>} />
                            <Route path="/control-tower/checkout-vision" element={<ProtectedRoute allowedRoles={['staff']}><CheckoutVisionPage /></ProtectedRoute>} />
                            <Route path="/control-tower/checkout-analytics" element={<ProtectedRoute allowedRoles={['staff']}><CheckoutAnalyticsPage /></ProtectedRoute>} />
                            <Route path="/control-tower/federated-learning" element={<ProtectedRoute allowedRoles={['staff']}><FederatedLearningPage /></ProtectedRoute>} />
                            <Route path="/control-tower/model-health" element={<ProtectedRoute allowedRoles={['staff']}><ModelHealthPage /></ProtectedRoute>} />
                            <Route path="/control-tower/alerts" element={<ProtectedRoute allowedRoles={['staff']}><OperationalAlertsPage /></ProtectedRoute>} />
                            <Route path="/control-tower/stock-rebalancing" element={<ProtectedRoute allowedRoles={['staff']}><StockRebalancingPage /></ProtectedRoute>} />
                            <Route path="/logistics" element={<ProtectedRoute allowedRoles={['staff']}><LogisticsPage /></ProtectedRoute>} />
                            <Route path="/logistics/*" element={<ProtectedRoute allowedRoles={['staff']}><LogisticsPage /></ProtectedRoute>} />

                            {/* Vendor & Admin Routes */}
                            <Route path="/vendor" element={<ProtectedRoute allowedRoles={['vendor']}><VendorPage /></ProtectedRoute>} />
                            <Route path="/vendor/*" element={<ProtectedRoute allowedRoles={['vendor']}><VendorPage /></ProtectedRoute>} />
                        </Routes>
                    </Suspense>
                </Layout>
                <Toaster />
            </Router>
        </AuthProvider>
    );
}
