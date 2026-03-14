
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const envLocalPath = join(__dirname, '../.env.local');
const envPath = join(__dirname, '../.env');
if (existsSync(envLocalPath)) config({ path: envLocalPath });
else if (existsSync(envPath)) config({ path: envPath });
else config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials. Create .env.local with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// ─────────────────────────────────────────────────────────────────────────────
// TREND SEED CONFIGURATION
//
// The 'trends' table schema:
//   trend_id        UUID (auto)
//   category_id     FK → categories
//   region_id       FK → regions
//   trend_score     INTEGER (0-100)
//   signal_strength NUMERIC (0.0-1.0)
//   momentum        TEXT: 'Rising' | 'Stable' | 'Falling'
//   driver_json     JSONB { velocity, event_impact, social, promo, weather }
//   calculated_at   TIMESTAMP
//
// Frontend filters:
//   - Region Scope  → filters by regions.region_name
//   - Category      → filters by categories.category_name
//   - Window (7/14/30/90) → NOT applied server-side, it's client-side label only
//                           BUT we generate data spanning last 90 days so all windows have data
//
// Heatmap: shows unique region x category grid → needs 1 row per region+category combination (latest)
// Timeline: shows trend_score over time (calculated_at) for filtered trends → needs many rows per combo
// ─────────────────────────────────────────────────────────────────────────────

// Realistic momentum phase patterns per category type
const CATEGORY_PATTERNS = {
    'Category 1': { // Staples & Groceries – always high, steady
        baseScore: 72, variance: 12, momentum: ['Rising', 'Stable', 'Stable'],
        driverProfile: { velocity: [55, 80], event_impact: [20, 45], social: [5, 15], promo: [10, 30], weather: [10, 25] }
    },
    'Category 2': { // Packaged Foods – moderate
        baseScore: 60, variance: 18, momentum: ['Rising', 'Stable', 'Falling'],
        driverProfile: { velocity: [40, 70], event_impact: [15, 40], social: [10, 30], promo: [20, 45], weather: [5, 15] }
    },
    'Category 3': { // Cooking Essentials – spikes during festivals
        baseScore: 55, variance: 22, momentum: ['Rising', 'Rising', 'Stable'],
        driverProfile: { velocity: [30, 65], event_impact: [30, 60], social: [5, 20], promo: [15, 35], weather: [5, 20] }
    },
    'Category 4': { // Fresh Produce – volatile, weather-sensitive
        baseScore: 50, variance: 25, momentum: ['Falling', 'Stable', 'Rising'],
        driverProfile: { velocity: [25, 60], event_impact: [20, 50], social: [5, 15], promo: [10, 25], weather: [20, 50] }
    },
    'Category 5': { // Beverages – strong seasonal signal
        baseScore: 68, variance: 15, momentum: ['Rising', 'Rising', 'Stable'],
        driverProfile: { velocity: [50, 75], event_impact: [15, 35], social: [15, 35], promo: [20, 45], weather: [15, 35] }
    },
    'Category 6': { // Bakery & Snacks – event-driven
        baseScore: 62, variance: 20, momentum: ['Rising', 'Stable', 'Stable'],
        driverProfile: { velocity: [40, 70], event_impact: [25, 55], social: [15, 35], promo: [25, 50], weather: [5, 15] }
    },
    'Category 7': { // Dairy & Eggs – consistent, temp-sensitive
        baseScore: 58, variance: 14, momentum: ['Stable', 'Stable', 'Falling'],
        driverProfile: { velocity: [40, 65], event_impact: [15, 35], social: [5, 15], promo: [10, 25], weather: [20, 40] }
    },
    'Category 8': { // Frozen Foods – weather and storage driven
        baseScore: 42, variance: 18, momentum: ['Falling', 'Stable', 'Rising'],
        driverProfile: { velocity: [20, 50], event_impact: [10, 30], social: [5, 15], promo: [15, 35], weather: [25, 55] }
    },
    'Category 9': { // Meat & Poultry – festival spikes
        baseScore: 48, variance: 22, momentum: ['Rising', 'Falling', 'Stable'],
        driverProfile: { velocity: [25, 55], event_impact: [30, 65], social: [5, 15], promo: [10, 25], weather: [10, 25] }
    },
    'Category 10': { // Home Care – stable, promo-driven
        baseScore: 52, variance: 15, momentum: ['Stable', 'Rising', 'Stable'],
        driverProfile: { velocity: [35, 60], event_impact: [10, 25], social: [10, 25], promo: [30, 60], weather: [5, 15] }
    },
    'Category 11': { // Personal Care – promo and social buzz
        baseScore: 55, variance: 18, momentum: ['Rising', 'Stable', 'Rising'],
        driverProfile: { velocity: [35, 65], event_impact: [10, 25], social: [25, 55], promo: [35, 65], weather: [2, 10] }
    },
    'Category 12': { // Pet Care – niche, slow growth
        baseScore: 38, variance: 12, momentum: ['Rising', 'Stable', 'Stable'],
        driverProfile: { velocity: [20, 45], event_impact: [5, 15], social: [20, 45], promo: [20, 40], weather: [2, 8] }
    },
};

function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randomFloat(min, max, dp = 2) { return parseFloat((Math.random() * (max - min) + min).toFixed(dp)); }
function randomItem(arr) { return arr[randomInt(0, arr.length - 1)]; }

