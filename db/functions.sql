-- Database functions for document matching and retrieval

-- First, create a function that only returns documents for a user
CREATE OR REPLACE FUNCTION get_user_documents(
  user_id text  -- Using text to match what we pass from TypeScript
)
RETURNS SETOF documents
LANGUAGE sql SECURITY DEFINER
AS $$
  SELECT *
  FROM documents
  WHERE documents.user_id = user_id::uuid  -- Cast text to uuid
  AND documents.active = true
$$;

-- Function to get document chunks for a user
CREATE OR REPLACE FUNCTION get_user_document_chunks(
  user_id text  -- Using text to match what we pass from TypeScript
)
RETURNS TABLE (
  id bigint,
  document_id bigint,
  chunk text,
  embedding vector(3072),
  created_at text,
  updated_at text,
  active boolean,
  is_knowledge_base boolean,
  title text,
  user_id uuid,
  document_name text
)
LANGUAGE sql SECURITY DEFINER
AS $$
  SELECT 
    dc.id,
    dc.document_id,
    dc.chunk,
    dc.embedding,
    dc.created_at,
    dc.updated_at,
    dc.active,
    dc.is_knowledge_base,
    d.title,
    d.user_id,
    d.document_name
  FROM document_chunks dc
  JOIN documents d ON dc.document_id = d.id
  WHERE d.user_id = user_id::uuid
  AND dc.active = true
  AND d.active = true
$$;

-- Match documents function (for backward compatibility)
CREATE OR REPLACE FUNCTION match_documents (
  query_embedding vector(3072),
  match_threshold float,
  match_count int,
  user_id text  -- Using text to match what we pass from TypeScript
)
RETURNS SETOF documents
LANGUAGE sql SECURITY DEFINER
AS $$
  -- First get the user's documents using our new function
  SELECT *
  FROM documents
  WHERE user_id = user_id::uuid
  AND active = true
  AND embedding <=> query_embedding < 1 - match_threshold
  ORDER BY embedding <=> query_embedding ASC
  LIMIT least(match_count, 200);
$$;

-- Match document chunks function (new approach)
CREATE OR REPLACE FUNCTION match_document_chunks (
  query_embedding vector(3072),
  match_threshold float,
  match_count int,
  user_id text  -- Using text to match what we pass from TypeScript
)
RETURNS TABLE (
  id bigint,
  document_id bigint,
  chunk text,
  embedding vector(3072),
  created_at text,
  updated_at text,
  active boolean,
  is_knowledge_base boolean,
  title text,
  user_id uuid,
  document_name text,
  similarity float
)
LANGUAGE sql SECURITY DEFINER
AS $$
  SELECT 
    dc.id,
    dc.document_id,
    dc.chunk,
    dc.embedding,
    dc.created_at,
    dc.updated_at,
    dc.active,
    dc.is_knowledge_base,
    d.title,
    d.user_id,
    d.document_name,
    (1 - (dc.embedding <=> query_embedding)) AS similarity
  FROM document_chunks dc
  JOIN documents d ON dc.document_id = d.id
  WHERE d.user_id = user_id::uuid
  AND dc.active = true
  AND d.active = true
  AND dc.embedding <=> query_embedding < 1 - match_threshold
  ORDER BY dc.embedding <=> query_embedding ASC
  LIMIT least(match_count, 200);
$$;

-- Match documents from a specific list of document IDs (for backward compatibility)
CREATE OR REPLACE FUNCTION match_selected_documents (
  query_embedding vector(3072),
  match_threshold float,
  match_count int,
  user_id text,  -- Using text to match what we pass from TypeScript
  document_ids jsonb  -- Array of document IDs to filter by
)
RETURNS SETOF documents
LANGUAGE sql SECURITY DEFINER
AS $$
  -- Get the user's documents and filter by document_ids
  SELECT *
  FROM documents
  WHERE user_id = user_id::uuid
  AND active = true
  AND documentId IN (SELECT value::text FROM jsonb_array_elements_text(document_ids))
  AND embedding <=> query_embedding < 1 - match_threshold
  ORDER BY embedding <=> query_embedding ASC
  LIMIT least(match_count, 200);
$$;

-- Match document chunks from a specific list of document IDs (new approach)
CREATE OR REPLACE FUNCTION match_selected_document_chunks (
  query_embedding vector(3072),
  match_threshold float,
  match_count int,
  user_id text,  -- Using text to match what we pass from TypeScript
  document_ids jsonb  -- Array of document IDs to filter by
)
RETURNS TABLE (
  id bigint,
  document_id bigint,
  chunk text,
  embedding vector(3072),
  created_at text,
  updated_at text,
  active boolean,
  is_knowledge_base boolean,
  title text,
  user_id uuid,
  document_name text,
  similarity float
)
LANGUAGE sql SECURITY DEFINER
AS $$
  SELECT 
    dc.id,
    dc.document_id,
    dc.chunk,
    dc.embedding,
    dc.created_at,
    dc.updated_at,
    dc.active,
    dc.is_knowledge_base,
    d.title,
    d.user_id,
    d.document_name,
    (1 - (dc.embedding <=> query_embedding)) AS similarity
  FROM document_chunks dc
  JOIN documents d ON dc.document_id = d.id
  WHERE d.user_id = user_id::uuid
  AND dc.active = true
  AND d.active = true
  AND d.id IN (SELECT value::bigint FROM jsonb_array_elements_text(document_ids))
  AND dc.embedding <=> query_embedding < 1 - match_threshold
  ORDER BY dc.embedding <=> query_embedding ASC
  LIMIT least(match_count, 200);
$$;
