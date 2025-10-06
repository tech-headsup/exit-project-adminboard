import {
  useQueryStates,
  parseAsInteger,
  parseAsString,
  parseAsJson,
} from "nuqs";
import { useCallback, useMemo } from "react";
import {
  SortOptions,
  SearchFilters,
  PaginationState,
} from "@/types/tableTypes";
import { z } from "zod";

/**
 * Configuration for useTableState hook
 */
interface UseTableStateConfig<T> {
  /** Default page size */
  defaultPageSize?: number;
  /** Default sort options */
  defaultSort?: SortOptions<T>;
  /** Default filters */
  defaultFilters?: SearchFilters<T>;
}

/**
 * Generic hook for managing table state via URL parameters
 * Handles pagination, sorting, filtering, and search
 */
export function useTableState<T>({
  defaultPageSize = 10,
  defaultSort,
  defaultFilters = {},
}: UseTableStateConfig<T> = {}) {
  // Create Zod validators for JSON parsing
  const sortValidator = z.record(
    z.string(),
    z.union([z.literal(1), z.literal(-1)])
  );
  const filtersValidator = z.record(z.string(), z.any());

  // URL state management
  const [queryState, setQueryState] = useQueryStates(
    {
      page: parseAsInteger.withDefault(1),
      limit: parseAsInteger.withDefault(defaultPageSize),
      searchText: parseAsString.withDefault(""),
      sort: parseAsJson(sortValidator.parse).withDefault(
        (defaultSort || {}) as Record<string, 1 | -1>
      ),
      filters: parseAsJson(filtersValidator.parse).withDefault(defaultFilters),
    },
    {
      history: "push",
      shallow: true,
    }
  );

  // Extract state
  const { page, limit, searchText, sort, filters } = queryState;

  // Pagination state
  const pagination: PaginationState = useMemo(
    () => ({ page, limit }),
    [page, limit]
  );

  // Update functions
  const updatePage = useCallback(
    (newPage: number) => {
      setQueryState({ page: newPage });
    },
    [setQueryState]
  );

  const updatePageSize = useCallback(
    (newLimit: number) => {
      setQueryState({ limit: newLimit, page: 1 }); // Reset to page 1 when changing page size
    },
    [setQueryState]
  );

  const updateSearchText = useCallback(
    (text: string) => {
      setQueryState({ searchText: text, page: 1 }); // Reset to page 1 when searching
    },
    [setQueryState]
  );

  const updateSort = useCallback(
    (newSort: SortOptions<T>) => {
      setQueryState({ sort: newSort as Record<string, 1 | -1>, page: 1 });
    },
    [setQueryState]
  );

  const updateFilters = useCallback(
    (
      newFilters:
        | SearchFilters<T>
        | ((prev: SearchFilters<T>) => SearchFilters<T>)
    ) => {
      const updatedFilters =
        typeof newFilters === "function" ? newFilters(filters) : newFilters;
      setQueryState({ filters: updatedFilters, page: 1 }); // Reset to page 1 when filtering
    },
    [setQueryState, filters]
  );

  const resetFilters = useCallback(() => {
    setQueryState({
      filters: defaultFilters,
      searchText: "",
      page: 1,
    });
  }, [setQueryState, defaultFilters]);

  const resetAll = useCallback(() => {
    setQueryState({
      page: 1,
      limit: defaultPageSize,
      searchText: "",
      sort: (defaultSort || {}) as Record<string, 1 | -1> | null,
      filters: defaultFilters,
    });
  }, [setQueryState, defaultPageSize, defaultSort, defaultFilters]);

  return {
    // Current state
    pagination,
    sorting: sort,
    filters,
    searchText,

    // Raw query state (for debugging)
    rawState: queryState,

    // Update functions
    updatePage,
    updatePageSize,
    updateSearchText,
    updateSort,
    updateFilters,
    resetFilters,
    resetAll,
  };
}
