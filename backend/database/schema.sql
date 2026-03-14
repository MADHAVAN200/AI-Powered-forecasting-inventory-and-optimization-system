-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ==========================================
-- 1. CORE ORGANIZATIONAL ENTITIES
-- ==========================================

create table if not exists public.regions (
    region_id        uuid default uuid_generate_v4() primary key,
    region_name      varchar(120) not null,
    region_code      varchar(20) unique,
    created_at       timestamp with time zone default now()
);

create table if not exists public.cities (
    city_id          uuid default uuid_generate_v4() primary key,
    city_name        varchar(120),
    region_id        uuid references public.regions(region_id) on delete cascade,
    latitude         decimal(9,6),
    longitude        decimal(9,6),
    created_at       timestamp with time zone default now()
);

create table if not exists public.stores (
    store_id         uuid default uuid_generate_v4() primary key,
    store_code       varchar(50) unique,
    store_name       varchar(150),
    city_id          uuid references public.cities(city_id) on delete cascade,
    latitude         decimal(9,6),
    longitude        decimal(9,6),
    health_status    varchar(30), -- Healthy / Watch / At-Risk
    operational_flag boolean default true,
    created_at       timestamp with time zone default now()
);

create table if not exists public.warehouses (
    warehouse_id     uuid default uuid_generate_v4() primary key,
    warehouse_code   varchar(50) unique,
    warehouse_name   varchar(150),
    warehouse_type   varchar(50), -- Cold / General / Bakery
    city_id          uuid references public.cities(city_id) on delete cascade,
    created_at       timestamp with time zone default now()
);

-- ==========================================
-- 2. PRODUCT & INVENTORY MANAGEMENT
-- ==========================================

create table if not exists public.categories (
    category_id      uuid default uuid_generate_v4() primary key,
    category_name    varchar(120) not null,
    parent_category  uuid references public.categories(category_id) on delete set null
);

create table if not exists public.products (
    product_id       uuid default uuid_generate_v4() primary key,
    sku_code         varchar(100) unique not null,
    product_name     varchar(200) not null,
    category_id      uuid references public.categories(category_id) on delete set null,
    description      text,
    unit_type        varchar(50), -- kg, units, cases
    cold_chain_flag  boolean default false,
    created_at       timestamp with time zone default now()
);

create table if not exists public.store_inventory (
    inventory_id     uuid default uuid_generate_v4() primary key,
    store_id         uuid references public.stores(store_id) on delete cascade,
    product_id       uuid references public.products(product_id) on delete cascade,
    current_stock    decimal(12,2) default 0,
    safety_stock     decimal(12,2) default 0,
    optimal_stock    decimal(12,2) default 0,
    last_updated     timestamp with time zone default now()
);

create table if not exists public.warehouse_inventory (
    wh_inventory_id  uuid default uuid_generate_v4() primary key,
    warehouse_id     uuid references public.warehouses(warehouse_id) on delete cascade,
    product_id       uuid references public.products(product_id) on delete cascade,
    quantity_on_hand decimal(12,2) default 0,
    last_updated     timestamp with time zone default now()
);

create table if not exists public.spoilage_tracking (
    spoilage_id      uuid default uuid_generate_v4() primary key,
    store_id         uuid references public.stores(store_id) on delete cascade,
    product_id       uuid references public.products(product_id) on delete cascade,
    expiry_date      date,
    quantity         decimal(12,2),
    spoilage_status  varchar(50), -- Fresh / Risk / Expired
    created_at       timestamp with time zone default now()
);

-- ==========================================
-- 3. INTELLIGENCE & SIGNAL DATA
-- ==========================================

create table if not exists public.events (
    event_id         uuid default uuid_generate_v4() primary key,
    title            varchar(200),
    event_type       varchar(50),
    severity_level   varchar(30), -- Low -> Critical
    start_date       date,
    end_date         date,
    city_id          uuid references public.cities(city_id) on delete cascade,
    location_name    varchar(200),
    impact_score     int check (impact_score between 0 and 100),
    created_at       timestamp with time zone default now()
);

create table if not exists public.event_category_impact (
    impact_id        uuid default uuid_generate_v4() primary key,
    event_id         uuid references public.events(event_id) on delete cascade,
    category_id      uuid references public.categories(category_id) on delete cascade,
    impact_weight    decimal(5,2)
);

