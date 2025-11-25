
-- Function to match knowledge base chunks
create or replace function match_knowledge_base_chunks (
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  kb_id uuid
)
returns table (
  id bigint,
  chunk text,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    kbc.id,
    kbc.chunk,
    1 - (kbc.embedding <=> query_embedding) as similarity
  from knowledge_base_chunks kbc
  where kbc.knowledge_base_id = kb_id
  and 1 - (kbc.embedding <=> query_embedding) > match_threshold
  order by kbc.embedding <=> query_embedding
  limit match_count;
end;
$$;
