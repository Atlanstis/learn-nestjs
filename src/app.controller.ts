import { Controller, Get, Inject, LoggerService } from '@nestjs/common';
import { AppService } from './app.service';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

@Controller()
export class AppController {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
    private readonly appService: AppService,
  ) {
    this.logger.log('AppController constructor');
  }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
