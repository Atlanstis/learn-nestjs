import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Logger } from 'nestjs-pino';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly logger: Logger,
  ) {}

  @Get()
  getHello(): string {
    this.logger.log('hello');
    return this.appService.getHello();
  }
}
