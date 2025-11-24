-- Add detail and detailEmbedding fields to documents table
ALTER TABLE documents 
ADD COLUMN detail text,
ADD COLUMN detail_embedding vector(1536);

-- Add index for better search performance on detail field
CREATE INDEX idx_documents_detail ON documents USING gin(to_tsvector('english', detail));

-- Add index for vector similarity search
CREATE INDEX idx_documents_detail_embedding ON documents USING ivfflat (detail_embedding vector_cosine_ops);