# HM Pravardhan — Backend Architecture

This directory houses the backend server logic, RESTful API routing, and institutional calculation engines.

---

## Directory Structure

```
backend/
├── src/
│   ├── routes/          # Express API route declarations
│   ├── controllers/     # Request dispatchers and response formatting
│   ├── services/        # Business logic and notification dispatches
│   ├── middleware/      # Role-based authorization & header verification
│   ├── scoring/         # Weighted scoring calculation algorithms
│   ├── ranking/         # State, District, and Mandal ranking generation
│   └── database/        # JSON & Relational store adapter
├── package.json
└── README.md
```

## Key Modules

* **Scoring Engine (`src/scoring/scoringEngine.ts`)**:
  Calculates the 100-point base score across 6 domains, applies bonus credit caps (max 10 points), and outputs the final score.

* **Ranking Engine (`src/ranking/rankingEngine.ts`)**:
  Computes State, District, and Mandal standings, and computes previous rank trajectory (`rankChange`).

* **Auth & Authorization Middleware (`src/middleware/authMiddleware.ts`)**:
  Protects endpoints according to user roles: `VISITOR`, `HEADMASTER`, `MEO`, and `DEO`.
