-- Store Settings Table for Layout Modes and Global Config
CREATE TABLE IF NOT EXISTS store_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert Default Layout Settings (Original Mode Enabled by Default)
INSERT INTO store_settings (key, value) VALUES
('enabled_layouts', '["original"]'::jsonb),
('default_layout', '"original"'::jsonb),
('site_config', '{"maintenance_mode": false, "announcement": "مرحباً بكم في صناع السعادة"}'::jsonb)
ON CONFLICT (key) DO UPDATE SET 
    value = EXCLUDED.value,
    updated_at = CURRENT_TIMESTAMP;

-- Enable RLS
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;

-- Allow Public Read
CREATE POLICY "Public_Read_Settings" ON store_settings 
FOR SELECT TO anon, authenticated 
USING (true);

-- Allow Admin Write
CREATE POLICY "Admin_Write_Settings" ON store_settings 
FOR ALL TO authenticated 
USING (auth.jwt() ->> 'email' LIKE '%admin%' OR auth.jwt() ->> 'email' = 'h@saada.com');
