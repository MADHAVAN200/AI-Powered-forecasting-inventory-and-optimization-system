import express from 'express';
import { mlController } from '../controllers/mlController.js';

const router = express.Router();

router.post('/train/event', mlController.trainEvent);
router.post('/train/trend', mlController.trainTrend);
router.post('/train/weather', mlController.trainWeather);
router.post('/train/federated', mlController.trainFederated);

export default router;
