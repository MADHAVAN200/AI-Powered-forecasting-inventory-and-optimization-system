import { supabase } from '@/supabaseClient';

/**
 * Weather Service
 * Handles localized weather impacts and forecasts.
 */
export const weatherService = {
    /**
     * Fetches active weather impact signals for a region.
     * @param {string} cityId - UUID of the city.
     * @param {number} horizon - Number of days to fetch (defaults to 7).
     */
    async getWeatherImpact(cityId, horizon = 7) {
        const { data, error } = await supabase
            .from('weather_forecasts')
            .select('*')
            .eq('city_id', cityId)
            .order('forecast_date', { ascending: true })
            .limit(horizon);
        if (error) throw error;
        return data;
    }
};
