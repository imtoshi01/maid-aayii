-- Add new columns to users table
ALTER TABLE users
ADD COLUMN mobile VARCHAR(20) UNIQUE NOT NULL,
ADD COLUMN name VARCHAR(100),
ADD COLUMN address TEXT,
ADD COLUMN latitude DECIMAL(10, 8),
ADD COLUMN longitude DECIMAL(11, 8);

-- Remove the OTP table creation
DROP TABLE IF EXISTS otps;

-- Remove password_hash column from users table
ALTER TABLE users
DROP COLUMN password_hash;

-- Update service_providers table to include user_id
ALTER TABLE service_providers
ADD COLUMN user_id INTEGER REFERENCES users(id);

-- Update existing service providers to belong to a default user (you may want to handle this differently)
UPDATE service_providers
SET user_id = (SELECT id FROM users LIMIT 1)
WHERE user_id IS NULL;

-- Make user_id NOT NULL after updating existing records
ALTER TABLE service_providers
ALTER COLUMN user_id SET NOT NULL;

