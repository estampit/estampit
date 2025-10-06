-- Ensure promotion_usages has the updated_at column expected by triggers
ALTER TABLE public.promotion_usages
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Backfill NULL values just in case previous rows exist without the column
UPDATE public.promotion_usages
SET updated_at = NOW()
WHERE updated_at IS NULL;
