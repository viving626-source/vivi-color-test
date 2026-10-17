import { useRef, useState, useCallback, type DragEvent, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { getDataloom } from '@lark-apaas/client-toolkit/dataloom';
import { getDefaultBucketId } from '@lark-apaas/client-toolkit/tools/storage';
import { logger } from '@lark-apaas/client-toolkit/logger';
import { Upload, Loader2, X, Plus, ArrowRight } from 'lucide-react';
import { Button } from '@client/src/components/ui/button';
import { Image } from '@client/src/components/ui/image';
import { useTestSession } from '@client/src/hooks/useTestSession';

const MAX_PHOTOS_PER_TYPE = 3;
const MIN_PHOTOS_PER_TYPE = 1;

// 上傳前於瀏覽器端壓縮：最長邊 1280、JPEG 0.85。
// 避免手機原圖（5–10MB）直接上傳，導致後端影像分析/合成時記憶體與 CPU 爆量。
const MAX_EDGE = 1280;
const JPEG_QUALITY = 0.85;

async function compressImage(file: File): Promise<File> {
  // 非瀏覽器環境或非圖片，直接回傳原檔
  if (typeof createImageBitmap !== 'function' || typeof document === 'undefined') {
    return file;
  }
  try {
    const bitmap = await createImageBitmap(file);
    const { width, height } = bitmap;
    const longEdge = Math.max(width, height);
    if (longEdge <= MAX_EDGE) {
      bitmap.close?.();
      return file;
    }
    const scale = MAX_EDGE / longEdge;
    const targetW = Math.round(width * scale);
    const targetH = Math.round(height * scale);
    const canvas = document.createElement('canvas');
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      bitmap.close?.();
      return file;
    }
    // 白底，避免 PNG 透明區轉 JPEG 變黑
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, targetW, targetH);
    ctx.drawImage(bitmap, 0, 0, targetW, targetH);
    bitmap.close?.();
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', JPEG_QUALITY),
    );
    if (!blob) return file;
    const baseName = file.name.replace(/\.[^.]+$/, '') || 'photo';
    return new File([blob], `${baseName}.jpg`, { type: 'image/jpeg' });
  } catch {
    // 壓縮失敗時退回原檔，不阻斷上傳
    return file;
  }
}

