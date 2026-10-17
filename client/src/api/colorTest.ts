import { logger } from '@lark-apaas/client-toolkit/logger';
import { axiosForBackend } from '@lark-apaas/client-toolkit/utils/getAxiosForBackend';

import type {
  CreateRecordRequest,
  SubmitQuizRequest,
  GenerateReportRequest,
  RecordResponse,
  CreateOrderRequest,
  OrderResponse,
  CreateOrderResponse,
  SendEmailRequest,
  AdminRecordListResponse,
  StyleTransformResponse,
  StyleTransformStyle,
} from '@shared/api.interface';

export async function createRecord(data: CreateRecordRequest): Promise<RecordResponse> {
  try {
    const response = await axiosForBackend({
      url: '/api/color-test/records',
      method: 'POST',
      data,
    });
    return response.data;
  } catch (error) {
    logger.error('創建記錄失敗', error);
    throw error;
  }
}

export async function getRecord(sessionId: string): Promise<RecordResponse> {
  try {
    const response = await axiosForBackend({
      url: `/api/color-test/records/${sessionId}`,
      method: 'GET',
    });
    return response.data;
  } catch (error) {
    logger.error('獲取記錄失敗', error);
    throw error;
  }
}

export async function submitQuiz(data: SubmitQuizRequest): Promise<RecordResponse> {
  try {
    const response = await axiosForBackend({
      url: '/api/color-test/records/quiz',
      method: 'POST',
      data,
    });
    return response.data;
  } catch (error) {
    logger.error('提交問卷失敗', error);
    throw error;
  }
}

export async function generateReport(data: GenerateReportRequest): Promise<RecordResponse> {
  try {
    const response = await axiosForBackend({
      url: '/api/color-test/records/generate',
      method: 'POST',
      data,
    });
    return response.data;
  } catch (error) {
    logger.error('生成報告失敗', error);
    throw error;
  }
}

export async function createOrder(data: CreateOrderRequest): Promise<CreateOrderResponse> {
  try {
    const response = await axiosForBackend({
      url: '/api/color-test/orders',
      method: 'POST',
      data,
    });
    return response.data as CreateOrderResponse;
  } catch (error) {
    logger.error('創建訂單失敗', error);
    throw error;
  }
}

// 結果頁輪詢訂單狀態
export async function getOrderStatus(orderNo: string): Promise<{ order: OrderResponse }> {
  try {
    const response = await axiosForBackend({
      url: `/api/color-test/orders/status/${encodeURIComponent(orderNo)}`,
      method: 'GET',
    });
    return response.data as { order: OrderResponse };
  } catch (error) {
    logger.error('查詢訂單狀態失敗', error);
    throw error;
  }
}

// 人工模式：管理員核實收款後確認（後台調用）
export async function adminConfirmOrder(orderId: string): Promise<{ order: OrderResponse }> {
  try {
    const response = await axiosForBackend({
      url: `/api/color-test/admin/orders/${orderId}/confirm`,
      method: 'POST',
    });
    return response.data as { order: OrderResponse };
  } catch (error) {
    logger.error('確認收款失敗', error);
    throw error;
  }
}

export async function sendReportEmail(data: SendEmailRequest): Promise<{ success: boolean }> {
  try {
    const response = await axiosForBackend({
      url: '/api/color-test/records/email',
      method: 'POST',
      data,
    });
    return response.data;
  } catch (error) {
    logger.error('發送郵件失敗', error);
    throw error;
  }
}

export async function listTransformStyles(sessionId: string): Promise<{ styles: StyleTransformStyle[] }> {
  try {
    const response = await axiosForBackend({
      url: `/api/color-test/records/${sessionId}/transform-styles`,
      method: 'GET',
    });
    return response.data;
  } catch (error) {
    logger.error('獲取風格列表失敗', error);
    throw error;
  }
}

export async function generateStyleTransform(
  sessionId: string,
  styleId: string,
  photoIndex: number = 0,
): Promise<StyleTransformResponse> {
  try {
    const response = await axiosForBackend({
      url: `/api/color-test/records/${sessionId}/transform`,
      method: 'POST',
      data: { sessionId, styleId, photoIndex },
    });
    return response.data;
  } catch (error) {
    logger.error('AI 風格改造生成失敗', error);
    throw error;
  }
}

export async function generatePdf(sessionId: string): Promise<{ pdfUrl: string }> {
  try {
    const response = await axiosForBackend({
      url: `/api/color-test/records/${sessionId}/pdf`,
      method: 'POST',
    });
    return response.data;
  } catch (error) {
    logger.error('生成PDF失敗', error);
    throw error;
  }
}

export async function getAdminRecords(
  page: number,
  pageSize: number,
): Promise<AdminRecordListResponse> {
  try {
    const response = await axiosForBackend({
      url: `/api/color-test/admin/records?page=${page}&pageSize=${pageSize}`,
      method: 'GET',
    });
    return response.data;
  } catch (error) {
    logger.error('獲取管理記錄失敗', error);
    throw error;
  }
}

export interface AdminOrderItem {
  id: string;
  orderNo: string;
  amount: number;
  currency: string;
  status: string;
  paymentMethod: string;
  provider?: string;
  payMethod?: string;
  email: string;
  sessionId: string;
  createdAt: string;
}

export async function listAdminOrders(status: string = 'pending'): Promise<{ items: AdminOrderItem[] }> {
  try {
    const response = await axiosForBackend({
      url: `/api/color-test/admin/orders?status=${status}`,
      method: 'GET',
    });
    return response.data as { items: AdminOrderItem[] };
  } catch (error) {
    logger.error('獲取訂單失敗', error);
    throw error;
  }
}

export async function exportAdminRecords(): Promise<{ downloadUrl: string }> {
  try {
    const response = await axiosForBackend({
      url: '/api/color-test/admin/export',
      method: 'GET',
      responseType: 'blob',
    });
    const url = URL.createObjectURL(response.data);
    return { downloadUrl: url };
  } catch (error) {
    logger.error('導出記錄失敗', error);
    throw error;
  }
}
