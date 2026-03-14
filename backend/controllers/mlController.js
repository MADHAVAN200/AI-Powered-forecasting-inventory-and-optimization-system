import path from 'path';
import { fileURLToPath } from 'url';
import { mlService } from '../services/mlService.js';

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
    }
};
