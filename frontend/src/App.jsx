import React, { Suspense, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Moon, Sun } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import { Toaster } from '@/components/ui/toaster';


import { AuthProvider } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';

// Lazy load pages
const LoginPage = React.lazy(() => import('@/app/LoginPage'));
const DashboardPage = React.lazy(() => import('@/app/dashboard/DashboardPage'));
const StaffDashboardPage = React.lazy(() => import('@/app/dashboard/StaffDashboardPage'));

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
const RecommendationsPage = React.lazy(() => import('@/app/recommendations/RecommendationsPage'));
const AdminTransactionsPage = React.lazy(() => import('@/app/control-tower/AdminTransactions'));








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

import { useAuth } from '@/context/AuthContext';

function DashboardWrapper() {
    const { role } = useAuth();
    if (role === 'staff') {
        return <StaffDashboardPage />;
    }
    return <DashboardPage />;
}

// Redirect if logged in but on wrong path
function DashboardLogic() {
    const { user, role, loading } = useAuth();
    const location = useLocation();

    useEffect(() => {
        if (!loading && user) {
            if (role === 'vendor' && !location.pathname.startsWith('/vendor') && location.pathname !== '/login') {
                // Redirect vendor to vendor portal if they try to access other pages
                // navigate('/vendor'); // Can't use navigate here since it's not and component
            }
        }
    }, [user, role, loading, location]);

    return null;
}

export default function App() {
    return (
        <AuthProvider>
            <Router>
                <DashboardLogic />
                <Layout>
                    <Suspense fallback={<Loading />}>
                        <Routes>
                            <Route path="/" element={<Navigate to="/dashboard" replace />} />
                            
                            {/* Public Route */}
                            <Route path="/login" element={<LoginPage />} />

                            {/* Private Routes - Staff has access to only 3 specific modules */}
                            <Route path="/dashboard" element={
                                <ProtectedRoute allowedRoles={['staff', 'admin']}>
                                    <DashboardWrapper />
                                </ProtectedRoute>
                            } />
                            
                            {/* Admin only Hub and Strategy */}
                            <Route path="/control-tower" element={<ProtectedRoute allowedRoles={['admin']}><ControlTowerPage /></ProtectedRoute>} />
                            <Route path="/control-tower/event-intelligence" element={<ProtectedRoute allowedRoles={['admin']}><EventIntelligencePage /></ProtectedRoute>} />
                            <Route path="/control-tower/trend-intelligence" element={<ProtectedRoute allowedRoles={['admin']}><TrendIntelligencePage /></ProtectedRoute>} />
                            <Route path="/control-tower/weather-intelligence" element={<ProtectedRoute allowedRoles={['admin']}><WeatherIntelligencePage /></ProtectedRoute>} />
                            <Route path="/control-tower/forecast-engine" element={<ProtectedRoute allowedRoles={['admin']}><ForecastEnginePage /></ProtectedRoute>} />
                            <Route path="/control-tower/scenario-planning" element={<ProtectedRoute allowedRoles={['admin']}><ScenarioPlanningPage /></ProtectedRoute>} />
                            <Route path="/control-tower/inventory-risk" element={<ProtectedRoute allowedRoles={['admin']}><InventoryRiskPage /></ProtectedRoute>} />
                            <Route path="/control-tower/store-health" element={<ProtectedRoute allowedRoles={['admin']}><StoreHealthPage /></ProtectedRoute>} />
                            <Route path="/control-tower/live-checkout" element={<ProtectedRoute allowedRoles={['admin']}><LiveCheckoutPage /></ProtectedRoute>} />
                            
                            {/* Staff & Admin operational tools */}
                            <Route path="/checkout-vision" element={<ProtectedRoute allowedRoles={['staff', 'admin']}><CheckoutVisionPage /></ProtectedRoute>} />
                            <Route path="/control-tower/alerts" element={<ProtectedRoute allowedRoles={['staff', 'admin']}><OperationalAlertsPage /></ProtectedRoute>} />
                            
                            {/* Admin only operations */}
                            <Route path="/control-tower/checkout-analytics" element={<ProtectedRoute allowedRoles={['admin']}><CheckoutAnalyticsPage /></ProtectedRoute>} />
                            <Route path="/control-tower/federated-learning" element={<ProtectedRoute allowedRoles={['admin']}><FederatedLearningPage /></ProtectedRoute>} />
                            <Route path="/control-tower/model-health" element={<ProtectedRoute allowedRoles={['admin']}><ModelHealthPage /></ProtectedRoute>} />
                            <Route path="/control-tower/stock-rebalancing" element={<ProtectedRoute allowedRoles={['admin']}><StockRebalancingPage /></ProtectedRoute>} />
                            <Route path="/logistics" element={<ProtectedRoute allowedRoles={['admin']}><LogisticsPage /></ProtectedRoute>} />
                            <Route path="/logistics/*" element={<ProtectedRoute allowedRoles={['admin']}><LogisticsPage /></ProtectedRoute>} />
                            <Route path="/recommendations" element={<ProtectedRoute allowedRoles={['admin']}><RecommendationsPage /></ProtectedRoute>} />
                            <Route path="/control-tower/admin-transactions" element={<ProtectedRoute allowedRoles={['admin']}><AdminTransactionsPage /></ProtectedRoute>} />

                            {/* Vendor & Admin Routes */}
                            <Route path="/vendor" element={<ProtectedRoute allowedRoles={['vendor', 'admin']}><VendorPage /></ProtectedRoute>} />
                            <Route path="/vendor/*" element={<ProtectedRoute allowedRoles={['vendor', 'admin']}><VendorPage /></ProtectedRoute>} />
                        </Routes>
                    </Suspense>
                </Layout>
                <Toaster />
            </Router>
        </AuthProvider>
    );
}
