import { Controller, Post, Get, Body, Param, Req, Query } from '@nestjs/common';
import type { Request } from 'express';

import { ColorTestService } from './color-test.service';
import type {
  CreateRecordRequest,
  SubmitQuizRequest,
  GenerateReportRequest,
  CreateOrderRequest,
  SendEmailRequest,
  StyleTransformRequest,
} from '@shared/api.interface';

@Controller('api/color-test')
// eslint-disable-next-line @darraghor/nestjs-typed/injectable-should-be-provided
export class ColorTestController {
  constructor(private readonly colorTestService: ColorTestService) {}

  @Post('records')
  async createRecord(@Body() body: CreateRecordRequest) {
    return this.colorTestService.createRecord(body.sessionId, body.facePhotoUrls, body.bodyPhotoUrls);
  }

  @Get('records/:sessionId')
  async getRecord(@Param('sessionId') sessionId: string) {
    return this.colorTestService.getRecord(sessionId);
  }

  @Post('records/quiz')
  async submitQuiz(@Body() body: SubmitQuizRequest) {
    return this.colorTestService.submitQuiz(body.sessionId, body.answers);
  }

  @Post('records/generate')
  async generateReport(@Body() body: GenerateReportRequest) {
    return this.colorTestService.generateReport(body.sessionId);
  }

  @Post('orders')
  async createOrder(@Body() body: CreateOrderRequest) {
    return this.colorTestService.createOrder(
      body.sessionId,
      body.amount,
      body.currency,
      body.email,
      body.paymentMethod,
    );
  }

  @Post('orders/:orderId/pay')
  async simulatePayment(@Param('orderId') orderId: string) {
    return this.colorTestService.simulatePayment(orderId);
  }

  @Post('records/email')
  async sendEmail(@Body() body: SendEmailRequest) {
    return this.colorTestService.sendEmail(body.sessionId, body.email);
  }

  @Get('records/:sessionId/transform-styles')
  async listTransformStyles(@Param('sessionId') _sessionId: string) {
    return { styles: this.colorTestService.listTransformStyles() };
  }

  @Post('records/:sessionId/transform')
  async generateStyleTransform(
    @Param('sessionId') sessionId: string,
    @Body() body: StyleTransformRequest,
  ) {
    return this.colorTestService.generateStyleTransform(
      sessionId,
      body.styleId,
      body.photoIndex ?? 0,
    );
  }

  @Post('records/:sessionId/pdf')
  async generatePdf(@Param('sessionId') sessionId: string) {
    return this.colorTestService.generatePdf(sessionId);
  }
}

