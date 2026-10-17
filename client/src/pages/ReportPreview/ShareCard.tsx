import { useCallback, useEffect, useRef } from 'react';
import { Download, Share2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import type { SeasonResult } from '@shared/api.interface';

// 品牌色（與全站一致）
const BRAND = {
  burgundy: '#782b37',
  burgundyDeep: '#5f1c27',
  burgundyLight: '#b46471',
  cream: '#f5f0eb',
  creamLight: '#faf7f4',
  roseDust: '#d2acac',
  gold: '#ac8f39',
  warmBeige: '#e0c5b8',
};

const W = 1080;
const H = 1920;

const SERIF = `"Songti SC","Noto Serif TC","PMingLiU","SimSun",serif`;
const SANS = `'PingFang SC','Hiragino Sans CNS','Microsoft JhengHei','Noto Sans TC',sans-serif`;

const SEASON_LABEL: Record<string, string> = {
  spring: '春',
  summer: '夏',
  autumn: '秋',
  winter: '冬',
};

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

/** 自動縮小字號，直到文字不超過 maxWidth；必要時換行 */
function fitAndWrap(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  startSize: number,
  fontFamily: string,
  weight: string,
  maxLines = 2,
): { lines: string[]; size: number } {
  let size = startSize;
  while (size > 24) {
    ctx.font = `${weight} ${size}px ${fontFamily}`;
    const chars = Array.from(text);
    const lines: string[] = [];
    let line = '';
    for (const ch of chars) {
      const test = line + ch;
      if (ctx.measureText(test).width > maxWidth && line) {
        lines.push(line);
        line = ch;
      } else {
        line = test;
      }
    }
    if (line) lines.push(line);
    if (lines.length <= maxLines) return { lines, size };
    size -= 4;
  }
  return { lines: [text], size: 24 };
}

interface ShareCardProps {
  season: SeasonResult;
}

function ShareCard({ season }: ShareCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const pickColors = useCallback((): string[] => {
    const w = season.warmColors ?? [];
    const n = season.neutralColors ?? [];
    const c = season.coolColors ?? [];
    return [w[0], w[1], n[0], n[1], c[0], c[1]].filter(Boolean).slice(0, 6);
  }, [season]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, W, H);

    // 背景漸層
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, BRAND.creamLight);
    bg.addColorStop(0.55, BRAND.cream);
    bg.addColorStop(1, '#f1e2dc');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // 裝飾圓點（半透明，不喧賓奪主）
    const blobs: Array<[number, number, number, string]> = [
      [-140, 200, 360, `${BRAND.roseDust}55`],
      [W - 180, 60, 320, `${BRAND.gold}33`],
      [-160, H - 380, 380, `${BRAND.warmBeige}66`],
      [W - 120, H - 520, 300, `${BRAND.burgundyLight}2e`],
    ];
    blobs.forEach(([x, y, r, color]) => {
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
    });

    // 外框細邊
    ctx.strokeStyle = `${BRAND.burgundy}26`;
    ctx.lineWidth = 3;
    roundRect(ctx, 40, 40, W - 80, H - 80, 44);
    ctx.stroke();

    // 頂部小標 pill
    const pillText = 'Vivi Macau · 個人色彩測試';
    ctx.font = `400 30px ${SANS}`;
    const pillW = ctx.measureText(pillText).width + 72;
    ctx.fillStyle = `${BRAND.burgundy}12`;
    roundRect(ctx, (W - pillW) / 2, 128, pillW, 68, 34);
    ctx.fill();
    ctx.fillStyle = BRAND.burgundy;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(pillText, W / 2, 163);

    // 品牌字樣
    ctx.fillStyle = BRAND.burgundyDeep;
    ctx.font = `600 76px ${SERIF}`;
    ctx.fillText('Vivi Macau', W / 2, 290);
    ctx.fillStyle = BRAND.gold;
    ctx.font = `500 26px ${SANS}`;
    ctx.fillText('PERSONAL COLOR · STYLE', W / 2, 340);

    // 主結果：把「春夏型人（暖春偏夏）」拆成主標＋副標，避免孤懸括號
    const typeName = season.typeName ?? '';
    const parenMatch = typeName.match(/^(.+?)[（(]\s*(.+?)\s*[）)]\s*$/);
    const mainName = parenMatch ? parenMatch[1].trim() : typeName;
    const subName = parenMatch ? parenMatch[2].trim() : '';

    ctx.fillStyle = BRAND.burgundy;
    ctx.font = `400 40px ${SANS}`;
    ctx.fillText('我的色彩結果是', W / 2, 450);

    const mainFit = fitAndWrap(ctx, mainName, W - 160, 160, SERIF, '700', 1);
    ctx.fillStyle = BRAND.burgundyDeep;
    ctx.font = `700 ${mainFit.size}px ${SERIF}`;
    ctx.fillText(mainFit.lines[0], W / 2, 600);

    if (subName) {
      const subText = `「${subName}」`;
      ctx.font = `600 50px ${SERIF}`;
      const subW = ctx.measureText(subText).width + 76;
      const subX = (W - subW) / 2;
      ctx.fillStyle = '#fff';
      roundRect(ctx, subX, 700, subW, 86, 43);
      ctx.fill();
      ctx.strokeStyle = BRAND.gold;
      ctx.lineWidth = 3;
      roundRect(ctx, subX, 700, subW, 86, 43);
      ctx.stroke();
      ctx.fillStyle = BRAND.gold;
      ctx.fillText(subText, W / 2, 743);
    } else {
      const p = SEASON_LABEL[season.primarySeason] ?? '?';
      const s = SEASON_LABEL[season.secondarySeason] ?? '?';
      const seasonText = `主：${p}季型 · 輔：${s}季型`;
      ctx.font = `500 34px ${SANS}`;
      const sw = ctx.measureText(seasonText).width + 64;
      ctx.fillStyle = BRAND.burgundy;
      roundRect(ctx, (W - sw) / 2, 708, sw, 72, 36);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.fillText(seasonText, W / 2, 744);
    }

    // 關鍵字（自動換行、最多 5 個）
    const kws = (season.keywords ?? []).slice(0, 5);
    ctx.font = `400 32px ${SANS}`;
    const gap = 22;
    const padX = 28;
    const chipH = 60;
    const chips = kws.map((k) => {
      const w = ctx.measureText(k).width + padX * 2;
      return { k, w };
    });
    const rows: Array<{ items: typeof chips; width: number }> = [];
    let row: typeof chips = [];
    let rowW = 0;
    const maxRowW = W - 200;
    chips.forEach((chip) => {
      const add = row.length === 0 ? chip.w : rowW + gap + chip.w;
      if (add > maxRowW && row.length) {
        rows.push({ items: row, width: rowW });
        row = [chip];
        rowW = chip.w;
      } else {
        row.push(chip);
        rowW = add;
      }
    });
    if (row.length) rows.push({ items: row, width: rowW });
    let chipY = 880;
    rows.forEach((r) => {
      let x = (W - r.width) / 2;
      r.items.forEach((chip) => {
        ctx.fillStyle = '#ffffffcc';
        roundRect(ctx, x, chipY, chip.w, chipH, 30);
        ctx.fill();
        ctx.strokeStyle = `${BRAND.burgundy}33`;
        ctx.lineWidth = 2;
        roundRect(ctx, x, chipY, chip.w, chipH, 30);
        ctx.stroke();
        ctx.fillStyle = BRAND.burgundy;
        ctx.font = `400 32px ${SANS}`;
        ctx.fillText(chip.k, x + chip.w / 2, chipY + chipH / 2);
        x += chip.w + gap;
      });
      chipY += chipH + 22;
    });

    // 命定色標題
    ctx.fillStyle = BRAND.gold;
    ctx.font = `600 38px ${SANS}`;
    ctx.fillText('— 我的命定色 —', W / 2, 1120);

    // 色票
    const colors = pickColors();
    const r = 68;
    const space = 16;
    const totalW = colors.length * r * 2 + (colors.length - 1) * space;
    const startX = (W - totalW) / 2 + r;
    const cy = 1255;
    colors.forEach((hex, i) => {
      const cx = startX + i * (r * 2 + space);
      // 陰影
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(95,28,39,0.12)';
      ctx.fill();
      // 色圓
      ctx.beginPath();
      ctx.arc(cx, cy - 6, r, 0, Math.PI * 2);
      ctx.fillStyle = hex;
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 6;
      ctx.stroke();
      // hex 標籤
      const label = hex.replace('#', '').toUpperCase();
      ctx.font = `500 24px ${SANS}`;
      const lw = ctx.measureText(label).width + 28;
      ctx.fillStyle = '#ffffff';
      roundRect(ctx, cx - lw / 2, cy + r + 6, lw, 42, 21);
      ctx.fill();
      ctx.fillStyle = BRAND.burgundyDeep;
      ctx.fillText(label, cx, cy + r + 28);
    });

    // 底部 CTA 色帶
    const bandX = 90;
    const bandY = 1470;
    const bandW = W - 180;
    const bandH = 320;
    const bandGrad = ctx.createLinearGradient(bandX, bandY, bandX + bandW, bandY + bandH);
    bandGrad.addColorStop(0, BRAND.burgundy);
    bandGrad.addColorStop(1, BRAND.burgundyDeep);
    roundRect(ctx, bandX, bandY, bandW, bandH, 40);
    ctx.fillStyle = bandGrad;
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.font = `600 56px ${SERIF}`;
    ctx.fillText('你也來測測你的命定色', W / 2, bandY + 120);

    ctx.font = `500 40px ${SANS}`;
    ctx.fillText('vivi-color-test.pages.dev', W / 2, bandY + 205);

    ctx.font = `400 32px ${SANS}`;
    ctx.fillStyle = '#f3e0d6';
    ctx.fillText('IG @vivimacau · Vivi Macau', W / 2, bandY + 262);

    // 免責
    ctx.fillStyle = '#9a7b75';
    ctx.font = `400 24px ${SANS}`;
    ctx.fillText('線上測試與照片分析僅供自我參考', W / 2, H - 48);

    // 文字對齊重置
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
  }, [season, pickColors]);

  useEffect(() => {
    let cancelled = false;
    const render = () => {
      if (cancelled) return;
      draw();
    };
    if (document.fonts?.ready) {
      document.fonts.ready.then(render).catch(render);
    }
    render();
    return () => {
      cancelled = true;
    };
  }, [draw]);

  const handleDownload = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vivi-color-share.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, []);

  const handleCopy = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      await new Promise<void>((resolve, reject) => {
        canvas.toBlob(async (blob) => {
          if (!blob) return reject(new Error('no blob'));
          try {
            await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
            resolve();
          } catch (e) {
            reject(e);
          }
        }, 'image/png');
      });
      alert('已複製圖片，可直接貼到 IG 動態/小紅書！');
    } catch {
      handleDownload();
    }
  }, [handleDownload]);

  return (
    <div className="bg-cream-light rounded-2xl border border-border shadow-sm p-6 space-y-5 no-print">
      <div className="flex items-center gap-2">
        <Share2 className="size-5 text-burgundy" />
        <h3 className="font-serif text-xl text-burgundy">你的結果分享卡</h3>
      </div>
      <p className="text-sm text-muted-foreground -mt-2">
        存圖分享到 IG 動態／小紅書，讓朋友也來測測看（分享卡上有你的專屬入口）。
      </p>

      <div className="mx-auto w-full max-w-[300px] rounded-2xl overflow-hidden shadow-lg border border-burgundy/10 bg-white">
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          className="block w-full h-auto"
        />
      </div>

      <div className="flex gap-3">
        <Button
          onClick={handleDownload}
          className="flex-1 bg-burgundy text-primary-foreground rounded-xl min-h-11"
        >
          <Download className="size-4" />
          下載分享卡
        </Button>
        <Button
          onClick={handleCopy}
          variant="outline"
          className="flex-1 rounded-xl min-h-11 border-burgundy/30 text-burgundy"
        >
          <Share2 className="size-4" />
          複製圖片
        </Button>
      </div>
      <p className="text-center text-xs text-muted-foreground">
        手機如未自動下載，可直接「長按圖片 → 儲存影像」。
      </p>
    </div>
  );
}

export default ShareCard;
