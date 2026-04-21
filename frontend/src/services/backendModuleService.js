const API_BASE = 'http://localhost:3001/api';

async function parseResponse(res) {
    const payload = await res.json();
    if (!res.ok || payload?.success === false) {
        throw new Error(payload?.error || payload?.message || `Request failed with ${res.status}`);
    }
    return payload;
}

export const backendModuleService = {
    async getModuleData(moduleKey, filters = {}) {
        const queryParams = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value) queryParams.append(key, value);
        });
        const queryString = queryParams.toString();
        const url = `${API_BASE}/modules/${moduleKey}${queryString ? `?${queryString}` : ''}`;
        
        const res = await fetch(url);
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
    },

    async updateModuleItem(moduleKey, collectionKey, itemId, item) {
        const res = await fetch(`${API_BASE}/modules/${moduleKey}/${collectionKey}/${itemId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item),
        });
        return parseResponse(res);
    },

    async recordVendorRequestDecision(requestId, decision, request, note = '') {
        const res = await fetch(`${API_BASE}/modules/vendorPortal/requests/${requestId}/decision`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ decision, request, note }),
        });
        return parseResponse(res);
    }
};
