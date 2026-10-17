import { callFunction } from "./apiClient";
import { getSessionId } from "../lib/supabase";

// 兼容原平台 capabilityClient：
// - callStream('imageUnderstanding') → Edge Function 視覺分析（返回完整文字，單塊）
// - call('imageToImage')            → Edge Function 風格改造（圖生圖，返回 { images }）
interface ImageToImageParams {
  user_portrait?: string[];
  style_reference_images?: string[];
  style_description?: string;
  image_ratio?: string;
}

function load(_pluginId: string) {
  return {
    async call(
      method: string,
      params: ImageToImageParams,
    ): Promise<{ images: string[]; fallback?: boolean; reason?: string }> {
      const sid = getSessionId();
      const { data } = await callFunction<{
        imageUrl?: string;
        fallback?: boolean;
        reason?: string;
      }>(
        `/color-test/records/${sid}/transform`,
        {
          method: "POST",
          body: {
            styleDescription: params.style_description ?? "",
            photoUrl: params.user_portrait?.[0] ?? "",
            imageRatio: params.image_ratio ?? "3:4",
          },
        },
      );
      return {
        images: data.imageUrl ? [data.imageUrl] : [],
        fallback: data.fallback ?? false,
        reason: data.reason ?? "",
      };
    },

    async *callStream<T = { content?: string; response?: string }>(
      method: string,
      params: { photos?: string[]; analysisPrompt?: string },
    ): AsyncIterable<T> {
      const sid = getSessionId();
      if (method === "imageUnderstanding") {
        const { data } = await callFunction<{ content: string }>(
          `/color-test/records/${sid}/analyze`,
          {
            method: "POST",
            body: {
              analysisPrompt: params.analysisPrompt ?? "",
              photos: params.photos ?? [],
            },
          },
        );
        yield { content: data.content } as T;
      } else {
        yield { content: "" } as T;
      }
    },
  };
}

export const capabilityClient = { load };
