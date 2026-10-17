import { Injectable, Logger, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DRIZZLE_DATABASE, CapabilityService, type PostgresJsDatabase } from '@lark-apaas/fullstack-nestjs-core';
import { Inject } from '@nestjs/common';

import { colorRecords, orders } from '../../database/schema';
import type {
  QuizAnswer,
  SeasonResult,
  FacialResult,
  HairstyleResult,
  StyleResult,
  RecordResponse,
  OrderResponse,
} from '@shared/api.interface';
import { generateSeasonResult, generateFacialResult } from './report-generators/season-facial.generator';
import { generateHairstyleResult } from './report-generators/hairstyle.generator';
import { generateStyleResult } from './report-generators/style.generator';

@Injectable()
export class ColorTestService {
  private readonly logger = new Logger(ColorTestService.name);

  constructor(
    @Inject(DRIZZLE_DATABASE) private readonly db: PostgresJsDatabase,
    @Inject(CapabilityService) private readonly capabilityService: CapabilityService,
  ) {}

  async createRecord(sessionId: string, facePhotoUrls?: string[], bodyPhotoUrls?: string[]): Promise<RecordResponse> {
    const existing = await this.db.select().from(colorRecords).where(eq(colorRecords.sessionId, sessionId));
    if (existing.length > 0) {
      return this.mapToResponse(existing[0]);
    }

    const inserted = await this.db.insert(colorRecords)
      .values({
        sessionId,
        facePhotoUrl: facePhotoUrls?.[0],
        bodyPhotoUrl: bodyPhotoUrls?.[0],
      })
      .returning();
    return this.mapToResponse(inserted[0]);
  }

  async getRecord(sessionId: string): Promise<RecordResponse> {
    const records = await this.db.select().from(colorRecords).where(eq(colorRecords.sessionId, sessionId));
    if (records.length === 0) {
      throw new NotFoundException('記錄不存在');
    }
    return this.mapToResponse(records[0]);
  }

  async submitQuiz(sessionId: string, answers: QuizAnswer[]): Promise<RecordResponse> {
    const records = await this.db.select().from(colorRecords).where(eq(colorRecords.sessionId, sessionId));
    if (records.length === 0) {
      throw new NotFoundException('記錄不存在');
    }

    const updated = await this.db.update(colorRecords)
      .set({ quizAnswers: answers as unknown as Record<string, unknown>, updatedAt: new Date() })
      .where(eq(colorRecords.sessionId, sessionId))
      .returning();
    return this.mapToResponse(updated[0]);
  }

  async generateReport(sessionId: string): Promise<RecordResponse> {
    const records = await this.db.select().from(colorRecords).where(eq(colorRecords.sessionId, sessionId));
    if (records.length === 0) {
      throw new NotFoundException('記錄不存在');
    }

    const record = records[0];
    const answers = (record.quizAnswers ?? []) as QuizAnswer[];

    const seasonResult = generateSeasonResult(answers);
    const facialResult = generateFacialResult(seasonResult, answers);
    const hairstyleResult = generateHairstyleResult(seasonResult, answers);
    const styleResult = generateStyleResult(seasonResult, facialResult, answers);

    const fullReport = {
      season: seasonResult,
      facial: facialResult,
      hairstyle: hairstyleResult,
      style: styleResult,
    };

    const updated = await this.db.update(colorRecords)
      .set({
        seasonResult: seasonResult as unknown as Record<string, unknown>,
        facialResult: facialResult as unknown as Record<string, unknown>,
        hairstyleResult: hairstyleResult as unknown as Record<string, unknown>,
        styleResult: styleResult as unknown as Record<string, unknown>,
        fullReport: fullReport as unknown as Record<string, unknown>,
        updatedAt: new Date(),
      })
      .where(eq(colorRecords.sessionId, sessionId))
      .returning();
    return this.mapToResponse(updated[0]);
  }

