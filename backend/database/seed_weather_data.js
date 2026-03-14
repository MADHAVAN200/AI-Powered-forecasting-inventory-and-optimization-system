
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
// WEATHER SEED CONFIGURATION
//
// The 'weather_forecasts' table schema:
//   id               UUID (auto)
//   city_id          FK → cities
//   forecast_date    DATE
//   weather_condition TEXT
//   temp_max         NUMERIC (°C)
//   precipitation    NUMERIC (mm)
//   humidity         NUMERIC (%)
//
// Frontend filters:
//   - City (city_id)  → WHERE city_id = ?
//   - Horizon (3/7/14) → LIMIT N rows ordered by forecast_date ASC
//
// The frontend uses .limit(horizon) on ordered dates, so we must seed:
//   - For each city: next 14 days of forecasts (covers the max horizon=14)
//   - Realistic Indian city weather patterns based on current season (March)
// ─────────────────────────────────────────────────────────────────────────────

// Current date: March 4, 2026 (user local time) — EARLY MARCH = late winter / pre-summer
// Indian city climate profiles for early March:
const CITY_CLIMATE_PROFILES = {
    // Tier 1 metros
    'Mumbai': { tempRange: [28, 34], humidity: [65, 80], rainChance: 0.05, conditions: ['Sunny', 'Partly Cloudy', 'Sunny', 'Sunny', 'Humid Cloudy'] },
    'Delhi': { tempRange: [22, 35], humidity: [30, 55], rainChance: 0.08, conditions: ['Sunny', 'Sunny', 'Foggy', 'Sunny', 'Partly Cloudy', 'Dusty Wind'] },
    'Bangalore': { tempRange: [24, 32], humidity: [50, 70], rainChance: 0.15, conditions: ['Partly Cloudy', 'Sunny', 'Light Rain', 'Partly Cloudy', 'Sunny'] },
    'Chennai': { tempRange: [30, 38], humidity: [65, 80], rainChance: 0.10, conditions: ['Sunny', 'Sunny', 'Humid Cloudy', 'Partly Cloudy', 'Sunny'] },
    'Hyderabad': { tempRange: [28, 36], humidity: [40, 60], rainChance: 0.08, conditions: ['Sunny', 'Sunny', 'Partly Cloudy', 'Sunny', 'Clear'] },
    'Kolkata': { tempRange: [26, 34], humidity: [60, 75], rainChance: 0.12, conditions: ['Sunny', 'Partly Cloudy', 'Sunny', 'Humid', 'Partly Cloudy'] },
    'Pune': { tempRange: [24, 34], humidity: [40, 65], rainChance: 0.10, conditions: ['Sunny', 'Partly Cloudy', 'Sunny', 'Sunny', 'Clear'] },
    'Ahmedabad': { tempRange: [26, 38], humidity: [30, 50], rainChance: 0.04, conditions: ['Sunny', 'Clear', 'Hot & Sunny', 'Sunny', 'Dusty'] },
    // Tier 2 cities
    'Jaipur': { tempRange: [22, 36], humidity: [25, 45], rainChance: 0.06, conditions: ['Sunny', 'Sunny', 'Clear', 'Dusty Wind', 'Sunny'] },
    'Surat': { tempRange: [28, 36], humidity: [55, 72], rainChance: 0.06, conditions: ['Sunny', 'Humid Cloudy', 'Sunny', 'Partly Cloudy', 'Sunny'] },
    'Lucknow': { tempRange: [20, 33], humidity: [35, 55], rainChance: 0.10, conditions: ['Sunny', 'Partly Cloudy', 'Sunny', 'Foggy Morning', 'Clear'] },
    'Kanpur': { tempRange: [20, 34], humidity: [30, 50], rainChance: 0.08, conditions: ['Sunny', 'Clear', 'Partly Cloudy', 'Sunny', 'Dusty'] },
    'Nagpur': { tempRange: [26, 38], humidity: [30, 50], rainChance: 0.06, conditions: ['Hot & Sunny', 'Sunny', 'Clear', 'Sunny', 'Partly Cloudy'] },
    'Indore': { tempRange: [24, 36], humidity: [30, 50], rainChance: 0.06, conditions: ['Sunny', 'Clear', 'Hot & Sunny', 'Partly Cloudy', 'Sunny'] },
    'Bhopal': { tempRange: [22, 34], humidity: [30, 50], rainChance: 0.08, conditions: ['Sunny', 'Partly Cloudy', 'Sunny', 'Clear', 'Sunny'] },
    'Patna': { tempRange: [22, 34], humidity: [40, 60], rainChance: 0.10, conditions: ['Sunny', 'Partly Cloudy', 'Foggy', 'Sunny', 'Clear'] },
    'Coimbatore': { tempRange: [26, 35], humidity: [55, 70], rainChance: 0.15, conditions: ['Sunny', 'Partly Cloudy', 'Light Rain', 'Sunny', 'Humid'] },
    'Kochi': { tempRange: [28, 34], humidity: [70, 85], rainChance: 0.20, conditions: ['Partly Cloudy', 'Humid', 'Light Rain', 'Sunny', 'Cloudy'] },
    'Visakhapatnam': { tempRange: [28, 36], humidity: [60, 78], rainChance: 0.12, conditions: ['Sunny', 'Partly Cloudy', 'Humid', 'Sunny', 'Clear'] },
    'Vadodara': { tempRange: [26, 38], humidity: [35, 55], rainChance: 0.05, conditions: ['Sunny', 'Hot & Sunny', 'Clear', 'Partly Cloudy', 'Sunny'] },
};

