# Logger-日志模块

## 官方日志方案

在创建应用时，可以通过配置 `logger` 的方式，进行日志的管理。

```ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    // logger: false,
    logger: ['error', 'warn'],
  });
  await app.listen(3000);
}
bootstrap();
```

`logger` 为 false，关闭日志的打印。

`logger`  为数组时，表示相对应等级的日志将会被打印，日志等级分为：'error', 'warn', 'debug', 'log', 'verbose', 'fatal' 6种。

### 使用

在 `main.ts` 中使用，

```ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger();
  const app = await NestFactory.create(AppModule, {
    // logger: false,
    logger: ['error', 'warn', 'log'],
  });
  const port = 3000;
  await app.listen(port);
  logger.log(`Server running on port: ${port}`);
}
bootstrap();
```

通过初始化 `Logger` 实例，调用相对应等级的方法即可。

在 `app.controller.ts` 中使用：

```ts
import { Controller, Get, Logger } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  private logger = new Logger(AppController.name);
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    this.logger.log('Hello World!');
    return this.appService.getHello();
  }
}
```

在 `AppController` 中，初始化 logger 属性，调用即可。

初始化 Logger 实例，支持传递一个参数，在日志打印时，会将响应的信息打印出来，例如：

```
[Nest] 49555  - 2023/11/02 11:01:02     LOG [AppController] Hello World!
```

### 参考说明

[Logger | NestJS - A progressive Node.js framework](https://docs.nestjs.com/techniques/logger#logger)
