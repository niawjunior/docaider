import { useState, useMemo } from "react";
import { KnowledgeBase as ApiKnowledgeBase } from "./useKnowledgeBases";
import { SharedKnowledgeBase } from "./useSharedKnowledgeBases";

// Component-expected interface format
type KnowledgeBase = {
  id: string;
  name: string;
  description: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  userId: string;
  userName?: string;
};

export interface SearchAndFilterState {
  searchQuery: string;
  sortBy: string;
  filterBy: string;
}

export interface UseSearchAndFilterProps {
  knowledgeBases: ApiKnowledgeBase[];
  sharedKnowledgeBases?: SharedKnowledgeBase[];
  publicKnowledgeBases: ApiKnowledgeBase[];
}

export interface UseSearchAndFilterReturn {
  // State
  searchQuery: string;
  sortBy: string;
  filterBy: string;

  // Actions
  setSearchQuery: (query: string) => void;
  setSortBy: (sort: string) => void;
  setFilterBy: (filter: string) => void;

  // Filtered data
  filteredMyKnowledgeBases: KnowledgeBase[];
  filteredSharedKnowledgeBases: SharedKnowledgeBase[];
  filteredPublicKnowledgeBases: KnowledgeBase[];

  // Stats
  totalResults: number;
  hasActiveFilters: boolean;
}

/**
 * Custom hook for searching and filtering knowledge bases
 */
export const useSearchAndFilter = ({
  knowledgeBases,
  sharedKnowledgeBases = [],
  publicKnowledgeBases,
}: UseSearchAndFilterProps): UseSearchAndFilterReturn => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("updated_desc");
  const [filterBy, setFilterBy] = useState("all");

  // Helper function to convert API format to component format
  const convertApiToComponent = (apiKb: ApiKnowledgeBase): KnowledgeBase => {
    // Debug: Log the original API data to understand the structure
    console.log('API Knowledge Base:', apiKb);
    
    return {
      id: apiKb.id,
      name: apiKb.name,
      description: apiKb.description || '',
      isPublic: apiKb.is_public ?? false,
      createdAt: apiKb.created_at || new Date().toISOString(),
      updatedAt: apiKb.updated_at || new Date().toISOString(),
      userId: apiKb.user_id || '',
      userName: apiKb.user_name || undefined,
    };
  };

  // Helper function to filter and sort knowledge bases
  const filterKnowledgeBases = useMemo(() => {
    return (items: ApiKnowledgeBase[]): KnowledgeBase[] => {
      // Convert API format to component format
      const converted = items.map(convertApiToComponent);
      let filtered = [...converted];

      // Apply search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        filtered = filtered.filter(
          (item) =>
            item.name.toLowerCase().includes(query) ||
            (item.description && item.description.toLowerCase().includes(query))
        );
      }

      // Apply category filter - Note: converted format doesn't have document_ids
      // This would need to be enhanced if document filtering is needed
      switch (filterBy) {
        case "active":
        case "has_documents":
        case "no_documents":
        case "all":
        default:
          break;
      }

      // Apply sorting
      filtered.sort((a, b) => {
        switch (sortBy) {
          case "updated_desc":
            return (
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
            );
          case "updated_asc":
            return (
              new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
            );
          case "name_asc":
            return a.name.localeCompare(b.name);
          case "name_desc":
            return b.name.localeCompare(a.name);
          case "created_desc":
            return (
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
          case "created_asc":
            return (
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            );
          default:
            return 0;
        }
      });

      return filtered;
    };
  }, [searchQuery, sortBy, filterBy]);

  // Helper function to filter and sort shared knowledge bases
  const filterSharedKnowledgeBases = useMemo(() => {
    return (items: SharedKnowledgeBase[]): SharedKnowledgeBase[] => {
      let filtered = [...items];

      // Apply search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        filtered = filtered.filter(
          (item) =>
            item.title.toLowerCase().includes(query) ||
            (item.description && item.description.toLowerCase().includes(query))
        );
      }

      // Apply category filter - SharedKnowledgeBase doesn't have document_ids, so skip document filters
      switch (filterBy) {
        case "active":
        case "has_documents":
        case "no_documents":
        case "all":
        default:
          break;
      }

      // Apply sorting
      filtered.sort((a, b) => {
        switch (sortBy) {
          case "updated_desc":
            return (
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
            );
          case "updated_asc":
            return (
              new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
            );
          case "name_asc":
            return a.title.localeCompare(b.title);
          case "name_desc":
            return b.title.localeCompare(a.title);
          case "created_desc":
            return (
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
          case "created_asc":
            return (
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            );
          default:
            return 0;
        }
      });

      return filtered;
    };
  }, [searchQuery, sortBy, filterBy]);

  // Apply filtering and sorting to each category
  const filteredMyKnowledgeBases = useMemo(
    () => filterKnowledgeBases(knowledgeBases),
    [knowledgeBases, filterKnowledgeBases]
  );

  const filteredSharedKnowledgeBases = useMemo(
    () => filterSharedKnowledgeBases(sharedKnowledgeBases),
    [sharedKnowledgeBases, filterSharedKnowledgeBases]
  );

  const filteredPublicKnowledgeBases = useMemo(
    () => filterKnowledgeBases(publicKnowledgeBases),
    [publicKnowledgeBases, filterKnowledgeBases]
  );

  // Calculate total results
  const totalResults =
    filteredMyKnowledgeBases.length +
    filteredSharedKnowledgeBases.length +
    filteredPublicKnowledgeBases.length;

  // Check if any filters are active
  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    sortBy !== "updated_desc" ||
    filterBy !== "all";

  return {
    // State
    searchQuery,
    sortBy,
    filterBy,

    // Actions
    setSearchQuery,
    setSortBy,
    setFilterBy,

    // Filtered data
    filteredMyKnowledgeBases,
    filteredSharedKnowledgeBases,
    filteredPublicKnowledgeBases,

    // Stats
    totalResults,
    hasActiveFilters,
  };
};
