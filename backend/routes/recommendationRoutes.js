import express from 'express';
import { recommendationController } from '../controllers/recommendationController.js';

const router = express.Router();

router.get('/', recommendationController.getAll);
router.get('/stats', recommendationController.getStats);

export default router;
