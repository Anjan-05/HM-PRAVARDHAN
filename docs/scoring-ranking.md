# HM Pravardhan — Scoring & Ranking Methodology

## 1. Institutional Evaluation Framework

Headmasters are evaluated across **six core domains**, each with a defined weight:

| Domain | Key | Weight | Maximum Contribution | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Academic Performance** | `academic` | **30%** (0.30) | 30.0 pts | SSC Pass %, standardized scores, learning outcomes |
| **School Management** | `schoolMgmt` | **20%** (0.20) | 20.0 pts | Student attendance, dropout reduction, safety, SMCs |
| **Student Development** | `studentDev` | **15%** (0.15) | 15.0 pts | Sports tournaments, science exhibits, clubs |
| **Teacher Management** | `teacherMgmt` | **15%** (0.15) | 15.0 pts | Faculty attendance, lesson plans, mentorship |
| **Infrastructure & Facilities** | `infrastructure` | **10%** (0.10) | 10.0 pts | Sanitation, drinking water, labs, classroom upkeep |
| **Administrative Governance** | `admin` | **10%** (0.10) | 10.0 pts | MDM audits, grant utilization, report compliance |
| **Total Base Potential** | | **100%** | **100.0 pts** | |

---

## 2. Base Score Formula

$$\text{Base Score} = \sum_{i=1}^{6} (\text{Category Score}_i \times \text{Weight}_i)$$

* Every category score is an integer or decimal between $0$ and $100$.
* The Base Score is capped at **100.0 points**.

---

## 3. Bonus Credits Formula

Headmasters can submit verifiable achievements (state awards, zero-dropout initiatives, green school certifications).
* Upon DEO verification, an achievement awards **1 to 3 bonus credits**.
* To prevent distortion of core academic responsibilities, bonus credits are strictly **capped at 10.0 points**.

$$\text{Approved Bonus Credits} = \min\left(10.0, \sum \text{Verified Credits}\right)$$

---

## 4. Final Performance Score

$$\text{Final Score} = \text{Base Score} + \text{Approved Bonus Credits}$$

* Theoretical maximum: **110.0 points**.

---

## 5. Ranking Algorithm & Tie Breaking

Rankings are calculated across three tiers:
1. **Overall State Rank (`overallRank`)**: All schools across Telangana.
2. **District Rank (`districtRank`)**: Schools within the same educational district.
3. **Mandal Rank (`mandalRank`)**: Schools within the same mandal.

### Tie-Breaking Priority:
1. Higher **Final Score**
2. Higher **Base Score**
3. Higher **Academic Performance Domain Score**
4. Alphabetical by school name

---

## 6. Trajectory & Rank Change

For evaluation terms following the baseline (e.g., Term 2, Term 3):
$$\text{Rank Change} = \text{Previous Rank} - \text{Current Rank}$$

* $\text{Rank Change} > 0$: The HM ascended in ranking (e.g., $+2$ positions).
* $\text{Rank Change} < 0$: The HM declined in ranking (e.g., $-1$ positions).
* $\text{Rank Change} = 0$: The HM maintained their ranking.
