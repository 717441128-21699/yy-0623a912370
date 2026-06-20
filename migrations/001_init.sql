CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    nickname TEXT NOT NULL,
    avatar TEXT,
    reputation INTEGER DEFAULT 100,
    hosted_count INTEGER DEFAULT 0,
    ghost_count INTEGER DEFAULT 0,
    play_styles TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS fleets (
    id TEXT PRIMARY KEY,
    script_name TEXT NOT NULL,
    is_city_limited INTEGER DEFAULT 0,
    script_type TEXT NOT NULL,
    atmosphere TEXT,
    city TEXT NOT NULL,
    district TEXT,
    location TEXT,
    start_time TEXT NOT NULL,
    total_players INTEGER NOT NULL,
    current_players INTEGER DEFAULT 1,
    host_id TEXT NOT NULL,
    roles TEXT,
    status TEXT DEFAULT 'recruiting',
    notes TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (host_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS applications (
    id TEXT PRIMARY KEY,
    fleet_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    preferred_roles TEXT,
    red_flags TEXT,
    acceptable_end_time TEXT,
    willing_to_waitlist INTEGER DEFAULT 0,
    status TEXT DEFAULT 'pending',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (fleet_id) REFERENCES fleets(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS reviews (
    id TEXT PRIMARY KEY,
    from_user_id TEXT NOT NULL,
    to_user_id TEXT NOT NULL,
    fleet_id TEXT NOT NULL,
    rating INTEGER NOT NULL,
    comment TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (from_user_id) REFERENCES users(id),
    FOREIGN KEY (to_user_id) REFERENCES users(id),
    FOREIGN KEY (fleet_id) REFERENCES fleets(id)
);

CREATE TABLE IF NOT EXISTS radar_subscriptions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    script_name TEXT NOT NULL,
    city TEXT NOT NULL,
    notify_browser INTEGER DEFAULT 1,
    notify_site INTEGER DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS fleet_matches (
    id TEXT PRIMARY KEY,
    subscription_id TEXT NOT NULL,
    fleet_id TEXT NOT NULL,
    is_read INTEGER DEFAULT 0,
    matched_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (subscription_id) REFERENCES radar_subscriptions(id),
    FOREIGN KEY (fleet_id) REFERENCES fleets(id)
);

CREATE INDEX IF NOT EXISTS idx_fleets_city ON fleets(city);
CREATE INDEX IF NOT EXISTS idx_fleets_status ON fleets(status);
CREATE INDEX IF NOT EXISTS idx_fleets_start_time ON fleets(start_time);
CREATE INDEX IF NOT EXISTS idx_matches_subscription ON fleet_matches(subscription_id);
CREATE INDEX IF NOT EXISTS idx_matches_is_read ON fleet_matches(is_read);
