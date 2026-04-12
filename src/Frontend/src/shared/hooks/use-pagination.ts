import { useCallback, useState } from 'react';

interface UsePaginationReturn {
  page: number;
  pageSize: number;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  resetPagination: () => void;
}

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;

export function usePagination(): UsePaginationReturn {
  const [page, setPage] = useState(DEFAULT_PAGE);
  const [pageSize, setPageSizeState] = useState(DEFAULT_PAGE_SIZE);

  const setPageSize = useCallback((newPageSize: number) => {
    setPageSizeState(newPageSize);
    setPage(DEFAULT_PAGE);
  }, []);

  const resetPagination = useCallback(() => {
    setPage(DEFAULT_PAGE);
    setPageSizeState(DEFAULT_PAGE_SIZE);
  }, []);

  return {
    page,
    pageSize,
    setPage,
    setPageSize,
    resetPagination,
  };
}
