export type PaginationMeta = {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
};

export type PaginatedResult<TItem> =
  PaginationMeta & {
    items: TItem[];
  };

export type PaginationOptions = {
  page?: number;
  pageSize?: number;
};