// hooks/useChats.ts
import { useInfiniteQuery } from "@tanstack/react-query";

const LIMIT = 10;

export const useChats = ({
  isKnowledgeBase = false,
  knowledgeBaseId,
}: {
  isKnowledgeBase?: boolean;
  knowledgeBaseId?: string;
}) => {
  return useInfiniteQuery({
    queryKey: ["chats"],
    queryFn: async ({ pageParam = 0 }) => {
      const res = await fetch(
        `/api/chats?limit=${LIMIT}&offset=${pageParam}&isKnowledgeBase=${isKnowledgeBase}&knowledgeBaseId=${knowledgeBaseId}`
      );
      const data = await res.json();
      return {
        data,
        nextOffset: pageParam + LIMIT,
        hasMore: data.length === LIMIT,
      };
    },
    getNextPageParam: (lastPage) => {
      return lastPage.hasMore ? lastPage.nextOffset : undefined;
    },
    initialPageParam: 0,
    refetchOnWindowFocus: false,
    retry: 1,
    staleTime: 0,
  });
};