// Default profile for cities not explicitly listed
const DEFAULT_PROFILE = { tempRange: [25, 35], humidity: [40, 65], rainChance: 0.08, conditions: ['Sunny', 'Partly Cloudy', 'Sunny', 'Clear', 'Sunny'] };

// Weather conditions that trigger precipitation
const WET_CONDITIONS = ['Light Rain', 'Heavy Rain', 'Storm', 'Thunderstorm'];
const DRY_CONDITIONS = ['Sunny', 'Partly Cloudy', 'Clear', 'Hot & Sunny', 'Humid', 'Foggy', 'Dusty', 'Foggy Morning', 'Dusty Wind', 'Humid Cloudy'];

function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randomFloat(min, max, dp = 1) { return parseFloat((Math.random() * (max - min) + min).toFixed(dp)); }
function randomItem(arr) { return arr[randomInt(0, arr.length - 1)]; }

function addDays(date, days) {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
}
function formatDate(date) { return date.toISOString().split('T')[0]; }

async function seedWeather() {
    console.log('\n🌤️  Starting Weather Intelligence Seeding...\n');

    // 1. Fetch all cities
    console.log('📍 Fetching cities...');
    const { data: cities, error: cityErr } = await supabase.from('cities').select('*');

    if (cityErr) {
        console.error('❌ Error fetching cities:', cityErr.message);
        process.exit(1);
    }
    if (!cities?.length) {
        console.error('❌ No cities found. Run seed_data.sql first.');
        process.exit(1);
    }

    console.log(`✅ Found ${cities.length} cities.\n`);

    // 2. Delete existing weather forecasts
    console.log('🗑️  Deleting existing weather forecasts...');
    const { error: delErr } = await supabase
        .from('weather_forecasts')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');
    if (delErr) {
        // Try alternate PK name
        const { error: delErr2 } = await supabase
            .from('weather_forecasts')
            .delete()
            .gte('forecast_date', '2000-01-01');
        if (delErr2) console.warn('⚠️  Could not delete via date range:', delErr2.message);
        else console.log('✅ Existing forecasts cleared.\n');
    } else {
        console.log('✅ Existing forecasts cleared.\n');
    }

    // 3. Generate weather data
    // Strategy: for each city, generate 14 days of forecast data (covers all horizons: 3/7/14)
    // Plus add some historical data (past 3 days) to make charts look natural
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const forecastsToInsert = [];

    for (const city of cities) {
        const profile = CITY_CLIMATE_PROFILES[city.city_name] || DEFAULT_PROFILE;

        // Generate 14 days forward (to cover max horizon filter)
        for (let dayOffset = 0; dayOffset <= 14; dayOffset++) {
            const forecastDate = addDays(today, dayOffset);

            // Determine if this is a rainy/disruptive day
            const isRainy = Math.random() < profile.rainChance;
            let condition;

            if (isRainy && dayOffset > 0) {
                // Pick a wet condition based on season (March = mostly pre-monsoon light rains)
                const wetOptions = profile.tempRange[1] > 36
                    ? ['Thunderstorm', 'Light Rain']
                    : ['Light Rain', 'Light Rain', 'Thunderstorm'];
                condition = randomItem(wetOptions);
            } else {
                condition = randomItem(profile.conditions);
            }

            // Temperature – increases through the week (March = warming trend)
            const tempBase = randomFloat(profile.tempRange[0], profile.tempRange[1]);
            const warmingTrend = dayOffset * 0.2; // Gradual warming
            const temp_max = parseFloat(Math.min(45, tempBase + warmingTrend).toFixed(1));

            // Precipitation – only substantial if rainy
            const isWet = WET_CONDITIONS.some(w => condition.includes(w.split(' ')[0]));
            const precipitation = isWet
                ? randomFloat(condition.includes('Heavy') ? 40 : condition.includes('Thunder') ? 25 : 8, condition.includes('Heavy') ? 120 : 35)
                : randomFloat(0, 3);

            const humidity = randomFloat(
                profile.humidity[0] + (isWet ? 15 : 0),
                Math.min(95, profile.humidity[1] + (isWet ? 20 : 0))
            );

            forecastsToInsert.push({
                city_id: city.city_id,
                forecast_date: formatDate(forecastDate),
                weather_condition: condition,
                temp_max,
                precipitation: parseFloat(precipitation.toFixed(1)),
                humidity: parseFloat(humidity.toFixed(1)),
            });
        }
    }

    console.log(`📦 Generated ${forecastsToInsert.length} weather forecast records. Inserting in batches...`);

    // 4. Insert in batches
    const BATCH_SIZE = 200;
    let insertedCount = 0;
    for (let i = 0; i < forecastsToInsert.length; i += BATCH_SIZE) {
        const batch = forecastsToInsert.slice(i, i + BATCH_SIZE);
        const { error } = await supabase.from('weather_forecasts').insert(batch);
        if (error) {
            console.error(`  ❌ Batch ${Math.floor(i / BATCH_SIZE) + 1} error:`, error.message);
            if (batch[0]) console.error('  Sample record:', JSON.stringify(batch[0]));
        } else {
            insertedCount += batch.length;
            console.log(`  ✅ Batch ${Math.floor(i / BATCH_SIZE) + 1}: inserted ${batch.length} (total: ${insertedCount})`);
        }
    }

    console.log(`\n✅ Weather seeding complete!`);
    console.log(`📊 SUMMARY:`);
    console.log(`   • Cities:                ${cities.length}`);
    console.log(`   • Days per city:         15 (covers Next 3/7/14 day horizons)`);
    console.log(`   • Total records:         ${forecastsToInsert.length}`);
    console.log(`   • Total inserted:        ${insertedCount}`);
    console.log(`\n   Weather patterns include: Sunny, Partly Cloudy, Light Rain, Thunderstorm,`);
    console.log(`   Hot & Sunny, Humid Cloudy, Foggy, Dusty Wind, Clear`);
    console.log(`   Temperature range: 20-45°C (city-specific for March season)\n`);
    process.exit(0);
}

seedWeather();
