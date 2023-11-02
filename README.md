# Logger-日志模块

## winston

一个高度集成的日志模块。

### 安装

```shell
npm i winston
```

与 nest 集成，可通过第三方提供的 `nest-winston` 库，进行实现。

```shell
npm i nest-winston
```

### 使用-替换 nest 原有日志模块

在 `main.ts` 中，创建 `winston` 实例，并传入 `nest`  的 `logger` 属性，

```ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { createLogger } from 'winston';
import * as winston from 'winston';
import { WinstonModule, utilities } from 'nest-winston';

async function bootstrap() {
  const instance = createLogger({
    transports: [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.timestamp(),
          utilities.format.nestLike(),
        ),
      }),
    ],
  });
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger(instance),
  });
  await app.listen(3000);
}
bootstrap();
```

 在 `app.module.ts` 中传入，此时 Logger 模块采用 `@nestjs/common` 提供的模块：

```ts
import { Logger, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, Logger],
})
export class AppModule {}
```

在 `app.controller.ts`中，使用即可。

```ts
import { Controller, Get, Logger } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly logger: Logger,
  ) {}

  @Get()
  getHello(): string {
    this.logger.log('getHello');
    return this.appService.getHello();
  }
}
```

### 日志滚动

通过 `winston-daily-rotate-file` 可以将日志以文件的方式进行保存。

```shell
npm i winston-daily-rotate-file
```

然后在 `winston` 实例中增加配置即可。

```ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { createLogger } from 'winston';
import * as winston from 'winston';
import { WinstonModule, utilities } from 'nest-winston';
import 'winston-daily-rotate-file';

async function bootstrap() {
  const instance = createLogger({
    transports: [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.timestamp(),
          utilities.format.nestLike(),
        ),
      }),
      new winston.transports.DailyRotateFile({
        filename: 'application-%DATE%.log',
        dirname: 'logs',
        datePattern: 'YYYY-MM-DD-HH',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '14d',
      }),
    ],
  });
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger(instance),
  });
  await app.listen(3000);
}
bootstrap();
```



### 参考说明

[winston](https://www.npmjs.com/package/winston)

[nest-winston](https://www.npmjs.com/package/nest-winston)

[winston-daily-rotate-file](https://www.npmjs.com/package/winston-daily-rotate-file)
