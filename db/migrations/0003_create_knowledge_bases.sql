-- Create knowledge_bases table
CREATE TABLE IF NOT EXISTS knowledge_bases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Add RLS policies for knowledge_bases
ALTER TABLE knowledge_bases ENABLE ROW LEVEL SECURITY;

-- Users can view their own knowledge bases
CREATE POLICY "Users can view their own knowledge bases" 
  ON knowledge_bases 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Users can view public knowledge bases
CREATE POLICY "Anyone can view public knowledge bases" 
  ON knowledge_bases 
  FOR SELECT 
  USING (is_public = TRUE);

-- Users can insert their own knowledge bases
CREATE POLICY "Users can insert their own knowledge bases" 
  ON knowledge_bases 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own knowledge bases
CREATE POLICY "Users can update their own knowledge bases" 
  ON knowledge_bases 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Users can delete their own knowledge bases
CREATE POLICY "Users can delete their own knowledge bases" 
  ON knowledge_bases 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create knowledge_base_documents table to link documents to knowledge bases
CREATE TABLE IF NOT EXISTS knowledge_base_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  knowledge_base_id UUID NOT NULL REFERENCES knowledge_bases(id) ON DELETE CASCADE,
  document_id BIGINT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  UNIQUE(knowledge_base_id, document_id)
);

-- Add RLS policies for knowledge_base_documents
ALTER TABLE knowledge_base_documents ENABLE ROW LEVEL SECURITY;

-- Users can view their own knowledge base documents
CREATE POLICY "Users can view their own knowledge base documents" 
  ON knowledge_base_documents 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM knowledge_bases kb 
      WHERE kb.id = knowledge_base_id 
      AND kb.user_id = auth.uid()
    )
  );

-- Users can view public knowledge base documents
CREATE POLICY "Anyone can view public knowledge base documents" 
  ON knowledge_base_documents 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM knowledge_bases kb 
      WHERE kb.id = knowledge_base_id 
      AND kb.is_public = TRUE
    )
  );

-- Users can insert their own knowledge base documents
CREATE POLICY "Users can insert their own knowledge base documents" 
  ON knowledge_base_documents 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM knowledge_bases kb 
      WHERE kb.id = knowledge_base_id 
      AND kb.user_id = auth.uid()
    )
  );

-- Users can delete their own knowledge base documents
CREATE POLICY "Users can delete their own knowledge base documents" 
  ON knowledge_base_documents 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM knowledge_bases kb 
      WHERE kb.id = knowledge_base_id 
      AND kb.user_id = auth.uid()
    )
  );

-- Create function to update document_count when documents are added or removed
CREATE OR REPLACE FUNCTION update_knowledge_base_document_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE knowledge_bases
    SET document_count = document_count + 1,
        updated_at = timezone('utc'::text, now())
    WHERE id = NEW.knowledge_base_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE knowledge_bases
    SET document_count = document_count - 1,
        updated_at = timezone('utc'::text, now())
    WHERE id = OLD.knowledge_base_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to update document_count
CREATE TRIGGER knowledge_base_document_inserted
AFTER INSERT ON knowledge_base_documents
FOR EACH ROW
EXECUTE FUNCTION update_knowledge_base_document_count();

CREATE TRIGGER knowledge_base_document_deleted
AFTER DELETE ON knowledge_base_documents
FOR EACH ROW
EXECUTE FUNCTION update_knowledge_base_document_count();
