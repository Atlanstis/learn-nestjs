# 官方配置方案-@nestjs/config

## 安装

```
npm i @nestjs/config
```

## 使用

默认以 `.env` 文件作为配置文件，例如：

```.env
DB='mysql'
DB_SERVER='localhost'
```

`@nestjs/config` 提供了 `ConfigModule`  用于获取配置，并且提供了 `forRoot` 跟 `forFeature` 两个方法。

### forRoot

在 `app.module.ts` 的 imports 中，引入：

```ts
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

在 `app.controller.ts` 中，通过 `ConfigService` 即可获取到配置的值：

```ts
import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ConfigService } from '@nestjs/config';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly configService: ConfigService,
  ) {}

  @Get()
  getHello(): string {
    console.log(this.configService.get('DB'));
    return this.appService.getHello();
  }
}
```

#### isGlobal

此时，`configService` 仅能在当前 imports 中被引入的 `Module` 中使用，如果想在不同的模块中使用，可以通过将 `isGlobal` 属性设置为 `true`。

```ts
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

#### envFilePath

`@nestjs/config ` 支持自定义配置文件及多个配置文件的方式，通过 `envFilePath` 属性，该属性定义如下：

```ts
envFilePath?: string | string[];
```

在 `app.module.ts` 传入多个配置文件路径：

```ts
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import * as path from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        path.join(process.cwd(), '.env'),
        path.join(process.cwd(), '.common.env'),
      ],
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

前面的配置会覆盖后面的配置。

也可以通过 `cross-env` 设置环境变量，在不同的环境下获取不同的配置。

在 `package.json` 更改启动命令，

```json
{
  "start:dev": "cross-env NODE_ENV=development nest start --watch",
  "start:prod": "cross-env NODE_ENV=production node dist/main",
}
```

在 `app.module.ts` 中，根据环境的不同，读取不同的配置文件。

```ts
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath:
        process.env.NODE_ENV === 'production' ? '.env' : '.env.development',
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

#### load

通过 `load` 属性，可以自定义读取参数的内容，例如在 ts 文件中配置参数。

新增 `config.ts`，

```ts
export default async () => {
  const dbPort = await 3306;

  return {
    db: {
      host: 'localhost',
      port: dbPort,
    },
  };
};
```

在 `app.module.ts` 中，`load` 中传入。在`config.ts` 中，支持书写异步逻辑。

```ts
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import config from './config';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath:
        process.env.NODE_ENV === 'production' ? '.env' : '.env.development',
      load: [config],
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

之后，即可通过如下方式读取传入的内容。

```ts
const db = this.configService.get('db');
```

#### ignoreEnvFile

此时会忽略默认的配置文件 `.env` 中的值。

## 拓展

### 以 yaml 文件作为配置文件 

读取 yaml  文件，就是通过 `load` 的方式读取。

首先需安装读取 yaml 文件的包 `js-yaml`。

```shell
npm i js-yaml
```

接着实现如下场景，以 yaml 作为配置文件，其中配置文件分为 3 份：

- common.yml：通用配置的存储。
- development.yml：开发环境配置的存储。
- production.yml：正式环境配置的存储。

新建配置文件，

```yml
# common.yml
common:
  title: '多环境配置'
```

```yml
# development.yml
mysql:
  url: 'localhost'
  port: 3306
```

```yml
# production.yml
mysql:
  url: '127.0.0.1'
  port: 3306
```

新建 `yml-config.ts` 用于读取配置，

```ts
import * as yml from 'js-yaml';
import { readFile } from 'fs/promises';
import { join } from 'path';
import * as _ from 'lodash';

export default async () => {
  const commonConfigFilePath = join(process.cwd(), 'config/common.yml');
  const commonConfigFile = await readFile(commonConfigFilePath, 'utf-8');
  const commonConfig = yml.load(commonConfigFile);
  const envConfigFilePath = join(
    process.cwd(),
    `config/${process.env.NODE_ENV || 'development'}.yml`,
  );
  const envConfigFile = await readFile(envConfigFilePath, 'utf-8');
  const envConfig = yml.load(envConfigFile);
  // 通过 merge 将两份参数合并
  return _.merge(commonConfig, envConfig);
};
```

最后在 `app.module.ts` 中引入：

```ts
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import config from './yml-config';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [config],
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

此时，通过 `configService` 即可获取对应的值。

## 参考

[Configuration | NestJS - A progressive Node.js framework](https://docs.nestjs.com/techniques/configuration)
