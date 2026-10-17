import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { logger } from '@lark-apaas/client-toolkit/logger';
import { Table, type TableProps } from '@lark-apaas/client-toolkit/antd-table';
import {
  Download,
  RefreshCw,
  Search,
  Eye,
  CheckCircle2,
  Wallet,
  Lock,
  LogOut,
  Bell,
} from 'lucide-react';

import { colorTest } from '@client/src/api';
import type { AdminOrderItem } from '@client/src/api/colorTest';
import { Button } from '@client/src/components/ui/button';
import { Badge } from '@client/src/components/ui/badge';
import { Input } from '@client/src/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@client/src/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@client/src/components/ui/dialog';
import { Image } from '@client/src/components/ui/image';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@client/src/components/ui/alert';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@client/src/components/ui/card';

import type { AdminRecordItem } from '@shared/api.interface';

type PaymentFilter = 'all' | 'pending' | 'paid';

const AdminPage = () => {
  const [page, setPage] = useState<number>(1);
  const [pageSize] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);
  const [items, setItems] = useState<AdminRecordItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>('all');
  const [exporting, setExporting] = useState<boolean>(false);
  const [detailRecord, setDetailRecord] = useState<AdminRecordItem | null>(null);
  const [detailOpen, setDetailOpen] = useState<boolean>(false);

  // 人工收款待確認訂單
  const [pendingOrders, setPendingOrders] = useState<AdminOrderItem[]>([]);
  const [pendingLoading, setPendingLoading] = useState<boolean>(false);
  const [confirmingId, setConfirmingId] = useState<string>('');

  // 管理員密鑰（存於本機 localStorage）
  const [storedKey, setStoredKey] = useState<string>(
    () => localStorage.getItem('vivi_admin_key') ?? '',
  );
  const [keyInput, setKeyInput] = useState<string>('');
  const [authError, setAuthError] = useState<string>('');

  const isAuthError = useCallback((err: unknown): boolean => {
    const msg = err instanceof Error ? err.message : String(err);
    return msg.includes('密鑰') || msg.includes('未授權') || msg.includes('401');
  }, []);

  const handleSaveKey = useCallback(async (): Promise<void> => {
    const trimmed = keyInput.trim();
    if (!trimmed) return;
    localStorage.setItem('vivi_admin_key', trimmed);
    setStoredKey(trimmed);
    setAuthError('');
    setKeyInput('');
  }, [keyInput]);

  const handleLogout = useCallback((): void => {
    localStorage.removeItem('vivi_admin_key');
    setStoredKey('');
    setKeyInput('');
    setAuthError('');
  }, []);

  const fetchPendingOrders = useCallback(async (): Promise<void> => {
    setPendingLoading(true);
    try {
      const res = await colorTest.listAdminOrders('pending');
      setPendingOrders(res.items);
      setAuthError('');
    } catch (err) {
      logger.error('獲取待確認訂單失敗', err);
      if (isAuthError(err)) {
        setAuthError('管理員密鑰錯誤，請重新輸入');
        localStorage.removeItem('vivi_admin_key');
        setStoredKey('');
      }
    } finally {
      setPendingLoading(false);
    }
  }, [isAuthError]);

  useEffect(() => {
    if (storedKey) void fetchPendingOrders();
  }, [fetchPendingOrders, storedKey]);

  const fetchRecords = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const response: Awaited<ReturnType<typeof colorTest.getAdminRecords>> =
        await colorTest.getAdminRecords(page, pageSize);
      setItems(response.items);
      setTotal(response.total);
    } catch (err: unknown) {
      logger.error('取得管理記錄失敗', err);
      if (isAuthError(err)) {
        setAuthError('管理員密鑰錯誤，請重新輸入');
        localStorage.removeItem('vivi_admin_key');
        setStoredKey('');
      } else {
        setError('載入記錄失敗，請稍後重試');
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthError, page, pageSize]);

  useEffect(() => {
    if (storedKey) void fetchRecords();
  }, [fetchRecords, storedKey]);

  const handleConfirmPaid = useCallback(
    async (orderId: string): Promise<void> => {
      setConfirmingId(orderId);
      try {
        await colorTest.adminConfirmOrder(orderId);
        setPendingOrders((prev) => prev.filter((o) => o.id !== orderId));
        void fetchRecords();
        void fetchPendingOrders();
      } catch (err) {
        logger.error('確認收款失敗', err);
      } finally {
        setConfirmingId('');
      }
    },
    [fetchRecords, fetchPendingOrders],
  );

  // ---------- 到單提示：聲音 + 瀏覽器通知 + 自動輪詢 ----------
  const knownOrderIdsRef = useRef<Set<string> | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const [notifyPermission, setNotifyPermission] = useState<string>(
    typeof window !== 'undefined' && 'Notification' in window
      ? Notification.permission
      : 'unsupported',
  );

  const playBeep = useCallback((): void => {
    try {
      const Ctx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!Ctx) return;
      if (!audioCtxRef.current) audioCtxRef.current = new Ctx();
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') void ctx.resume();
      [0, 0.28, 0.56].forEach((t) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.value = 880;
        gain.gain.setValueAtTime(0.0001, ctx.currentTime + t);
        gain.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + t + 0.2);
        osc.start(ctx.currentTime + t);
        osc.stop(ctx.currentTime + t + 0.22);
      });
    } catch {
      // 音效不可用時靜默
    }
  }, []);

  const enableNotify = useCallback(async (): Promise<void> => {
    if (!('Notification' in window)) {
      setNotifyPermission('unsupported');
      return;
    }
    const p = await Notification.requestPermission();
    setNotifyPermission(p);
    // 用戶與頁面互動後順便激活音頻上下文
    playBeep();
  }, [playBeep]);

  // 待確認列表出現新單 → 提示音 + 瀏覽器通知（首次載入不響）
  useEffect(() => {
    if (!storedKey) {
      knownOrderIdsRef.current = null;
      return;
    }
    const ids = pendingOrders.map((o) => o.id);
    if (knownOrderIdsRef.current === null) {
      knownOrderIdsRef.current = new Set(ids);
      return;
    }
    const known = knownOrderIdsRef.current;
    const fresh = pendingOrders.filter((o) => !known.has(o.id));
    if (fresh.length > 0) {
      playBeep();
      const n = fresh[0];
      if ('Notification' in window && Notification.permission === 'granted') {
        try {
          new Notification('🔔 新訂單待收款', {
            body: `${n.orderNo} · ${n.currency} ${n.amount.toFixed(2)} · ${n.paymentMethod || ''}`,
            tag: n.id,
          });
        } catch {
          // 通知失敗忽略
        }
      }
      ids.forEach((id) => known.add(id));
    }
  }, [pendingOrders, storedKey, playBeep]);

  // 登入後每 15 秒自動刷新待確認收款與記錄
  useEffect(() => {
    if (!storedKey) return;
    const timer = window.setInterval(() => {
      void fetchPendingOrders();
      void fetchRecords();
    }, 15000);
    return () => window.clearInterval(timer);
  }, [storedKey, fetchPendingOrders, fetchRecords]);

  const handlePageChange = useCallback((newPage: number): void => {
    setPage(newPage);
  }, []);

  // 前端過濾（當前頁範圍內） — 後端若支援 server-side 搜索可替換
  const filteredItems: AdminRecordItem[] = useMemo(() => {
    let result: AdminRecordItem[] = items;
    if (searchKeyword.trim()) {
      const keyword: string = searchKeyword.trim().toLowerCase();
      result = result.filter((item: AdminRecordItem) =>
        item.sessionId.toLowerCase().includes(keyword) ||
        (item.email && item.email.toLowerCase().includes(keyword)),
      );
    }
    if (paymentFilter !== 'all') {
      result = result.filter(
        (item: AdminRecordItem) => item.paymentStatus === paymentFilter,
      );
    }
    return result;
  }, [items, searchKeyword, paymentFilter]);

  // 統計卡片：從當前頁 items 計算已付費 / 已發送數量
  // TODO: 後端補齊總覽統計接口後，替換為真實總計
  const paidCount: number = useMemo(
    () => items.filter((item: AdminRecordItem) => item.paymentStatus === 'paid').length,
    [items],
  );
  const emailSentCount: number = useMemo(
    () => items.filter((item: AdminRecordItem) => item.emailSent).length,
    [items],
  );

  const handleExport = useCallback(async (): Promise<void> => {
    if (exporting) return;
    setExporting(true);
    try {
      const result: Awaited<ReturnType<typeof colorTest.exportAdminRecords>> =
        await colorTest.exportAdminRecords();
      if (result.downloadUrl) {
        window.open(result.downloadUrl, '_blank');
      }
    } catch (err: unknown) {
      logger.error('匯出記錄失敗', err);
    } finally {
      setExporting(false);
    }
  }, [exporting]);

  const handleViewDetail = useCallback((record: AdminRecordItem): void => {
    setDetailRecord(record);
    setDetailOpen(true);
  }, []);

  const columns: TableProps<AdminRecordItem>['columns'] = [
    {
      title: '序號',
      key: 'index',
      width: 70,
      align: 'center',
      render: (_value: unknown, _record: AdminRecordItem, index: number) =>
        (page - 1) * pageSize + index + 1,
    },
    {
      title: 'Session ID',
      dataIndex: 'sessionId',
      key: 'sessionId',
      width: 200,
      ellipsis: true,
      render: (value: string) => (
        <span className="font-mono text-xs text-foreground">{value}</span>
      ),
    },
    {
      title: '付款狀態',
      dataIndex: 'paymentStatus',
      key: 'paymentStatus',
      width: 110,
      align: 'center',
      render: (status: string) => {
        if (status === 'paid') {
          return (
            <Badge
              variant="default"
              className="bg-burgundy text-cream-light border-burgundy-deep"
            >
              已付費
            </Badge>
          );
        }
        if (status === 'pending') {
          return (
            <Badge variant="secondary" className="text-muted-foreground">
              免費
            </Badge>
          );
        }
        return (
          <Badge variant="outline" className="text-muted-foreground">
            {status || '未知'}
          </Badge>
        );
      },
    },
    {
      title: '電郵',
      dataIndex: 'email',
      key: 'email',
      width: 220,
      ellipsis: true,
      render: (value: string | undefined) => value || '—',
    },
    {
      title: '郵件發送',
      dataIndex: 'emailSent',
      key: 'emailSent',
      width: 110,
      align: 'center',
      render: (sent: boolean) =>
        sent ? (
          <span className="text-success font-medium">☑ 已發送</span>
        ) : (
          <span className="text-muted-foreground">✕ 未發送</span>
        ),
    },
    {
      title: '建立時間',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (value: string) =>
        value ? new Date(value).toLocaleString('zh-HK') : '—',
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 120,
      align: 'center',
      render: (_value: unknown, record: AdminRecordItem) => (
        <Button
          variant="ghost"
          size="sm"
          className="text-burgundy hover:text-burgundy-deep"
          onClick={() => handleViewDetail(record)}
        >
          <Eye className="size-4" />
          查看詳情
        </Button>
      ),
    },
  ];

  // 未輸入管理員密鑰：顯示登入閘門
  if (!storedKey) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center px-4">
        <Card className="w-full max-w-md border-burgundy/30 shadow-lg">
          <CardHeader className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-serif text-xl font-bold text-burgundy tracking-tight">
                Vivi Macau
              </span>
              <span className="h-4 w-px bg-border" />
              <span className="text-xs text-muted-foreground tracking-wider">
                管理後台
              </span>
            </div>
            <CardTitle className="font-serif text-lg text-foreground flex items-center gap-2">
              <Lock className="size-4 text-burgundy" />
              請輸入管理員密鑰
            </CardTitle>
            <CardDescription className="text-muted-foreground text-sm">
              密鑰僅保存在你這台設備的瀏覽器中，用於核實收款與查看測試記錄。
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              type="password"
              autoFocus
              placeholder="貼上管理員密鑰"
              value={keyInput}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setKeyInput(e.target.value)
              }
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                if (e.key === 'Enter') void handleSaveKey();
              }}
              className="bg-cream-light"
            />
            {authError && (
              <Alert variant="destructive">
                <AlertDescription>{authError}</AlertDescription>
              </Alert>
            )}
            <Button
              className="w-full bg-burgundy text-cream-light hover:bg-burgundy-deep"
              onClick={handleSaveKey}
              disabled={!keyInput.trim()}
            >
              進入後台
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream pb-12">
      {/* 頁首 */}
      <header className="border-b border-border bg-cream-light">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="font-serif text-2xl font-bold text-burgundy tracking-tight">
              Vivi Macau
            </span>
            <span className="h-5 w-px bg-border" />
            <span className="text-sm text-muted-foreground tracking-wider">
              管理後台
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto text-muted-foreground hover:text-burgundy"
              onClick={handleLogout}
            >
              <LogOut className="size-4" />
              登出
            </Button>
          </div>
          <h1 className="font-serif text-3xl text-foreground mb-2">
            測試記錄管理
          </h1>
          <p className="text-muted-foreground text-sm">
            管理客戶測試記錄，支持匯出與查看
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 pt-8 space-y-6">
        {/* 人工收款待確認訂單 */}
        <section className="rounded-2xl border border-burgundy/40 bg-amber-50/60 p-5">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <Wallet className="size-5 text-burgundy" />
            <h2 className="font-serif text-lg text-burgundy">
              待確認收款（{pendingOrders.length}）
            </h2>
            <span className="text-xs text-muted-foreground">
              核實客戶轉賬/掃碼後點擊確認，系統即自動解鎖完整報告
            </span>
            <span className="text-xs text-emerald-600 inline-flex items-center gap-1">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              每 15 秒自動刷新
            </span>
            {notifyPermission !== 'granted' && notifyPermission !== 'unsupported' && (
              <Button
                variant="outline"
                size="sm"
                className="text-burgundy border-burgundy/40"
                onClick={() => void enableNotify()}
              >
                <Bell className="size-4" />
                開啟到單提示音
              </Button>
            )}
            {notifyPermission === 'granted' && (
              <span className="text-xs text-emerald-600 inline-flex items-center gap-1">
                <Bell className="size-3.5" />
                到單提示已開啟
              </span>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto text-burgundy"
              onClick={() => void fetchPendingOrders()}
              disabled={pendingLoading}
            >
              <RefreshCw className={`size-4 ${pendingLoading ? 'animate-spin' : ''}`} />
              刷新
            </Button>
          </div>
          <div className="space-y-2">
            {pendingOrders.length === 0 && (
              <div className="rounded-xl border border-dashed border-border bg-cream-light/60 px-4 py-6 text-center text-sm text-muted-foreground">
                暫無待確認收款。客戶付款後，訂單會即時出現在這裡。
              </div>
            )}
            {pendingOrders.map((o) => (
                <div
                  key={o.id}
                  className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-cream-light px-4 py-2.5"
                >
                  <span className="font-mono text-xs">{o.orderNo}</span>
                  <span className="text-sm font-medium text-burgundy">
                    {o.currency} {o.amount.toFixed(2)}
                  </span>
                  <span className="text-sm text-foreground/80">
                    {o.email || '—'}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {o.paymentMethod}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(o.createdAt).toLocaleString('zh-HK')}
                  </span>
                  <Button
                    size="sm"
                    className="ml-auto bg-burgundy text-cream-light hover:bg-burgundy-deep"
                    disabled={confirmingId === o.id}
                    onClick={() => handleConfirmPaid(o.id)}
                  >
                    <CheckCircle2 className="size-4" />
                    {confirmingId === o.id ? '確認中…' : '確認已收款'}
                  </Button>
                </div>
              ))}
            </div>
          </section>

        {/* 統計卡片 */}
        <section
          data-ai-section-type="card-stat"
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          <div className="rounded-2xl border border-border bg-cream-light p-5 shadow-xs">
            <div className="text-sm text-muted-foreground mb-2">總記錄數</div>
            <div className="font-serif text-3xl text-burgundy font-semibold">
              {loading ? '—' : total.toLocaleString()}
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-cream-light p-5 shadow-xs">
            <div className="text-sm text-muted-foreground mb-2">已付費數</div>
            <div className="font-serif text-3xl text-burgundy font-semibold">
              {/* TODO: 後端補齊總覽統計接口後，替換為全域已付費數量 */}
              {loading ? '—' : paidCount.toLocaleString()}
              <span className="text-xs text-muted-foreground font-sans ml-1">
                （當前頁）
              </span>
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-cream-light p-5 shadow-xs">
            <div className="text-sm text-muted-foreground mb-2">已發送郵件</div>
            <div className="font-serif text-3xl text-burgundy font-semibold">
              {/* TODO: 後端補齊總覽統計接口後，替換為全域已發送數量 */}
              {loading ? '—' : emailSentCount.toLocaleString()}
              <span className="text-xs text-muted-foreground font-sans ml-1">
                （當前頁）
              </span>
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-cream-light p-5 shadow-xs">
            <div className="text-sm text-muted-foreground mb-2">今日新增</div>
            <div className="font-serif text-3xl text-burgundy font-semibold">
              {/* TODO: 後端補齊今日新增統計接口 */}
              —
            </div>
          </div>
        </section>

        {/* 篩選列 */}
        <section className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            <div className="relative max-w-sm flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="搜尋 sessionId 或電郵"
                value={searchKeyword}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSearchKeyword(e.target.value)
                }
                className="pl-9 bg-cream-light"
              />
            </div>
            <div className="w-full sm:w-40">
              <Select
                value={paymentFilter}
                onValueChange={(val: string) =>
                  setPaymentFilter(val as PaymentFilter)
                }
              >
                <SelectTrigger className="w-full bg-cream-light">
                  <SelectValue placeholder="付款狀態" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部</SelectItem>
                  <SelectItem value="pending">免費</SelectItem>
                  <SelectItem value="paid">已付費</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button
            variant="default"
            onClick={handleExport}
            disabled={exporting}
            className="bg-burgundy text-cream-light border-burgundy-deep hover:bg-burgundy-deep"
          >
            <Download className="size-4" />
            {exporting ? '匯出中...' : '匯出記錄'}
          </Button>
        </section>

        {/* 錯誤提示 */}
        {error && (
          <Alert variant="destructive">
            <AlertTitle>載入失敗</AlertTitle>
            <AlertDescription className="flex items-center gap-3">
              <span>{error}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchRecords}
                className="ml-auto"
              >
                <RefreshCw className="size-4" />
                重試
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* 數據表格 */}
        <section className="rounded-2xl border border-border bg-cream-light shadow-xs overflow-hidden">
          <Table<AdminRecordItem>
            rowKey="id"
            columns={columns}
            dataSource={filteredItems}
            loading={loading}
            scroll={{ x: 960, y: 500 }}
            pagination={{
              current: page,
              pageSize,
              total,
              showSizeChanger: false,
              onChange: handlePageChange,
              showTotal: (t: number) => `共 ${t} 條記錄`,
            }}
            // 品牌風格表頭
            className="admin-table"
          />
        </section>
      </main>

      {/* 詳情 Modal */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-cream-light">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl text-burgundy">
              記錄詳情
            </DialogTitle>
            <DialogDescription>
              {detailRecord?.sessionId && (
                <span className="font-mono text-xs">
                  {detailRecord.sessionId}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          {detailRecord && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-muted-foreground text-xs mb-1">
                    記錄 ID
                  </div>
                  <div className="font-mono text-xs break-all">
                    {detailRecord.id}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs mb-1">
                    付款狀態
                  </div>
                  <div>
                    {detailRecord.paymentStatus === 'paid' ? (
                      <Badge
                        variant="default"
                        className="bg-burgundy text-cream-light border-burgundy-deep"
                      >
                        已付費
                      </Badge>
                    ) : detailRecord.paymentStatus === 'pending' ? (
                      <Badge variant="secondary">免費</Badge>
                    ) : (
                      <Badge variant="outline">
                        {detailRecord.paymentStatus || '未知'}
                      </Badge>
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs mb-1">電郵</div>
                  <div className="break-all">
                    {detailRecord.email || '—'}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs mb-1">
                    郵件發送狀態
                  </div>
                  <div>
                    {detailRecord.emailSent ? (
                      <span className="text-success">☑ 已發送</span>
                    ) : (
                      <span className="text-muted-foreground">✕ 未發送</span>
                    )}
                  </div>
                </div>
                <div className="col-span-2">
                  <div className="text-muted-foreground text-xs mb-1">
                    建立時間
                  </div>
                  <div>
                    {detailRecord.createdAt
                      ? new Date(detailRecord.createdAt).toLocaleString(
                          'zh-HK',
                        )
                      : '—'}
                  </div>
                </div>
              </div>

              {/* 照片預覽 */}
              {((detailRecord.facePhotoUrls?.length ?? 0) > 0 || (detailRecord.bodyPhotoUrls?.length ?? 0) > 0) && (
                <div className="pt-3 border-t border-border">
                  <div className="text-muted-foreground text-xs mb-3">
                    上傳照片
                  </div>
                  <div className="space-y-3">
                    {detailRecord.facePhotoUrls && detailRecord.facePhotoUrls.length > 0 && (
                      <div>
                        <div className="text-xs text-muted-foreground mb-2">
                          素顏照（{detailRecord.facePhotoUrls.length}）
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          {detailRecord.facePhotoUrls.map((url, idx) => (
                            <Image
                              key={idx}
                              src={url}
                              alt={`素顏照 ${idx + 1}`}
                              width={80}
                              height={80}
                              className="rounded-lg border border-border object-cover w-20 h-20"
                            />
                          ))}
                        </div>
                      </div>
                    )}
                    {detailRecord.bodyPhotoUrls && detailRecord.bodyPhotoUrls.length > 0 && (
                      <div>
                        <div className="text-xs text-muted-foreground mb-2">
                          全身照（{detailRecord.bodyPhotoUrls.length}）
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          {detailRecord.bodyPhotoUrls.map((url, idx) => (
                            <Image
                              key={idx}
                              src={url}
                              alt={`全身照 ${idx + 1}`}
                              width={80}
                              height={107}
                              className="rounded-lg border border-border object-cover w-20 h-28"
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPage;
