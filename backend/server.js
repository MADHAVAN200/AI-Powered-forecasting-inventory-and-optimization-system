import express from 'express';
import cors from 'cors';
import mlRoutes from './routes/mlRoutes.js';

const app = express();

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api', mlRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Backend API Server running on http://localhost:${PORT}`);
});
