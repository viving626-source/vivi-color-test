import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { logger } from '@lark-apaas/client-toolkit/logger';
import {
  CreditCard,
  Loader2,
  ShieldCheck,
  Lock,
  CheckCircle2,
  Smartphone,
} from 'lucide-react';

import { colorTest } from '@client/src/api';
import { Button } from '@client/src/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@client/src/components/ui/card';
import { Input } from '@client/src/components/ui/input';
import { Label } from '@client/src/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@client/src/components/ui/radio-group';
import { useTestSession } from '@client/src/hooks/useTestSession';

const base = import.meta.env.BASE_URL ?? '/';

// 人工收款模式下的三個錢包（MPay / 微信 / 支付寶）
const WALLETS: Record<
  string,
  { label: string; account: string; qr: string; tip: string; accent: string }
> = {
  mpay: {
    label: 'MPay 澳門通',
    account: '+853 66752916',
    qr: `${base}pay/mpay.jpg`,
    tip: '開啟 MPay App 掃碼轉賬',
    accent: 'text-orange-500',
  },
  wechat: {
    label: '微信支付',
    account: '+86 172 0721 3305',
    qr: `${base}pay/wechat.jpg`,
    tip: '打開微信「掃一掃」付款',
    accent: 'text-green-600',
  },
  alipay: {
    label: '支付寶',
    account: '+86 172 0721 3305',
    qr: `${base}pay/alipay.jpg`,
    tip: '打開支付寶「掃一掃」付款',
    accent: 'text-blue-500',
  },
};

const PAYMENT_METHODS = [
  { id: 'mpay', label: 'MPay 澳門通', desc: '澳門本地錢包，轉賬收款（+853 66752916）', icon: Smartphone },
  { id: 'wechat', label: '微信支付', desc: '微信掃碼付款（+86 172 0721 3305）', icon: Smartphone },
  { id: 'alipay', label: '支付寶', desc: '支付寶掃碼付款（+86 172 0721 3305）', icon: Smartphone },
];

