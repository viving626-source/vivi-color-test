import type { ReactNode } from "react";
import { Link } from "react-router-dom";

export function UniversalLink({
  to,
  className,
  children,
}: {
  to: string;
  className?: string;
  children?: ReactNode;
}) {
  // 站內路由
  if (to.startsWith("/") && !to.startsWith("//")) {
    return (
      <Link to={to} className={className}>
        {children}
      </Link>
    );
  }
  // 錨點 / 郵件 / 電話 / 外鏈
  return (
    <a href={to} className={className}>
      {children}
    </a>
  );
}
