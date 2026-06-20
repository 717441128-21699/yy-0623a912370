ALTER TABLE applications ADD COLUMN status_timeline TEXT DEFAULT '[]';
ALTER TABLE applications ADD COLUMN viewed_at TEXT;
