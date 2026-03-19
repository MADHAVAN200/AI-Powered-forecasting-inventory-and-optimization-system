import { supabase } from '@/supabaseClient';

/**
 * Fusion Service
 * Handles fetching of fused intelligence signals (Event + Trend + Weather).
 */
export const fusionService = {
    /**
     * Fetches normalized intelligence signals for specific SKU/Store.
     */
    async getIntelligenceSignals({ productId, storeId }) {
        const { data, error } = await supabase
            .from('fused_signal_features')
            .select('*')
            .eq('product_id', productId)
            .eq('store_id', storeId)
            .order('date', { ascending: false })
            .limit(7);
        if (error) throw error;
        
        // Map database fields to frontend field names for consistency
        return data.map(item => ({
            ...item,
            event_logic_score: item.event_logic_score ?? item.event_uplift_norm,
            global_consensus_score: item.global_consensus_score ?? item.trend_score_norm,
            weather_deviation_score: item.weather_deviation_score ?? item.weather_impact_norm
        }));
    }
};
