import { Module } from '@nestjs/common';

import { ColorTestService } from './color-test.service';
import { ColorTestController } from './color-test.controller';
import { AdminController } from './admin.controller';

@Module({
  controllers: [ColorTestController, AdminController],
  providers: [ColorTestService],
})
export class ColorTestModule {}
