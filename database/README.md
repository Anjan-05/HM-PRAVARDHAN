# HM Pravardhan — Database Architecture & Data Models

This directory contains the database schema, migration scripts, and seed dataset definitions for **HM Pravardhan** (Telangana Institutional Headmaster Performance Evaluation System).

---

## Data Models Overview

The database is designed with normalized relational models supporting institutional evaluation, governance workflows, and public transparency.

### 1. `districts`
Represents educational revenue districts across Telangana.
* `id`: Unique identifier (e.g., `dist-warangal-urban`)
* `name`: District name (e.g., "Hanamkonda / Warangal Urban")
* `state`: State jurisdiction ("Telangana")
* `created_at`: Timestamp

### 2. `mandals`
Sub-district administrative educational zones.
* `id`: Unique identifier (e.g., `mandal-kazipet`)
* `name`: Mandal name (e.g., "Kazipet")
* `district_id`: Foreign key referencing `districts.id`

### 3. `schools`
Government and model secondary educational institutions.
* `id`: Unique school identifier
* `school_code`: U-DISE+ institutional code (e.g., `TG-SCH-1001`)
* `name`: Official school name (e.g., `Zilla Parishad High School, Kazipet`)
* `district`: District location
* `mandal`: Mandal jurisdiction
* `category`: School level (`High School (6-10)`, `Higher Secondary (6-12)`, etc.)
* `student_count`: Total enrolled student population
* `teacher_count`: Active sanctioned faculty count
* `headmaster_id`: Reference to assigned Headmaster
* `headmaster_name`: Name of Headmaster in charge

### 4. `headmasters`
Gazetted Headmasters subject to institutional evaluation.
* `id`: Unique HM identifier
* `user_id`: Reference to `users.id` for login authentication
* `employee_code`: Telangana Treasury / HRMS employee code (e.g., `TS-HM-40112`)
* `name`: Full name of the Headmaster
* `email`: Institutional email address
* `qualification`: Academic degrees (e.g., "M.Sc, M.Ed")
* `experience_years`: Years in educational administration
* `school_id`: Assigned institutional posting

### 5. `performance_records`
Evaluation records generated per academic term (Term 1, Term 2, Term 3).
* `id`: Unique performance record ID
* `headmaster_id`: Foreign key to `headmasters.id`
* `school_id`: Foreign key to `schools.id`
* `evaluation_period`: Term label (`Term 1 (2025-26)`, `Term 2 (2025-26)`, `Term 3 (2025-26)`)
* `period_order`: Chronological ordering (1, 2, 3)
* `categories`: JSON or individual columns for 6 core domains:
  1. `academic`: 30% weight
  2. `school_mgmt`: 20% weight
  3. `student_dev`: 15% weight
  4. `teacher_mgmt`: 15% weight
  5. `infrastructure`: 10% weight
  6. `admin`: 10% weight
* `base_score`: Weighted sum of 6 categories (max 100.0)
* `approved_bonus_credits`: Verified achievement bonus credits (capped at 10.0)
* `final_score`: `base_score + approved_bonus_credits` (max 110.0)
* `previous_period_score`: Final score from the preceding evaluation term
* `improvement_percentage`: Percentage growth vs preceding term
* `performance_trend`: Trend direction (`UP`, `DOWN`, `STABLE`, `BASELINE`)
* `evaluated_by`: Designated evaluating education officer

### 6. `rankings`
Derived standing computed per evaluation period across three administrative tiers:
* `overall_rank`: Statewide standing among all Headmasters in Telangana
* `district_rank`: Standing within the Headmaster's district
* `mandal_rank`: Standing within the Headmaster's local mandal
* `previous_rank`: Overall rank in preceding evaluation period
* `rank_change`: Position delta (`previous_rank - overall_rank`)
  * Positive values indicate rank ascent (e.g., `+2` positions climbed)
  * Negative values indicate rank decline (e.g., `-1` positions dropped)

