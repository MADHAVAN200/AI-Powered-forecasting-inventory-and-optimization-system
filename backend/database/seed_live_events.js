
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Try loading from .env.local first, then .env
const envLocalPath = join(__dirname, '../.env.local');
const envPath = join(__dirname, '../.env');
if (existsSync(envLocalPath)) {
    config({ path: envLocalPath });
} else if (existsSync(envPath)) {
    config({ path: envPath });
} else {
    config(); // Try default locations
}

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials.');
    console.error('   Please create a .env.local file in the React/ folder with:');
    console.error('   VITE_SUPABASE_URL=https://xxx.supabase.co');
    console.error('   VITE_SUPABASE_ANON_KEY=your-anon-key');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// ─────────────────────────────────────────────────────────────────────────────
// DB Category IDs match category_name in DB (Category 1 … Category 12)
// CATEGORY_NAME_MAP (from frontend):
//   Category 1 → Staples & Groceries
//   Category 2 → Packaged Foods
//   Category 3 → Cooking Essentials
//   Category 4 → Fresh Produce
//   Category 5 → Beverages
//   Category 6 → Bakery & Snacks
//   Category 7 → Dairy & Eggs
//   Category 8 → Frozen Foods
//   Category 9 → Meat & Poultry
//   Category 10 → Home Care
//   Category 11 → Personal Care
//   Category 12 → Pet Care
// ─────────────────────────────────────────────────────────────────────────────

// Category affinities per event type – uses DB category_name strings
const CATEGORY_AFFINITIES = {
    Festival: {
        cats: ['Category 1', 'Category 3', 'Category 4', 'Category 6', 'Category 7'],
        weights: [0.85, 0.70, 0.75, 0.80, 0.65],
        impactRange: [3.5, 5.0],
        durationRange: [2, 7],
    },
    Concert: {
        cats: ['Category 5', 'Category 6', 'Category 2', 'Category 11'],
        weights: [0.80, 0.75, 0.55, 0.50],
        impactRange: [2.5, 4.0],
        durationRange: [1, 2],
    },
    'Sporting Event': {
        cats: ['Category 5', 'Category 6', 'Category 2', 'Category 9'],
        weights: [0.85, 0.80, 0.60, 0.55],
        impactRange: [2.5, 4.5],
        durationRange: [1, 3],
    },
    Holiday: {
        cats: ['Category 4', 'Category 7', 'Category 9', 'Category 6', 'Category 1'],
        weights: [0.80, 0.75, 0.70, 0.65, 0.85],
        impactRange: [3.0, 5.0],
        durationRange: [1, 3],
    },
    Conference: {
        cats: ['Category 5', 'Category 2', 'Category 11', 'Category 10'],
        weights: [0.60, 0.55, 0.50, 0.45],
        impactRange: [1.5, 3.0],
        durationRange: [1, 4],
    },
    Promotion: {
        cats: ['Category 1', 'Category 2', 'Category 5', 'Category 6', 'Category 10', 'Category 11'],
        weights: [0.75, 0.70, 0.65, 0.70, 0.60, 0.55],
        impactRange: [2.0, 4.0],
        durationRange: [1, 5],
    },
    'Weather Alert': {
        cats: ['Category 1', 'Category 4', 'Category 8', 'Category 10', 'Category 3'],
        weights: [0.90, 0.85, 0.70, 0.65, 0.75],
        impactRange: [3.0, 5.0],
        durationRange: [1, 4],
    },
};

