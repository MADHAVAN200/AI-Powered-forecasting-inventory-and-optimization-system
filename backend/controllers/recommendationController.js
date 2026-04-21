import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

export const recommendationController = {
    getAll: async (req, res) => {
        try {
            const { 
                startDate, 
                endDate, 
                module, 
                status, 
                priority,
                page = 1,
                limit = 50
            } = req.query;

            let query = supabase
                .from('ai_recommendations_log')
                .select('*', { count: 'exact' });

            if (startDate && !endDate) {
                query = query.eq('date', startDate);
            } else {
                if (startDate) query = query.gte('date', startDate);
                if (endDate) query = query.lte('date', endDate);
            }
            if (module && module !== 'all') query = query.eq('module', module);
            if (status && status !== 'all') query = query.eq('status', status);
            if (priority && priority !== 'all') query = query.eq('priority', priority);

            // Pagination
            const from = (page - 1) * limit;
            const to = from + limit - 1;
            
            query = query
                .order('date', { ascending: false })
                .order('created_at', { ascending: false })
                .range(from, to);

            const { data, count, error } = await query;

            if (error) throw error;

            res.json({
                data,
                total: count,
                page: parseInt(page),
                limit: parseInt(limit)
            });
        } catch (error) {
            console.error('Error fetching recommendations:', error);
            res.status(500).json({ error: error.message });
        }
    },

    getStats: async (req, res) => {
        try {
            const { startDate, endDate, module, status, priority } = req.query;

            let query = supabase
                .from('ai_recommendations_log')
                .select('module, priority, status, impact');

            if (startDate && !endDate) {
                query = query.eq('date', startDate);
            } else {
                if (startDate) query = query.gte('date', startDate);
                if (endDate) query = query.lte('date', endDate);
            }
            if (module && module !== 'all') query = query.eq('module', module);
            if (status && status !== 'all') query = query.eq('status', status);
            if (priority && priority !== 'all') query = query.eq('priority', priority);

            const { data, error } = await query;

            if (error) throw error;

            // Generate basic stats for charts
            const stats = {
                byModule: {},
                byPriority: {},
                byStatus: {},
                totalImpact: { High: 0, Medium: 0, Low: 0 }
            };

            data.forEach(item => {
                stats.byModule[item.module] = (stats.byModule[item.module] || 0) + 1;
                stats.byPriority[item.priority] = (stats.byPriority[item.priority] || 0) + 1;
                stats.byStatus[item.status] = (stats.byStatus[item.status] || 0) + 1;
                stats.totalImpact[item.impact]++;
            });

            res.json(stats);
        } catch (error) {
            console.error('Error fetching stats:', error);
            res.status(500).json({ error: error.message });
        }
    }
};
