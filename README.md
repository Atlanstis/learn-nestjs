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

### 独立成单独模块

现在日志的配置大多集中在 `main.ts` 中，接着将其独立成单独的模块。

通过命令生成日志模块：

```ts
nest g mo log
```

生成与日志相关的独立模块 `log.module.ts`，

```ts
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
```

在 **log** 模块中，首先将  **winston**  相关的配置进行独立。

在 **inject** 中，注入了 **@nestjs/config** 相关的依赖，这样可以根据项目中的配置文件，对 **winston**  的配置进行变更。

通过提供的 **forRootAsync** 方法，异步完成日志模块的声明。

之后在 `main.ts` 中，通过 **useLogger** 替换默认的日志模块，[参照](https://www.npmjs.com/package/nest-winston#replacing-the-nest-logger)。

```ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {});
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));
  await app.listen(3000);
}
bootstrap();
```

最后，在需要使用日志的 **Service**、**Controller** 中，注入：

```ts
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
```

### 参考说明

[winston](https://www.npmjs.com/package/winston)

[nest-winston](https://www.npmjs.com/package/nest-winston)

[winston-daily-rotate-file](https://www.npmjs.com/package/winston-daily-rotate-file)
