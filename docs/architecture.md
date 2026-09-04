# HM Pravardhan — System Architecture

## Overview
**HM Pravardhan** is an institutional evaluation and accountability platform designed for the Department of School Education, Government of Telangana. It benchmarks the performance of Gazetted Headmasters across secondary schools in Telangana, providing data-driven governance, verified incentive credits, and public transparency.

---

## Architectural Principles

1. **Role Isolation**: Strict separation between public citizens and authenticated administrators.
2. **Transparent Scoring**: Deterministic, weighted evaluation algorithms ensuring fair statewide assessments.
3. **Traceable Verification**: Bonus credits and appeal adjustments require verified officer sign-offs.
4. **Single Port Serving**: The full stack architecture integrates an Express REST API with a Vite SPA in a unified environment.

---

## High-Level Topology

```
┌─────────────────────────────────────────────────────────────┐
│                       Client Browser                        │
│  (React 18 + TypeScript + Tailwind CSS + Lucide Icons)      │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTPS / JSON
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    Vite & Express Server                    │
│                      (Port 3000 / tsx)                      │
│                                                             │
│  ┌───────────────────────┐      ┌────────────────────────┐  │
│  │   Frontend SPA Bundler│      │   REST API (/api/*)    │  │
│  └───────────────────────┘      └───────────┬────────────┘  │
│                                             │               │
│                                             ▼               │
│                                 ┌────────────────────────┐  │
│                                 │   Calculation Engine   │  │
│                                 │  (Scoring & Rankings)  │  │
│                                 └───────────┬────────────┘  │
│                                             │               │
│                                             ▼               │
│                                 ┌────────────────────────┐  │
│                                 │   Data Persistence     │  │
│                                 │ (JSON Store / Schema)  │  │
│                                 └────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## Layer Breakdown

* **Presentation Layer (`src/` / `frontend/`)**: Single-page application rendering role-tailored workspaces for Visitors, Headmasters, MEOs, and DEOs.
* **API Layer (`server/routes/` / `backend/src/routes/`)**: Express router providing RESTful JSON endpoints.
* **Domain Engine (`backend/src/scoring/`, `backend/src/ranking/`)**: Calculates weighted category scores, bonus credits, and rank trajectories.
* **Data Access Layer (`server/db.ts` / `database/`)**: Manages records, state mutations, and seed data initialization.
