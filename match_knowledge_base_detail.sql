CREATE OR REPLACE FUNCTION match_knowledge_base_detail(
  query_embedding vector(1536),
  match_threshold float,
  kb_id uuid
)
RETURNS TABLE (
  id uuid,
  name text,
  detail text,
  similarity float
)
LANGUAGE sql SECURITY DEFINER
AS $$
  SELECT
    kb.id,
    kb.name,
    kb.detail,
    1 - (kb.detail_embedding <=> query_embedding) as similarity
  FROM knowledge_bases kb
  WHERE kb.id = kb_id
    AND kb.detail_embedding IS NOT NULL
    AND (1 - (kb.detail_embedding <=> query_embedding)) > match_threshold;
$$;
