-- Add ttsOverride column to the accounts table
ALTER TABLE 'accounts' ADD COLUMN 'ttsOverride' INTEGER NOT NULL DEFAULT 0;
-- Retroactively set ttsOverride to 0 for all accounts that dont have it set at all
UPDATE 'accounts' SET 'ttsOverride' = 0 WHERE 'ttsOverride' IS NULL;