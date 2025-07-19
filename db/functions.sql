-- 1️⃣ Get all document_chunks for a specific user
CREATE OR REPLACE FUNCTION get_user_document_chunks(
  user_id text  -- Using text to match what we pass from TypeScript
)
RETURNS SETOF document_chunks
LANGUAGE sql SECURITY DEFINER
AS $$
  SELECT *
  FROM document_chunks
  WHERE document_chunks.user_id = user_id::uuid;  -- Cast text to uuid
$$;

-- 2️⃣ Match document_chunks across all user's documents
CREATE OR REPLACE FUNCTION match_document_chunks(
  query_embedding vector(3072),
  match_threshold float,
  match_count int,
  user_id text  -- Using text to match what we pass from TypeScript
)
RETURNS SETOF document_chunks
LANGUAGE sql SECURITY DEFINER
AS $$
  WITH user_docs AS (
    SELECT * FROM get_user_document_chunks(user_id)
  )
  SELECT *
  FROM user_docs
  WHERE user_docs.embedding <=> query_embedding < 1 - match_threshold
  ORDER BY user_docs.embedding <=> query_embedding ASC
  LIMIT LEAST(match_count, 200);
$$;

-- 3️⃣ Match document_chunks from a selected list of document IDs
CREATE OR REPLACE FUNCTION match_selected_document_chunks(
  query_embedding vector(3072),
  match_threshold float,
  match_count int,
  user_id text,  -- Using text to match what we pass from TypeScript
  document_ids jsonb  -- Array of document IDs to filter by
)
RETURNS SETOF document_chunks
LANGUAGE sql SECURITY DEFINER
AS $$
  WITH user_docs AS (
    SELECT * 
    FROM get_user_document_chunks(user_id)
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
