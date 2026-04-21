const API_BASE_URL = 'http://localhost:3001/api/recommendations';

export const recommendationService = {
    /**
     * Fetch recommendations with optional filters
     */
    getAll: async (filters = {}) => {
        const { startDate, endDate, module, status, priority, page = 1, limit = 50 } = filters;
        
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        if (module) params.append('module', module);
        if (status) params.append('status', status);
        if (priority) params.append('priority', priority);
        params.append('page', page);
        params.append('limit', limit);

        const response = await fetch(`${API_BASE_URL}?${params.toString()}`);
        if (!response.ok) throw new Error('Failed to fetch recommendations');
        return response.json();
    },

    /**
     * Get aggregated statistics for charts
     */
    getStats: async (filters = {}) => {
        const { startDate, endDate, module, status, priority } = filters;
        
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        if (module) params.append('module', module);
        if (status) params.append('status', status);
        if (priority) params.append('priority', priority);

        const response = await fetch(`${API_BASE_URL}/stats?${params.toString()}`);
        if (!response.ok) throw new Error('Failed to fetch recommendation stats');
        return response.json();
    }
};
