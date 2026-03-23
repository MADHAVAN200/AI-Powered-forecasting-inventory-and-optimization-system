import express from 'express';
import cors from 'cors';
import mlRoutes from './routes/mlRoutes.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';


const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function loadEnvFile(filePath) {
    if (!fs.existsSync(filePath)) return;
    const raw = fs.readFileSync(filePath, 'utf-8');
    raw.split(/\r?\n/).forEach((line) => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) return;
        const idx = trimmed.indexOf('=');
        if (idx === -1) return;
        const key = trimmed.slice(0, idx).trim();
        const value = trimmed.slice(idx + 1).trim();
        if (!process.env[key]) {
            process.env[key] = value;
        }
    });
}

loadEnvFile(path.join(__dirname, '.env.local'));
loadEnvFile(path.join(__dirname, '.env'));

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api', mlRoutes);


const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Backend API Server running on http://localhost:${PORT}`);
});
