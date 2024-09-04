-- Add ttsOverride column to the accounts table
--ALTER TABLE 'accounts' ADD COLUMN 'cooldown' TEXT;
-- Step 1: Check if 'cooldown' column exists in 'accounts' table
-- Step 1: Check if 'cooldown' column exists in 'accounts' table
SELECT COUNT(*) 
FROM pragma_table_info('accounts') 
WHERE name = 'armState';

-- Step 2: If the count is 0, add the 'cooldown' column
ALTER TABLE accounts ADD COLUMN armState INTEGER DEFAULT 0;
