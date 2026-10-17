// ---- plugin:vivi_macau_ai_style_photo_edit_1 ----
// ============================================================
// 插件 vivi_macau_ai_style_photo_edit_1 (Vivi Macau AI风格改造合成照) 的类型定义
// 由 get_plugin_ai_json 自动生成
// ============================================================

export interface ViviMacauAiStylePhotoEditOneInput {
  /** 用户上传的人像照片（1张） */
  user_portrait: string[];
  /** 风格参考图（最多2张，可选） */
  style_reference_images?: string[];
  /** 风格文字描述，如韩系轻熟、法式温柔等 */
  style_description: string;
  /** 生成图片的比例，可选值：1:1、4:3、3:4、16:9、9:16、3:2、2:3 */
  image_ratio?: string;
}

/**
 * capabilityClient.load('vivi_macau_ai_style_photo_edit_1').call<ViviMacauAiStylePhotoEditOneOutput>('imageToImage', input)
 * 直接返回此类型，无 .data 包装，直接解构使用：
 * const { images } = result;
 * 返回值形如：
 *   {"images":["示例文本"]}
 */
export interface ViviMacauAiStylePhotoEditOneOutput {
  /** [object Object] */
  images: string[];
}
// ---- end:vivi_macau_ai_style_photo_edit_1 ----

// ---- plugin:vivi_macau_ai_style_transform_2 ----
// ============================================================
// 插件 vivi_macau_ai_style_transform_2 (Vivi Macau 人像风格改造合成) 的类型定义
// 由 get_plugin_ai_json 自动生成
// ============================================================

export interface ViviMacauAiStyleTransformTwoInput {
  /** 风格描述，包含妆容、发型、穿搭、色系、氛围等详细要求（如柔夏知性、韩系轻熟、法式温柔等） */
  style_description: string;
  /** 图片比例，支持的值：1:1、4:3、3:4、16:9、9:16、3:2、2:3，默认3:4竖版人像 */
  image_ratio?: string;
  /** 用户上传的人像参考照片 */
  user_portrait: string[];
}

/**
 * capabilityClient.load('vivi_macau_ai_style_transform_2').call<ViviMacauAiStyleTransformTwoOutput>('imageToImage', input)
 * 直接返回此类型，无 .data 包装，直接解构使用：
 * const { images } = result;
 * 返回值形如：
 *   {"images":["示例文本"]}
 */
export interface ViviMacauAiStyleTransformTwoOutput {
  /** [object Object] */
  images: string[];
}
// ---- end:vivi_macau_ai_style_transform_2 ----

// ---- plugin:vivi_macau_photo_analysis_3 ----
// ============================================================
// 插件 vivi_macau_photo_analysis_3 (人像面部与身形图像分析) 的类型定义
// 由 get_plugin_ai_json 自动生成
// ============================================================

export interface ViviMacauPhotoAnalysisThreeInput {
  /** 需要分析的人像照片，1-2张 */
  photos: string[];
  /** 分析要求与维度 */
  analysisPrompt: string;
}

/**
 * capabilityClient.load('vivi_macau_photo_analysis_3').callStream<ViviMacauPhotoAnalysisThreeOutput>('imageUnderstanding', input)
 * 每个 chunk 就是下面这个扁平对象，字段名与 ViviMacauPhotoAnalysisThreeOutput 一致，外面没有 data / choices / message 包装：
 *   {"reasoningContent":"","response":"示例文本","content":"示例文本"}
 * 返回值可能是 AsyncIterable<chunk>，也可能是 { output: AsyncIterable<chunk> }，取流前先归一化。
 * 逐段累加：
 *   for await (const chunk of stream) { result += chunk.reasoningContent ?? ''; }
 */
export interface ViviMacauPhotoAnalysisThreeOutput {
  /** [object Object] */
  reasoningContent?: string;
  /** [object Object] */
  response?: string;
  /** [object Object] */
  content: string;
}
// ---- end:vivi_macau_photo_analysis_3 ----