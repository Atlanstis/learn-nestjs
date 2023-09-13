import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { CreatePersonDto } from './dto/create-person.dto';

@Controller('person')
export class PersonController {
  // json 方式
  @Post('json')
  json(@Body() createPersonDto: CreatePersonDto) {
    console.log(createPersonDto);
    return `received: ${JSON.stringify(createPersonDto)}`;
  }

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

  // form urlencoded 方式
  @Post('/add')
  create(@Body() body: CreatePersonDto) {
    return `received: ${JSON.stringify(body)}`;
  }

  // query 方式
  // 由于 Nest 是从上往下匹配的，需放在 :id 前，否则会触发 :id
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
