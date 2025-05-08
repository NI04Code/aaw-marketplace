function formatLog(level: string, message: string, meta?: any) {
    const timestamp = new Date().toISOString();
    const base = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    return meta ? `${base} ${JSON.stringify(meta)}` : base;
}

export const logger = {
    info: (message: string, meta?: any) =>
        console.info(formatLog('info', message, meta)),
    error: (message: string, meta?: any) =>
        console.error(formatLog('error', message, meta)),
    warn: (message: string, meta?: any) =>
        console.warn(formatLog('warn', message, meta)),
};