  async createOrder(
    sessionId: string,
    amount: number,
    currency: string,
    email: string,
    paymentMethod: string,
  ): Promise<OrderResponse> {
    const records = await this.db.select().from(colorRecords).where(eq(colorRecords.sessionId, sessionId));
    if (records.length === 0) {
      throw new NotFoundException('記錄不存在');
    }

    const orderNo = `VIVI${Date.now()}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
    const inserted = await this.db.insert(orders)
      .values({
        recordId: records[0].id,
        orderNo,
        amount: String(amount),
        currency,
        email,
        paymentMethod,
        status: 'pending',
      })
      .returning();

    return {
      id: inserted[0].id,
      orderNo: inserted[0].orderNo,
      amount: Number(inserted[0].amount),
      currency: inserted[0].currency ?? 'MOP',
      status: inserted[0].status ?? 'pending',
      paymentMethod: inserted[0].paymentMethod ?? '',
    };
  }

  async simulatePayment(orderId: string): Promise<OrderResponse> {
    const orderRecords = await this.db.select().from(orders).where(eq(orders.id, orderId));
    if (orderRecords.length === 0) {
      throw new NotFoundException('訂單不存在');
    }

    const updated = await this.db.update(orders)
      .set({ status: 'paid', updatedAt: new Date() })
      .where(eq(orders.id, orderId))
      .returning();

    const order = updated[0];
    await this.db.update(colorRecords)
      .set({
        paymentStatus: 'paid',
        email: order.email,
        updatedAt: new Date(),
      })
      .where(eq(colorRecords.id, order.recordId));

    return {
      id: order.id,
      orderNo: order.orderNo,
      amount: Number(order.amount),
      currency: order.currency ?? 'MOP',
      status: 'paid',
      paymentMethod: order.paymentMethod ?? '',
    };
  }

  async sendEmail(sessionId: string, email: string): Promise<{ success: boolean }> {
    const records = await this.db.select().from(colorRecords).where(eq(colorRecords.sessionId, sessionId));
    if (records.length === 0) {
      throw new NotFoundException('記錄不存在');
    }

    await this.db.update(colorRecords)
      .set({ email, emailSent: true, updatedAt: new Date() })
      .where(eq(colorRecords.sessionId, sessionId));

    this.logger.log(`Email would be sent to ${email} for session ${sessionId}`);
    return { success: true };
  }

  async generatePdf(sessionId: string): Promise<{ pdfUrl: string }> {
    const records = await this.db.select().from(colorRecords).where(eq(colorRecords.sessionId, sessionId));
    if (records.length === 0) {
      throw new NotFoundException('記錄不存在');
    }
    const pdfUrl = `https://example.com/report-${sessionId}.pdf`;
    await this.db.update(colorRecords)
      .set({ pdfUrl, updatedAt: new Date() })
      .where(eq(colorRecords.sessionId, sessionId));
    return { pdfUrl };
  }

  async getAdminRecords(page: number, pageSize: number) {
    const offset = (page - 1) * pageSize;
    const rawItems = await this.db.select({
      id: colorRecords.id,
      sessionId: colorRecords.sessionId,
      facePhotoUrl: colorRecords.facePhotoUrl,
      bodyPhotoUrl: colorRecords.bodyPhotoUrl,
      paymentStatus: colorRecords.paymentStatus,
      email: colorRecords.email,
      emailSent: colorRecords.emailSent,
      createdAt: colorRecords.createdAt,
    })
      .from(colorRecords)
      .orderBy(colorRecords.createdAt)
      .limit(pageSize)
      .offset(offset);
    const items = rawItems as unknown as { id: string; sessionId: string; facePhotoUrl: string | null; bodyPhotoUrl: string | null; paymentStatus: string | null; email: string | null; emailSent: boolean | null; createdAt: Date }[];

    const [{ count }] = await this.db
      .select({ count: (await import('drizzle-orm')).count() })
      .from(colorRecords);

    return {
      items: items.map((item) => ({
        id: item.id,
        sessionId: item.sessionId,
        facePhotoUrls: item.facePhotoUrl ? [item.facePhotoUrl] : [],
        bodyPhotoUrls: item.bodyPhotoUrl ? [item.bodyPhotoUrl] : [],
        paymentStatus: item.paymentStatus ?? 'free',
        email: item.email ?? undefined,
        emailSent: item.emailSent ?? false,
        createdAt: item.createdAt.toISOString(),
      })),
      total: Number(count),
      page,
      pageSize,
    };
  }

