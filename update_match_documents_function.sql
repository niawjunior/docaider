DROP FUNCTION IF EXISTS match_documents_by_detail_and_content(vector, float, int, jsonb);

CREATE OR REPLACE FUNCTION match_documents_by_detail_and_content(
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  document_ids jsonb  -- Array of document IDs to filter by
)
RETURNS TABLE (
  title text,
  detail text,
  document_id text,
  similarity float,
  match_type int,
  chunk_content text
)
LANGUAGE sql SECURITY DEFINER
AS $$
  -- First, search documents by detail_embedding (title, description, etc.)
  WITH document_matches AS (
    SELECT
      d.title,
      d.detail,
      d.document_id,
      1 - (d.detail_embedding <=> query_embedding) as similarity,
      1 as match_type,  -- 1 = detail match
      NULL::text as chunk_content
    FROM documents d
    WHERE d.active = true
      AND d.is_knowledge_base = true
      AND d.detail_embedding IS NOT NULL
      AND (
        document_ids IS NULL OR 
        jsonb_array_length(document_ids) = 0 OR 
        d.document_id IN (SELECT value FROM jsonb_array_elements_text(document_ids))
      )
      AND (1 - (d.detail_embedding <=> query_embedding)) > match_threshold
  ),
  -- Second, search document_chunks by content
  chunk_matches AS (
    SELECT
      d.title,
      d.detail,
      dc.document_id,
      1 - (dc.embedding <=> query_embedding) as similarity,
      2 as match_type,  -- 2 = content match
      dc.chunk as chunk_content
    FROM document_chunks dc
    JOIN documents d ON (dc.document_id = d.document_id OR dc.document_id = d.id::text)
    WHERE dc.active = true
      AND (
        document_ids IS NULL OR 
        jsonb_array_length(document_ids) = 0 OR 
        dc.document_id IN (SELECT value FROM jsonb_array_elements_text(document_ids))
      )
      AND (1 - (dc.embedding <=> query_embedding)) > match_threshold
      AND d.active = true
      AND d.is_knowledge_base = true
  )
  -- Combine both searches
  SELECT * FROM (
    SELECT * FROM document_matches
    UNION ALL
    SELECT * FROM chunk_matches
  ) combined_results
  ORDER BY
    similarity DESC
  LIMIT LEAST(match_count, 200);
$$;
