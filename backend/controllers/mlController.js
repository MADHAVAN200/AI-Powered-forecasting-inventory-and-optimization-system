import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { mlService } from '../services/mlService.js';
import { moduleDataStore } from '../services/moduleDataStore.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const mlBasePath = path.join(__dirname, '..', 'ml');

export const mlController = {
    trainEvent: async (req, res) => {
        try {
            const result = await mlService.triggerTraining(path.join(mlBasePath, 'event_intelligence', 'driver.py'));
            res.json(result);
        } catch (error) {
            res.status(500).json(error);
        }
    },
    trainTrend: async (req, res) => {
        try {
            const result = await mlService.triggerTraining(path.join(mlBasePath, 'trend_intelligence', 'driver.py'));
            res.json(result);
        } catch (error) {
            res.status(500).json(error);
        }
    },
    trainWeather: async (req, res) => {
        try {
            const result = await mlService.triggerTraining(path.join(mlBasePath, 'weather_intelligence', 'driver.py'));
            res.json(result);
        } catch (error) {
            res.status(500).json(error);
        }
    },
    trainFederated: async (req, res) => {
        try {
            const result = await mlService.triggerTraining(path.join(mlBasePath, 'federated', 'driver.py'));
            res.json(result);
        } catch (error) {
            res.status(500).json(error);
        }
    },
    analyzeCheckoutVision: async (req, res) => {
        const uploadedFile = req.file;

        if (!uploadedFile) {
            return res.status(400).json({ error: 'image file is required' });
        }

        try {
            const result = await mlService.runCheckoutVision(uploadedFile.path);
            res.json({ success: true, data: result });
        } catch (error) {
            res.status(500).json({
                error: error.error || 'Checkout vision inference failed',
                details: error.details || error.message,
            });
        } finally {
            await fs.unlink(uploadedFile.path).catch(() => null);
        }
    },
    getModuleData: async (req, res) => {
        const { moduleKey } = req.params;
        const filters = Object.entries(req.query || {}).reduce((acc, [key, value]) => {
            if (value !== undefined && value !== null && String(value).trim() !== '') {
                acc[key] = value;
            }
            return acc;
        }, {});

        const payload = await moduleDataStore.getModule(moduleKey, filters);

        if (!payload) {
            return res.status(404).json({ error: `Unknown module: ${moduleKey}` });
        }

        res.json({ success: true, data: payload });
    },
    addModuleDataItem: async (req, res) => {
        const { moduleKey, collectionKey } = req.params;
        const item = req.body || {};

        try {
            const saved = await moduleDataStore.addItem(moduleKey, collectionKey, item);
            res.status(201).json({ success: true, data: saved });
        } catch (error) {
            res.status(400).json({ error: error.message || 'Failed to add item' });
        }
    },
    updateModuleDataItem: async (req, res) => {
        const { moduleKey, collectionKey, itemId } = req.params;
        const item = req.body || {};

        try {
            const saved = await moduleDataStore.updateItem(moduleKey, collectionKey, itemId, item);
            res.json({ success: true, data: saved });
        } catch (error) {
            res.status(400).json({ error: error.message || 'Failed to update item' });
        }
    },
    updateVendorRequestDecision: async (req, res) => {
        const { requestId } = req.params;
        const { decision, note, request } = req.body || {};

        if (!requestId) {
            return res.status(400).json({ error: 'requestId is required' });
        }

        if (!decision) {
            return res.status(400).json({ error: 'decision is required' });
        }

        const reviewedAt = new Date().toISOString();
        const normalizedRequest = {
            ...(request || {}),
            id: requestId,
            status: decision,
            decision,
            decisionNote: note || '',
            reviewedAt,
        };

        try {
            await moduleDataStore.addItem('vendorPortal', 'requests', normalizedRequest);
            await moduleDataStore.addItem('vendorPortal', 'requestActions', {
                id: `VP-ACT-${Date.now()}`,
                requestId,
                decision,
                note: note || '',
                actedAt: reviewedAt,
            });

            const payload = await moduleDataStore.getModule('vendorPortal');
            res.json({
                success: true,
                data: {
                    request: normalizedRequest,
                    requests: payload?.requests || [],
                    requestActions: payload?.requestActions || [],
                },
            });
        } catch (error) {
            res.status(400).json({ error: error.message || 'Failed to update request decision' });
        }
    },
    approveStockTransfer: async (req, res) => {
        const { transferId } = req.body || {};

        if (!transferId) {
            return res.status(400).json({ error: 'transferId is required' });
        }

        res.json({
            success: true,
            message: `Transfer ${transferId} approved and queued for execution`
        });
    }
};
