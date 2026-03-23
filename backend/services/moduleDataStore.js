import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { moduleDataSeed } from '../data/moduleData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataFilePath = path.join(__dirname, '..', 'data', 'moduleData.json');
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const collectionMap = {
    alerts: ['alerts'],
    logistics: ['transfers'],
    stockRebalancing: ['recommendations'],
    federatedLearning: ['edgeNodes', 'logs']
};

function clone(value) {
    return JSON.parse(JSON.stringify(value));
}

function isSupabaseConfigured() {
    return Boolean(supabaseUrl && supabaseKey);
}

async function supabaseRequest(endpoint, options = {}) {
    const url = `${supabaseUrl}/rest/v1/${endpoint}`;
    const res = await fetch(url, {
        ...options,
        headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
            ...(options.headers || {})
        }
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Supabase error ${res.status}: ${text}`);
    }

    if (res.status === 204) return null;
    return res.json();
}

async function getSupabaseItems(moduleKey, collectionKey) {
    if (!isSupabaseConfigured()) return [];

    const query = `module_records?module_key=eq.${encodeURIComponent(moduleKey)}&collection_key=eq.${encodeURIComponent(collectionKey)}&select=payload,created_at&order=created_at.desc`;
    const rows = await supabaseRequest(query, { method: 'GET' });
    return (rows || []).map(r => r.payload);
}

async function addSupabaseItem(moduleKey, collectionKey, item) {
    if (!isSupabaseConfigured()) return null;

    const payload = {
        module_key: moduleKey,
        collection_key: collectionKey,
        item_id: item?.id || `${Date.now()}`,
        payload: item
    };

    await supabaseRequest('module_records', {
        method: 'POST',
        headers: {
            Prefer: 'resolution=merge-duplicates,return=representation'
        },
        body: JSON.stringify(payload)
    });

    return item;
}

async function ensureDataFile() {
    try {
        await fs.access(dataFilePath);
    } catch {
        await fs.writeFile(dataFilePath, JSON.stringify(moduleDataSeed, null, 2), 'utf-8');
    }
}

async function readData() {
    await ensureDataFile();
    const raw = await fs.readFile(dataFilePath, 'utf-8');
    return JSON.parse(raw);
}

async function writeData(data) {
    await fs.writeFile(dataFilePath, JSON.stringify(data, null, 2), 'utf-8');
}

export const moduleDataStore = {
    async getModule(moduleKey) {
        const seed = moduleDataSeed[moduleKey];
        if (!seed) return null;

        const result = clone(seed);
        const collections = collectionMap[moduleKey] || [];

        for (const collectionKey of collections) {
            try {
                const remoteItems = await getSupabaseItems(moduleKey, collectionKey);
                if (remoteItems.length > 0) {
                    result[collectionKey] = remoteItems;
                }
            } catch (error) {
                // If Supabase table/policies are not ready, silently fall back to local file.
                const local = await readData();
                if (local?.[moduleKey]?.[collectionKey]) {
                    result[collectionKey] = local[moduleKey][collectionKey];
                }
            }
        }

        return result;
    },

    async addItem(moduleKey, collectionKey, item) {
        const seed = moduleDataSeed[moduleKey];
        if (!seed) throw new Error(`Unknown module: ${moduleKey}`);
        if (!Array.isArray(seed[collectionKey])) {
            throw new Error(`Collection '${collectionKey}' not found on module '${moduleKey}'`);
        }

        if (isSupabaseConfigured()) {
            try {
                await addSupabaseItem(moduleKey, collectionKey, item);
                return item;
            } catch (error) {
                throw new Error(
                    `${error.message}. Run SQL from backend/database/create_module_records_table.sql in Supabase and verify RLS policies.`
                );
            }
        }

        // Fallback for local-only development when Supabase env is not set
        const data = await readData();
        const targetModule = data[moduleKey] || {};
        if (!Array.isArray(targetModule[collectionKey])) targetModule[collectionKey] = [];
        targetModule[collectionKey].unshift(item);
        data[moduleKey] = targetModule;
        await writeData(data);
        return item;
    }
};
