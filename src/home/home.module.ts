import { ClassSerializerInterceptor, Module } from '@nestjs/common';
import { HomeService } from './home.service';
import { HomeController } from './home.controller';
import { PrismaModule } from "src/prisma/prisma.module";
import { APP_INTERCEPTOR } from '@nestjs/core';

@Module({
  controllers: [HomeController],
  providers: [
    HomeService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor
    }
  ],
  imports: [PrismaModule]
})
export class HomeModule {}
