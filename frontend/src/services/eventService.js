import { supabase } from '@/supabaseClient';

/**
 * Event Service
 * Handles localized event detection and impact scores.
 */
export const eventService = {
    /**
     * Fetches event-driven demand shocks for a specific region.
     * Fixes schema mismatch: uses 'start_date' instead of 'event_date'.
     */
    async getEventSignals(cityId = null) {
        let query = supabase
            .from('events')
            .select(`
                *,
                cities (
                    city_name
                ),
                event_category_impact (
                    category_id,
                    impact_weight,
                    categories (
                        category_name
                    )
                )
            `);

        if (cityId) {
            query = query.eq('city_id', cityId);
        }

        const { data, error } = await query
            .gte('start_date', new Date().toISOString().split('T')[0])
            .order('start_date', { ascending: true });

        if (error) throw error;

        // Map schema fields to common frontend terminology if needed
        return data.map(ev => ({
            ...ev,
            event_name: ev.title, // Backward compatibility with UI components expecting event_name
            event_date: ev.start_date // Backward compatibility
        }));
    }
};
