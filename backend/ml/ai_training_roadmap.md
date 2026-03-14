# OptiFresh AI Model Training Implementation Plan

## Executive Summary

This plan outlines the phased implementation of the OptiFresh AI intelligence stack, following a **signal-first architecture** where external intelligence models (Event, Trend, Weather) are trained before the central Demand Forecast Engine.

**Total Timeline**: 18-21 weeks  
**Architecture**: Signals Layer → Feature Fusion → Demand Engine  
**Deployment Model**: Centralized training with federated inference

---

## Phase 0: Data Foundation (Weeks 1-4)

### Objectives
Establish a unified training dataset at **Store × SKU × Date** granularity with 2-3 years of historical coverage.

### Data Sources & Integration

#### Internal Operational Data
- **Sales Transactions**: Daily units sold per store/SKU
- **Inventory History**: Stock levels, safety stock, optimal stock
- **Promotional Campaigns**: Discount flags, campaign dates
- **Stockout Incidents**: Out-of-stock events and duration
- **Replenishment Cycles**: Transfer history from warehouses

#### External Intelligence Signals
- **Event Calendars**: Local festivals, concerts, sports, holidays
- **Weather Data**: Temperature, humidity, precipitation, alerts
- **Trend Proxies**: Search interest (Google Trends), social buzz indicators

---

## Phase 1: Signal Intelligence Models (Weeks 5-10)

### 1.1 Event Intelligence Model (COMPLETED)

#### Training Objective
Predict **demand uplift %** caused by local events across different product categories.

#### Current Stats (as of Feb 2026)
- **Training Samples**: 20,000
- **Test Samples**: 10,000
- **Primary Metric (MAPE)**: 12.14%
- **Directional Accuracy**: 91.80%

---

### 1.2 Trend Intelligence Model (Next Phase)

#### Training Objective
Predict **sales acceleration rate** and momentum direction.

#### Model Architecture
- **Production**: LightGBM for multi-signal fusion
- **Experimental**: LSTM for pure momentum sequences

---

### 1.3 Weather Intelligence Model (Following Trends)

#### Training Objective
Predict **demand deviation %** caused by weather anomalies.

#### Model Architecture
- **Production**: Random Forest for nonlinear weather-demand relationships

---

## Phase 2: Feature Fusion Pipeline (Weeks 11-13)

### Objectives
Normalize and harmonize signal intelligence outputs into a unified feature vector for the Demand Engine.

---

## Phase 3: Demand Forecast Engine (Weeks 14-19)

### Training Objective
Forecast **future SKU-level demand** at 3, 7, and 14-day horizons.

---

## Phase 4: Model Evaluation & Governance (Weeks 20-21)

### Evaluation Metrics by Model

| Model | Primary Metric | Target |
|-------|---------------|--------|
| Event Intelligence | Uplift MAPE | < 15% |
| Trend Intelligence | Momentum Accuracy | > 80% |
| Weather Intelligence | Deviation RMSE | < 10% |
| Demand Forecast | WMAPE | < 12% |

---

## Technology Stack

### Machine Learning
- **XGBoost/LightGBM**: Signal intelligence models
- **Prophet**: Baseline forecasting
- **PyTorch**: Deep learning (TFT, DeepAR)

---

## Next Steps

1. **Phase 1.2 Start**: Transition to Trend Intelligence modeling.
2. **Feature Fusion Design**: Begin architecting the fusion layer.
