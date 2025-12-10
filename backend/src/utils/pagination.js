// backend/src/utils/pagination.js
// Pagination helpers

/**
 * Parse pagination params from request query
 */
export const parsePagination = (query) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 20));
  const skip = (page - 1) * limit;
  
  const sort = query.sort || "createdAt";
  const order = query.order === "asc" ? 1 : -1;
  
  return {
    page,
    limit,
    skip,
    sort: { [sort]: order },
  };
};

/**
 * Create paginated response
 */
export const paginatedResponse = (data, total, { page, limit }) => {
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;
  
  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage,
      hasPrevPage,
      nextPage: hasNextPage ? page + 1 : null,
      prevPage: hasPrevPage ? page - 1 : null,
    },
  };
};

/**
 * Cursor-based pagination helper
 */
export const parseCursorPagination = (query) => {
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 20));
  const cursor = query.cursor || null;
  const direction = query.direction === "prev" ? "prev" : "next";
  
  return { limit, cursor, direction };
};

/**
 * Create cursor-paginated response
 */
export const cursorPaginatedResponse = (data, { limit, getNextCursor, getPrevCursor }) => {
  const hasMore = data.length > limit;
  const items = hasMore ? data.slice(0, limit) : data;
  
  return {
    data: items,
    pagination: {
      hasMore,
      nextCursor: items.length > 0 ? getNextCursor(items[items.length - 1]) : null,
      prevCursor: items.length > 0 ? getPrevCursor(items[0]) : null,
    },
  };
};

export default {
  parsePagination,
  paginatedResponse,
  parseCursorPagination,
  cursorPaginatedResponse,
};




