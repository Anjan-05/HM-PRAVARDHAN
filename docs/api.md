# HM Pravardhan — REST API Documentation

All API endpoints are served under the `/api` prefix.

---

## 1. Authentication & Users

### `POST /api/auth/login`
Authenticates a user by email, employee code, or demo role selector.
* **Request**:
  ```json
  { "email": "hm.kazipet@telangana.gov.in" }
  ```
* **Response**:
  ```json
  {
    "user": {
      "id": "u-hm-1",
      "name": "M. Ramakrishna, M.Sc., M.Ed.",
      "email": "hm.kazipet@telangana.gov.in",
      "role": "HEADMASTER",
      "headmasterId": "hm-1"
    }
  }
  ```

### `GET /api/auth/me`
Returns current session profile.

### `GET /api/demo/users`
Returns test users for evaluating role permissions.

---

## 2. Headmasters & Schools

### `GET /api/headmasters`
Returns list of registered Headmasters with filters:
* Query parameters: `district`, `search`

### `GET /api/headmasters/:id`
Returns full profile of a single Headmaster.

### `GET /api/schools`
Returns list of schools.

---

## 3. Performance & Rankings

### `GET /api/performance?headmasterId=:id`
Returns all chronological evaluation records for a specific Headmaster.

### `GET /api/performance/:headmasterId/latest`
Returns the most recent evaluation record (Term 3).

### `GET /api/rankings?period=:period`
Returns complete ranking table with filters for:
* `period`: e.g. "Term 3 (2025-26)"
* `district`: District filter
* `mandal`: Mandal filter

---

## 4. Achievements & Bonus Credits

### `GET /api/achievements?headmasterId=:id`
Returns submitted achievements for an HM.

### `POST /api/achievements`
Submits a new achievement for verification and bonus credits.

### `PUT /api/achievements/:id/verify`
(DEO / MEO only) Verifies or rejects an achievement and awards bonus credits.

---

## 5. Complaints & Appeals

### `GET /api/complaints?headmasterId=:id`
Returns filed bottlenecks and grievances.

### `POST /api/complaints`
Submits an institutional bottleneck complaint to the District Education Office.

### `PUT /api/complaints/:id/resolve`
(DEO only) Records an official resolution response.

---

## 6. Student Performance (Class 10 SSC)

### `GET /api/students?schoolId=:id`
Returns student marks records and aggregate pass percentage.

### `POST /api/students`
Adds a new student Class 10 record with 6 subject marks.

### `PUT /api/students/:id`
Updates existing marks and recalculates total and grade.

---

## 7. Activity Feed

### `GET /api/activities`
Returns public activity feed posts.

### `POST /api/activities`
Publishes a new activity post with image/video attachments.
