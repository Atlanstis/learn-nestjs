# 统一返回内容

## 错误处理

`Nest` 默认情况下，返回的内容是比较杂乱的，没有统一的格式，例如：

- 未匹配到对应的路由时，会默认返回：

  ```json
  { "message": "Cannot GET /404", "error": "Not Found", "statusCode": 404 }
  ```

- 代码程序出错时：

  ```ts
  const a: any = {};
  console.log(a.b.c);
  ```

  会默认返回：

  ```json
  { "statusCode": 500, "message": "Internal server error" }
  ```

- 手动抛出异常时：

  ```ts
  throw new HttpException('用户未认证', HttpStatus.UNAUTHORIZED);
  ```

  会默认返回：

  ```
  {"statusCode":401,"message":"用户未认证"}
  ```

Nest` 提供了 Filter，可以用于拦截此类异常，可以在此自定义处理的逻辑。

通过 `Nest Cli` 提供的命令，可以快速生成文件。

```shell
nest g f filter/http-exception --no-spec --flat
```

执行生成 filter 文件，该文件用于拦截未匹配到对应的路由以及手动抛出的异常。

```ts
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';

/**
 * 拦截 HttpException，并返回统一的数据格式，用于处理业务上的异常。
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp(); // 获取请求上下文
    const response = ctx.getResponse(); // 获取请求上下文中的 response对象
    const status = exception.getStatus(); // 获取异常状态码

    const message = exception.message;

    const errorResponse = {
      data: {},
      message: message,
      code: -1,
    };

    // 设置返回的状态码， 请求头，发送错误信息
    response.status(status);
    response.header('Content-Type', 'application/json; charset=utf-8');
    response.send(errorResponse);
  }
}
```

在上述文件中，首先通过 `Nest` 提供的 `@Catch` 方法捕获所有的 `HttpException`，然后自定义返回。

之后，在 `main.ts` 中，通过 `useGlobalFilters` 进行注册。

```ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './filter/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalFilters(new HttpExceptionFilter());
  await app.listen(3000);
}
bootstrap();
```

`Nest` 中 `@Catch` 方法，不传入参数，代表捕获所有异常，这样就能捕获到代码报错导致的异常。

```shell
nest g f filter/all-exception --no-spec --flat
```

通过命令生成针对全部异常的过滤器。

```ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const responseBody = {
      data: {},
      message: '程序出错了',
      code: -1,
    };

    // 设置返回的状态码， 请求头，发送错误信息
    response.status(httpStatus);
    response.header('Content-Type', 'application/json; charset=utf-8');
    response.send(responseBody);
  }
}
```

在 `main.ts` 中注册，

```ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './filter/http-exception.filter';
import { AllExceptionsFilter } from './filter/all-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalFilters(new AllExceptionsFilter(), new HttpExceptionFilter());
  await app.listen(3000);
}
bootstrap();
```

> `HttpExceptionFilter` 需要注册在 `AllExceptionsFilter` 之后，不然 `HttpException` 也会被全局给捕获到。

## 正常返回

通过 `Nest` 提供的拦截器 `Interceptor` ，可以对正常的返回数据，进行包装处理。

```shell
nest g itc interceptor/transform --no-spec --flat
```

通过命令生成文件拦截器文件。

```ts
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';

/**
 * 对成功返回的数据，进行包裹，进行格式统一
 */
@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        return {
          data,
          code: 0,
          msg: '请求成功',
        };
      }),
    );
  }
}
```

最后在 `main.js` 中注册，

```ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './filter/http-exception.filter';
import { AllExceptionsFilter } from './filter/all-exception.filter';
import { TransformInterceptor } from './interceptor/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalFilters(new AllExceptionsFilter(), new HttpExceptionFilter());

  app.useGlobalInterceptors(new TransformInterceptor());

  await app.listen(3000);
}
bootstrap();
```

## 参考

[Exception filters | NestJS - A progressive Node.js framework](https://docs.nestjs.com/exception-filters)
