export interface CursorPaginated<T> {
  data: T[];
  meta: {
    nextCursor?: string;
    prevCursor?: string;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    limit: number;
  };
}
