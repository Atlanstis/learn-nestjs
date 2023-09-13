# 5 种 HTTP 数据传输方式

启动服务，通过访问 http://localhost:3000/static/index.html 查看效果。

## url param

### 说明

可以把参数写在 url 中，比如：

```
http://xxx.xxx/person/1111
```

这里的 1111 就是路径中的参数（url param），服务端框架或者单页应用的路由都支持从 url 中取出参数。

### 实现

Nest 里通过 :参数名 的方式来声明（比如下面的 :id），然后通过 @Param(参数名) 的装饰器取出来注入到 controller。

```ts
import { Controller, Get, Param } from '@nestjs/common';

@Controller('person')
export class PersonController {
  @Get(':id')
  findOne(@Param('id') id: string) {
    return `received: id=${id}`;
  }
}
```

## query

### 说明

通过 url 中 ? 后面的用 & 分隔的字符串传递数据。比如：

```
http://xxx.xxx/person?name=Nest&age=20
```

这里的 name 和 age 就是 query 传递的数据。

其中非英文的字符和一些特殊字符要经过编码，可以使用 encodeURIComponent 的 api 来编码。

### 实现

在 Nest 里，通过 @Query 装饰器来进行取值，由于 Nest 是从上往下匹配的，需放在 :id 路由前，否则会触发 :id 路由：

```typescript
import { Controller, Get, Param, Query } from '@nestjs/common';

@Controller('person')
export class PersonController {
  // query 方式
  // 由于 Nest 是从上往下匹配的，需放在 :id 路由前，否则会触发 :id 路由
  @Get('')
  query(@Query('name') name: string, @Query('age') age: number) {
    return `received: name=${name},age=${age}`;
  }

  // url param 方式
  @Get(':id')
  findOne(@Param('id') id: string) {
    return `received: id=${id}`;
  }
}
```

## form-urlencoded

### 说明

直接用 form 表单提交数据就是这种，它和 query 字符串的方式的区别只是放在了 body 里，然后指定下 content-type 是 `application/x-www-form-urlencoded`。

因为内容也是 query 字符串，所以也要用 encodeURIComponent 的 api 或者 query-string 库处理下。

这种格式也很容易理解，get 是把数据拼成 query 字符串放在 url 后面，于是表单的 post 提交方式的时候就直接用相同的方式把数据放在了 body 里。

通过 & 分隔的 form-urlencoded 的方式需要对内容做 url encode，如果传递大量的数据，比如上传文件的时候就不是很合适了，因为文件 encode 一遍的话太慢了，这时候就可以用 form-data。

### 实现

用 Nest 接收的话，使用 @Body 装饰器，Nest 会解析请求体，然后注入到 dto 中。

dto 是 data transfer object，就是用于封装传输的数据的对象：

```ts
export class CreatePersonDto {
    name: string;
    age: number;
}
```

```ts
import { CreatePersonDto } from './dto/create-person.dto';

@Controller('person')
export class PersonController {
  // form urlencoded 方式
  @Post('/add')
  create(@Body() body: CreatePersonDto) {
    return `received: ${JSON.stringify(body)}`;
  }
}
```

前端代码需使用 post 方式请求，指定 content type 为 `application/x-www-form-urlencoded`。

## form-data

### 说明

orm data 不再是通过 & 分隔数据，而是用 --------- + 一串数字做为 boundary 分隔符。因为不是 url 的方式了，自然也不用再做 url encode。

form-data 需要指定 content type 为 `multipart/form-data`，然后指定 boundary 也就是分割线。

body 里面就是用 boundary 分隔符分割的内容。

很明显，这种方式适合传输文件，而且可以传输多个文件。

但是毕竟多了一些只是用来分隔的 boundary，所以请求体会增大。

### 实现

Nest 解析 form data 使用 FilesInterceptor 的拦截器，用 @UseInterceptors 装饰器启用，然后通过 @UploadedFiles 来取。非文件的内容，同样是通过 @Body 来取。

```ts
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { CreatePersonDto } from './dto/create-person.dto';

@Controller('person')
export class PersonController {
  // form-data 方式
  @Post('upload')
  @UseInterceptors(
    AnyFilesInterceptor({
      dest: 'uploads/',
    }),
  )
  upload(
    @Body() createPersonDto: CreatePersonDto,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    console.log(files);
    return `received: ${JSON.stringify(createPersonDto)}`;
  }
}
```

前端代码发送 post 请求，指定 content type 为 `multipart/form-data`。

## json

### 说明

form-urlencoded 需要对内容做 url encode，而 form data 则需要加很长的 boundary，两种方式都有一些缺点。如果只是传输 json 数据的话，不需要用这两种。

可以直接指定content type 为 application/json 就行。

### 实现

后端代码同样使用 @Body 来接收，不需要做啥变动。form urlencoded 和 json 都是从 body 取值，Nest 内部会根据 content type 做区分，使用不同的解析方式。

```ts
@Controller('person')
export class PersonController {
  // json 方式
  @Post('json')
  json(@Body() createPersonDto: CreatePersonDto) {
    console.log(createPersonDto);
    return `received: ${JSON.stringify(createPersonDto)}`;
  }
}
```

## 总结

用 axios 发送请求，使用 Nest 起后端服务，实现了 5 种 http/https 的数据传输方式：

其中前两种是 url 中的：

- **url param**： url 中的参数，Nest 中使用 @Param 来取
- **query**：url 中 ? 后的字符串，Nest 中使用 @Query 来取

后三种是 body 中的：

- **form urlencoded**： 类似 query 字符串，只不过是放在 body 中。Nest 中使用 @Body 来取，axios 中需要指定 content type 为 `application/x-www-form-urlencoded`，并且对数据用 qs 或者 query-string 库做 url encode
- **json**： json 格式的数据。Nest 中使用 @Body 来取，axios 中不需要单独指定 content type，axios 内部会处理。
- **form data**：通过 ----- 作为 boundary 分隔的数据。主要用于传输文件，Nest 中要使用 FilesInterceptor 来处理其中的 binary 字段，用 @UseInterceptors 来启用，其余字段用 @Body 来取。axios 中需要指定 content type 为 `multipart/form-data`，并且用 FormData 对象来封装传输的内容。
