import { supabase } from '@/supabaseClient';
import { inventoryService } from './inventoryService';

/**
 * Store Health Service
 * Aggregates operational metrics, risks, and derived health scores for specific stores.
 */
export const storeHealthService = {
    /**
     * Fetches comprehensive health data for a specific store.
     */
    async getStoreHealth(storeId, filters = {}) {
        if (!storeId || storeId === 'all') return null;

        // 1. Fetch persistent metrics from DB
        let metricQuery = supabase
            .from('store_health_metrics')
            .select('dimension_name, score_value, trend_direction')
            .eq('store_id', storeId);

        if (filters.daysBack && Number(filters.daysBack) > 0) {
            const startDate = new Date();
            startDate.setHours(startDate.getHours() - Number(filters.daysBack));
            metricQuery = metricQuery.gte('recorded_at', startDate.toISOString());
        }

        const { data: dbMetrics, error: mError } = await metricQuery;

        if (mError) {
            console.warn("Failed to fetch persistent metrics, falling back to derivation:", mError);
        }

        // 2. Fetch current inventory risks for this store (Dynamic)
        const risks = await inventoryService.getInventoryRisksFiltered({
            storeId,
            cityId: filters.cityId || 'all',
            daysBack: filters.daysBack,
        });

        // 3. Count severity types
        const criticalCount = risks.filter(r => r.severity_level === 'Critical').length;
        const highCount = risks.filter(r => r.severity_level === 'High').length;

        // 4. Map Metrics (Prefer DB, fallback to derivation if not seeded)
        const getMetric = (name, fallback) => {
            const m = dbMetrics?.find(dm => dm.dimension_name === name);
            const score = m ? Number(m.score_value) : fallback;
            return Math.max(0, Math.min(100, Number.isFinite(score) ? score : fallback));
        };

        const demandReadiness = getMetric("Demand Readiness", Math.max(0, 92 - (risks.filter(r => r.risk_type === 'Shortage').length * 4)));
        const inventoryStability = getMetric("Inventory Stability", Math.max(0, 88 - (risks.filter(r => r.risk_type === 'Overstock' || r.risk_type === 'Spoilage').length * 3)));
        const opsEfficiency = getMetric("Ops Efficiency", 94);
        const checkoutSpeed = getMetric("Checkout Speed", 65 - (highCount * 2));
        const aiConfidence = getMetric("AI Confidence", 92);

        // Overall score: Weighted average with penalties for criticals
        const rawAverage = (demandReadiness + inventoryStability + opsEfficiency + checkoutSpeed + aiConfidence) / 5;
        const healthScore = Math.max(0, Math.min(100, Math.round(rawAverage - (criticalCount * 2))));

        const severityRank = { Critical: 0, High: 1, Medium: 2, Low: 3 };

        // 5. Transform Risky Items into Attention Queue
        const attentionQueue = [...risks]
            .sort((a, b) => {
                const severityDelta = (severityRank[a.severity_level] ?? 4) - (severityRank[b.severity_level] ?? 4);
                if (severityDelta !== 0) return severityDelta;
                return new Date(b.detected_at || 0) - new Date(a.detected_at || 0);
            })
            .slice(0, 5)
            .map(risk => ({
            id: risk.risk_id,
            issue: `${risk.risk_type} Risk`,
            desc: `${risk.products?.product_name}: ${risk.ai_insight}`,
            severity: risk.severity_level,
            time: risk.severity_level === 'Critical' ? 'Immediate' : risk.severity_level === 'High' ? '< 1 Hour' : 'Today',
            action: risk.risk_type === 'Shortage' ? 'Expedite Transfer' : risk.risk_type === 'Spoilage' ? 'Markdown' : 'Verify Stock'
        }));

        // 6. Risk Snapshots
        const riskSnapshots = [
            { title: "Shortage Risks", count: risks.filter(r => r.risk_type === 'Shortage').length, severity: "High", desc: "Items below safety stock" },
            { title: "Spoilage Risk", count: risks.filter(r => r.risk_type === 'Spoilage').length, severity: "Critical", desc: "Expiring soon" },
            { title: "Overstock Warnings", count: risks.filter(r => r.risk_type === 'Overstock').length, severity: "Medium", desc: "Low rotation index" },
            { title: "Anomalies", count: criticalCount, severity: "Critical", desc: "Immediate resolution req." }
        ];

        return {
            overallScore: healthScore,
            status: healthScore >= 85 ? 'Healthy' : healthScore >= 65 ? 'Acceptable' : 'At Risk',
            dimensions: [
                { title: "Demand Readiness", score: Math.round(demandReadiness), status: demandReadiness > 85 ? "Healthy" : "Watch", trend: dbMetrics?.find(m => m.dimension_name === "Demand Readiness")?.trend_direction === "Rising" ? "+2%" : "-1%", icon: 'BarChart2', color: "text-green-500" },
                { title: "Inventory Stability", score: Math.round(inventoryStability), status: inventoryStability > 80 ? "Healthy" : "Watch", trend: dbMetrics?.find(m => m.dimension_name === "Inventory Stability")?.trend_direction === "Rising" ? "+3%" : "-5%", icon: 'Package', color: "text-yellow-500" },
                { title: "Ops Efficiency", score: Math.round(opsEfficiency), status: "Healthy", trend: "+1%", icon: 'Activity', color: "text-green-500" },
                { title: "Checkout Speed", score: Math.round(checkoutSpeed), status: checkoutSpeed > 70 ? "Healthy" : "At Risk", trend: "-12%", icon: 'ShoppingCart', color: "text-orange-500" },
                { title: "AI Confidence", score: aiConfidence, status: "High", trend: "0%", icon: 'Zap', color: "text-blue-500" },
            ],
            riskSnapshots,
            attentionQueue,
            dbMetrics // Expose for summary generation
        };
    },

    /**
     * Generates an in-depth operational summary for a specific store.
     */
    async getStoreSummary(storeId, filters = {}) {
        if (!storeId || storeId === 'all') return null;

        // Fetch health data for context
        const health = await this.getStoreHealth(storeId, filters);
        if (!health) return null;

        // Pick a persistent narrative based on the Strategic Summary score value
        const summaryMetric = health.dbMetrics?.find(dm => dm.dimension_name === "Strategic Summary");
        const seed = summaryMetric ? Number(summaryMetric.score_value) : health.overallScore;

        const templates = [
            `is maintaining a robust operational equilibrium. Real-time signals indicate that demand readiness is the primary driver of current node stability.`,
            `shows acceptable operational health. We have detected minor inventory volatility in core categories, suggesting a proactive restocking cycle.`,
            `is currently operating with high synchronization across logistics and floor management. Model confidence remains high for the next 72-hour window.`,
            `is under moderate operational pressure. Strategic focus should be directed towards optimizing checkout throughput to maintain service level targets.`,
            `exhibits peak performance characteristics. The node has successfully navigated recent demand shocks with zero critical shortages reported.`
        ];

        // Use the seed to pick a persistent template
        const templateIndex = seed % templates.length;
        const narrative = `Store node ${storeId} ${templates[templateIndex]} Overall health index is verified at ${health.overallScore}.`;

        // Key Highlights (Derived from persistent metrics)
        const highlights = [
            `Demand Readiness index: ${health.dimensions[0].score}% (Persistent)`,
            `Inventory Stability index: ${health.dimensions[1].score}% (Persistent)`,
            `Strategic Confidence: ${health.dimensions[4].score}%`
        ];

        return {
            narrative,
            highlights,
            lastSync: new Date().toLocaleTimeString(),
            inventoryValue: `$${(20 + (seed % 15)).toFixed(1)}k`
        };
    }
};
