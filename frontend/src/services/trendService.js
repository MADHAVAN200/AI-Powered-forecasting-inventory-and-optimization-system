import { supabase } from '@/supabaseClient';

/**
 * Trend Service
 * Handles fetching of trend momentum and signal strength data.
 */
export const trendService = {
    /**
     * Fetches trend signals joined with categories and regions.
     */
    async getTrendSignals() {
        const { data, error } = await supabase
            .from('trends')
            .select(`
                *,
                categories (
                    category_name
                ),
                regions (
                    region_name
                )
            `)
            .order('calculated_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    /**
     * Fetches historical trend data for a specific category/region.
     * (Currently fetching latest based on schema, but in production this would be a time-series query)
     */
    async getTrendHistory(categoryId, regionId) {
        let query = supabase
            .from('trends')
            .select('*')
            .order('calculated_at', { ascending: true });

        if (categoryId) query = query.eq('category_id', categoryId);
        if (regionId) query = query.eq('region_id', regionId);

        const { data, error } = await query.limit(30);
        if (error) throw error;
        return data;
    }
};

