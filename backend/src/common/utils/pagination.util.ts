import { PaginationOptions, PaginationMeta, PaginatedResult } from '@shared/interfaces/paginated-response.interface';

export function getPaginationOptions(
  page: number = 1,
  limit: number = 20,
  maxLimit: number = 100,
): Required<PaginationOptions> {
  const normalizedPage = Math.max(1, page);
  const normalizedLimit = Math.min(Math.max(1, limit), maxLimit);
  const offset = (normalizedPage - 1) * normalizedLimit;

  return { page: normalizedPage, limit: normalizedLimit, offset };
}

export function createPaginationMeta(
  total: number,
  page: number,
  limit: number,
): PaginationMeta {
  const totalPages = Math.ceil(total / limit);
  return {
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
}

export function createPaginatedResult<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
): PaginatedResult<T> {
  return {
    data,
    meta: createPaginationMeta(total, page, limit),
  };
}
