# Walmart OptiFresh - AI-Powered Inventory Intelligence

**Intelligent Freshness. Zero Waste.**

Walmart OptiFresh is a comprehensive, enterprise-level AI solution designed to revolutionize fresh food inventory management. Built as a part of the **Walmart Sparkathon Initiative**, the platform unifies the supply chain—from vendors to retail staff—using advanced predictive analytics, autonomous vision systems, and federated learning to eliminate waste and maximize delivery value.

---

## Architecture Overview

The project is structured as a **Monorepo** for seamless development and deployment of both the user interface and the machine learning backbone.

-   **Frontend (`/frontend`)**: A high-performance React application built with Vite and Tailwind CSS. It features a dark glassmorphism aesthetic, interactive dashboards using Recharts, and a modular component library (shadcn/ui).
-   **Backend (`/backend`)**: A robust Node.js Express server following a strict **MVC (Model-View-Controller)** pattern.
    -   **Routes**: Maps API endpoints for data fetching and ML model triggers.
    -   **Controllers**: Manages the request/response lifecycle.
    -   **Services**: Handles business logic and spawns Python subprocesses for machine learning.
-   **Machine Learning (`/backend/ml`)**: A suite of Python-driven intelligence engines utilizing Jupyter Notebooks (`.ipynb`) for training and JSON for live reporting.

---

## Core Features

### 1. Enterprise Control Tower
The central "cockpit" of the application. It provides modular access to all intelligence subsystems, allowing operational staff to observe data freshness, regional health, and cross-module recommendations in one unified view.

### 2. Intelligence Engines
*   **Event Intelligence**: Tracks over 500+ realistic Indian events (festivals, holidays, local gatherings) to predict localized demand spikes.
*   **Trend Intelligence**: Monitors category-level popularity and product momentum using rolling average momentum models.
*   **Weather Intelligence**: Correlates 7-day weather forecasts with demand patterns, specifically flagging spoilage risks for perishables during heatwaves or logistical delays during storms.
*   **Demand Forecast Engine**: Provides high-accuracy, SKU-level demand predictions using historical baselines and real-time signal reconciliation.

### 3. Operational Planning & Execution
*   **Scenario Planning (What-If)**: A simulation environment where managers can adjust event impacts, weather severity, and trend momentum to see projected demand deltas before they happen.
*   **Inventory Risk Dashboard**: Real-time detection of imminent stockouts and overstock warnings based on predicted demand vs. on-hand inventory.
*   **Stock Rebalancing**: Identifies opportunities for inter-store transfers, allowing stores with low demand to supply those with high-velocity gaps, preventing both waste and lost sales.
*   **Logistics Pipeline**: End-to-end tracking of goods in transit with automated delay alerts.

### 4. Autonomous Store Technology
*   **Live Checkout Monitoring**: Real-time monitoring of self-checkout lanes with anomaly detection to improve lane throughput.
*   **Vision-Based Verification**: AI-assisted product recognition that validates scans at the point of sale to prevent misscans and inventory shrinkage.

### 5. AI System Governance
*   **Federated Learning Panel**: Manages privacy-preserving model updates across edge stores, aggregating local weights into a global "consensus" model.
*   **Model Health & Drift**: Continuous monitoring of model accuracy (MAPE, R² Score) and CV accuracy to detect performance degradation over time.

---

## AI Insights Panel
Every intelligence module is powered by a dynamic **AI Insights Panel**. This component uses NLP-style logic to explain the "Why" behind the data:
-   **Restock Alerts**: Highlights which products need urgent replenishment based on upcoming events or trends.
-   **Reduction Suggestions**: Identifies overstock risks where markdown or reallocation is needed.
-   **Cross-Region Transfers**: Suggests specific "From → To" storage movements to optimize regional availability.
-   **Performance Metrics**: Surfaces real-time training stats (Directional Accuracy, R² Score, CV MAPE).

---

## Getting Started

### Prerequisites
-   Node.js (v18+)
-   Python (v3.10+) with `jupyter` and `nbconvert` installed.

### Installation & Run
From the root directory, simply run:

```bash
# Install all dependencies (Root, Frontend, Backend)
npm install
npm run install:all

# Start both Frontend and Backend concurrently
npm start
```

-   **Frontend**: Runs on [http://localhost:5173](http://localhost:5173)
-   **Backend**: Runs on [http://localhost:3001](http://localhost:3001)

### Checkout Vision Setup

The warehouse app now includes the multimodal checkout vision workflow at `/checkout-vision`.

1. Copy the multimodal inference assets into `backend/ml/checkout_vision/`:
   - `pipeline.py`
   - `multimodal_classifier.py`
   - `labels.json`
   - `weights/`
2. Create `backend/.env.local` from `backend/.env.example`.
3. Set `CHECKOUT_VISION_PYTHON` to the Python executable that already has `ultralytics`, `easyocr`, `torch`, `torchvision`, and `transformers` installed.
4. Start the backend and frontend.
5. Open `http://localhost:5173/checkout-vision`.

The page preloads a default `multiproduct.png` sample and automatically runs inference when it loads.

---

## Technology Stack
-   **UI**: React, Vite, Tailwind CSS, Lucide React, Recharts.
-   **Server**: Node.js, Express, CORS.
-   **ML**: Python, Jupyter, Scikit-Learn, Prophet, lightGBM.
-   **Database/Storage**: Supabase (PostgreSQL), JSON Flat Files.