const UploadPage = () => {
  const navigate = useNavigate();
  const { startSession, setPhotos, session } = useTestSession();

  const faceInputRef = useRef<HTMLInputElement>(null);
  const bodyInputRef = useRef<HTMLInputElement>(null);

  const [faceUrls, setFaceUrls] = useState<string[]>(session?.facePhotoUrls ?? []);
  const [bodyUrls, setBodyUrls] = useState<string[]>(session?.bodyPhotoUrls ?? []);
  const [faceUploadingIndex, setFaceUploadingIndex] = useState<number | null>(null);
  const [bodyUploadingIndex, setBodyUploadingIndex] = useState<number | null>(null);
  const [faceDragOver, setFaceDragOver] = useState(false);
  const [bodyDragOver, setBodyDragOver] = useState(false);

  const handleUpload = useCallback(
    async (file: File, type: 'face' | 'body'): Promise<boolean> => {
      if (!file.type.startsWith('image/')) {
        toast.error('請上傳圖片檔案');
        return false;
      }

      const urls = type === 'face' ? faceUrls : bodyUrls;
      const setUrls = type === 'face' ? setFaceUrls : setBodyUrls;
      const setUploadingIndex = type === 'face' ? setFaceUploadingIndex : setBodyUploadingIndex;
      const label = type === 'face' ? '面部照' : '全身照';

      if (urls.length >= MAX_PHOTOS_PER_TYPE) {
        toast.error(`${label}最多上傳 ${MAX_PHOTOS_PER_TYPE} 張`);
        return false;
      }

      const uploadIndex = urls.length;
      setUploadingIndex(uploadIndex);

      try {
        const dataloom = await getDataloom();
        // 上傳前先壓縮，減少後端影像分析/合成的資源消耗
        const compressed = await compressImage(file);
        const { data, error } = await dataloom
          .storage
          .from(getDefaultBucketId())
          .uploadFile(compressed);

        if (error || !data) {
          const err = error as { message?: string; error_msg?: string } | null;
          const msg = err?.message ?? err?.error_msg ?? '未知錯誤';
          throw new Error(msg);
        }

        setUrls((prev) => [...prev, data.download_url]);
        toast.success(`${label} 上傳成功`);
        return true;
      } catch (err) {
        const error = err as { response?: { data?: { error?: { message?: string } } } } & Error;
        const msg =
          error.response?.data?.error?.message ??
          error.message ??
          '上傳失敗，請稍後再試';
        logger.error(`${label} 上傳失敗`, err);
        toast.error(msg);
        return false;
      } finally {
        setUploadingIndex(null);
      }
    },
    [faceUrls, bodyUrls],
  );

  const handleFilesSelected = useCallback(
    async (files: FileList | null, type: 'face' | 'body') => {
      if (!files || files.length === 0) return;
      const currentUrls = type === 'face' ? faceUrls : bodyUrls;
      const remaining = MAX_PHOTOS_PER_TYPE - currentUrls.length;
      if (remaining <= 0) {
        toast.error(`最多上傳 ${MAX_PHOTOS_PER_TYPE} 張照片`);
        return;
      }
      const toUpload = Array.from(files).slice(0, remaining);
      for (const file of toUpload) {
        await handleUpload(file, type);
      }
      const ref = type === 'face' ? faceInputRef.current : bodyInputRef.current;
      if (ref) ref.value = '';
    },
    [faceUrls, bodyUrls, handleUpload],
  );

  const handleFileSelect = useCallback(
    (e: ChangeEvent<HTMLInputElement>, type: 'face' | 'body') => {
      void handleFilesSelected(e.target.files, type);
    },
    [handleFilesSelected],
  );

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>, type: 'face' | 'body') => {
      e.preventDefault();
      if (type === 'face') setFaceDragOver(false);
      else setBodyDragOver(false);
      void handleFilesSelected(e.dataTransfer.files, type);
    },
    [handleFilesSelected],
  );

  const handleRemove = useCallback((type: 'face' | 'body', index: number) => {
    const setUrls = type === 'face' ? setFaceUrls : setBodyUrls;
    setUrls((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const faceCount = faceUrls.length;
  const bodyCount = bodyUrls.length;
  const faceValid = faceCount >= MIN_PHOTOS_PER_TYPE && faceCount <= MAX_PHOTOS_PER_TYPE;
  const bodyValid = bodyCount >= MIN_PHOTOS_PER_TYPE && bodyCount <= MAX_PHOTOS_PER_TYPE;
  const canProceed = faceValid && bodyValid;

  const handleNext = useCallback(() => {
    if (!canProceed) {
      if (!faceValid) {
        toast.error(`請上傳 ${MIN_PHOTOS_PER_TYPE}-${MAX_PHOTOS_PER_TYPE} 張面部照`);
      }
      if (!bodyValid) {
        toast.error(`請上傳 ${MIN_PHOTOS_PER_TYPE}-${MAX_PHOTOS_PER_TYPE} 張全身照`);
      }
      return;
    }
    if (!session) {
      startSession();
    }
    setPhotos(faceUrls, bodyUrls);
    navigate('/quiz');
  }, [canProceed, faceValid, bodyValid, session, startSession, setPhotos, navigate, faceUrls, bodyUrls]);

  const tips = [
    '請在自然光下拍攝，避免黃光或強烈頂光',
    '請拍攝正面照，臉部朝向鏡頭',
    '請勿使用強濾鏡或美顏效果',
    '請保持素顏或淡妝，避免厚重妝容影響判斷',
    '全身照請站直，雙手自然垂放，全身入鏡',
    '建議穿貼身衣物，清楚呈現身形輪廓',
    '多張不同角度/光線的照片，分析更精準',
  ];

  const renderUploadSlot = (
    type: 'face' | 'body',
    label: string,
    desc: string,
    urls: string[],
    uploadingIndex: number | null,
    dragOver: boolean,
    inputRef: React.RefObject<HTMLInputElement>,
  ) => {
    const count = urls.length;
    const canAddMore = count < MAX_PHOTOS_PER_TYPE;

    return (
      <div className="bg-cream-light rounded-2xl border border-border/60 shadow-sm p-6">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-serif text-lg text-foreground">{label}</h3>
          <span className={`text-xs font-medium ${count >= MIN_PHOTOS_PER_TYPE ? 'text-burgundy' : 'text-muted-foreground'}`}>
            {count} / {MAX_PHOTOS_PER_TYPE} 張
          </span>
        </div>
        <p className="text-sm text-muted-foreground mb-5">{desc}</p>

        {/* Thumbnail grid */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {urls.map((url, index) => (
            <div key={index} className="relative group aspect-square">
              <div className="rounded-xl overflow-hidden border border-border/40 h-full">
                <Image
                  src={url}
                  alt={`${label} ${index + 1}`}
                  sizes="120px"
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                type="button"
                onClick={() => handleRemove(type, index)}
                className="absolute -top-2 -right-2 size-6 rounded-full bg-burgundy text-white flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label={`刪除第 ${index + 1} 張`}
              >
                <X className="size-3.5" />
              </button>
              <div className="absolute bottom-1 left-1 bg-black/50 text-white text-xs px-1.5 py-0.5 rounded">
                {index + 1}
              </div>
            </div>
          ))}

          {canAddMore && (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                if (type === 'face') setFaceDragOver(true);
                else setBodyDragOver(true);
              }}
              onDragLeave={() => {
                if (type === 'face') setFaceDragOver(false);
                else setBodyDragOver(false);
              }}
              onDrop={(e) => handleDrop(e, type)}
              onClick={() => inputRef.current?.click()}
              className={`
                aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer
                transition-all duration-200
                ${dragOver
                  ? 'border-burgundy bg-burgundy/5'
                  : 'border-border hover:border-burgundy/40 hover:bg-burgundy/[0.02]'}
              `}
            >
              {uploadingIndex === count ? (
                <Loader2 className="w-6 h-6 text-burgundy animate-spin" />
              ) : (
                <>
                  <Plus className="w-6 h-6 text-burgundy/60 mb-1" />
                  <p className="text-xs text-muted-foreground">新增照片</p>
                </>
              )}
            </div>
          )}
        </div>

        {/* Big drop zone when empty */}
        {count === 0 && (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              if (type === 'face') setFaceDragOver(true);
              else setBodyDragOver(true);
            }}
            onDragLeave={() => {
              if (type === 'face') setFaceDragOver(false);
              else setBodyDragOver(false);
            }}
            onDrop={(e) => handleDrop(e, type)}
            onClick={() => inputRef.current?.click()}
            className={`
              border-2 border-dashed rounded-xl py-12 px-6 text-center cursor-pointer
              transition-all duration-200 mb-5
              ${dragOver
                ? 'border-burgundy bg-burgundy/5'
                : 'border-border hover:border-burgundy/40 hover:bg-burgundy/[0.02]'}
            `}
          >
            <div className="flex flex-col items-center gap-3">
              <Upload className="w-10 h-10 text-burgundy/60" />
              <div>
                <p className="text-sm text-foreground font-medium">
                  點擊選擇檔案 或 拖曳圖片到這裡
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  支援 JPG / PNG / WEBP 格式，可一次選多張
                </p>
              </div>
            </div>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => handleFileSelect(e, type)}
          className="hidden"
        />

        {count < MIN_PHOTOS_PER_TYPE && (
          <p className="text-xs text-burgundy/70 mt-2">
            至少上傳 {MIN_PHOTOS_PER_TYPE} 張
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-4xl mx-auto px-6 py-12 md:py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="text-sm uppercase tracking-widest text-burgundy/70 font-medium">
            Step 01
          </span>
          <h1 className="font-serif text-3xl md:text-5xl text-burgundy-deep mt-3 tracking-tight">
            上傳你的照片
          </h1>
          <p className="text-muted-foreground mt-4 leading-relaxed">
            請上傳面部素顏 / 淡妝照 1-3 張 + 全身照 1-3 張，
            <br className="hidden md:block" />
            多張不同角度的照片，分析更精準
          </p>
        </div>

        {/* Upload slots */}
        <div className="grid md:grid-cols-2 gap-6 mb-10">
          {renderUploadSlot(
            'face',
            '面部素顏 / 淡妝照',
            '正面清楚的臉部照片，不同光線/角度更佳',
            faceUrls,
            faceUploadingIndex,
            faceDragOver,
            faceInputRef,
          )}
          {renderUploadSlot(
            'body',
            '全身照',
            '全身入鏡、站直的正面照片，可多張不同姿勢',
            bodyUrls,
            bodyUploadingIndex,
            bodyDragOver,
            bodyInputRef,
          )}
        </div>

        {/* Tips */}
        <div className="bg-cream-light rounded-2xl border border-border/60 shadow-sm p-6 md:p-8 mb-10">
          <h3 className="font-serif text-xl text-foreground mb-5 flex items-center gap-2">
            <span className="text-gold-brown">☑</span>
            拍攝小提示
          </h3>
          <ul className="grid md:grid-cols-2 gap-x-8 gap-y-3">
            {tips.map((tip) => (
              <li key={tip} className="flex items-start gap-3 text-sm text-muted-foreground">
                <span className="text-burgundy shrink-0 mt-0.5">☑</span>
                <span className="leading-relaxed">{tip}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Next button */}
        <div className="flex flex-col items-center">
          <Button
            size="lg"
            onClick={handleNext}
            disabled={!canProceed}
            className={`
              px-12 py-6 text-base rounded-full shadow-lg
              ${canProceed
                ? 'bg-burgundy text-white hover:bg-burgundy-deep'
                : 'bg-muted text-muted-foreground cursor-not-allowed'}
            `}
          >
            開始測試
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          {!canProceed && (
            <p className="text-xs text-muted-foreground mt-3">
              請至少上傳 1 張面部照和 1 張全身照後再繼續
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadPage;
