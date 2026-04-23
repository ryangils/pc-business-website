-- CyberForge PC — Database Schema
-- SQLite schema for contact form and repair booking submissions.
--
-- Apply with:
--   sqlite3 cyberforge.db < schema.sql
-- Or run automatically via init_db() in app.py on first start.

CREATE TABLE IF NOT EXISTS contacts (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT    NOT NULL,
    name      TEXT    NOT NULL,
    email     TEXT    NOT NULL,
    subject   TEXT    NOT NULL,
    message   TEXT    NOT NULL
);

CREATE TABLE IF NOT EXISTS bookings (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp      TEXT    NOT NULL,
    name           TEXT    NOT NULL,
    email          TEXT    NOT NULL,
    phone          TEXT    NOT NULL DEFAULT '',
    device         TEXT    NOT NULL,
    service        TEXT    NOT NULL,
    issue          TEXT    NOT NULL,
    preferred_date TEXT    NOT NULL,
    preferred_time TEXT    NOT NULL,
    notes          TEXT    NOT NULL DEFAULT ''
);
