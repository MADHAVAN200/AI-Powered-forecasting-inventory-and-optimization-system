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
        return data;
    }
};
