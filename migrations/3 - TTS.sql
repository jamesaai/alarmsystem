-- Add ttsOverride column to the accounts table
SELECT COUNT(*) 
FROM pragma_table_info('accounts') 
WHERE name = 'ttsOverride';

-- Step 2: If the count is 0, add the 'cooldown' column
ALTER TABLE accounts ADD COLUMN ttsOverride TEXT INTEGER NOT NULL DEFAULT 0;
-- Retroactively set ttsOverride to 0 for all accounts that dont have it set at all
UPDATE 'accounts' SET 'ttsOverride' = 0 WHERE 'ttsOverride' IS NULL;