create table if not exists public.weather_forecasts (
    weather_id       uuid default uuid_generate_v4() primary key,
    city_id          uuid references public.cities(city_id) on delete cascade,
    forecast_date    date,
    temp_min         decimal(5,2),
    temp_max         decimal(5,2),
    humidity         decimal(5,2),
    precipitation    decimal(5,2),
    weather_condition varchar(50),
    alert_level      varchar(30),
    created_at       timestamp with time zone default now()
);

create table if not exists public.trends (
    trend_id         uuid default uuid_generate_v4() primary key,
    category_id      uuid references public.categories(category_id) on delete cascade,
    region_id        uuid references public.regions(region_id) on delete cascade,
    trend_score      int,
    momentum         varchar(30), -- Rising / Falling
    signal_strength  decimal(5,2),
    driver_json      jsonb,
    calculated_at    timestamp with time zone default now()
);

-- ==========================================
-- 4. AI OUTPUTS
-- ==========================================

create table if not exists public.demand_forecasts (
    forecast_id      uuid default uuid_generate_v4() primary key,
    product_id       uuid references public.products(product_id) on delete cascade,
    store_id         uuid references public.stores(store_id) on delete cascade,
    forecast_date    date,
    predicted_units  decimal(12,2),
    lower_bound      decimal(12,2),
    upper_bound      decimal(12,2),
    confidence_pct   decimal(5,2),
    scenario_type    varchar(50),
    model_version    varchar(50)
);

create table if not exists public.inventory_risks (
    risk_id          uuid default uuid_generate_v4() primary key,
    product_id       uuid references public.products(product_id) on delete cascade,
    store_id         uuid references public.stores(store_id) on delete cascade,
    risk_type        varchar(50), -- Shortage / Overstock / Spoilage
    severity_level   varchar(30),
    impact_timeframe varchar(50),
    confidence_pct   decimal(5,2),
    driver_reason    varchar(200),
    detected_at      timestamp with time zone default now()
);

-- ==========================================
-- 5. LOGISTICS & SUPPLY CHAIN
-- ==========================================

create table if not exists public.transfers (
    transfer_id      uuid default uuid_generate_v4() primary key,
    product_id       uuid references public.products(product_id) on delete cascade,
    quantity         decimal(12,2),
    unit_type        varchar(50),
    source_type      varchar(30), -- Store / DC / Vendor
    source_id        uuid, -- Reference to Store or Warehouse ID (dynamic)
    destination_type varchar(30),
    destination_id   uuid,
    status           varchar(50),
    eta              timestamp with time zone,
    sla_status       varchar(30),
    risk_reason      varchar(200),
    created_at       timestamp with time zone default now()
);

create table if not exists public.transfer_events (
    event_id         uuid default uuid_generate_v4() primary key,
    transfer_id      uuid references public.transfers(transfer_id) on delete cascade,
    event_timestamp  timestamp with time zone default now(),
    event_description text,
    location_update  varchar(200)
);

-- ==========================================
-- 6. CHECKOUT & STORE OPERATIONS
-- ==========================================

create table if not exists public.checkout_lanes (
    lane_id          uuid default uuid_generate_v4() primary key,
    store_id         uuid references public.stores(store_id) on delete cascade,
    lane_status      varchar(30)
);

create table if not exists public.checkout_sessions (
    session_id       uuid default uuid_generate_v4() primary key,
    lane_id          uuid references public.checkout_lanes(lane_id) on delete cascade,
    item_count       int,
    start_timestamp  timestamp with time zone,
    end_timestamp    timestamp with time zone,
    confidence_score decimal(5,2)
);

create table if not exists public.checkout_anomalies (
    anomaly_id       uuid default uuid_generate_v4() primary key,
    session_id       uuid references public.checkout_sessions(session_id) on delete cascade,
    anomaly_type     varchar(50),
    severity_level   varchar(30),
    anomaly_status   varchar(30),
    detected_at      timestamp with time zone default now()
);

create table if not exists public.store_health_metrics (
    health_metric_id uuid default uuid_generate_v4() primary key,
    store_id         uuid references public.stores(store_id) on delete cascade,
    dimension_name   varchar(100),
    score_value      decimal(5,2),
    trend_direction  varchar(30),
    recorded_at      timestamp with time zone default now()
);

-- ==========================================
-- 7. AI GOVERNANCE & MODEL HEALTH
-- ==========================================

