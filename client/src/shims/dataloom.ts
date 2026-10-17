import { supabase, SUPABASE_URL, getSessionId } from "../lib/supabase";

const BUCKET = "photos";

function uuid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function extFrom(file: File): string {
  const m = file.name.toLowerCase().match(/\.([a-z0-9]+)$/);
  if (m) return m[1];
  if (file.type.includes("png")) return "png";
  if (file.type.includes("webp")) return "webp";
  return "jpg";
}

export interface UploadFileResult {
  data: { path: string; download_url: string } | null;
  error: { message?: string; error_msg?: string } | null;
}

export function getDefaultBucketId(): string {
  return BUCKET;
}

export async function getDataloom() {
  return {
    storage: {
      from(_bucket: string) {
        return {
          async uploadFile(file: File): Promise<UploadFileResult> {
            const sid = getSessionId() || "guest";
            const ext = extFrom(file);
            const path = `${sid}/${uuid()}.${ext}`;
            const { error } = await supabase.storage
              .from(BUCKET)
              .upload(path, file, { contentType: file.type || "image/jpeg", upsert: false });
            if (error) {
              return { data: null, error: { message: error.message, error_msg: error.message } };
            }
            const download_url = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`;
            return { data: { path, download_url }, error: null };
          },
        };
      },
    },
  };
}
