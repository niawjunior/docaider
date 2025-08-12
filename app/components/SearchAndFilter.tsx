"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, X, Filter, SortAsc } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

export interface SearchAndFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  filterBy: string;
  onFilterChange: (filter: string) => void;
  className?: string;
  placeholder?: string;
  showFilters?: boolean;
  showSort?: boolean;
}

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

export interface SortOption {
  value: string;
  label: string;
}

const getSortOptions = (
  t: ReturnType<typeof useTranslations>
): SortOption[] => [
  { value: "updated_desc", label: t("recentlyUpdated") },
  { value: "updated_asc", label: t("oldestFirst") },
  { value: "name_asc", label: t("nameAZ") },
  { value: "name_desc", label: t("nameZA") },
  { value: "created_desc", label: t("recentlyCreated") },
  { value: "created_asc", label: t("oldestCreated") },
];

const getFilterOptions = (
  t: ReturnType<typeof useTranslations>
): FilterOption[] => [
  { value: "all", label: t("all") },
  { value: "active", label: t("active") },
  { value: "has_documents", label: t("hasDocuments") },
  { value: "no_documents", label: t("empty") },
];

export default function SearchAndFilter({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  filterBy,
  onFilterChange,
  className,
  placeholder,
  showFilters = true,
  showSort = true,
}: SearchAndFilterProps) {
  const t = useTranslations("search");
  const defaultSortOptions = getSortOptions(t);
  const defaultFilterOptions = getFilterOptions(t);
  placeholder = placeholder || t("searchQuery");
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(localSearchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [localSearchQuery, onSearchChange]);

  // Update local state when external search query changes
  useEffect(() => {
    setLocalSearchQuery(searchQuery);
  }, [searchQuery]);

  const clearSearch = () => {
    setLocalSearchQuery("");
    onSearchChange("");
  };

  const hasActiveFilters =
    searchQuery || sortBy !== "updated_desc" || filterBy !== "all";

  const clearAllFilters = () => {
    setLocalSearchQuery("");
    onSearchChange("");
    onSortChange("updated_desc");
    onFilterChange("all");
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          type="text"
          placeholder={placeholder}
          value={localSearchQuery}
          onChange={(e) => setLocalSearchQuery(e.target.value)}
          className="pl-10 pr-10"
        />
        {localSearchQuery && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSearch}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Filters and Sort */}
      {(showFilters || showSort) && (
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex flex-wrap gap-2 items-center w-full">
            {showFilters && (
              <div className="flex items-center gap-2 md:w-[140px] w-full">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={filterBy} onValueChange={onFilterChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t("filterBy")} />
                  </SelectTrigger>
                  <SelectContent className="w-full">
                    {defaultFilterOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                        {option.count !== undefined && (
                          <Badge variant="secondary" className="ml-2 text-xs">
                            {option.count}
                          </Badge>
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {showSort && (
              <div className="flex items-center gap-2 md:w-[140px] w-full">
                <SortAsc className="h-4 w-4 text-muted-foreground" />
                <Select value={sortBy} onValueChange={onSortChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t("sortBy")} />
                  </SelectTrigger>
                  <SelectContent>
                    {defaultSortOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Active Filters & Clear All */}
          {hasActiveFilters && (
            <div className="flex items-center gap-2">
              <div className="flex flex-wrap gap-1">
                {searchQuery && (
                  <Badge variant="secondary" className="text-xs">
                    {t("search")}: &ldquo;{searchQuery}&rdquo;
                  </Badge>
                )}
                {filterBy !== "all" && (
                  <Badge variant="secondary" className="text-xs">
                    {t("filter")}:{" "}
                    {
                      defaultFilterOptions.find((f) => f.value === filterBy)
                        ?.label
                    }
                  </Badge>
                )}
                {sortBy !== "updated_desc" && (
                  <Badge variant="secondary" className="text-xs">
                    {t("sort")}:{" "}
                    {defaultSortOptions.find((s) => s.value === sortBy)?.label}
                  </Badge>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllFilters}
                className="text-xs"
              >
                {t("clearAll")}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
