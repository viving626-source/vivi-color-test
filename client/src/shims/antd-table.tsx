import type { ReactNode } from "react";

export interface ColumnType<T> {
  title?: ReactNode;
  key?: string;
  dataIndex?: keyof T | string;
  width?: number | string;
  align?: "left" | "center" | "right";
  ellipsis?: boolean;
  fixed?: "left" | "right";
  render?: (value: unknown, record: T, index: number) => ReactNode;
}

export interface TableProps<T> {
  columns?: ColumnType<T>[];
  dataSource?: T[];
  rowKey?: keyof T | ((r: T) => string);
  loading?: boolean;
  className?: string;
  scroll?: { x?: number; y?: number };
  pagination?: {
    current?: number;
    pageSize?: number;
    total?: number;
    showSizeChanger?: boolean;
    onChange?: (page: number, pageSize: number) => void;
    showTotal?: (total: number) => ReactNode;
  } | false;
}

export function Table<T extends Record<string, unknown>>(props: TableProps<T>) {
  const { columns = [], dataSource = [], rowKey, loading, pagination, className } = props;

  const getKey = (r: T, i: number): string => {
    if (typeof rowKey === "function") return rowKey(r);
    if (rowKey && r[rowKey as string] !== undefined) return String(r[rowKey as string]);
    return String(i);
  };

  const current = pagination && pagination.current ? pagination.current : 1;
  const pageSize = pagination && pagination.pageSize ? pagination.pageSize : dataSource.length;
  const total = pagination && pagination.total !== undefined ? pagination.total : dataSource.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className={className}>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm" style={{ minWidth: props.scroll?.x }}>
          <thead>
            <tr>
              {columns.map((c, i) => (
                <th
                  key={c.key ?? String(i)}
                  style={{ width: c.width, textAlign: c.align ?? "left" }}
                  className="border-b border-border bg-cream px-3 py-3 font-medium text-muted-foreground whitespace-nowrap"
                >
                  {c.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="px-3 py-10 text-center text-muted-foreground">
                  載入中...
                </td>
              </tr>
            ) : dataSource.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-3 py-10 text-center text-muted-foreground">
                  暫無數據
                </td>
              </tr>
            ) : (
              dataSource.map((record, ri) => (
                <tr key={getKey(record, ri)} className="border-b border-border/60 hover:bg-cream/60">
                  {columns.map((c, ci) => {
                    const value = c.dataIndex ? record[c.dataIndex as string] : undefined;
                    const content = c.render
                      ? c.render(value, record, ri)
                      : (value as ReactNode) ?? "—";
                    return (
                      <td
                        key={c.key ?? String(ci)}
                        style={{ textAlign: c.align ?? "left" }}
                        className={`px-3 py-3 align-middle ${c.ellipsis ? "max-w-[220px] truncate" : ""}`}
                      >
                        {content as ReactNode}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {pagination && (
        <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-3 text-sm text-muted-foreground">
          <div>{pagination.showTotal ? pagination.showTotal(total) : `共 ${total} 條`}</div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded border border-border px-2 py-1 disabled:opacity-40"
              disabled={current <= 1}
              onClick={() => pagination.onChange?.(current - 1, pageSize)}
            >
              上一頁
            </button>
            <span>
              {current} / {totalPages}
            </span>
            <button
              type="button"
              className="rounded border border-border px-2 py-1 disabled:opacity-40"
              disabled={current >= totalPages}
              onClick={() => pagination.onChange?.(current + 1, pageSize)}
            >
              下一頁
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
