import { supabase } from '@/supabaseClient';

/**
 * Master Data Service
 * Handles fetching of core organizational entities like Cities, Categories, and Products.
 */
export const masterDataService = {
    /**
     * Fetches all cities.
     */
    async getCities() {
        const { data, error } = await supabase
            .from('cities')
            .select('city_id, city_name')
            .order('city_name');
        if (error) throw error;
        return data;
    },

    /**
     * Fetches a single city by name.
     */
    async getCityByName(cityName) {
        const { data, error } = await supabase
            .from('cities')
            .select('city_id')
            .eq('city_name', cityName)
            .single();
        if (error) throw error;
        return data;
    },

    /**
     * Fetches all categories.
     */
    async getCategories() {
        const { data, error } = await supabase
            .from('categories')
            .select('category_id, category_name')
            .order('category_name');
        if (error) throw error;
        return data;
    },

    /**
     * Fetches a single category by name.
     */
    async getCategoryByName(categoryName) {
        const { data, error } = await supabase
            .from('categories')
            .select('category_id')
            .eq('category_name', categoryName)
            .single();
        if (error) throw error;
        return data;
    },

    /**
     * Fetches all products.
     */
    async getProducts() {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('product_name');
        if (error) throw error;
        return data;
    },

    /**
     * Fetches products by category.
     */
    async getProductsByCategory(categoryId) {
        let query = supabase.from('products').select('*');
        if (categoryId && categoryId !== 'all') {
            query = query.eq('category_id', categoryId);
        }
        const { data, error } = await query.order('product_name');
        if (error) throw error;
        return data;
    }
};
