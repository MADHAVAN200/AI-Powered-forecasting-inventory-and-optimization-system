import { supabase } from '@/supabaseClient';

/**
 * Governance Service
 * Handles AI model health, feature importance, and feature drift detection.
 */
export const governanceService = {
    /**
     * Fetches all AI models and their latest health status.
     */
    async getModelHealth() {
        const { data, error } = await supabase
            .from('ai_models')
            .select(`
                *,
                model_health_logs (
                    reliability_score,
                    drift_status,
                    recorded_at
                )
            `)
            .order('deployment_date', { ascending: false });
        if (error) throw error;
        return data;
    },

    /**
     * Fetches accuracy trends for a specific model.
     */
    async getAccuracyTrends(modelId) {
        const { data, error } = await supabase
            .from('model_accuracy_trend')
            .select('*')
            .eq('model_id', modelId)
            .order('recorded_at', { ascending: true });
        if (error) throw error;
        return data;
    },

    /**
     * Fetches feature drift detections.
     */
    async getFeatureDrift() {
        const { data, error } = await supabase
            .from('feature_drift')
            .select(`
                *,
                stores (store_name)
            `)
            .order('detected_at', { ascending: false });
        if (error) throw error;
        return data;
    },

    /**
     * Fetches feature importance scores.
     */
    async getFeatureImportance(modelId) {
        const { data, error } = await supabase
            .from('feature_importance')
            .select('*')
            .eq('model_id', modelId)
            .order('current_importance', { ascending: false });
        if (error) throw error;
        return data;
    }
};
