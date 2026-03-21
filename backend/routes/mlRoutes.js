import express from 'express';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { mlController } from '../controllers/mlController.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const checkoutVisionUploadDir = path.resolve(
    __dirname,
    '..',
    'uploads',
    'checkout-vision'
);

fs.mkdirSync(checkoutVisionUploadDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, checkoutVisionUploadDir);
    },
    filename: (_req, file, cb) => {
        const extension = path.extname(file.originalname) || '.png';
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`;
        cb(null, uniqueName);
    },
});

const upload = multer({ storage });

router.post('/train/event', mlController.trainEvent);
router.post('/train/trend', mlController.trainTrend);
router.post('/train/weather', mlController.trainWeather);
router.post('/train/federated', mlController.trainFederated);
router.post('/checkout-vision/analyze', upload.single('image'), mlController.analyzeCheckoutVision);
router.get('/modules/:moduleKey', mlController.getModuleData);
router.post('/modules/stock-rebalancing/approve', mlController.approveStockTransfer);
router.post('/modules/:moduleKey/:collectionKey', mlController.addModuleDataItem);

export default router;
