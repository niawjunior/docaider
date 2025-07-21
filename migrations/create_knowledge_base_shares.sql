-- Create knowledge_base_shares table for team sharing
CREATE TABLE IF NOT EXISTS knowledge_base_shares (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  knowledge_base_id UUID NOT NULL REFERENCES knowledge_bases(id) ON DELETE CASCADE,
  shared_with_email VARCHAR(255) NOT NULL,
  shared_by_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure unique sharing per knowledge base and email
  UNIQUE(knowledge_base_id, shared_with_email)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_knowledge_base_shares_kb_id ON knowledge_base_shares(knowledge_base_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_shares_email ON knowledge_base_shares(shared_with_email);

-- Enable RLS
ALTER TABLE knowledge_base_shares ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view shares for knowledge bases they own
CREATE POLICY "Users can view shares for their knowledge bases" ON knowledge_base_shares
  FOR SELECT USING (
    shared_by_user_id = auth.uid()
  );

-- Users can insert shares for knowledge bases they own
CREATE POLICY "Users can create shares for their knowledge bases" ON knowledge_base_shares
  FOR INSERT WITH CHECK (
    shared_by_user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM knowledge_bases 
      WHERE id = knowledge_base_id AND user_id = auth.uid()
    )
  );

-- Users can delete shares for knowledge bases they own
CREATE POLICY "Users can delete shares for their knowledge bases" ON knowledge_base_shares
  FOR DELETE USING (
    shared_by_user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM knowledge_bases 
      WHERE id = knowledge_base_id AND user_id = auth.uid()
    )
  );

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_knowledge_base_shares_updated_at 
  BEFORE UPDATE ON knowledge_base_shares 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
