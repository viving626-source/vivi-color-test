import { Controller, Get, Query } from '@nestjs/common';

import { ColorTestService } from './color-test.service';

@Controller('api/color-test/admin')
// eslint-disable-next-line @darraghor/nestjs-typed/injectable-should-be-provided
export class AdminController {
  constructor(private readonly colorTestService: ColorTestService) {}

  @Get('records')
  async getRecords(
    @Query('page') page: string = '1',
    @Query('pageSize') pageSize: string = '20',
  ) {
    return this.colorTestService.getAdminRecords(parseInt(page, 10), parseInt(pageSize, 10));
  }

  @Get('export')
  async exportRecords() {
    return { downloadUrl: '/api/color-test/admin/export/download' };
  }
}

