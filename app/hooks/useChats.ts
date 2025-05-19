// hooks/useChats.ts
import { useInfiniteQuery } from "@tanstack/react-query";

const LIMIT = 20;

export const useChats = () => {
  return useInfiniteQuery({
    queryKey: ["chats"],
    queryFn: async ({ pageParam = 0 }) => {
      const res = await fetch(`/api/chats?limit=${LIMIT}&offset=${pageParam}`);
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
  });
};
