-- Create the Fused Signal Features table for Phase 2
CREATE TABLE IF NOT EXISTS public.fused_signal_features (
    feature_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL,
    store_id UUID NOT NULL REFERENCES public.stores(store_id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(product_id) ON DELETE CASCADE,
    event_uplift_norm NUMERIC(5, 4) DEFAULT 0, -- Range: [-1, +1]
    trend_score_norm NUMERIC(5, 4) DEFAULT 0,   -- Range: [0, 1]
    weather_impact_norm NUMERIC(5, 4) DEFAULT 0, -- Range: [-1, +1]
    signal_confidence_avg NUMERIC(5, 4) DEFAULT 0,
    version_tag VARCHAR(50) DEFAULT 'v1',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure uniqueness for (Date, Store, Product, Version)
    UNIQUE(date, store_id, product_id, version_tag)
);

COMMENT ON TABLE public.fused_signal_features IS 'Normalized and harmonized signal vectors for Demand Engine input.';
