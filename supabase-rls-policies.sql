-- Create custom enum types
CREATE TYPE user_role AS ENUM ('FAN', 'VOLUNTEER', 'ORGANIZER');
CREATE TYPE incident_status AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED');
CREATE TYPE incident_severity AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- Create tables
CREATE TABLE profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    role user_role DEFAULT 'FAN'::user_role NOT NULL,
    language VARCHAR(5) DEFAULT 'en' NOT NULL,
    requires_step_free BOOLEAN DEFAULT false NOT NULL
);

CREATE TABLE incidents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    section VARCHAR(10) NOT NULL,
    gate VARCHAR(10) NOT NULL,
    geom_lat NUMERIC(9,6) NOT NULL,
    geom_lng NUMERIC(9,6) NOT NULL,
    severity incident_severity NOT NULL,
    status incident_status DEFAULT 'OPEN'::incident_status NOT NULL,
    description TEXT NOT NULL
);

-- Enable Row-Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;

-- Security Policies (Data Isolation)
CREATE POLICY "Public profiles are viewable by authenticated users" 
ON profiles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Fans can insert own incidents" 
ON incidents FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Only Volunteers and Organizers can read detailed incident records" 
ON incidents FOR SELECT TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() AND profiles.role IN ('VOLUNTEER', 'ORGANIZER')
    )
);
