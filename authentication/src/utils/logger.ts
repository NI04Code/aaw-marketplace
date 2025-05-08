// @src/utils/logger.ts
export const logger = {
    info: (message: string, meta?: any) => console.info(message, meta || ''),
    error: (message: string, meta?: any) => console.error(message, meta || ''),
    warn: (message: string, meta?: any) => console.warn(message, meta || ''),
};
  