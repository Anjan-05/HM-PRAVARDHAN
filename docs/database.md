# HM Pravardhan — Database Specification

## Architecture
The HM Pravardhan data store is modeled relationally to support institutional integrity, historical tracking, and hierarchical aggregations (State -> District -> Mandal -> School).

---

## Entity Relationship Overview

```
Districts ──────1:N───── Mandals
   │                       │
   │1:N                    │1:N
   ▼                       ▼
Schools ────────1:1───── Headmasters ────1:1──── Users
   │                       │
   │1:N                    │1:N
   ▼                       ├─────► Performance Records (Terms 1, 2, 3)
Student Records            ├─────► Achievements (Bonus Credits)
(Class 10 Marks)           ├─────► Complaints (Bottleneck Grievances)
                           ├─────► Score Appeals
                           └─────► Activity Posts
```

---

## Performance Records & Ranking Computation

Evaluation scores are recorded per academic term (`periodOrder`: 1 = Term 1, 2 = Term 2, 3 = Term 3).

### Key Columns in `performance_records`:
* `headmaster_id`: Identifier for the Headmaster.
* `evaluation_period`: Term name (e.g., `Term 3 (2025-26)`).
* `base_score`: Weighted sum of 6 domain scores (maximum 100.0).
* `approved_bonus_credits`: Verified achievement bonus points (maximum 10.0).
* `final_score`: Sum of base score and bonus credits (maximum 110.0).
* `overall_rank`: Rank across all Headmasters statewide.
* `district_rank`: Rank within the local district.
* `mandal_rank`: Rank within the local mandal.
* `previous_rank`: Overall rank in the preceding term.
* `rank_change`: Numeric difference (`previous_rank - overall_rank`).

---

## Seed Data Generation

The seed dataset is generated deterministically in `server/data/seedData.ts` and mirrored in `database/seed/seedData.ts`. It provides:
* 10 Secondary Schools and 10 Gazetted Headmasters
* Complete 3-Term historical evaluation records for all Headmasters
* Student Class 10 marks distributions for academic tracking
* Verified and pending achievements with bonus credits
* Filed institutional complaints and appeals
