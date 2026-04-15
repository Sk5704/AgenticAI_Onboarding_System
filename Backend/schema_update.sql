-- Create verification_logs table
CREATE TABLE IF NOT EXISTS verification_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID REFERENCES applications(id),
    step VARCHAR(255),
    status VARCHAR(255),
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add missing columns to applications table (if not exist)
ALTER TABLE applications ADD COLUMN IF NOT EXISTS risk_score INTEGER;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS personal_details JSONB;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_verification_logs_application_id ON verification_logs(application_id);