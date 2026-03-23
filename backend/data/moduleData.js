export const moduleDataSeed = {
    alerts: {
        kpis: {
            avgResponseTime: '8m',
        },
        alerts: [
            {
                id: 'ALT-2024-001',
                priority: 'Critical',
                type: 'Inventory',
                source: 'Inventory Risk',
                description: 'Imminent stockout for Avocados (Hass) at Store #402. Safety stock breached.',
                store: 'Store 402',
                time: '10m ago',
                sla: '15m remaining',
                status: 'New',
                owner: 'Unassigned',
                rootCause: ['Demand spike (+40%)', 'Late delivery'],
                recommendation: 'Initiate emergency replenishment from Warehouse B.'
            },
            {
                id: 'ALT-2024-002',
                priority: 'High',
                type: 'Model/System',
                source: 'Model Health',
                description: 'Vision Model accuracy dropped by 1.5% in the last hour.',
                store: 'Global',
                time: '45m ago',
                sla: '2h remaining',
                status: 'In Progress',
                owner: 'Sarah J. (AI Ops)',
                rootCause: ['Lighting condition change', 'New packaging detected'],
                recommendation: 'Trigger localized retraining for affected cameras.'
            },
            {
                id: 'ALT-2024-003',
                priority: 'High',
                type: 'Checkout',
                source: 'Live Monitoring',
                description: 'Repeated lane anomalies at Lane 03. Possible camera obstruction.',
                store: 'Store 115',
                time: '1h ago',
                sla: 'Overdue',
                status: 'New',
                owner: 'Unassigned',
                rootCause: ['Camera occlusion', 'Sensor noise'],
                recommendation: 'Dispatch floor staff to inspect Lane 03.'
            },
            {
                id: 'ALT-2024-004',
                priority: 'Medium',
                type: 'Forecast',
                source: 'Demand Engine',
                description: 'Forecast volatility exceeds threshold due to unmapped local event.',
                store: 'Store 892',
                time: '3h ago',
                sla: '4h remaining',
                status: 'Acknowledged',
                owner: 'Mike R.',
                rootCause: ['Event detection lag', 'Weather shift'],
                recommendation: 'Review event parameters in Scenario Planner.'
            }
        ]
    },
    logistics: {
        kpis: [
            { label: 'Active Transfers', value: '42', trend: '+5', status: 'neutral', icon: 'Truck' },
            { label: 'In-Transit', value: '28', trend: '+12', status: 'neutral', icon: 'Activity' },
            { label: 'Delayed', value: '3', trend: '-2', status: 'critical', icon: 'AlertTriangle' },
            { label: 'At Risk', value: '5', trend: '+1', status: 'warning', icon: 'ShieldAlert' },
        ],
        transfers: [
            {
                id: 'TRF-2024-001',
                sku: 'APP-ORG-001',
                product: 'Organic Honeycrisp Apples',
                qty: 500,
                unit: 'kg',
                source: 'DC-North (Warehouse)',
                destination: 'Store #104 (Downtown)',
                type: 'Warehouse -> Store',
                status: 'In Transit',
                eta: 'Today, 14:00',
                sla_status: 'On Track',
                cold_chain: true,
                risk_level: 'Low',
                events: [
                    { time: '10:00 AM', event: 'Departed DC-North', location: 'Seattle, WA' },
                    { time: '08:30 AM', event: 'Loaded via Dock 4', location: 'Seattle, WA' },
                ]
            },
            {
                id: 'TRF-2024-002',
                sku: 'DAI-MLK-202',
                product: 'Whole Milk 2L',
                qty: 200,
                unit: 'units',
                source: 'Store #201 (Westside)',
                destination: 'Store #104 (Downtown)',
                type: 'Inter-store',
                status: 'Delayed',
                eta: 'Today, 18:30',
                sla_status: 'At Risk',
                cold_chain: true,
                risk_level: 'High',
                events: [
                    { time: '11:15 AM', event: 'Delay Alert: Traffic Congestion', location: 'I-5 South' },
                    { time: '09:45 AM', event: 'Departed Store #201', location: 'Portland, OR' }
                ]
            },
            {
                id: 'TRF-2024-005',
                sku: 'FRZ-IC-505',
                product: 'Vanilla Bean Ice Cream',
                qty: 50,
                unit: 'cases',
                source: 'DC-ColdStorage',
                destination: 'Store #102 (Northgate)',
                type: 'Warehouse -> Store',
                status: 'In Transit',
                eta: 'Today, 15:45',
                sla_status: 'Critical',
                cold_chain: true,
                risk_level: 'Critical',
                risk_reason: 'Temp Fluctuation',
                events: [
                    { time: '12:30 PM', event: 'Temp Alert: +4C variance', location: 'En route' },
                    { time: '11:00 AM', event: 'Departed Cold Storage', location: 'Tacoma, WA' }
                ]
            }
        ]
    },
    stockRebalancing: {
        summary: {
            excessStockUnits: 2450,
            spoilageRisk: 'High',
            lowDemandConfidence: '42%',
            insight: 'Store 402 has a surplus of perishable goods due to a cancelled local event. Store 115 is facing shortages for the same items.'
        },
        recommendations: [
            {
                id: 'TRF-2024-882',
                sku: 'Avocados (Hass) - Premium',
                skuId: 'SKU-9928',
                sourceStore: 'Store 402 (North)',
                destStore: 'Store 115 (Downtown)',
                marketingName: 'Organic Hass Avocados',
                qty: 150,
                unit: 'Units',
                demandGap: '+420 Units',
                riskReduction: 'High',
                priority: 'Critical',
                confidence: 96,
                distance: '12 miles',
                time: '45 mins',
                feasibility: 'Feasible',
                coldChain: true,
                sourceMetrics: {
                    overstock: 'Severe (+200%)',
                    spoilageRisk: 'High (<3 days)',
                    forecast: 'Declining'
                },
                destMetrics: {
                    stockoutRisk: 'Imminent (2h)',
                    forecast: 'Spiking (+50%)',
                    promoActive: true
                }
            },
            {
                id: 'TRF-2024-885',
                sku: 'Almond Milk - Unsweetened',
                skuId: 'SKU-1029',
                sourceStore: 'Store 892 (West)',
                destStore: 'Store 402 (North)',
                marketingName: 'Silk Almond Milk',
                qty: 40,
                unit: 'Cartons',
                demandGap: '+65 Units',
                riskReduction: 'Medium',
                priority: 'High',
                confidence: 88,
                distance: '8 miles',
                time: '30 mins',
                feasibility: 'Feasible',
                coldChain: false,
                sourceMetrics: {
                    overstock: 'Moderate (+40%)',
                    spoilageRisk: 'Low',
                    forecast: 'Flat'
                },
                destMetrics: {
                    stockoutRisk: 'Medium (24h)',
                    forecast: 'Stable',
                    promoActive: false
                }
            }
        ]
    },
    federatedLearning: {
        globalAccuracy: [
            { round: 'R-104', accuracy: 90.5, loss: 0.38 },
            { round: 'R-105', accuracy: 91.2, loss: 0.35 },
            { round: 'R-106', accuracy: 91.8, loss: 0.33 },
            { round: 'R-107', accuracy: 92.4, loss: 0.31 },
            { round: 'R-108', accuracy: 93.1, loss: 0.28 },
        ],
        edgeNodes: [
            { id: 'STORE-402', status: 'Training', round: 108, accuracy: 94.2, weight: 1.2, drift: 'Low', lastUpdate: '2m ago' },
            { id: 'STORE-115', status: 'Ready', round: 108, accuracy: 92.8, weight: 1.0, drift: 'Low', lastUpdate: '5m ago' },
            { id: 'STORE-892', status: 'Idle', round: 107, accuracy: 89.5, weight: 0.9, drift: 'Medium', lastUpdate: '1h ago' },
            { id: 'STORE-055', status: 'Error', round: 106, accuracy: 0.0, weight: 0.0, drift: 'High', lastUpdate: '4h ago' },
        ],
        logs: [
            { id: 1, time: '10:45:00', event: 'Global Aggregation R-108 started', type: 'info' },
            { id: 2, time: '10:44:22', event: 'Store-402 submitted local gradients (Size: 45MB)', type: 'success' },
            { id: 3, time: '10:30:15', event: 'Store-055 connection timeout - dropped from round', type: 'error' }
        ]
    }
};

export const moduleData = moduleDataSeed;
