export interface SeasonScore {
  spring: number;
  summer: number;
  autumn: number;
  winter: number;
}

export interface SeasonResult {
  scores: SeasonScore;
  primarySeason: 'spring' | 'summer' | 'autumn' | 'winter';
  secondarySeason: 'spring' | 'summer' | 'autumn' | 'winter';
  typeName: string;
  conclusion: string;
  keywords: string[];
  warmColors: string[];
  neutralColors: string[];
  coolColors: string[];
}

export interface FacialFeature {
  name: string;
  description: string;
  detail: string;
}

export interface MakeupAdvice {
  name: string;
  description: string;
  detail: string;
}

export interface JewelryItem {
  name: string;
  description: string;
  reason: string;
  stars: number;
}

export interface FacialResult {
  features: FacialFeature[];
  makeupAdvices: MakeupAdvice[];
  baseColors: string[];
  eyeshadowColors: string[];
  lipColors: string[];
  makeupTips: { name: string; description: string }[];
  jewelries: JewelryItem[];
  style: string;
}

export interface HairstyleItem {
  name: string;
  imageUrl: string;
  description: string;
}

export interface HairColorItem {
  name: string;
  imageUrl: string;
  description: string;
  colorHex: string;
}

export interface HairstyleResult {
  hairstyles: HairstyleItem[];
  hairColors: HairColorItem[];
  keyPoints: string[];
  avoidColors: { name: string; reason: string; color: string }[];
  compareCorrect: { name: string; description: string; imageUrl: string };
  compareCold: { name: string; description: string; imageUrl: string };
  compareDark: { name: string; description: string; imageUrl: string };
  blowDryTips: string[];
  careTips: string[];
  summary: string;
}

export interface StyleType {
  name: string;
  imageUrl: string;
  description: string;
}

export interface CelebrityRef {
  name: string;
  imageUrl: string;
  style: string;
}

export interface ClothingCategory {
  level: 'recommend' | 'normal' | 'not-recommend';
  items: { name: string; imageUrl: string }[];
}

export interface StyleResult {
  mainStyle: string;
  subStyles: StyleType[];
  keywords: string[];
  celebrities: CelebrityRef[];
  checklist: { category: string; items: string[] }[];
  colorPalette: { name: string; mainColor: string; matchColor: string }[];
  clothingCategories: ClothingCategory[];
  recommendedItems: { name: string; imageUrl: string }[];
  beautyGuide: { category: string; items: string[] }[];
  closingQuote: string;
}

export interface FullReport {
  season: SeasonResult;
  facial: FacialResult;
  hairstyle: HairstyleResult;
  style: StyleResult;
}

export interface QuizAnswer {
  questionId: string;
  answer: string; // 選中的選項 ID
  dimensionId?: string;
  dimensionName?: string;
  scoreSeason?: Partial<SeasonScore>;
  tags?: string[];
}

export interface QuizDimension {
  id: string;
  name: string;
  description?: string;
  questions: QuizQuestion[];
}

export interface QuizQuestion {
  id: string;
  text: string;
  imageUrl?: string;
  options: QuizOption[];
}

export interface QuizOption {
  id: string;
  text: string;
  imageUrl?: string;
  scoreSeason?: Partial<SeasonScore>;
}

export interface CreateRecordRequest {
  sessionId: string;
  facePhotoUrls?: string[];
  bodyPhotoUrls?: string[];
}

export interface SubmitQuizRequest {
  sessionId: string;
  answers: QuizAnswer[];
}

export interface GenerateReportRequest {
  sessionId: string;
}

export interface RecordResponse {
  id: string;
  sessionId: string;
  facePhotoUrls: string[];
  bodyPhotoUrls: string[];
  paymentStatus: string;
  seasonResult?: SeasonResult;
  facialResult?: FacialResult;
  hairstyleResult?: HairstyleResult;
  styleResult?: StyleResult;
  email?: string;
  emailSent?: boolean;
}

export interface CreateOrderRequest {
  sessionId: string;
  amount: number;
  currency: string;
  email: string;
  paymentMethod: string;
}

export interface OrderResponse {
  id: string;
  orderNo: string;
  amount: number;
  currency: string;
  status: string;
  paymentMethod: string;
}

export interface SendEmailRequest {
  sessionId: string;
  email: string;
}

export interface AdminRecordItem {
  id: string;
  sessionId: string;
  facePhotoUrls: string[];
  bodyPhotoUrls: string[];
  paymentStatus: string;
  email?: string;
  emailSent: boolean;
  createdAt: string;
}

export interface AdminRecordListResponse {
  items: AdminRecordItem[];
  total: number;
  page: number;
  pageSize: number;
}

export interface StyleTransformStyle {
  id: string;
  name: string;
  description: string;
  prompt: string;
}

export interface StyleTransformRequest {
  sessionId: string;
  styleId: string;
  photoIndex?: number;
}

export interface StyleTransformResponse {
  status: 'success' | 'failed';
  styleId: string;
  imageUrl: string;
  styleName: string;
}
