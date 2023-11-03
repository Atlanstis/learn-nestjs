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
