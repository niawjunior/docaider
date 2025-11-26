
-- Enable pgvector extension if not already enabled (it should be, but good practice)
CREATE EXTENSION IF NOT EXISTS vector;

-- Create HNSW index for document_chunks embedding
CREATE INDEX IF NOT EXISTS document_chunks_embedding_idx ON document_chunks USING hnsw (embedding vector_cosine_ops);

-- Create HNSW index for documents detail_embedding
CREATE INDEX IF NOT EXISTS documents_detail_embedding_idx ON documents USING hnsw (detail_embedding vector_cosine_ops);


