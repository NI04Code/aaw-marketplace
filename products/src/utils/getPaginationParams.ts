import { Request } from "express";

export const getPaginationParams = (req: Request) => {
  const DEFAULT_PAGE = 1;
  const DEFAULT_SIZE = 10;
  const MAX_PAGE_SIZE = 100;

  const rawPage = req.query.page_number as string;
  const rawSize = req.query.page_size as string;

  let page = parseInt(rawPage || '') || DEFAULT_PAGE;
  let size = parseInt(rawSize || '') || DEFAULT_SIZE;

  // Ensure page >= 1
  page = Math.max(page, 1);

  // Cap page_size to MAX_PAGE_SIZE
  size = Math.min(Math.max(size, 1), MAX_PAGE_SIZE);

  const offset = (page - 1) * size;

  return { page, pageSize: size, offset };
};
