-- Migration 001: Initial HM Pravardhan Institutional Evaluation Schema
-- Up Migration: Creates initial tables, indexes, and constraints

BEGIN;

\i ../schema/schema.sql

-- Performance & Ranking Indexes for high query speed
CREATE INDEX IF NOT EXISTS idx_perf_headmaster ON performance_records(headmaster_id);
CREATE INDEX IF NOT EXISTS idx_perf_school ON performance_records(school_id);
CREATE INDEX IF NOT EXISTS idx_perf_period ON performance_records(evaluation_period);
CREATE INDEX IF NOT EXISTS idx_perf_overall_rank ON performance_records(overall_rank);
CREATE INDEX IF NOT EXISTS idx_perf_district ON performance_records(district, district_rank);
CREATE INDEX IF NOT EXISTS idx_perf_mandal ON performance_records(mandal, mandal_rank);

CREATE INDEX IF NOT EXISTS idx_achieve_hm ON achievements(headmaster_id, status);
CREATE INDEX IF NOT EXISTS idx_complaint_hm ON complaints(headmaster_id, status);
CREATE INDEX IF NOT EXISTS idx_appeal_hm ON score_appeals(headmaster_id, status);
CREATE INDEX IF NOT EXISTS idx_student_school ON student_records(school_id, class_level);
CREATE INDEX IF NOT EXISTS idx_notif_user ON notifications(user_id, is_read);

COMMIT;
