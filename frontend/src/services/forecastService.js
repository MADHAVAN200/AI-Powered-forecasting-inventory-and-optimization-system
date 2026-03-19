import { supabase } from '@/supabaseClient';

/**
 * Forecast Service
 * Handles fetching of demand forecasts and scenario comparisons.
 */
export const forecastService = {
    /**
     * Fetches demand forecasts with advanced filtering.
     */
    /**
     * Fetches demand forecasts with advanced filtering.
     */
    async getForecasts({ productId = 'all', cityId = 'all', categoryId = 'all', horizon = 7, modelVersion = 'varied_v1' }) {
        // High-Performance Simulation for Demo Version (To bypass 1.5M row database timeouts)
        if (modelVersion === 'varied_v1') {
            console.log(`[forecastService] Using Simulation for varied_v1 (${horizon}d horizon)`);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // Fetch some real product and store IDs to use in the simulation to avoid UUID errors
            const [{ data: realProducts }, { data: realStores }] = await Promise.all([
                supabase.from('products').select('product_id').limit(20),
                supabase.from('stores').select('store_id').limit(10)
            ]);
            
            const productPool = realProducts?.length > 0 ? realProducts.map(p => p.product_id) : [];
            const storePool = realStores?.length > 0 ? realStores.map(s => s.store_id) : [];
            
            const data = [];
            
            // Generate deterministic but varied data for the next year
            for (let i = 0; i < horizon; i++) {
                const date = new Date(today);
                date.setDate(today.getDate() + i);
                const isoDate = date.toISOString().split('T')[0];
                
                // Deterministic seed based on date AND city
                const citySeed = cityId === 'all' ? 0 : cityId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
                const seed = date.getDate() + date.getMonth() + date.getFullYear() + citySeed;
                
                // Use 1:3 ratio for city-specific data
                const baseCount = 15 + (seed % 25);
                const count = cityId === 'all' ? baseCount * 3 : baseCount; 
                
                for (let j = 0; j < count; j++) {
                    const basePredicted = 100 + ((seed * (j + 1)) % 400);
                    data.push({
                        forecast_id: `sim-${isoDate}-${j}`,
                        product_id: productPool.length > 0 ? productPool[j % productPool.length] : '00000000-0000-0000-0000-000000000000',
                        store_id: storePool.length > 0 ? storePool[j % storePool.length] : '00000000-0000-0000-0000-000000000000',
                        forecast_date: isoDate,
                        predicted_units: basePredicted,
                        lower_bound: basePredicted * 0.8,
                        upper_bound: basePredicted * 1.2,
                        confidence_pct: 85 + (seed % 10),
                        scenario_type: `Standard_${horizon}d`,
                        model_version: 'varied_v1'
                    });
                }
            }
            return data;
        }

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
                return []; 
            }
            targetProductIds = products.map(p => p.product_id);
        }

        // 3. Build Main Query
        let query = supabase
            .from('demand_forecasts')
            .select('*')
            .eq('model_version', modelVersion)
            .eq('scenario_type', scenarioTag)
            .gte('forecast_date', new Date().toISOString().split('T')[0]);

        if (productId && productId !== 'all') {
            query = query.eq('product_id', productId);
        } else if (targetProductIds) {
            query = query.in('product_id', targetProductIds);
        }

        if (targetStoreIds) {
            if (targetStoreIds.length === 0) return []; // No stores in this city
            query = query.in('store_id', targetStoreIds);
        }

        let allData = [];
        let page = 0;
        const PAGE_SIZE = 1000;
        const MAX_TOTAL = 50000;

        while (allData.length < MAX_TOTAL) {
            const { data, error } = await query
                .order('forecast_date', { ascending: true })
                .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

            if (error) throw error;
            if (!data || data.length === 0) break;

            allData = [...allData, ...data];
            if (data.length < PAGE_SIZE) break; // Finished
            page++;
        }

        return allData;
    },

    /**
     * Fetches a detailed breakdown of all product forecasts for a specific date.
     */
    async getDailyBreakdown({ date, cityId, modelVersion = 'varied_v1' }) {
        if (modelVersion === 'varied_v1') {
            console.log(`[forecastService] Using Simulation Breakdown for varied_v1 (${date}, City: ${cityId})`);
            const d = new Date(date);
            const citySeed = cityId === 'all' ? 0 : cityId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
            const seed = d.getDate() + d.getMonth() + d.getFullYear() + citySeed;
            
            // Use 1:3 ratio for city-specific data
            const baseCount = 15 + (seed % 25);
            const count = cityId === 'all' ? baseCount * 3 : baseCount;
            
            // Resolve products and stores for hydration
            const [{ data: products }, { data: realStores }] = await Promise.all([
                supabase.from('products').select('product_id, product_name, category:categories(category_name)').limit(Math.min(count, 100)),
                supabase.from('stores').select('store_id').limit(10)
            ]);
            
            const storePool = realStores?.length > 0 ? realStores.map(s => s.store_id) : [];
            
            const forecasts = [];
            for (let j = 0; j < count; j++) {
                const prod = products?.[j % (products?.length || 1)];
                if (!prod) continue;
                
                const basePredicted = 100 + ((seed * (j + 1)) % 400);
                forecasts.push({
                    forecast_id: `sim-${date}-${j}`,
                    forecast_date: date,
                    predicted_units: basePredicted,
                    lower_bound: basePredicted * 0.8,
                    upper_bound: basePredicted * 1.2,
                    product_id: prod.product_id,
                    store_id: storePool.length > 0 ? storePool[j % storePool.length] : '00000000-0000-0000-0000-000000000000',
                    products: {
                        product_name: prod.product_name,
                        category: { category_name: prod.category?.category_name || 'General' }
                    }
                });
            }
            return forecasts;
        }

        let query = supabase
            .from('demand_forecasts')
            .select('forecast_id, forecast_date, predicted_units, lower_bound, upper_bound, product_id, store_id')
            .eq('forecast_date', date)
            .eq('model_version', modelVersion)
            .eq('scenario_type', 'Standard_7d'); 

        if (cityId && cityId !== 'all') {
            const { data: stores } = await supabase.from('stores').select('store_id').eq('city_id', cityId);
            const targetStoreIds = stores?.map(s => s.store_id);
            if (targetStoreIds && targetStoreIds.length > 0) {
                query = query.in('store_id', targetStoreIds);
            } else {
                return [];
            }
        }

        const { data: forecasts, error } = await query.limit(2000);
        if (error) throw error;
        if (!forecasts || forecasts.length === 0) return [];

        const productIds = [...new Set(forecasts.map(f => f.product_id))];
        const { data: products } = await supabase
            .from('products')
            .select('product_id, product_name, category_id, category:categories(category_name)')
            .in('product_id', productIds);

        const productMap = new Map(products?.map(p => [p.product_id, p]));

        return forecasts.map(f => ({
            ...f,
            products: productMap.get(f.product_id)
        }));
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
