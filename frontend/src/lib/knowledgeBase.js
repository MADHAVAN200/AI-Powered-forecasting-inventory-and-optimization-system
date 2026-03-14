
export const knowledgeBase = [
    // --- DASHBOARD COMPONENTS ---
    {
        id: 'dashboard-network-health',
        keywords: ['network health', 'dashboard', 'health score', '94', '100', 'global snapshot'],
        title: 'Network Health (Dashboard)',
        content: "The 'Network Health' card on the Dashboard shows a composite score (currently 94/100) representing the overall operational status. It aggregates store uptime, inventory health, and system performance. It is currently trending up (+2% vs yesterday).",
        actions: [{ label: 'View Dashboard', route: '/dashboard' }]
    },
    {
        id: 'dashboard-cards',
        keywords: ['dashboard', 'cards', 'summary', 'snapshot', 'stores at risk', 'stockouts', 'checkout alerts', 'logistics status'],
        title: 'Dashboard Snapshot Cards',
        content: "The top row of the Dashboard features 5 key snapshot cards: 1) Network Health, 2) Stores at Risk (Red, critical needs), 3) Stockouts Imminent (Yellow, inventory risks), 4) Checkout Alerts (Blue, high traffic/anomalies), and 5) Logistics Status (Purple, in-transit transfers).",
        actions: [{ label: 'View Dashboard', route: '/dashboard' }]
    },
    {
        id: 'dashboard-demand-outlook',
        keywords: ['demand outlook', 'dashboard', 'bar', 'progress', 'confidence', 'forecast'],
        title: 'Demand Outlook (Dashboard)',
        content: "The 'Demand Outlook' card displays a prediction for the next 7 days. It currently shows a +12% demand increase above baseline with High Confidence (94%). The green progress bar visually indicates this positive trend.",
        actions: [{ label: 'Detailed Forecast', route: '/forecast-engine' }]
    },
    {
        id: 'dashboard-inventory-risk',
        keywords: ['inventory risk', 'dashboard', 'shortage', 'overstock', 'critical'],
        title: 'Inventory Risk Summary (Dashboard)',
        content: "The 'Inventory Risk' card summarizes stock health complications. It specifically tracks: 14 Critical Shortage SKUs (Red), 8 Major Overstock SKUs (Yellow), and 2 At-Risk Stores (402, 115).",
        actions: [{ label: 'View Inventory Risk', route: '/inventory-risk' }]
    },
    {
        id: 'dashboard-checkout-ops',
        keywords: ['checkout operations', 'dashboard', 'lanes', 'anomaly', 'store 115'],
        title: 'Checkout Ops Summary (Dashboard)',
        content: "The 'Checkout Operations' card monitors live lane status. It currently flags 4 lanes requiring action and highlights a high anomaly rate at Store 115. A red pulsing dot indicates active issues.",
        actions: [{ label: 'Live Monitoring', route: '/live-checkout' }]
    },
    {
        id: 'dashboard-alerts',
        keywords: ['active operational alerts', 'dashboard', 'alerts', 'stockout', 'truck', 'delayed', 'vision drift'],
        title: 'Active Alerts List (Dashboard)',
        content: "The 'Active Operational Alerts' section lists prioritized incidents. Current alerts include: Inventory Stockout (Avocados @ St 402), Checkout Lane Blocked (St 115), Vision Model Drift, Truck 42 Delay, and High Temp Alert (Freezer B).",
        actions: [{ label: 'View All Alerts', route: '/alerts' }]
    },

    // --- CONTROL TOWER COMPONENTS ---
    {
        id: 'control-tower-partitions',
        keywords: ['control tower', 'partitions', 'sections', 'grid'],
        title: 'Control Tower Sections',
        content: "The Control Tower is divided into 6 intelligence partitions: 1) Demand & Market (Events, Weather), 2) Forecasting & Planning (AI Engine, Scenarios), 3) Inventory & Execution (Risk, Store Health), 4) Checkout Intelligence (Live Vision), 5) AI Models (Health, Federated Learning), and 6) Active Alerts.",
        actions: [{ label: 'Open Control Tower', route: '/control-tower' }]
    },
    {
        id: 'control-tower-demand',
        keywords: ['demand intelligence', 'event', 'trend', 'weather', 'control tower'],
        title: 'Demand Intelligence (Control Tower)',
        content: "This section tracks external factors. 'Event Intelligence' monitors city events (3 active). 'Trend Intelligence' tracks momentum. 'Weather Intelligence' forecasts conditions affecting demand and spoilage.",
        actions: [{ label: 'Event Intelligence', route: '/event-intelligence' }]
    },
    {
        id: 'control-tower-forecast',
        keywords: ['forecast engine', 'scenario planning', 'control tower', 'simulation'],
        title: 'Forecasting & Planning (Control Tower)',
        content: "Includes the 'Demand Forecast Engine' (Store/SKU predictions) and 'Scenario Planning' (Beta) which allows for simulating demand under different conditions (Comparator Active).",
        actions: [{ label: 'Scenario Planning', route: '/scenario-planning' }]
    },
    {
        id: 'control-tower-checkout',
        keywords: ['live checkout', 'vision verification', 'checkout analytics', 'control tower'],
        title: 'Checkout Intelligence (Control Tower)',
        content: "Monitors the front-end. 'Live Checkout' tracks 8 active lanes. 'Vision Verification' shows AI confidence (98%) in product recognition. 'Checkout Analytics' tracks error rates (1.2%).",
        actions: [{ label: 'Vision Verification', route: '/checkout-vision' }]
    },
    {
        id: 'control-tower-ai',
        keywords: ['federated learning', 'model health', 'drift', 'control tower'],
        title: 'AI Governance (Control Tower)',
        content: "Ensures model reliability. 'Federated Learning Panel' tracks edge model updates (Global gain +2.3%). 'Model Health' monitors for drift (Health Score 88/100).",
        actions: [{ label: 'Model Health', route: '/model-health' }]
    },

    // --- INVENTORY RISK COMPONENTS ---
    {
        id: 'inventory-risk-matrix',
        keywords: ['risk matrix', 'scatter chart', 'inventory risk', 'graph', 'chart', 'quadrant', 'y axis', 'x axis'],
        title: 'Inventory Risk Matrix',
        content: "The 'Risk Matrix' is a scatter chart visualizing SKUs. The X-Axis is 'Forecasted Demand' (Right = High Demand). The Y-Axis is 'Available Inventory' (Top = High Stock). \n- Quadrant 1 (Top-Left): Overstock (High Inv, Low Demand).\n- Quadrant 4 (Bottom-Right): Shortage (Low Inv, High Demand).\n- Active dots are colored by risk type (Orange=Shortage, Yellow=Overstock).",
        actions: [{ label: 'View Matrix', route: '/inventory-risk' }]
    },
    {
        id: 'inventory-risk-drivers',
        keywords: ['risk drivers', 'bars', 'inventory risk', 'forecast surge', 'supply delay'],
        title: 'Risk Drivers Panel',
        content: "The 'Risk Drivers' panel uses progress bars to show WHY items are at risk. Current top drivers: Forecast Surge (45%), Event Overlap (30%), Supply Delay (15%), and Weather (10%).",
        actions: [{ label: 'View Inventory Risk', route: '/inventory-risk' }]
    },
    {
        id: 'inventory-critical-queue',
        keywords: ['critical sku', 'queue', 'table', 'inventory risk', 'actions'],
        title: 'Critical SKU Actions Queue',
        content: "This table lists high-priority corrective actions. E.g., SKU-101 (Cola) needs an 'Expedite Transfer' due to shortage. SKU-890 (Berries) needs a 'Markdown' due to spoilage risk.",
        actions: [{ label: 'View Queue', route: '/inventory-risk' }]
    },

    // --- EVENT INTELLIGENCE ---
    {
        id: 'event-intelligence-overview',
        keywords: ['event intelligence', 'events', 'city events', 'impact score', 'impact threshold'],
        title: 'Event Intelligence Components',
        content: "This dashboard tracks city-level events. Components include: 1) 'High-Impact Events' Card (Count: 3), 2) 'Peak Risk Window' (Mar 15-20), 3) 'Affected Category' (Beverages), 4) 'Forecast Sensitivity' (High). Use the 'Min Impact Score' slider to filter events.",
        actions: [{ label: 'Event Dashboard', route: '/event-intelligence' }]
    },
    {
        id: 'event-data-marathon',
        keywords: ['marathon', 'city marathon 2026', 'new york', 'sports', 'road closure'],
        title: 'Event: City Marathon 2026',
        content: "A major sports event in New York on 2026-03-15. Impact Score: 4.8/5.0. Affected Categories: Beverages, Snacks, First Aid. Confidence: 94%. Description: Annual marathon with 50k+ participants, expecting road closures.",
        actions: [{ label: 'View Marathon Details', route: '/event-intelligence' }]
    },
    {
        id: 'event-data-festival',
        keywords: ['spring music festival', 'austin', 'music', 'festival', 'tourist'],
        title: 'Event: Spring Music Festival',
        content: "A festival in Austin on 2026-03-20. Impact Score: 4.2/5.0. Affected Categories: Alcohol, Ready-to-Eat, Camping. Confidence: 88%. Description: 3-day outdoor music festival with high tourist influx.",
        actions: [{ label: 'View Festival Details', route: '/event-intelligence' }]
    },
    {
        id: 'event-data-holiday',
        keywords: ['holiday parade', 'thanksgiving', 'new york', 'parade', 'midtown'],
        title: 'Event: Holiday Parade',
        content: "A holiday event in New York on 2026-11-26. Impact Score: 4.5/5.0. Affected Categories: Toys, Seasonal, Bakery. Confidence: 95%. Description: Annual Thanksgiving parade with massive crowd density in Midtown.",
        actions: [{ label: 'View Parade Details', route: '/event-intelligence' }]
    },
    {
        id: 'event-demand-impact-chart',
        keywords: ['demand impact timeline', 'event chart', 'baseline', 'projected demand', 'graph'],
        title: 'Demand Impact Timeline Chart',
        content: "An Area Chart showing 'Projected Demand' (Blue) vs 'Baseline' (Grey dotted). It highlights how demand spikes before (Day -1) and during (Day 0) an event, then normalizes. Current peak shows ~180 index vs 110 baseline.",
        actions: [{ label: 'View Chart', route: '/event-intelligence' }]
    },
    {
        id: 'event-insights',
        keywords: ['event insights', 'stock staples', 'perishables', 'ai insights'],
        title: 'Event AI Insights',
        content: "AI Generators 2 key insights: 1) 'Stock staples 2 days earlier' (High Priority) due to historical 45% spike in Water & Energy Bars. 2) 'Avoid overstocking perishables' (Medium Priority) as demand normalizes rapidly post-event.",
        actions: [{ label: 'View Insights', route: '/event-intelligence' }]
    },

    // --- TREND INTELLIGENCE ---
    {
        id: 'trend-intelligence-overview',
        keywords: ['trend intelligence', 'trends', 'momentum', 'signal strength', 'rising'],
        title: 'Trend Intelligence Overview',
        content: "Tracks product/city momentum. KPI Cards: 1) 'Current Trend Score' (82/100, High Momentum). 2) 'Trend Direction' (Rising, +15%). 3) 'Signal Strength' (94%, High Trust). 4) 'Forecast Impact' (High).",
        actions: [{ label: 'Trend Dashboard', route: '/trend-intelligence' }]
    },
    {
        id: 'trend-heatmap',
        keywords: ['heatmap', 'cross-city', 'momentum map', 'new york', 'miami', 'bevs'],
        title: 'Cross-City Momentum Heatmap',
        content: "A grid showing trend scores by City and Product. Highlights: Miami has very high momentum for Beverages (Score 95). New York is strong across board. San Francisco has lower scores generally using 'Data Reliability Warning'.",
        actions: [{ label: 'View Heatmap', route: '/trend-intelligence' }]
    },
    {
        id: 'trend-drivers',
        keywords: ['trend drivers', 'sales velocity', 'social buzz', 'competitor promo'],
        title: 'Trend Drivers Analysis',
        content: "Bar chart showing factors driving the current trend: Sales Velocity (65% - Primary Driver), Event Overlap (25%), Competitor Promo (15%), Social Buzz (10%), Weather Impact (5%).",
        actions: [{ label: 'View Drivers', route: '/trend-intelligence' }]
    },

    // --- WEATHER INTELLIGENCE ---
    {
        id: 'weather-intelligence-overview',
        keywords: ['weather intelligence', 'weather', 'storm', 'rain', 'severity'],
        title: 'Weather Intelligence Overview',
        content: "Monitors weather operational risks. KPI Cards: 1) 'Weather Severity' (Moderate - Rainstorm oncoming). 2) 'Demand Sensitivity' (High - Staples/Delivery). 3) 'Spoilage Risk' (Low). 4) 'Logistics Risk' (Medium - Last mile delays).",
        actions: [{ label: 'Weather Dashboard', route: '/weather-intelligence' }]
    },
    {
        id: 'weather-forecast-data',
        keywords: ['forecast', 'rain', 'thursday', 'jan 15', 'storm'],
        title: '7-Day Weather Forecast',
        content: "Notable forecast: Heavy Rain expected Wednesday (Jan 14) and Storm on Thursday (Jan 15) with 90% precip. Temps dropping to 60°F. Weekend (Jan 17-18) is Sunny/Clear.",
        actions: [{ label: 'View Forecast', route: '/weather-intelligence' }]
    },
    {
        id: 'weather-risk-skus',
        keywords: ['risk skus', 'spoilage', 'fresh berries', 'raincoats', 'charcoal'],
        title: 'Weather Risk SKUs',
        content: "Table of items at risk due to weather: 'Fresh Berries' (High Spoilage Risk, advise -20% order). 'Raincoats' (Stockout Risk due to rain). 'BBQ Charcoal' (High Demand Drop due to rain).",
        actions: [{ label: 'View Risks', route: '/weather-intelligence' }]
    },
    {
        id: 'weather-advisories',
        keywords: ['weather advisory', 'cold chain', 'delivery delay', 'heavy rain'],
        title: 'Weather Operational Advisories',
        content: "1) 'Increase cold-chain monitoring' (High Priority) - Check reefer sensors due to humidity spike. 2) 'Expect delivery delays' (Medium Priority) - Heavy rain may impact last-mile logistics by 15-20%.",
        actions: [{ label: 'View Advisories', route: '/weather-intelligence' }]
    },

    // --- DEMAND FORECAST ENGINE ---
    {
        id: 'forecast-engine-overview',
        keywords: ['forecast engine', 'prediction', 'predicted demand', 'confidence', 'volatility'],
        title: 'Demand Forecast Engine Overview',
        content: "AI-driven prediction hub. KPI Cards: 1) 'Predicted Demand' (1,240 units / 7 days). 2) 'Change vs Baseline' (+18% Uplift). 3) 'Confidence Score' (High - 88%). 4) 'Volatility Index' (Med - Moderate fluctuations).",
        actions: [{ label: 'Forecast Engine', route: '/forecast-engine' }]
    },
    {
        id: 'forecast-graph',
        keywords: ['forecast graph', 'confidence interval', 'historical actuals', 'ai forecast'],
        title: 'Demand Forecast Chart',
        content: "Composed chart showing 'Historical Actuals' (White line) transitioning to 'AI Forecast' (Blue dashed line). Shaded blue area represents the confidence interval. Shows a clear upward trend from Jan 13th.",
        actions: [{ label: 'View Graph', route: '/forecast-engine' }]
    },
    {
        id: 'forecast-drivers',
        keywords: ['forecast drivers', 'historical pattern', 'recent trend', 'event uplift'],
        title: 'Forecast Contribution Drivers',
        content: " breakdown of what drives the prediction: Historical Pattern (45%), Event Uplift (25%), Recent Trend (20%), and Weather (10%). AI notes 'City Festival' is a major uplift factor.",
        actions: [{ label: 'View Drivers', route: '/forecast-engine' }]
    },
    {
        id: 'forecast-table',
        keywords: ['forecast table', 'data table', 'confidence range', 'future demand'],
        title: 'Forecast Data Table',
        content: "Tabular view of future demand. E.g., Jan 14: Forecast 145 units (Range 135-155). Jan 15: Forecast 155 units (Range 140-170). Confidence is rated 'High' for near-term days.",
        actions: [{ label: 'View Table', route: '/forecast-engine' }]
    },

    // --- GENERAL MODULES ---
    {
        id: 'logistics',
        keywords: ['logistics', 'transfer', 'truck', 'shipment', 'delivery', 'pipeline'],
        title: 'Logistics & Transfers',
        content: "The Logistics module manages the flow of goods. It tracks shipments via truck/fleet in real-time ('In Transit', 'Planned', 'Delayed') to optimize store replenishment.",
        actions: [{ label: 'View Logistics', route: '/logistics' }]
    },
    {
        id: 'stock-rebalancing',
        keywords: ['stock rebalancing', 'rebalance', 'transfer', 'optimize', 'move stock'],
        title: 'Stock Rebalancing',
        content: "Stock Rebalancing optimizes inventory distribution by moving stock from overstocked stores to understocked ones, preventing both waste and lost sales.",
        actions: [{ label: 'Start Rebalancing', route: '/stock-rebalancing' }]
    }
];

export const searchKnowledgeBase = (query) => {
    const tokens = query.toLowerCase().split(/\s+/).filter(t => t.length > 2);
    if (tokens.length === 0) return null;

    let bestMatch = null;
    let maxScore = 0;

    knowledgeBase.forEach(doc => {
        let score = 0;
        tokens.forEach(token => {
            if (doc.keywords.some(k => k.includes(token) || token.includes(k))) {
                score += 1;
            }
            if (doc.title.toLowerCase().includes(token)) score += 3; // Title match weights heavily
        });

        if (score > maxScore) {
            maxScore = score;
            bestMatch = doc;
        }
    });

    return maxScore > 0 ? bestMatch : null;
};