function generateDriverJson(profile) {
    const d = profile.driverProfile;
    const velocity = randomInt(...d.velocity);
    const event_impact = randomInt(...d.event_impact);
    const social = randomInt(...d.social);
    const promo = randomInt(...d.promo);
    const weather = randomInt(...d.weather);
    // Normalize so they sum roughly to 100
    const total = velocity + event_impact + social + promo + weather;
    const scale = 100 / total;
    return {
        velocity: Math.round(velocity * scale),
        event_impact: Math.round(event_impact * scale),
        social: Math.round(social * scale),
        promo: Math.round(promo * scale),
        weather: Math.round(weather * scale),
    };
}

async function seedTrends() {
    console.log('\n🚀 Starting Trend Intelligence Seeding...\n');

    // 1. Fetch regions and categories
    console.log('📍 Fetching regions and categories...');
    const [{ data: regions, error: regErr }, { data: categories, error: catErr }] = await Promise.all([
        supabase.from('regions').select('*'),
        supabase.from('categories').select('*')
    ]);

    if (regErr || catErr) {
        console.error('❌ Error fetching reference data:', regErr || catErr);
        process.exit(1);
    }
    if (!regions?.length || !categories?.length) {
        console.error('❌ No regions or categories found. Run seed_data.sql first.');
        process.exit(1);
    }

    console.log(`✅ Found ${regions.length} regions and ${categories.length} categories.\n`);

    // 2. Delete existing trend data
    console.log('🗑️  Deleting existing trend data...');
    const { error: delErr } = await supabase
        .from('trends')
        .delete()
        .neq('trend_id', '00000000-0000-0000-0000-000000000000');
    if (delErr) console.warn('⚠️  Could not delete trends (may not exist):', delErr.message);
    else console.log('✅ Existing trend data cleared.\n');

    // 3. Generate trend records
    // Strategy:
    //   - For each region × category combination, generate time-series data
    //   - Cover last 90 days (so all window filters: 7/14/30/90 all have data)
    //   - One record per combo per day generates 6 × 12 × 90 = 6480 rows (too many)
    //   - Instead: one per combo per 3 days = 6 × 12 × 30 = 2160 rows
    //   - But the heatmap uses only the LATEST row per combo for the heatmap grid
    //   - The timeline uses ALL rows for filtered combos, sorted by calculated_at

    const trendsToInsert = [];
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    // Time points spread across last 90 days (one every 2-3 days = ~35 points)
    const timePoints = [];
    for (let d = 90; d >= 0; d -= 2) {
        const dt = new Date(now);
        dt.setDate(dt.getDate() - d);
        // Add small random hour offset for realism
        dt.setHours(randomInt(8, 22), randomInt(0, 59), 0, 0);
        timePoints.push(dt);
    }

    console.log(`📈 Generating trend signals across ${regions.length} regions × ${categories.length} categories × ${timePoints.length} time points...`);

    for (const region of regions) {
        for (const category of categories) {
            const pattern = CATEGORY_PATTERNS[category.category_name] || CATEGORY_PATTERNS['Category 1'];

            // For each time point, derive a score with trend evolution
            let prevScore = pattern.baseScore + randomInt(-15, 15);

            for (let tp = 0; tp < timePoints.length; tp++) {
                const dt = timePoints[tp];

                // Walk the score with some mean-reversion
                const delta = randomInt(-8, 8);
                const reversion = (pattern.baseScore - prevScore) * 0.08;
                let score = Math.round(prevScore + delta + reversion);
                score = Math.max(5, Math.min(100, score));
                prevScore = score;

                const momentumOptions = pattern.momentum;
                const momentum = randomItem(momentumOptions);
                const signal_strength = randomFloat(0.3, 0.95);

                const driver_json = generateDriverJson(pattern);

                trendsToInsert.push({
                    category_id: category.category_id,
                    region_id: region.region_id,
                    trend_score: score,
                    signal_strength,
                    momentum,
                    driver_json,
                    calculated_at: dt.toISOString(),
                });
            }
        }
    }

    console.log(`📦 Total records: ${trendsToInsert.length}. Inserting in batches...\n`);

    // 4. Insert in batches of 200
    const BATCH_SIZE = 200;
    let insertedCount = 0;
    for (let i = 0; i < trendsToInsert.length; i += BATCH_SIZE) {
        const batch = trendsToInsert.slice(i, i + BATCH_SIZE);
        const { error } = await supabase.from('trends').insert(batch);
        if (error) {
            console.error(`  ❌ Batch ${Math.floor(i / BATCH_SIZE) + 1} error:`, error.message);
        } else {
            insertedCount += batch.length;
            console.log(`  ✅ Batch ${Math.floor(i / BATCH_SIZE) + 1}: inserted ${batch.length} (total: ${insertedCount})`);
        }
    }

    console.log(`\n✅ Trend seeding complete!`);
    console.log(`📊 SUMMARY:`);
    console.log(`   • Regions:               ${regions.length}`);
    console.log(`   • Categories:            ${categories.length}`);
    console.log(`   • Time points (90d):     ${timePoints.length}`);
    console.log(`   • Total records:         ${trendsToInsert.length}`);
    console.log(`   • Total inserted:        ${insertedCount}`);
    console.log(`\n   Heatmap coverage:  ${regions.length} regions × ${categories.length} categories`);
    console.log(`   Timeline per combo: ${timePoints.length} data points (spans all filter windows: 7/14/30/90d)\n`);
    process.exit(0);
}

seedTrends();