create table if not exists public.ai_models (
    model_id         uuid default uuid_generate_v4() primary key,
    model_name       varchar(120),
    model_version    varchar(50),
    model_type       varchar(50), -- Vision / Forecast
    deployment_date  date
);

create table if not exists public.model_health_logs (
    log_id           uuid default uuid_generate_v4() primary key,
    model_id         uuid references public.ai_models(model_id) on delete cascade,
    reliability_score decimal(5,2),
    drift_status     varchar(30),
    recorded_at      timestamp with time zone default now()
);

create table if not exists public.model_accuracy_trend (
    trend_id         uuid default uuid_generate_v4() primary key,
    model_id         uuid references public.ai_models(model_id) on delete cascade,
    accuracy_value   decimal(5,2),
    recorded_at      timestamp with time zone default now()
);

create table if not exists public.feature_drift (
    drift_id         uuid default uuid_generate_v4() primary key,
    model_id         uuid references public.ai_models(model_id) on delete cascade,
    store_id         uuid references public.stores(store_id) on delete cascade,
    feature_name     varchar(120),
    severity_score   decimal(5,3),
    detected_at      timestamp with time zone default now()
);

create table if not exists public.feature_importance (
    importance_id    uuid default uuid_generate_v4() primary key,
    model_id         uuid references public.ai_models(model_id) on delete cascade,
    feature_name     varchar(120),
    baseline_importance decimal(5,3),
    current_importance  decimal(5,3),
    delta_value         decimal(5,3)
);

-- ==========================================
-- 8. SALES & TRANSACTIONS
-- ==========================================

create table if not exists public.sales_transactions (
    transaction_id   uuid default uuid_generate_v4() primary key,
    store_id         uuid references public.stores(store_id) on delete cascade,
    product_id       uuid references public.products(product_id) on delete cascade,
    transaction_date timestamp with time zone default now(),
    units_sold       decimal(12,2) not null,
    revenue          decimal(12,2),
    promotion_flag   boolean default false
);

-- ==========================================
-- 9. SECURITY & RLS POLICIES
-- ==========================================

-- Enable RLS on all tables
alter table public.regions enable row level security;
alter table public.cities enable row level security;
alter table public.stores enable row level security;
alter table public.warehouses enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.store_inventory enable row level security;
alter table public.warehouse_inventory enable row level security;
alter table public.spoilage_tracking enable row level security;
alter table public.events enable row level security;
alter table public.event_category_impact enable row level security;
alter table public.weather_forecasts enable row level security;
alter table public.trends enable row level security;
alter table public.demand_forecasts enable row level security;
alter table public.inventory_risks enable row level security;
alter table public.transfers enable row level security;
alter table public.transfer_events enable row level security;
alter table public.checkout_lanes enable row level security;
alter table public.checkout_sessions enable row level security;
alter table public.checkout_anomalies enable row level security;
alter table public.store_health_metrics enable row level security;
alter table public.ai_models enable row level security;
alter table public.model_health_logs enable row level security;
alter table public.model_accuracy_trend enable row level security;
alter table public.feature_drift enable row level security;
alter table public.feature_importance enable row level security;
alter table public.sales_transactions enable row level security;

-- Helper to create policies for a table
DO $$ 
DECLARE 
    t text;
    tables text[] := ARRAY[
        'regions', 'cities', 'stores', 'warehouses', 'categories', 'products', 
        'store_inventory', 'warehouse_inventory', 'spoilage_tracking', 
        'events', 'event_category_impact', 'weather_forecasts', 'trends', 
        'demand_forecasts', 'inventory_risks', 'transfers', 'transfer_events', 
        'checkout_lanes', 'checkout_sessions', 'checkout_anomalies', 
        'store_health_metrics', 'ai_models', 'model_health_logs', 
        'model_accuracy_trend', 'feature_drift', 'feature_importance',
        'sales_transactions'
    ];
BEGIN
    FOREACH t IN ARRAY tables LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Enable read access for all users" ON public.%I', t);
        EXECUTE format('CREATE POLICY "Enable read access for all users" ON public.%I FOR SELECT USING (true)', t);
        EXECUTE format('DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.%I', t);
        EXECUTE format('CREATE POLICY "Enable insert for authenticated users" ON public.%I FOR INSERT WITH CHECK (true)', t);
    END LOOP;
END $$;
