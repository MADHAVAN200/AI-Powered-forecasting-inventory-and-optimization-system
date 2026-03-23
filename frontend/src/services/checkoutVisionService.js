const API_BASE = 'http://localhost:3001/api';

async function parseResponse(res) {
    const payload = await res.json();
    if (!res.ok || payload?.success === false) {
        throw new Error(payload?.error || payload?.message || `Request failed with ${res.status}`);
    }
    return payload;
}

export const checkoutVisionService = {
    async analyzeImage(file) {
        const formData = new FormData();
        formData.append('image', file);

        const res = await fetch(`${API_BASE}/checkout-vision/analyze`, {
            method: 'POST',
            body: formData,
        });

        const payload = await parseResponse(res);
        return payload.data;
    },
};
