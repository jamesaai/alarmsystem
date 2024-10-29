CREATE TABLE IF NOT EXISTS 'accounts' (
	'id' INTEGER PRIMARY KEY,
	'phone' TEXT NOT NULL,
	--'discord_webhook' TEXT NOT NULL,
	'verified' INTEGER NOT NULL DEFAULT 0,
	'verification_code' TEXT,
	'code_sent_at' TEXT,
	'discord_id' TEXT,
	'ttsOverride' INTEGER NOT NULL DEFAULT 0,
	'cooldown' TEXT,
	'armState' INTEGER NOT NULL DEFAULT 0
)