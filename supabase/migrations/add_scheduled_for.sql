
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'debates' AND column_name = 'scheduled_for') THEN 
        ALTER TABLE debates ADD COLUMN scheduled_for DATE; 
    END IF; 
END $$;
