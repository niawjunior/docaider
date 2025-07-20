-- 1️⃣ Get all document_chunks for a specific user (with optional public access)
CREATE OR REPLACE FUNCTION get_user_document_chunks(
  user_id text,  -- Using text to match what we pass from TypeScript
  include_public boolean DEFAULT false  -- Whether to include public documents
)
RETURNS SETOF document_chunks
LANGUAGE sql SECURITY DEFINER
AS $$
  SELECT dc.*
  FROM document_chunks dc
  JOIN documents d ON dc.document_id = d.document_id
  WHERE (
    dc.user_id = user_id::uuid  -- User's own documents
    OR (
      include_public = true 
      AND d.is_public = true 
      AND dc.active = true
    )
  );
$$;

-- 2️⃣ Match document_chunks across all user's documents (with optional public access)
CREATE OR REPLACE FUNCTION match_document_chunks(
  query_embedding vector(3072),
  match_threshold float,
  match_count int,
  user_id text,  -- Using text to match what we pass from TypeScript
  include_public boolean DEFAULT false  -- Whether to include public documents
)
RETURNS SETOF document_chunks
LANGUAGE sql SECURITY DEFINER
AS $$
  WITH user_docs AS (
    SELECT * FROM get_user_document_chunks(user_id, include_public)
  )
  SELECT *
  FROM user_docs
  WHERE user_docs.embedding <=> query_embedding < 1 - match_threshold
  ORDER BY user_docs.embedding <=> query_embedding ASC
  LIMIT LEAST(match_count, 200);
$$;

-- 3️⃣ Match document_chunks from a selected list of document IDs (with optional public access)
CREATE OR REPLACE FUNCTION match_selected_document_chunks(
  query_embedding vector(3072),
  match_threshold float,
  match_count int,
  user_id text,  -- Using text to match what we pass from TypeScript
  document_ids jsonb,  -- Array of document IDs to filter by
  include_public boolean DEFAULT false  -- Whether to include public documents
)
RETURNS SETOF document_chunks
LANGUAGE sql SECURITY DEFINER
AS $$
  WITH user_docs AS (
    SELECT * 
    FROM get_user_document_chunks(user_id, include_public)
    WHERE document_id IN (
      SELECT value FROM jsonb_array_elements_text(document_ids)
    )
  )
  SELECT *
  FROM user_docs
  WHERE user_docs.embedding <=> query_embedding < 1 - match_threshold
  ORDER BY user_docs.embedding <=> query_embedding ASC
  LIMIT LEAST(match_count, 200);
$$;
