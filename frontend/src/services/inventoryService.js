import { supabase } from '@/supabaseClient';

/**
 * Inventory Service
 * Handles fetching of core inventory risks and spoilage alerts.
 */
export const inventoryService = {
    /**
     * Fetches current inventory risks and alerts.
     */
    async getInventoryRisks() {
        const { data, error } = await supabase
            .from('inventory_risks')
            .select(`
                *,
                products (
                    product_name
                )
            `)
            .order('detected_at', { ascending: false });

        if (error) throw error;
        return data;
    }
};
