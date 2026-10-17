// 獨立部署下應用根路徑為 "/"，直接返回路徑本身
export function resolveAppUrl(path: string): string {
  if (!path) return "/";
  return path.startsWith("http") ? path : path;
}