  async generateStyleTransform(
    sessionId: string,
    styleId: string,
    photoIndex: number = 0,
  ): Promise<{ status: 'success' | 'failed'; styleId: string; imageUrl: string; styleName: string }> {
    const records = await this.db.select().from(colorRecords).where(eq(colorRecords.sessionId, sessionId));
    if (records.length === 0) {
      throw new NotFoundException('記錄不存在');
    }
    const record = records[0];
    const faceUrls: string[] = record.facePhotoUrl ? [record.facePhotoUrl] : [];
    const bodyUrls: string[] = record.bodyPhotoUrl ? [record.bodyPhotoUrl] : [];
    const allPhotos = [...faceUrls, ...bodyUrls];
    if (allPhotos.length === 0) {
      throw new BadRequestException('請先上傳人像照片');
    }
    const idx = Math.max(0, Math.min(photoIndex, allPhotos.length - 1));
    const photoUrl = allPhotos[idx];

    const style = this.getStyleById(styleId, record);
    try {
      const result = await this.capabilityService
        .load('vivi_macau_ai_style_transform_2')
        .call('imageToImage', {
          user_portrait: [photoUrl],
          style_description: style.prompt,
          image_ratio: '3:4',
        });
      const images: string[] = (result as { images: string[] }).images;
      if (!images || images.length === 0) {
        throw new InternalServerErrorException('AI 生成失敗，未返回圖片');
      }
      return {
        status: 'success',
        styleId: style.id,
        imageUrl: images[0],
        styleName: style.name,
      };
    } catch (err) {
      this.logger.error('AI 風格改造生成失敗', err);
      throw new InternalServerErrorException('AI 風格改造生成失敗，請稍後重試');
    }
  }

