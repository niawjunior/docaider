-- Add embedding features to knowledge_bases table
ALTER TABLE knowledge_bases 
ADD COLUMN IF NOT EXISTS allow_embedding BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS embed_config JSONB DEFAULT '{}';

-- Create embed_access_logs table
CREATE TABLE IF NOT EXISTS embed_access_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  knowledge_base_id UUID NOT NULL REFERENCES knowledge_bases(id) ON DELETE CASCADE,
  chat_id TEXT NOT NULL,
  referrer TEXT,
  timestamp TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  user_agent TEXT,
  ip_address TEXT
);

-- Create embed_message_logs table
CREATE TABLE IF NOT EXISTS embed_message_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  knowledge_base_id UUID NOT NULL REFERENCES knowledge_bases(id) ON DELETE CASCADE,
  chat_id TEXT NOT NULL,
  message TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add RLS policies for embed_access_logs
CREATE POLICY embed_access_logs_select_policy 
  ON embed_access_logs 
  FOR SELECT 
  TO public 
  USING (
    EXISTS (
      SELECT 1 FROM knowledge_bases kb 
      WHERE kb.id = knowledge_base_id 
      AND kb.user_id = auth.uid()
    )
  );

-- Add RLS policies for embed_message_logs
CREATE POLICY embed_message_logs_select_policy 
  ON embed_message_logs 
  FOR SELECT 
  TO public 
  USING (
    EXISTS (
      SELECT 1 FROM knowledge_bases kb 
      WHERE kb.id = knowledge_base_id 
      AND kb.user_id = auth.uid()
    )
  );

-- Enable RLS on the new tables
ALTER TABLE embed_access_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE embed_message_logs ENABLE ROW LEVEL SECURITY;
