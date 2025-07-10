import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { UserModule } from "./user/user.module";
import { PrismaModule } from './prisma/prisma.module';
import { HomeModule } from './home/home.module';
import { APP_GUARD, APP_INTERCEPTOR } from "@nestjs/core";
import { UserInterceptor } from "./user/interceptor/user.interceptor";
import { AuthGuard } from "./guards/auth.guard";

@Module({
  imports: [
    UserModule,
    PrismaModule,
    HomeModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`
    }),
  ],
  controllers: [],
  providers: [{
    // implementing the custom interceptor
    provide: APP_INTERCEPTOR,
    useClass: UserInterceptor
  },
    {
      provide: APP_GUARD,
      useClass: AuthGuard
  }],
})
export class AppModule {}