### 7. `achievements`
Documented milestones and external honors submitted by Headmasters.
* `id`: Unique achievement ID
* `headmaster_id`: Submitting HM
* `title`: Name of award or achievement (e.g., "State Best Teacher Award 2025")
* `description`: Milestone narrative
* `category`: One of 10 approved categories (e.g., "Academic Achievement", "Science & Innovation")
* `status`: Workflow state:
  * `PENDING_VERIFICATION`: Awaiting MEO / DEO review
  * `VERIFIED`: Confirmed authentic
  * `REJECTED`: Disallowed or invalid evidence
  * `INFO_REQUIRED`: Returned for supplementary documentation
* `bonus_credits_awarded`: Points awarded toward evaluation (1.0 to 3.0 credits)
* `is_featured`: Flag for spotlighting on the public activity feed
* `verified_by`: Name and title of the verifying officer

### 8. `bonus_credits`
The reward points mechanism incentivizing institutional innovation.
* Contributed directly from verified achievements
* Added on top of the 100-point base score
* Hard-capped at **10.0 bonus points** to preserve baseline academic integrity

### 9. `complaints`
Institutional bottlenecks and grievances submitted by Headmasters.
* `id`: Unique complaint ID
* `complaint_number`: Official tracking reference (e.g., `CMP-2025-0104`)
* `headmaster_id`: Submitting HM
* `category`: Grievance type (`Infrastructure Problem`, `Teacher/Staff Shortage`, `Funding Issue`, etc.)
* `title`: Subject of bottleneck
* `description`: Specific impact on school performance
* `status`: `Submitted`, `Under Review`, `Resolved`, `Rejected`
* `officer_response`: Official reply and resolution action from DEO

### 10. `score_appeals`
Formal challenges against specific category evaluation scores.
* `id`: Unique appeal ID
* `appeal_number`: Official appeal reference (e.g., `APL-2025-0012`)
* `performance_record_id`: Target evaluation record
* `affected_category`: Disputed domain (e.g., `infrastructure`)
* `current_category_score`: Original score given
* `claimed_category_score`: Score requested with justification
* `status`: `SUBMITTED`, `UNDER_REVIEW`, `APPROVED`, `REJECTED`
* `adjusted_category_score`: Final adjusted score after DEO review

### 11. `activity_posts` & `activity_media`
Institutional broadcast feed for school initiatives, cultural events, and inspections.
* `id`: Unique post ID
* `headmaster_id`: Submitting HM
* `title`: Activity headline
* `category`: Event classification (`Academic Activity`, `Sports`, `Awareness Program`, etc.)
* `media`: Array of attached photo/video assets with captions
* `likes_count`: Citizen and officer engagement count

### 12. `student_records` (Student Performance)
Individual student profiles for Class 10 Board Examinations.
* `id`: Unique student ID
* `student_name`: Name of student
* `roll_number`: Hall ticket / roll number
* `school_id`: Enrolled institution
* `class_level`: "Class 10"
* `section`: Section assignment ("A", "B")
* `academic_year`: "2025-26"
* `total_marks`: Sum of 6 subjects (out of 600)
* `percentage`: Calculated score percentage
* `grade`: SSC grading scale (`A1`, `A2`, `B1`, `B2`, `C1`, `C2`, `D`, `F`)
* `passed`: Boolean pass criteria (≥35 marks in each subject)

### 13. `student_marks`
Granular scores across the 6 Telangana SSC board subjects:
1. `telugu`: First Language (out of 100)
2. `hindi`: Second Language (out of 100)
3. `english`: Third Language (out of 100)
4. `mathematics`: Mathematics (out of 100)
5. `science`: General Science (out of 100)
6. `social_studies`: Social Studies (out of 100)

### 14. `notifications`
Direct transactional alerts dispatched to user accounts.
* `id`: Notification ID
* `user_id`: Target recipient
* `type`: Event type (`SCORE_UPDATE`, `RANK_CHANGE`, `APPEAL_DECISION`, `COMPLAINT_RESPONSE`, `ACHIEVEMENT_VERIFIED`)
* `title`: Brief headline
* `message`: Explanatory message
* `is_read`: Read status flag
