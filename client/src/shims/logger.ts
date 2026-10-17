// 簡易日誌 shim，替代平台 logger
export const logger = {
  info: (...args: unknown[]) => console.info("[Vivi]", ...args),
  warn: (...args: unknown[]) => console.warn("[Vivi]", ...args),
  error: (...args: unknown[]) => console.error("[Vivi]", ...args),
  debug: (...args: unknown[]) => console.debug("[Vivi]", ...args),
};
export default logger;