// ─────────────────────────────────────────────────────────────────────────────
// DETAILED EVENT NAME POOLS WITH DESCRIPTIONS
// Each entry: { name, description, features }
// ─────────────────────────────────────────────────────────────────────────────
const EVENT_POOL = {
    Festival: [
        { name: 'Diwali – Festival of Lights', description: 'Multi-day Hindu festival with fireworks, sweets distribution, and family gatherings. Highest annual demand spike.' },
        { name: 'Holi – Festival of Colors', description: 'Spring festival with color celebrations, street gatherings, and special food preparations. Drives impulse purchases.' },
        { name: 'Eid al-Fitr Celebrations', description: 'End of Ramadan festival with community feasting, gift-giving, and large-scale food procurement.' },
        { name: 'Navratri – 9-Night Festival', description: 'Nine nights of Garba dancing, religious observances, and community meals. Significant demand on fasting foods.' },
        { name: 'Durga Puja – Puja Pandal Season', description: 'Major Bengali festival with evening puja, community dining, and special offerings. Kolkata epicenter.' },
        { name: 'Ganesh Chaturthi Utsav', description: 'Ganesha idol immersion festival with street feasts, modaks, and large gatherings over 10 days.' },
        { name: 'Pongal – Harvest Thanksgiving', description: 'Tamil harvest festival with rice boiling rituals, traditional sweets, and family reunions. South India focus.' },
        { name: 'Onam – Kerala Harvest Festival', description: 'Grand Kerala feast (Sadhya) with 26-course traditional meal. Peak demand for banana leaf, rice, and vegetables.' },
        { name: 'Baisakhi – Punjabi New Year', description: 'Sikh and Hindu harvest festival with bhangra, langar, and community kitchens. North India primary.' },
        { name: 'Eid ul-Adha – Bakrid', description: 'Festival of sacrifice with community feasting. Strong demand for biryani ingredients, meat, and sweets.' },
        { name: 'Makar Sankranti – Kite Festival', description: 'Harvest festival with kite-flying, sesame-jaggery sweets (tilgul), and community bonfires.' },
        { name: 'Ugadi – Telugu New Year', description: 'Andhra/Telangana New Year with traditional Pachadi dish, family meals, and temple visits.' },
        { name: 'Christmas & New Year Celebrations', description: 'Dual holiday season with cakes, confectioneries, gifting, and large party gatherings.' },
        { name: 'Dussehra – Vijayadasami', description: 'Victory of good over evil with Ramlila events, community meals, and effigies burning. 10-day build-up.' },
        { name: 'Janmashtami – Krishna Birthday', description: 'Hindu festival with day-long fasting followed by midnight feast. Dairy and sweets surge.' },
        { name: 'Raksha Bandhan – Sibling Bond', description: 'Festival of sibling bonding with sweets boxes, gifting, and family meals.' },
        { name: 'Karwa Chauth – Fasting Festival', description: 'Married women\'s fasting day with sargi pre-fast meal. Demand spike for fruits, sweets, and dry fruits.' },
        { name: 'Lohri – North India Bonfire', description: 'Winter harvest festival with bonfires, rewri, popcorn, and folk songs in Punjab and Delhi.' },
        { name: 'Bihu – Assamese New Year', description: 'Assamese spring festival with traditional Assam rice dishes, handloom fairs, and community feasts.' },
        { name: 'Ram Navami – Temple Fair', description: 'Hindu festival celebrating Ram\'s birth with community langars, temple prasad, and street fairs.' },
    ],
    Concert: [
        { name: 'Arijit Singh Live Concert', description: 'Sold-out Bollywood playback singer concert. 30,000+ attendees. Elevated beverage and snack sales in venue city.' },
        { name: 'A.R. Rahman World Tour Stop', description: 'Academy Award-winning composer\'s world tour. 25,000 attendees. Premium event with high crowd density.' },
        { name: 'Sunburn Festival – EDM 3-Day Event', description: 'India\'s largest EDM festival. 3-day outdoor event with food stalls, beverages, and high footfall.' },
        { name: 'NH7 Weekender – Multi-Genre Music', description: 'Multi-city indie music festival known for diversity. Strong correlation with convenience food demand.' },
        { name: 'Diljit Dosanjh Live – Punjab Night', description: 'Popular Punjabi singer\'s regional concert. Strong demand for north-Indian snacks and beverages.' },
        { name: 'Atif Aslam Live Performance', description: 'Popular Pakistani-origin artist\'s India concert. Massive fan gathering with expected footfall of 20,000+.' },
        { name: 'Shreya Ghoshal Melody Night', description: 'Classical-pop Bollywood singer concert. 15,000 attendees, evening event, drives snack hours surge.' },
        { name: 'Bollywood Retro Night – Live Band', description: 'Tribute retro Bollywood live band concert targeting 35+ age group. Drives premium snack categories.' },
        { name: 'Coldplay India Tour Concert', description: 'International mega-concert by Coldplay. 60,000+ attendees. City-wide surge in F&B and retail.' },
        { name: 'Nucleya – Bass & Electronic Night', description: 'Popular Indian electronic music artist. Younger demographic, strong protein drink and beverage correlation.' },
        { name: 'Kailash Kher Sufi Night', description: 'Sufi music concert attracting diverse crowd. Evening event with pre-concert dining surge.' },
        { name: 'Zakir Hussain – Classical Tabla Night', description: 'World-renowned classical musician. High-brow audience, drives premium F&B sales.' },
    ],
    'Sporting Event': [
        { name: 'IPL Match – MI vs CSK (Home Game)', description: 'Indian Premier League cricket match. 30,000+ stadium attendance. Broadcast drives citywide snack demand.' },
        { name: 'IPL Match – RCB vs KKR Clash', description: 'High-stakes IPL fixture. Peak TV viewership drives impulse snack and beverage purchasing.' },
        { name: 'IPL Playoff – Qualifier 1', description: 'IPL playoff match with maximum viewership. One of the highest demand-spike sporting events of the year.' },
        { name: 'IPL Final – Championship Match', description: 'Season finale. Nationwide broadcast drives maximum F&B demand surge. Pan-India impact.' },
        { name: 'ISL Football Final', description: 'Indian Super League football championship. Growing sports fan base drives evening snack and beverage surge.' },
        { name: 'Pro Kabaddi League – Home Fixture', description: 'Popular Indian contact sport with strong regional fan following. Mid-tier demand signal.' },
        { name: 'India vs Australia Test Match', description: 'International cricket Test match. Multi-day event driving consistent viewership snack demand.' },
        { name: 'India vs Pakistan T20 World Cup', description: 'Most-watched cricket fixture globally. Maximum F&B demand surge event. Pan-India signal.' },
        { name: 'T20 World Cup Final – India', description: 'If India reaches the final, triggers historic demand spike in snacks, beverages, and home gathering foods.' },
        { name: 'Mumbai Marathon – 42K Run', description: '45,000 runners. City traffic disruption. Pre-event demand for hydration, energy snacks, bananas.' },
        { name: 'Delhi Half Marathon – Mass Run', description: '35,000 participants. Pre-event surge in isotonic drinks, energy bars, fresh fruits.' },
        { name: 'Premier Badminton League Match', description: 'Indoor badminton league with moderate footfall. Drives convenience food sales near venue.' },
        { name: 'Hockey India League Final', description: 'National hockey championship finale. Regional demand spike based on city of the match.' },
        { name: 'Formula E Racing – India Circuit', description: 'International motorsport event. High-income audience. Premium beverage and snack demand.' },
        { name: 'Tata Open Maharashtra Tennis', description: 'ATP tennis tournament in Pune. 7-day event creating sustained demand around venue area.' },
    ],
    Holiday: [
        { name: 'Republic Day – 26 January', description: 'National holiday with parades, patriotic events, and family gatherings. Grocery pre-stock observed.' },
        { name: 'Independence Day – 15 August', description: 'National holiday with flag hoisting events, public celebrations, and school functions.' },
        { name: 'Gandhi Jayanti – 2 October', description: 'National holiday marking Mahatma Gandhi\'s birth. Government offices closed, retail activity moderate.' },
        { name: 'Good Friday – Christian Holiday', description: 'Religious observance with most businesses closed in key metros. Reduced foot traffic but pre-day grocery rush.' },
        { name: 'Easter Sunday', description: 'Christian holiday with family meals, Easter egg hunts, and specialty confectioneries.' },
        { name: 'Buddha Purnima – Full Moon Day', description: 'Buddhist holiday with meditation events, temple visits, and vegetarian food demand.' },
        { name: 'Guru Nanak Jayanti', description: 'Sikh religious holiday with langar (community kitchen) contributing to staples demand in Punjab/Delhi.' },
        { name: 'Ambedkar Jayanti – 14 April', description: 'National holiday with government events and social gatherings. Moderate retail impact.' },
        { name: 'Mahashivratri Night Watch', description: 'Hindu fasting holiday. Demand for fruits, milk, and fasting foods. Next-day feasting surge.' },
        { name: 'Eid – Public Holiday', description: 'National holiday for Eid with all major offices and markets closed. Pre-holiday shopping surge.' },
        { name: 'Muharram Observance', description: 'Islamic observance affecting commerce in Muslim-majority areas. Moderate demand shift.' },
        { name: 'Diwali Holiday Week', description: 'Multi-day holiday with schools and businesses closing. Pre-Diwali shopping at its peak.' },
        { name: 'Christmas Day – 25 December', description: 'National holiday with family gatherings, cakes, and gifting. Surge in bakery and personal care.' },
        { name: 'New Year\'s Eve City Parties', description: 'Massive citywide party events. Peak demand for beverages, snacks, and ready-to-eat categories.' },
        { name: 'Holi Holiday – Colours Day', description: 'Public holiday for Holi with street celebrations. Beverages, snacks, and dairy demand spike.' },
    ],
    Conference: [
        { name: 'India Retail & eCommerce Summit', description: 'Annual gathering of India\'s top retail leaders. 5,000 delegates in premium hotels. Drives catering and F&B.' },
        { name: 'TiECon – Entrepreneurship Conference', description: 'Leading startup and entrepreneurship conference. 10,000+ attendees over 2 days. Hotel catering dominant.' },
        { name: 'FoodTech India – Food Technology Expo', description: 'B2B food technology expo attracting manufacturers, chefs, and distributors. 15,000 trade visitors.' },
        { name: 'ASSOCHAM Supply Chain Summit', description: 'Annual supply chain and logistics conference. 3,000 industry executives. Moderate F&B signal.' },
        { name: 'India Grocery Retail Conference', description: 'Key industry conference for grocery and FMCG. Trade buyers and brand reps. Venue city signal.' },
        { name: 'Global Agritech Summit India', description: 'Agritech conference bringing together farmers, startups, and agri-investors. Fresh produce focus.' },
        { name: 'PHD Chamber Commerce Convention', description: 'Large industry convention with evening galas and networking dinners. Moderate venue-area signal.' },
        { name: 'IIM Alumni Annual Meet', description: 'IIM alumni gathering at host city campus. 3,000 attendees. Premium catering model.' },
        { name: 'Medical Congress – AIIMS Summit', description: 'Medical professionals conference. 8,000+ doctors. Drives premium packaged food and beverage.' },
        { name: 'Digital India Technology Expo', description: '3-day technology exhibition. 50,000 visitors. Strong footfall to venue area retail outlets.' },
        { name: 'India Real Estate Expo', description: 'Property exhibition with families attending weekend shows. Drives incidental snack and beverage.' },
        { name: 'India Cold Chain Forum', description: 'Industry forum for cold logistics. Specialty event with 2,000 attendees. Niche demand signal.' },
    ],
    Promotion: [
        { name: 'Flipkart Big Billion Days Sale', description: '5-day mega e-commerce sale event. Drives delivery worker surge and packaging demand. High city activity.' },
        { name: 'Amazon Great Indian Festival', description: 'Annual e-commerce mega sale. City-wide logistics boost. Impulse purchases in FMCG and groceries.' },
        { name: 'End of Season Sale – All Stores', description: 'Retail chain seasonal sale event with high footfall. Adjacent grocery and snack demand rises.' },
        { name: 'Swiggy Unlimited Food Festival', description: '3-day food delivery promo festival. Drives packaged ready-to-eat and ingredient demand surge.' },
        { name: 'Zomato 50% Off Weekend', description: 'Major food delivery weekend discount. Competes with home cooking – reduces fresh produce demand.' },
        { name: 'DMart Annual Members Day', description: 'Exclusive members-only sale at DMart. Pre-sale stock-up observed. Grocery demand up 40%.' },
        { name: 'Big Bazaar Freedom Sale', description: 'Annual patriotic-themed sale event aligned with Independence Day. Strong grocery category pull.' },
        { name: 'Reliance Fresh Launch Sale', description: 'New store opening promotional event with heavy discounting. Drives local foot traffic.' },
        { name: 'Grofers (Blinkit) Super Saver Week', description: 'Online grocery major sale. Heavy usage of staples, dairy, and beverage categories.' },
        { name: 'Republic Day Sale – Fashion & Food', description: 'Multi-category sale event around Republic Day. Strong grocery and snack correlation.' },
        { name: 'Myntra End of Reason Sale', description: 'Fashion mega-sale with adjacent personal care and home care demand in participating cities.' },
        { name: 'Spencer\'s Retail Weekend Promo', description: 'Large-format retail chain promotion event. Grocery and packaged food surge on promotion days.' },
        { name: 'Paytm Mall Grand Sale Weekend', description: 'Digital commerce sale driving delivery demand and adjacent brick-and-mortar foot traffic.' },
        { name: 'JioMart Grocery Mega Offer Week', description: 'Reliance-backed grocery platform offer week. Drives high-volume staples and FMCG orders.' },
    ],
    'Weather Alert': [
        { name: 'IMD Cyclone Alert – Category 3', description: 'India Meteorological Dept cyclone warning for coastal regions. Essential supplies rush. Strong demand signal.' },
        { name: 'Heavy Monsoon Rainfall Warning', description: 'Red alert for 200mm+ 24-hour rainfall. Supply chain disruption expected. Hoarding behaviour observed.' },
        { name: 'Northern Heatwave Advisory', description: 'Temperature exceeding 44°C for 5+ days. High demand for beverages, electrolytes, and ice cream.' },
        { name: 'Western Disturbance – Snowfall Alert', description: 'Snowfall warning for hill regions affecting supply routes in Himachal and Uttarakhand.' },
        { name: 'Flood Warning – River Overflows', description: 'Flood alert for low-lying areas. Pre-flood stocking of staples, packaged foods, and water.' },
        { name: 'Dense Fog – Visibility Alert', description: 'Multi-day dense fog season advisory. Delayed deliveries expected. Pre-stocking behaviour triggers.' },
        { name: 'Pre-Monsoon Storm Warning', description: 'Pre-monsoon thunder and lightning advisory. Short-term demand spike for essentials.' },
        { name: 'Cold Wave Alert – Northern Plains', description: 'Cold wave bulletin from IMD for temperatures below 4°C. Strong demand for warming foods and beverages.' },
        { name: 'Coastal High Tide Warning', description: 'High tide and rough sea warning for coastal cities. Fishing ban impacts seafood supply.' },
        { name: 'Air Quality Emergency – AQI 450+', description: 'Severe air pollution emergency. Demand for air purifiers, masks, and immunity-boosting foods.' },
        { name: 'Drought Warning – Kharif Season', description: 'Seasonal drought advisory affecting agricultural produce. Long-term fresh produce supply concern.' },
        { name: 'Lightning Storm Alert – Afternoon', description: 'Afternoon thunderstorm advisory. Short-term foot traffic disruption and impulse delivery demand.' },
    ],
};

