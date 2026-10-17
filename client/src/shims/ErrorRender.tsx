import { Button } from "../components/ui/button";

export function ErrorRender({
  error,
  resetErrorBoundary,
}: {
  error: Error;
  resetErrorBoundary?: () => void;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-cream px-6 text-center">
      <h1 className="font-serif text-2xl text-burgundy">頁面出了點問題</h1>
      <p className="text-sm text-muted-foreground max-w-md break-words">
        {error?.message || "未知錯誤，請稍後重試。"}
      </p>
      {resetErrorBoundary && (
        <Button
          onClick={resetErrorBoundary}
          className="bg-burgundy text-cream-light hover:bg-burgundy-deep"
        >
          重試
        </Button>
      )}
    </div>
  );
}
