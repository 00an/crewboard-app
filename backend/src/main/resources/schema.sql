-- =========================
-- DROP (clean startup)
-- =========================
DROP TABLE IF EXISTS availability CASCADE;
DROP TABLE IF EXISTS assignment CASCADE;
DROP TABLE IF EXISTS shift CASCADE;
DROP TABLE IF EXISTS event_entity CASCADE;
DROP TABLE IF EXISTS volunteer CASCADE;
DROP TABLE IF EXISTS users_roles CASCADE;
DROP TABLE IF EXISTS role CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- =========================
-- USERS & ROLES
-- =========================
CREATE TABLE users (
                       id        BIGSERIAL PRIMARY KEY,
                       username  VARCHAR(100) UNIQUE NOT NULL,
                       password  VARCHAR(255) NOT NULL,
                       email     VARCHAR(150) UNIQUE NOT NULL,
                       enabled   BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE role (
                      id    BIGSERIAL PRIMARY KEY,
                      name  VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE users_roles (
                             user_id BIGINT NOT NULL,
                             role_id BIGINT NOT NULL,
                             PRIMARY KEY (user_id, role_id),
                             CONSTRAINT fk_user_role_user
                                 FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
                             CONSTRAINT fk_user_role_role
                                 FOREIGN KEY (role_id) REFERENCES role (id) ON DELETE CASCADE
);

-- =========================
-- VOLUNTEER
-- =========================
CREATE TABLE volunteer (
                           id       BIGSERIAL PRIMARY KEY,
                           user_id  BIGINT UNIQUE NOT NULL,
                           name     VARCHAR(100) NOT NULL,
                           email    VARCHAR(150) UNIQUE NOT NULL,
                           phone    VARCHAR(30),

                           CONSTRAINT fk_volunteer_user
                               FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- =========================
-- EVENT
-- =========================
CREATE TABLE event_entity (
                              id              BIGSERIAL PRIMARY KEY,
                              title           VARCHAR(200) NOT NULL,
                              description     TEXT,
                              location        VARCHAR(200),
                              start_date      TIMESTAMP WITHOUT TIME ZONE NOT NULL,
                              end_date        TIMESTAMP WITHOUT TIME ZONE NOT NULL,
                              organizer_email VARCHAR(150),

                              CONSTRAINT chk_event_dates
                                  CHECK (end_date > start_date)
);

-- =========================
-- SHIFT
-- =========================
CREATE TABLE shift (
                       id                  BIGSERIAL PRIMARY KEY,
                       event_id            BIGINT NOT NULL,
                       role                VARCHAR(100) NOT NULL,
                       location            VARCHAR(200),
                       start_time          TIMESTAMP WITHOUT TIME ZONE NOT NULL,
                       end_time            TIMESTAMP WITHOUT TIME ZONE NOT NULL,
                       headcount           INT NOT NULL,
                       leader_volunteer_id BIGINT,

                       CONSTRAINT fk_shift_event
                           FOREIGN KEY (event_id) REFERENCES event_entity (id) ON DELETE CASCADE,

                       CONSTRAINT fk_shift_leader
                           FOREIGN KEY (leader_volunteer_id) REFERENCES volunteer (id),

                       CONSTRAINT chk_shift_dates
                           CHECK (end_time > start_time),

                       CONSTRAINT chk_shift_headcount
                           CHECK (headcount > 0)
);

-- =========================
-- AVAILABILITY
-- =========================
CREATE TABLE availability (
                              id            BIGSERIAL PRIMARY KEY,
                              volunteer_id  BIGINT NOT NULL,
                              shift_id      BIGINT NOT NULL,
                              submitted_at  TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

                              CONSTRAINT fk_availability_volunteer
                                  FOREIGN KEY (volunteer_id) REFERENCES volunteer (id) ON DELETE CASCADE,

                              CONSTRAINT fk_availability_shift
                                  FOREIGN KEY (shift_id) REFERENCES shift (id) ON DELETE CASCADE,

                              CONSTRAINT uq_availability_unique
                                  UNIQUE (volunteer_id, shift_id)
);

-- =========================
-- ASSIGNMENT
-- =========================
CREATE TABLE assignment (
                            id            BIGSERIAL PRIMARY KEY,
                            volunteer_id  BIGINT NOT NULL,
                            shift_id      BIGINT NOT NULL,
                            status        VARCHAR(50) NOT NULL,
                            assigned_at   TIMESTAMP WITHOUT TIME ZONE,
                            notes         TEXT,

                            CONSTRAINT fk_assignment_volunteer
                                FOREIGN KEY (volunteer_id) REFERENCES volunteer (id) ON DELETE CASCADE,

                            CONSTRAINT fk_assignment_shift
                                FOREIGN KEY (shift_id) REFERENCES shift (id) ON DELETE CASCADE,

                            CONSTRAINT uq_assignment_unique
                                UNIQUE (volunteer_id, shift_id)
);

-- =========================
-- INDEXES
-- =========================
CREATE INDEX idx_shift_event ON shift(event_id);
CREATE INDEX idx_shift_time ON shift(start_time, end_time);
CREATE INDEX idx_assignment_status ON assignment(status);
CREATE INDEX idx_assignment_shift ON assignment(shift_id);
CREATE INDEX idx_availability_volunteer ON availability(volunteer_id);