// ─────────────────────────────────────────────────────────────────────────────
// HELPER: Distribution strategy for events across time buckets
// Goal: ensure good data in each filter window
// Next 7 days: 50-60 events, Next 14: 120-130 total, Next 30: 300+, Next 90: 600+
// ─────────────────────────────────────────────────────────────────────────────
const TIME_BUCKETS = [
    { from: 0, to: 7, count: 55 },   // Next 7 days – needs plenty for filter
    { from: 7, to: 14, count: 70 },  // Days 8-14
    { from: 14, to: 30, count: 175 }, // Days 15-30
    { from: 30, to: 60, count: 160 }, // Days 31-60
    { from: 60, to: 90, count: 130 }, // Days 61-90
];

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
function randomFloat(min, max, decimals = 1) {
    return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomItem(array) {
    return array[randomInt(0, array.length - 1)];
}

function addDays(date, days) {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
}

function formatDate(date) {
    return date.toISOString().split('T')[0];
}

function randomDateInBucket(today, from, to) {
    const startOffset = from + Math.random() * (to - from);
    return addDays(today, startOffset);
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN SEED
// ─────────────────────────────────────────────────────────────────────────────
async function seedLiveEvents() {
    console.log('\n🚀 Starting Event Intelligence Seeding...\n');

    // 1. Fetch cities and categories
    console.log('📍 Fetching cities and categories...');
    const [{ data: cities, error: cityErr }, { data: categories, error: catErr }] = await Promise.all([
        supabase.from('cities').select('*'),
        supabase.from('categories').select('*')
    ]);

    if (cityErr || catErr) {
        console.error('❌ Error fetching reference data:', cityErr || catErr);
        process.exit(1);
    }
    if (!cities?.length || !categories?.length) {
        console.error('❌ No cities or categories found. Run the base seed_data.sql first.');
        process.exit(1);
    }

    // Build a lookup: category_name → category_id
    const categoryByName = {};
    categories.forEach(c => { categoryByName[c.category_name] = c.category_id; });

    console.log(`✅ Found ${cities.length} cities and ${categories.length} categories.\n`);

    // 2. Delete existing events (cascade deletes event_category_impact)
    console.log('🗑️  Deleting existing event category impacts...');
    const { error: delImpact } = await supabase
        .from('event_category_impact')
        .delete()
        .neq('event_id', '00000000-0000-0000-0000-000000000000');
    if (delImpact) console.warn('⚠️  Could not delete impacts (may not exist):', delImpact.message);

    console.log('🗑️  Deleting existing events...');
    const { error: delEvents } = await supabase
        .from('events')
        .delete()
        .neq('event_id', '00000000-0000-0000-0000-000000000000');
    if (delEvents) console.warn('⚠️  Could not delete events:', delEvents.message);

    console.log('✅ Existing data cleared.\n');

    // 3. Generate events spread across time buckets
    const eventTypes = Object.keys(EVENT_POOL);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const eventsToInsert = [];

    for (const bucket of TIME_BUCKETS) {
        for (let i = 0; i < bucket.count; i++) {
            const type = randomItem(eventTypes);
            const pool = EVENT_POOL[type];
            const template = randomItem(pool);
            const affinity = CATEGORY_AFFINITIES[type];
            const city = randomItem(cities);

            const startDate = randomDateInBucket(today, bucket.from, bucket.to);
            const duration = randomInt(affinity.durationRange[0], affinity.durationRange[1]);
            const endDate = addDays(startDate, duration);
            const impactScore = Math.round(randomFloat(affinity.impactRange[0], affinity.impactRange[1]));

            eventsToInsert.push({
                title: template.name,
                city_id: city.city_id,
                event_type: type,
                start_date: formatDate(startDate),
                end_date: formatDate(endDate),
                impact_score: impactScore,
            });
        }
    }

    console.log(`📦 Generated ${eventsToInsert.length} events. Inserting in batches...\n`);

    // 4. Insert events in batches
    const BATCH_SIZE = 100;
    const insertedEvents = [];

    for (let i = 0; i < eventsToInsert.length; i += BATCH_SIZE) {
        const batch = eventsToInsert.slice(i, i + BATCH_SIZE);
        const { data, error } = await supabase.from('events').insert(batch).select('event_id, event_type');
        if (error) {
            console.error(`  ❌ Batch ${i / BATCH_SIZE + 1} error:`, error.message);
            // Log first failing record for debugging
            if (batch[0]) console.error('  First record:', JSON.stringify(batch[0]));
        } else {
            insertedEvents.push(...data);
            console.log(`  ✅ Batch ${i / BATCH_SIZE + 1}: inserted ${data.length} events (total: ${insertedEvents.length})`);
        }
    }
    console.log(`\n✅ Total events inserted: ${insertedEvents.length}\n`);

    // 5. Build category impact rows
    console.log('🏷️  Generating category impacts with event-type affinities...\n');
    const impactsToInsert = [];

    for (const evt of insertedEvents) {
        const affinity = CATEGORY_AFFINITIES[evt.event_type];
        if (!affinity) continue;

        const numCats = randomInt(2, Math.min(4, affinity.cats.length));
        // Shuffle a copy of cats to pick a varied subset
        const shuffled = [...affinity.cats].sort(() => Math.random() - 0.5);
        const chosen = shuffled.slice(0, numCats);

        for (let j = 0; j < chosen.length; j++) {
            const catName = chosen[j];
            const catId = categoryByName[catName];
            if (!catId) {
                console.warn(`⚠️  Category "${catName}" not found in DB, skipping.`);
                continue;
            }
            // Use the affinity weight with small noise
            const baseWeight = affinity.weights[affinity.cats.indexOf(catName)] ?? 0.5;
            const weight = Math.min(1.0, Math.max(0.1, baseWeight + (Math.random() * 0.2 - 0.1)));
            impactsToInsert.push({
                event_id: evt.event_id,
                category_id: catId,
                impact_weight: parseFloat(weight.toFixed(2)),
            });
        }
    }

    console.log(`📦 Generated ${impactsToInsert.length} category impacts. Inserting...`);

    for (let i = 0; i < impactsToInsert.length; i += BATCH_SIZE) {
        const batch = impactsToInsert.slice(i, i + BATCH_SIZE);
        const { error } = await supabase.from('event_category_impact').insert(batch);
        if (error) {
            console.error(`❌ Error inserting impact batch at ${i}:`, error.message);
        } else {
            process.stdout.write(`  ✅ Inserted ${Math.min(i + BATCH_SIZE, impactsToInsert.length)}/${impactsToInsert.length} impacts...\r`);
        }
    }

    // 6. Summary
    console.log(`\n\n✅ Seeding complete!\n`);
    console.log('📊 SUMMARY:');
    console.log(`   • Events inserted:          ${insertedEvents.length}`);
    console.log(`   • Category impacts inserted: ${impactsToInsert.length}`);
    console.log(`   • Cities used:              ${cities.length}`);
    console.log(`   • Event types:              ${eventTypes.join(', ')}`);
    console.log('\n🗓️  TIME DISTRIBUTION:');
    TIME_BUCKETS.forEach(b => {
        const count = b.count;
        console.log(`   • Day ${b.from.toString().padStart(2, '0')}–${b.to.toString().padStart(2, '0')}: ${count} events`);
    });
    console.log(`\n   Total:  ${TIME_BUCKETS.reduce((s, b) => s + b.count, 0)} events\n`);
    process.exit(0);
}

seedLiveEvents();
