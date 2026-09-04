-- HM Pravardhan Database Schema (PostgreSQL / Relational SQL)
-- Standard institutional evaluation schema for schools, headmasters, rankings, and student analytics

-- 1. Districts & Mandals
CREATE TABLE IF NOT EXISTS districts (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(128) NOT NULL UNIQUE,
    state VARCHAR(64) DEFAULT 'Telangana',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS mandals (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    district_id VARCHAR(64) REFERENCES districts(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(name, district_id)
);

-- 2. Users (Authentication & Access Control)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255),
    role VARCHAR(32) NOT NULL CHECK (role IN ('VISITOR', 'HEADMASTER', 'MEO', 'DEO', 'PUBLIC')),
    headmaster_id VARCHAR(64),
    mandal VARCHAR(128),
    district VARCHAR(128),
    designation VARCHAR(128),
    department VARCHAR(128),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Headmasters
CREATE TABLE IF NOT EXISTS headmasters (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    employee_code VARCHAR(32) UNIQUE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    qualification VARCHAR(255),
    experience_years INT DEFAULT 0,
    joining_date DATE,
    school_id VARCHAR(64),
    school_name VARCHAR(255),
    district VARCHAR(128) NOT NULL,
    mandal VARCHAR(128) NOT NULL,
    phone VARCHAR(32),
    photo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Schools
CREATE TABLE IF NOT EXISTS schools (
    id VARCHAR(64) PRIMARY KEY,
    school_code VARCHAR(64) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    district VARCHAR(128) NOT NULL,
    mandal VARCHAR(128) NOT NULL,
    category VARCHAR(64) NOT NULL,
    student_count INT DEFAULT 0,
    teacher_count INT DEFAULT 0,
    headmaster_id VARCHAR(64) REFERENCES headmasters(id) ON DELETE SET NULL,
    headmaster_name VARCHAR(255),
    address TEXT,
    established_year INT,
    contact_number VARCHAR(32),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Performance Records & Rankings
CREATE TABLE IF NOT EXISTS performance_records (
    id VARCHAR(64) PRIMARY KEY,
    headmaster_id VARCHAR(64) NOT NULL REFERENCES headmasters(id) ON DELETE CASCADE,
    headmaster_name VARCHAR(255) NOT NULL,
    school_id VARCHAR(64) NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    school_name VARCHAR(255) NOT NULL,
    district VARCHAR(128) NOT NULL,
    mandal VARCHAR(128) NOT NULL,
    evaluation_period VARCHAR(64) NOT NULL, -- e.g. 'Term 3 (2025-26)'
    period_order INT NOT NULL DEFAULT 1,
    academic_score NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    student_dev_score NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    school_mgmt_score NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    teacher_mgmt_score NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    infrastructure_score NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    admin_score NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    base_score NUMERIC(5, 2) NOT NULL DEFAULT 0.00, -- Weighted 0 to 100
    approved_bonus_credits NUMERIC(4, 1) NOT NULL DEFAULT 0.0, -- Capped at 10.0
    final_score NUMERIC(5, 2) NOT NULL DEFAULT 0.00, -- base + bonus
    previous_period_score NUMERIC(5, 2),
    improvement_percentage NUMERIC(5, 2),
    performance_trend VARCHAR(16) DEFAULT 'STABLE',
    overall_rank INT NOT NULL DEFAULT 0,
    district_rank INT NOT NULL DEFAULT 0,
    mandal_rank INT NOT NULL DEFAULT 0,
    previous_rank INT,
    rank_change INT DEFAULT 0,
    evaluated_by VARCHAR(255),
    evaluated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    officer_remarks TEXT
);

-- 6. Achievements & Bonus Credits
CREATE TABLE IF NOT EXISTS achievements (
    id VARCHAR(64) PRIMARY KEY,
    headmaster_id VARCHAR(64) NOT NULL REFERENCES headmasters(id) ON DELETE CASCADE,
    headmaster_name VARCHAR(255) NOT NULL,
    school_id VARCHAR(64) NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    school_name VARCHAR(255) NOT NULL,
    district VARCHAR(128) NOT NULL,
    mandal VARCHAR(128) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(64) NOT NULL,
    achievement_date DATE NOT NULL,
    image_url TEXT,
    document_url TEXT,
    document_name VARCHAR(255),
    status VARCHAR(32) NOT NULL DEFAULT 'PENDING_VERIFICATION' CHECK (status IN ('PENDING_VERIFICATION', 'VERIFIED', 'REJECTED', 'INFO_REQUIRED')),
    bonus_credits_awarded NUMERIC(3, 1) DEFAULT 0.0,
    is_featured BOOLEAN DEFAULT FALSE,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    verified_at TIMESTAMP WITH TIME ZONE,
    verified_by VARCHAR(255),
    officer_feedback TEXT
);

-- 7. Complaints & Bottleneck Grievances
CREATE TABLE IF NOT EXISTS complaints (
    id VARCHAR(64) PRIMARY KEY,
    complaint_number VARCHAR(64) NOT NULL UNIQUE,
    headmaster_id VARCHAR(64) NOT NULL REFERENCES headmasters(id) ON DELETE CASCADE,
    headmaster_name VARCHAR(255) NOT NULL,
    school_id VARCHAR(64) NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    school_name VARCHAR(255) NOT NULL,
    district VARCHAR(128) NOT NULL,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(64) NOT NULL,
    description TEXT NOT NULL,
    related_performance_category VARCHAR(64) DEFAULT 'General',
    supporting_doc_url TEXT,
    supporting_doc_name VARCHAR(255),
    submission_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(32) NOT NULL DEFAULT 'Submitted' CHECK (status IN ('Submitted', 'Under Review', 'Additional Information Required', 'Resolved', 'Rejected')),
    officer_response TEXT,
    response_date TIMESTAMP WITH TIME ZONE,
    resolved_by VARCHAR(255)
);

-- 8. Score Appeals
CREATE TABLE IF NOT EXISTS score_appeals (
    id VARCHAR(64) PRIMARY KEY,
    appeal_number VARCHAR(64) NOT NULL UNIQUE,
    headmaster_id VARCHAR(64) NOT NULL REFERENCES headmasters(id) ON DELETE CASCADE,
    headmaster_name VARCHAR(255) NOT NULL,
    school_id VARCHAR(64) NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    school_name VARCHAR(255) NOT NULL,
    performance_record_id VARCHAR(64) NOT NULL REFERENCES performance_records(id) ON DELETE CASCADE,
    evaluation_period VARCHAR(64) NOT NULL,
    affected_category VARCHAR(64) NOT NULL,
    current_category_score NUMERIC(5, 2) NOT NULL,
    claimed_category_score NUMERIC(5, 2) NOT NULL,
    reason TEXT NOT NULL,
    evidence_url TEXT,
    evidence_name VARCHAR(255),
    status VARCHAR(32) NOT NULL DEFAULT 'SUBMITTED' CHECK (status IN ('SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED')),
    submission_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    reviewed_by VARCHAR(255),
    review_date TIMESTAMP WITH TIME ZONE,
    review_remarks TEXT,
    adjusted_category_score NUMERIC(5, 2)
);

-- 9. Activity Feed Posts & Media
CREATE TABLE IF NOT EXISTS activity_posts (
    id VARCHAR(64) PRIMARY KEY,
    headmaster_id VARCHAR(64) NOT NULL REFERENCES headmasters(id) ON DELETE CASCADE,
    headmaster_name VARCHAR(255) NOT NULL,
    school_id VARCHAR(64) NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    school_name VARCHAR(255) NOT NULL,
    district VARCHAR(128) NOT NULL,
    mandal VARCHAR(128) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(64) NOT NULL,
    activity_date DATE NOT NULL,
    likes_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS activity_media (
    id VARCHAR(64) PRIMARY KEY,
    activity_post_id VARCHAR(64) NOT NULL REFERENCES activity_posts(id) ON DELETE CASCADE,
    media_url TEXT NOT NULL,
    media_type VARCHAR(16) NOT NULL CHECK (media_type IN ('IMAGE', 'VIDEO')),
    caption TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. Student Performance & Marks (Class 10 SSC)
CREATE TABLE IF NOT EXISTS student_records (
    id VARCHAR(64) PRIMARY KEY,
    student_name VARCHAR(255) NOT NULL,
    roll_number VARCHAR(64) NOT NULL,
    school_id VARCHAR(64) NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    school_name VARCHAR(255) NOT NULL,
    district VARCHAR(128) NOT NULL,
    mandal VARCHAR(128) NOT NULL,
    class_level VARCHAR(32) DEFAULT 'Class 10',
    section VARCHAR(16) DEFAULT 'A',
    academic_year VARCHAR(32) DEFAULT '2025-26',
    gender VARCHAR(16) CHECK (gender IN ('Male', 'Female', 'Other')),
    telugu INT NOT NULL DEFAULT 0,
    hindi INT NOT NULL DEFAULT 0,
    english INT NOT NULL DEFAULT 0,
    mathematics INT NOT NULL DEFAULT 0,
    science INT NOT NULL DEFAULT 0,
    social_studies INT NOT NULL DEFAULT 0,
    total_marks INT NOT NULL DEFAULT 0, -- Max 600
    percentage NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    grade VARCHAR(8) NOT NULL DEFAULT 'F',
    passed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(roll_number, school_id, academic_year)
);

-- 11. System & User Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(32) NOT NULL,
    related_id VARCHAR(64),
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