const PaymentPage = () => {
  const navigate = useNavigate();
  const { session } = useTestSession();
  const [email, setEmail] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('mpay');
  const [loading, setLoading] = useState<boolean>(false);
  const [manualChecking, setManualChecking] = useState<boolean>(false);
  const [manualChecked, setManualChecked] = useState<string>('');
  const [error, setError] = useState<string>('');

  // 建立訂單後返回的託管收銀台 / 人工收款
  const [checkout, setCheckout] = useState<Awaited<
    ReturnType<typeof colorTest.createOrder>
  >['checkout'] | null>(null);
  const [orderNo, setOrderNo] = useState<string>('');

  const handleSubmit = async (): Promise<void> => {
    if (!session) {
      setError('未找到測試資料，請重新開始測試');
      return;
    }
    if (!email.trim()) {
      setError('請輸入電郵地址，以便接收完整報告');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('請輸入有效的電郵地址');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await colorTest.createOrder({
        sessionId: session.sessionId,
        email: email.trim(),
        paymentMethod,
        amount: 38,
        currency: 'MOP',
      });
      setOrderNo(res.order.orderNo);
      setCheckout(res.checkout);
      if (res.alreadyPaid) {
        navigate('/report/full');
        return;
      }
      // AsiaPay 託管收銀台：自動提交跳轉
      if (res.checkout?.provider === 'asiapay' && res.checkout.form) {
        const f = res.checkout.form;
        const form = document.createElement('form');
        form.method = f.method;
        form.action = f.action;
        Object.entries(f.fields).forEach(([k, v]) => {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = k;
          input.value = String(v);
          form.appendChild(input);
        });
        document.body.appendChild(form);
        form.submit();
        return;
      }
      // 人工模式：滾到收款區
      setTimeout(() => {
        document.getElementById('manual-pay-area')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (e) {
      logger.error('建立訂單失敗', e);
      setError(e instanceof Error ? e.message : '建立訂單失敗，請稍後重試');
    } finally {
      setLoading(false);
    }
  };

  // 人工模式：客戶聲稱已轉賬，主動查詢（服務端未確認則提示等待）
  const handleManualCheck = async (): Promise<void> => {
    if (!orderNo) return;
    setManualChecking(true);
    setManualChecked('');
    try {
      const res = await colorTest.getOrderStatus(orderNo);
      if (res.order.status === 'paid') {
        navigate('/report/full');
        return;
      }
      setManualChecked('pending');
    } catch {
      setManualChecked('error');
    } finally {
      setManualChecking(false);
    }
  };

  // 人工模式：建立訂單後自動輪詢，管理員確認收款即自動解鎖（無需客戶手動重試）
  const isManual = checkout?.provider === 'manual';
  useEffect(() => {
    if (!isManual || !orderNo) return;
    let stopped = false;
    const poll = async (): Promise<void> => {
      try {
        const res = await colorTest.getOrderStatus(orderNo);
        if (!stopped && res.order.status === 'paid') {
          stopped = true;
          navigate('/report/full');
        }
      } catch {
        // 網絡抖動忽略，下一次輪詢重試
      }
    };
    const timer = window.setInterval(poll, 6000);
    return () => {
      stopped = true;
      window.clearInterval(timer);
    };
  }, [isManual, orderNo, navigate]);

  const wallet = WALLETS[paymentMethod] ?? WALLETS.mpay;

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream-light to-cream pt-24 pb-20 px-4">
      <div className="mx-auto max-w-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-burgundy/30 bg-burgundy/5 px-4 py-1.5 text-xs font-medium tracking-wider text-burgundy mb-4">
            <CreditCard className="size-3.5" />
            安全付款
          </div>
          <h1 className="font-serif text-3xl md:text-4xl text-burgundy mb-3">
            解鎖完整色彩風格報告
          </h1>
          <p className="text-foreground/70 text-sm">
            10+ 頁完整分析 · 詳細風格定位 · 色彩 · 妝容 · 髮型 · 穿搭 · 珠寶建議
          </p>
        </div>

        {/* 人工收款區 */}
        {isManual && (
          <Card id="manual-pay-area" className="mb-6 border-burgundy/40 shadow-lg bg-cream-light">
            <CardHeader className="border-b border-border/70 bg-burgundy/5">
              <CardTitle className="font-serif text-xl text-burgundy flex items-center gap-2">
                <Smartphone className="size-5" />
                掃碼轉賬付款
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-5">
              <div className="flex items-center justify-center gap-2 rounded-xl bg-cream px-4 py-3">
                <span className="text-sm text-muted-foreground">應付金額</span>
                <span className="text-sm text-muted-foreground line-through">MOP 88</span>
                <span className="text-2xl font-bold text-burgundy">MOP 38</span>
              </div>

              {/* 錢包切換 */}
              <div className="flex gap-2">
                {Object.entries(WALLETS).map(([id, w]) => (
                  <button
                    type="button"
                    key={id}
                    onClick={() => setPaymentMethod(id)}
                    className={`flex-1 rounded-xl border px-2 py-2 text-xs font-medium transition ${
                      paymentMethod === id
                        ? 'border-burgundy bg-burgundy text-cream-light'
                        : 'border-border bg-cream-light text-foreground/70 hover:border-burgundy/40'
                    }`}
                  >
                    {w.label}
                  </button>
                ))}
              </div>

              {/* 當前錢包收款碼 */}
              <div className="flex flex-col items-center">
                <div className="rounded-2xl border border-border/70 bg-white p-3 shadow-sm">
                  <img
                    src={wallet.qr}
                    alt={`${wallet.label}收款碼`}
                    className="w-60 h-auto rounded-lg"
                  />
                </div>
                <p className={`mt-3 font-semibold ${wallet.accent}`}>{wallet.tip}</p>
                <p className="text-sm text-foreground/80">
                  收款賬號：<span className="font-mono">{wallet.account}</span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  轉賬時請備注訂單號：<span className="font-mono">{orderNo}</span>
                </p>
              </div>

              <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800 space-y-1">
                <p>1. 請按金額 <span className="font-semibold">MOP 38</span> 掃碼轉賬，轉賬時備注訂單號；</p>
                <p>2. 完成後截圖保存，點擊下方「我已付款」通知我們核實；</p>
                <p>3. 我們核實收款後（通常數分鐘內）將<b>自動</b>為你解鎖完整報告，本頁會自動刷新，請保持打開、無需重複點擊。</p>
                <p className="pt-1">如等待較久，可聯絡客服：
                  電話/WhatsApp <span className="font-mono">+853 6322 9396</span> / 電郵 <span className="font-mono">vivigroupmacau@gmail.com</span>
                </p>
              </div>

              {/* 自動核實中提示 */}
              <div className="flex items-center justify-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-2.5 text-xs text-emerald-700">
                <Loader2 className="size-4 animate-spin" />
                <span>已開啟自動核實，確認收款後本頁將自動解鎖完整報告…</span>
              </div>

              <Button
                type="button"
                onClick={handleManualCheck}
                disabled={manualChecking}
                className="w-full h-11 bg-burgundy text-cream-light hover:bg-burgundy-deep"
              >
                {manualChecking ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="size-4 animate-spin" /> 查詢確認中…
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="size-4" /> 我已付款，查詢並解鎖
                  </span>
                )}
              </Button>
              {manualChecked === 'pending' && (
                <p className="text-center text-xs text-amber-700">
                  尚未核實到收款，請稍候片刻再點擊查詢；我們確認後會自動解鎖。
                </p>
              )}
              {manualChecked === 'error' && (
                <p className="text-center text-xs text-red-600">查詢失敗，請稍後重試或聯絡客服。</p>
              )}
            </CardContent>
          </Card>
        )}

        {/* 付款方式 + 電郵（未建立訂單前） */}
        {!isManual && (
          <Card className="mb-6 border-border shadow-xl bg-cream-light">
            <CardHeader className="border-b border-border/70">
              <CardTitle className="font-serif text-xl text-burgundy">
                選擇付款方式
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-5">
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
                {PAYMENT_METHODS.map((m) => {
                  const Icon = m.icon;
                  return (
                    <label
                      key={m.id}
                      className={`flex items-start gap-3 rounded-xl border p-4 cursor-pointer transition ${
                        paymentMethod === m.id
                          ? 'border-burgundy bg-burgundy/5'
                          : 'border-border bg-cream-light hover:border-burgundy/40'
                      }`}
                    >
                      <RadioGroupItem value={m.id} id={m.id} className="mt-1" />
                      <Icon className="size-5 text-burgundy mt-0.5" />
                      <div className="flex-1">
                        <div className="font-medium text-foreground">{m.label}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{m.desc}</div>
                      </div>
                    </label>
                  );
                })}
              </RadioGroup>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  電郵地址（接收完整報告 PDF）
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="h-11"
                />
              </div>

              {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
                  {error}
                </div>
              )}

              <Button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="w-full h-12 bg-burgundy text-cream-light hover:bg-burgundy-deep font-medium text-base"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="size-4 animate-spin" /> 正在建立訂單…
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Lock className="size-4" /> 立即付款 · MOP 38
                  </span>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* 報告內容 */}
        <Card className="border-border bg-cream-light/80 shadow mb-6">
          <CardHeader>
            <CardTitle className="font-serif text-lg text-burgundy">完整報告包含</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-foreground/80">
              {[
                '專屬風格定位與整體氣質關鍵詞',
                '12 大維度 48 題深度色彩與風格分析',
                '個人季節色與適合 / 不適合色',
                '髮型髮色、妝容風格與面料建議',
                '珠寶配飾（珍珠 / 翡翠 / 紅藍寶 / 鑽石 / 黃金）對比',
                '穿搭風格與參考明星（含照片）',
                '10+ 頁完整分析，可電郵保存',
              ].map((t) => (
                <li key={t} className="flex items-start gap-2">
                  <CheckCircle2 className="size-4 text-burgundy mt-0.5 shrink-0" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="size-3.5" />
          <span>付款資料經安全處理，線上測試與照片分析為自我參考，不作醫療或商業診斷依據。</span>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
