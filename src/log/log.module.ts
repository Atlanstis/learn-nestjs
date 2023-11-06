import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WinstonModule, utilities } from 'nest-winston';
import * as winston from 'winston';
import 'winston-daily-rotate-file';
import { Console, DailyRotateFile } from 'winston/lib/winston/transports';

const consoleTransport = new Console({
  format: winston.format.combine(
    winston.format.timestamp(),
    utilities.format.nestLike(),
  ),
});

const dailRotateFileTransport = new DailyRotateFile({
  level: 'info',
  filename: 'application-%DATE%.log',
  dirname: 'logs',
  datePattern: 'YYYY-MM-DD-HH',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
});

const errorDailRotateFileTransport = new DailyRotateFile({
  level: 'error',
  filename: 'error-%DATE%.log',
  dirname: 'logs',
  datePattern: 'YYYY-MM-DD-HH',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
});

@Module({
  imports: [
    WinstonModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const open = configService.get('LOG_DAILY_ROTATE_FILE_OPEN');
        const dailyTransports =
          open === 'OPEN'
            ? [dailRotateFileTransport, errorDailRotateFileTransport]
            : [];
        return {
          transports: [consoleTransport, ...dailyTransports],
        };
      },
    }),
  ],
})
export class LogModule {}
