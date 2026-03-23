const API_BASE = 'http://localhost:3001/api';

async function parseResponse(res) {
    const payload = await res.json();
    if (!res.ok || payload?.success === false) {
        throw new Error(payload?.error || payload?.message || `Request failed with ${res.status}`);
    }
    return payload;
}

export const backendModuleService = {
    async getModuleData(moduleKey) {
        const res = await fetch(`${API_BASE}/modules/${moduleKey}`);
        const payload = await parseResponse(res);
        return payload.data;
    },

    async approveStockTransfer(transferId, reason = 'demand') {
        const res = await fetch(`${API_BASE}/modules/stock-rebalancing/approve`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ transferId, reason }),
        });
        return parseResponse(res);
    },

    async addModuleItem(moduleKey, collectionKey, item) {
        const res = await fetch(`${API_BASE}/modules/${moduleKey}/${collectionKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item),
        });
        return parseResponse(res);
    }
};
