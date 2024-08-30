-- Add ttsOverride column to the accounts table
ALTER TABLE 'accounts' ADD COLUMN IF NOT EXISTS 'cooldown' TEXT;