const isDev = __DEV__;

export const logger = {
  info: (msg: string, ...args: unknown[]) =>
    isDev && console.log(`[INFO] ${msg}`, ...args),
  warn: (msg: string, ...args: unknown[]) =>
    isDev && console.warn(`[WARN] ${msg}`, ...args),
  error: (msg: string, ...args: unknown[]) =>
    console.error(`[ERROR] ${msg}`, ...args), // always log errors
};
