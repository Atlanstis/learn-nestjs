import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ConfigService } from '@nestjs/config';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly configService: ConfigService,
  ) {}

  @Get()
  getHello(): string {
    const common = this.configService.get('common');
    console.log(
      '🚀 ~ file: app.controller.ts:15 ~ AppController ~ getHello ~ common:',
      common,
    );
    const mysql = this.configService.get('mysql');
    console.log(
      '🚀 ~ file: app.controller.ts:20 ~ AppController ~ getHello ~ mysql:',
      mysql,
    );

    return this.appService.getHello();
  }
}
