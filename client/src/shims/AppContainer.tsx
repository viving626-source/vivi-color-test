import type { ReactNode } from "react";

export function AppContainer({ children }: { children: ReactNode; defaultTheme?: string }) {
  return <>{children}</>;
}
