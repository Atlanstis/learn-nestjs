import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggerModule } from 'nestjs-pino';
import { join } from 'path';
@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        transport: {
          targets: [
            process.env.NODE_ENV === 'production'
              ? {
                  level: 'info',
                  target: 'pino-roll',
                  options: {
                    file: join('logs', 'log'),
                    frequency: 'daily',
                    mkdir: true,
                  },
                }
              : {
                  level: 'info',
                  target: 'pino-pretty',
                  options: {
                    colorize: true,
                  },
                },
          ],
        },
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
