# Logger-日志模块

## pino

`pino` 是一个日志模块，它提供了非常多的日志级别，并且可以非常方便的进行日志的格式化。

### 安装

```shell
npm i pino
```

### 与 nest 集成

官方提供了与 nest 集成的方案，更多 web 框架参考[这里](https://getpino.io/#/docs/web)。

```shell
npm i nestjs-pino
```

```ts
// main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {});
  await app.listen(3000);
}
bootstrap();
```

```ts
// app.module.ts
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggerModule } from 'nestjs-pino';

@Module({
  imports: [LoggerModule.forRoot()],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

```ts
// app.controller.ts
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
```

通过 `logger` 属性，调用相应等级的方法来使用。

此时获取到的信息，较为丰富，但杂乱，第一次为代码中打印的信息，第二次默认打印出请求的相关信息。

```json
{"level":30,"time":1698904998330,"pid":52169,"hostname":"Gypsophila-Mac.local","req":{"id":1,"method":"GET","url":"/","query":{},"params":{"0":""},"headers":{"host":"localhost:3000","connection":"keep-alive","sec-ch-ua":"\"Chromium\";v=\"118\", \"Google Chrome\";v=\"118\", \"Not=A?Brand\";v=\"99\"","sec-ch-ua-mobile":"?0","sec-ch-ua-platform":"\"macOS\"","upgrade-insecure-requests":"1","user-agent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36","accept":"text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7","sec-fetch-site":"none","sec-fetch-mode":"navigate","sec-fetch-user":"?1","sec-fetch-dest":"document","accept-encoding":"gzip, deflate, br","accept-language":"zh-CN,zh;q=0.9","cookie":"csrftoken=9C3HXTGl9PFTQpb1uQsJLCTcjqkMTCQ5; ajs_anonymous_id=8cd0b7246b1149aeb6ebc9704060558a; _ga=GA1.1.1629059203.1694672163; _ga_QDXDSM4W55=GS1.1.1694672162.1.1.1694672184.0.0.0","if-none-match":"W/\"c-Lve95gjOVATpfV8EL5X4nxwjKHE\""},"remoteAddress":"::1","remotePort":53688},"msg":"hello"}
{"level":30,"time":1698904998336,"pid":52169,"hostname":"Gypsophila-Mac.local","req":{"id":1,"method":"GET","url":"/","query":{},"params":{"0":""},"headers":{"host":"localhost:3000","connection":"keep-alive","sec-ch-ua":"\"Chromium\";v=\"118\", \"Google Chrome\";v=\"118\", \"Not=A?Brand\";v=\"99\"","sec-ch-ua-mobile":"?0","sec-ch-ua-platform":"\"macOS\"","upgrade-insecure-requests":"1","user-agent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36","accept":"text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7","sec-fetch-site":"none","sec-fetch-mode":"navigate","sec-fetch-user":"?1","sec-fetch-dest":"document","accept-encoding":"gzip, deflate, br","accept-language":"zh-CN,zh;q=0.9","cookie":"csrftoken=9C3HXTGl9PFTQpb1uQsJLCTcjqkMTCQ5; ajs_anonymous_id=8cd0b7246b1149aeb6ebc9704060558a; _ga=GA1.1.1629059203.1694672163; _ga_QDXDSM4W55=GS1.1.1694672162.1.1.1694672184.0.0.0","if-none-match":"W/\"c-Lve95gjOVATpfV8EL5X4nxwjKHE\""},"remoteAddress":"::1","remotePort":53688},"res":{"statusCode":304,"headers":{"x-powered-by":"Express","etag":"W/\"c-Lve95gjOVATpfV8EL5X4nxwjKHE\""}},"responseTime":7,"msg":"request completed"}
```

#### 日志格式化、存储为文件

 `pino-pretty` 可以优化日志的内容，`pino-roll` 可用于在生产环境，将日志保存在文本文件中。

```shell
npm i pino-pretty pino-roll
```

修改 `app.module.ts`，

```ts
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
```

达到开发环境，格式化输出，生产环境将日志生成为文件的方式。

### 参考说明

[pino](https://www.npmjs.com/package/pino)

[nestjs-pino](https://www.npmjs.com/package/nestjs-pino)

[pino-pretty](https://www.npmjs.com/package/pino-pretty)
