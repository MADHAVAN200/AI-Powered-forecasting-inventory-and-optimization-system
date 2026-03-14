import { supabase } from '@/supabaseClient';

/**
 * Forecast Service
 * Handles fetching of demand forecasts and scenario comparisons.
 */
export const forecastService = {
    /**
     * Fetches demand forecasts with advanced filtering.
     */
    async getForecasts({ productId, cityId, categoryId, horizon = 7, modelTag = 'prophet_v2_tuned' }) {
        const scenarioTag = `Standard_${horizon}d`;

        // 1. Resolve Store IDs if cityId is provided
        let targetStoreIds = null;
        if (cityId && cityId !== 'all') {
            const { data: stores } = await supabase
                .from('stores')
                .select('store_id')
                .eq('city_id', cityId);
            targetStoreIds = stores?.map(s => s.store_id);
        }

        // 2. Resolve Product IDs if categoryId is provided (and productId is 'all')
        let targetProductIds = null;
        if (categoryId && categoryId !== 'all' && (!productId || productId === 'all')) {
            const { data: products } = await supabase
                .from('products')
                .select('product_id')
                .eq('category_id', categoryId);

            if (!products || products.length === 0) {
                console.warn(`No products found for category: ${categoryId}`);
                return []; // Return empty data set if category exists but has no products
            }
            targetProductIds = products.map(p => p.product_id);
        }

        // 3. Build Main Query
        let query = supabase
            .from('demand_forecasts')
            .select(`
                *,
                products(product_name, category_id),
                stores(city_id)
            `)
            .eq('model_version', modelTag)
            .eq('scenario_type', scenarioTag);

        if (productId && productId !== 'all') {
            query = query.eq('product_id', productId);
        } else if (targetProductIds) {
            query = query.in('product_id', targetProductIds);
        }

        if (targetStoreIds) {
            if (targetStoreIds.length === 0) return []; // No stores in this city
            query = query.in('store_id', targetStoreIds);
        }

        const { data, error } = await query.order('forecast_date', { ascending: true });

        if (error) throw error;
        return data;
    },

    /**
     * Fetches scenario comparison data (e.g., Hierarchical vs Baseline).
     */
    async getScenarioComparison({ productId, scenarios = ['baseline', 'hierarchical_v1'] }) {
        const { data, error } = await supabase
            .from('demand_forecasts')
            .select('*')
            .eq('product_id', productId)
            .in('scenario_type', scenarios)
            .order('forecast_date', { ascending: true });

        if (error) throw error;
        return data;
    },

    /**
     * Fetches SKU clusters for segmenting products.
     */
    async getSkuClusters() {
        const { data, error } = await supabase
            .from('sku_clusters')
            .select('*');
        if (error) throw error;
        return data;
    }
};
