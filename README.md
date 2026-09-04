# HM Pravardhan (హెచ్.ఎం. ప్రవర్ధన్)
### Government School Headmaster Institutional Evaluation, Performance & Ranking Platform
**Department of School Education — Government of Telangana**

---

## 1. What is HM Pravardhan?

**HM Pravardhan** is a state-level institutional performance evaluation and accountability platform designed for the Department of School Education, Government of Telangana. It establishes an objective, transparent, data-driven system to benchmark and support Gazetted Headmasters (HMs) across government secondary schools.

Instead of evaluating schools solely on subjective annual reports or single-point pass percentages, HM Pravardhan combines:
* **Multi-domain institutional weighting** (Academic, School Management, Student Development, Teacher Governance, Infrastructure, and Administration)
* **Verified achievement bonus credits** (up to 10 points)
* **Real-time multi-tier rankings** (Statewide, District, and Mandal levels)
* **Class 10 SSC examination marks monitoring**
* **Direct grievance redressal & score appeals**

---

## 2. Main Features

* **Immediate Headmaster Ranking Visibility**: When a Headmaster logs in, their official ranking standing is displayed right at the top of their dashboard:
  * **Current Rank** (State Level)
  * **Mandal Rank**
  * **District Rank**
  * **Previous Rank** (Preceding evaluation term)
  * **Rank Change** (Climbed or dropped positions)
* **Performance Evolution Graph**: Placed in the **Performance History** tab, rendering 3-term trajectories across Term 1, Term 2, and Term 3 with dynamic score progression and rank trajectory.
* **Class 10 Board Analytics**: Headmasters directly record student-level marks across all 6 Telangana SSC subjects (Telugu, Hindi, English, Mathematics, Science, Social Studies) with automatic total, percentage, GPA grade, and pass verification.
* **Verified Achievement Incentives**: Headmasters can submit verifiable school honors (science exhibitions, sports titles, campus greening); DEOs review and award 1 to 3 bonus credits (capped at 10.0 pts).
* **Bottleneck Grievance Redressal**: Headmasters file official bottlenecks (staff shortages, infrastructure delays) with tracking numbers directly to the District Education Officer.
* **Score Appeals**: Formal re-evaluation requests allowing Headmasters to dispute category scores with documentary evidence.
* **Public Transparency Portal**: Citizens and parents can search any school or Headmaster in Telangana, inspect performance trends, and browse statewide rankings.

---

## 3. The Four Access Options

The application provides four distinct roles with strict permission boundaries:

| # | Role | Access Level | Primary Responsibilities |
|---|---|---|---|
| **1** | **Visitor (Public)** | Read-Only | Public citizen access to view statewide school rankings, search Headmaster profiles, and inspect verified school activities. No administrative controls. |
| **2** | **Headmaster** | Institutional | Private dashboard with immediate personal ranking metrics, Class 10 student marks management, achievement submissions, and grievance filing. |
| **3** | **Mandal Education Officer (MEO)** | Sub-District Supervisory | Mandal-wide school inspections, student performance reviews, and achievement preliminary verifications. |
| **4** | **District Education Officer (DEO)** | District Executive | District-wide analytics, final achievement bonus credit verification, grievance resolution, and score appeal adjudications. |

---

## 4. Project Structure

The project is cleanly separated into modular domains:

```
HM-Pravardhan/
│
├── frontend/                     # Frontend client documentation and package definition
├── backend/                      # Backend API, calculation engines, and package definition
│   └── src/
│       ├── routes/               # REST API route endpoints
│       ├── middleware/           # Role authorization middleware
│       ├── scoring/              # 6-category weighted scoring algorithms
│       ├── ranking/              # Statewide, District, Mandal ranking recalculation
│       └── database/             # Store access adapter
├── shared/                       # Safely shared definitions between frontend and backend
│   ├── types/                    # Shared TypeScript interfaces (User, School, Record, etc.)
│   ├── constants/                # Role constants (VISITOR, HEADMASTER, MEO, DEO) & weights
│   ├── schemas/                  # Data validation rules
│   └── utils/                    # Scoring, ranking, and sorting calculations
├── database/                     # Relational schema and seed definitions
│   ├── schema/                   # PostgreSQL schema (schema.sql)
│   ├── migrations/               # Database migration scripts (001_initial_schema.sql)
│   ├── seed/                     # Seed data loader module
│   └── README.md                 # Documentation of all 14 data models
├── docs/                         # Comprehensive project documentation
│   ├── architecture.md           # System topology and layer breakdown
│   ├── api.md                    # REST API endpoints and payloads
│   ├── database.md               # Data entity relationships and seed generation
│   ├── scoring-ranking.md        # Mathematical scoring and ranking formulas
│   └── roles-permissions.md     # Permission matrix across the 4 roles
├── src/                          # Active React 18 TypeScript frontend source
│   ├── components/
│   │   ├── common/               # Navbar, Footer, Notifications
│   │   ├── hm/                   # Headmaster Dashboard, History, Performance Graph, Students
│   │   ├── meo/                  # Mandal Education Officer Dashboard
│   │   ├── deo/                  # District Education Officer Dashboard
│   │   ├── public/               # State Rankings Table, HM Profile, Activity Feed
│   │   └── auth/                 # Login Modal and session handling
│   ├── context/                  # AuthContext for role sessions
│   ├── api.ts                    # Frontend API connector
│   └── types.ts                  # Client types
├── server/                       # Express server implementation & JSON database
├── server.ts                     # Full-stack server entry point (Vite + Express on Port 3000)
├── package.json                  # Root workspace package manager
└── README.md                     # This documentation file
```

---

## 5. Mathematical Scoring Model

### 5.1 Base Score (Out of 100)
$$\text{Base Score} = \sum (\text{Category Score} \times \text{Weight})$$

* **Academic Performance**: 30% (Weight: 0.30)
* **School Management**: 20% (Weight: 0.20)
* **Student Development**: 15% (Weight: 0.15)
* **Teacher Management**: 15% (Weight: 0.15)
* **Infrastructure & Facilities**: 10% (Weight: 0.10)
* **Administrative Governance**: 10% (Weight: 0.10)

### 5.2 Final Score (Out of 110)
$$\text{Final Score} = \text{Base Score} + \text{Approved Bonus Credits}$$
* Bonus credits are awarded for verified achievements (1 to 3 credits each).
* Capped at **10.0 points maximum** to preserve core academic focus.

---

## 6. How to Install and Run

### Prerequisites
* Node.js (v18 or v20 recommended)
* npm (v9 or v10)

### Step 1: Install Dependencies
From the project root:
```bash
npm install
```

### Step 2: Run in Development Mode
Starts the full-stack server (Express backend + Vite frontend) on **Port 3000**:
```bash
npm run dev
```
Open your browser and navigate to:
```
http://localhost:3000
```

### Step 3: Production Build
```bash
npm run build
npm start
```

---

## 7. Environment Variables

Create a `.env` file in the root directory (based on `.env.example`):
```env
PORT=3000
NODE_ENV=development
```

---

## 8. Package Management (Option B)

To maintain maximum stability and eliminate runtime container disruptions, this project uses **Option B (Root Workspace Management)**:
* A single unified root `package.json` coordinates all dependencies for Vite, Express, and TypeScript.
* Modular `frontend/package.json` and `backend/package.json` declarations are provided for independent deployment or containerization if decoupled microservices are required in the future.