  private getStyleById(
    styleId: string,
    record: typeof colorRecords.$inferSelect,
  ): { id: string; name: string; description: string; prompt: string } {
    const season = (record.seasonResult as unknown as { typeName?: string; keywords?: string[] } | null) ?? {};
    const typeName = season.typeName ?? '個人色彩風格';
    const styles: Record<string, { id: string; name: string; description: string; prompt: string }> = {
      korean: {
        id: 'korean',
        name: '韓系輕熟',
        description: '清透裸妝、空氣感瀏海、奶茶棕髮色、溫柔優雅穿搭',
        prompt: `韓系輕熟女風格改造。人物為${typeName}季型。
- 妝容：清透無瑕底妝，奶茶色調眼影，自然臥蠶，玫瑰豆沙色脣膏，腮紅位置偏高營造減齡效果
- 髮型髮色：空氣感八字瀏海，大波浪或層次剪，奶茶棕/焦糖棕髮色，髮絲柔順有光澤
- 穿搭：溫柔系針織衫、米杏色風衣、高腰寬褲或長裙，鬆弛感極簡風格
- 色系：奶油米白、奶茶棕、豆沙粉、駝色系
- 整體氛圍：溫柔知性、韓劇女主感、柔光、高級畫報質感
- 必須保留本人面部特徵與五官輪廓，改造自然真實`,
      },
      french: {
        id: 'french',
        name: '法式溫柔',
        description: '慵懶隨性、紅唇標誌、微亂長髮、復古優雅穿搭',
        prompt: `法式慵懶優雅風格改造。人物為${typeName}季型。
- 妝容：自然霧面底妝，精緻眼線，標誌性勃艮第紅/楓葉紅脣膏，腮紅低位置營造成熟感
- 髮型髮色：法式微亂長髮或及肩髮，自然蓬鬆感，深棕/亞麻棕/蜜茶棕髮色
- 穿搭：白襯衫、針織開衫、高腰直筒牛仔褲、風衣、樂福鞋，簡約而有質感
- 色系：米白、焦糖棕、勃艮第紅、駝色、藏青
- 整體氛圍：慵懶隨性、巴黎街頭感、電影質感、自然光
- 必須保留本人面部特徵與五官輪廓，改造自然真實`,
      },
      mature: {
        id: 'mature',
        name: '職場知性',
        description: '幹練大氣、精緻職場妝、短髮或低馬尾、西裝套裝',
        prompt: `職場知性禦姐風格改造。人物為${typeName}季型。
- 妝容：精緻職場妝，乾淨底妝，大地色眼線加強眼神，磚紅/梅子色調脣膏，氣場全開
- 髮型髮色：齊肩短髮或低馬尾/低盤髮，深棕/黑茶色髮色，乾淨利落
- 穿搭：合身西裝套裝、真絲襯衫、鉛筆裙、高跟鞋，專業幹練有氣場
- 色系：黑白灰、藏青、酒紅、橄欖綠、米駝
- 整體氛圍：專業自信、大氣從容、高級寫真質感、柔光棚拍
- 必須保留本人面部特徵與五官輪廓，改造自然真實`,
      },
      sweet: {
        id: 'sweet',
        name: '甜美減齡',
        description: '粉嫩系妝容、空氣感捲髮、娃娃裙/針織、軟糯甜美',
        prompt: `甜美減齡風格改造。人物為${typeName}季型。
- 妝容：粉嫩系妝容，膨潤蘋果肌腮紅，粉色/蜜桃色眼影，果汁感脣釉，無辜大眼效果
- 髮型髮色：空氣感羊毛捲/蛋捲頭，齊瀏海，淺棕/蜜桃棕/奶茶金髮色
- 穿搭：粉色系針織衫、娃娃領襯衫、百褶裙、A字短裙，軟糯甜美
- 色系：粉色、奶白、淡紫、鵝黃、蜜桃色
- 整體氛圍：甜美可愛、少女感、柔光、清新畫報
- 必須保留本人面部特徵與五官輪廓，改造自然真實`,
      },
    };
    return styles[styleId] ?? styles.korean;
  }

  listTransformStyles(): { id: string; name: string; description: string }[] {
    return [
      { id: 'korean', name: '韓系輕熟', description: '清透裸妝、空氣感瀏海、奶茶棕髮色、溫柔優雅穿搭' },
      { id: 'french', name: '法式溫柔', description: '慵懶隨性、紅唇標誌、微亂長髮、復古優雅穿搭' },
      { id: 'mature', name: '職場知性', description: '幹練大氣、精緻職場妝、短髮或低馬尾、西裝套裝' },
      { id: 'sweet', name: '甜美減齡', description: '粉嫩系妝容、空氣感捲髮、娃娃裙/針織、軟糯甜美' },
    ];
  }

  private mapToResponse(record: typeof colorRecords.$inferSelect): RecordResponse {
    return {
      id: record.id,
      sessionId: record.sessionId,
      facePhotoUrls: record.facePhotoUrl ? [record.facePhotoUrl] : [],
      bodyPhotoUrls: record.bodyPhotoUrl ? [record.bodyPhotoUrl] : [],
      paymentStatus: record.paymentStatus ?? 'free',
      seasonResult: record.seasonResult as unknown as SeasonResult | undefined,
      facialResult: record.facialResult as unknown as FacialResult | undefined,
      hairstyleResult: record.hairstyleResult as unknown as HairstyleResult | undefined,
      styleResult: record.styleResult as unknown as StyleResult | undefined,
      email: record.email ?? undefined,
      emailSent: record.emailSent ?? false,
    };
  }
}
