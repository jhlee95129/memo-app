import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import type { Request } from 'express';
import {
  MEMO_SERVICE,
  MEMO_PATTERNS,
  CreateMemoDto,
  UpdateMemoDto,
  SearchMemoDto,
  JwtPayload,
} from '@memo-app/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RpcExceptionFilter } from '../common/filters/rpc-exception.filter.js';

@Controller('memos')
@UseGuards(JwtAuthGuard)
@UseFilters(RpcExceptionFilter)
export class MemoController {
  constructor(
    @Inject(MEMO_SERVICE) private readonly memoClient: ClientProxy,
  ) {}

  @Post()
  create(@Body() dto: CreateMemoDto, @Req() req: Request) {
    const user = (req as Request & { user: JwtPayload }).user;
    return firstValueFrom(
      this.memoClient.send(MEMO_PATTERNS.CREATE, { dto, userId: user.sub }),
    );
  }

  @Get()
  findAll(@Req() req: Request) {
    const user = (req as Request & { user: JwtPayload }).user;
    return firstValueFrom(
      this.memoClient.send(MEMO_PATTERNS.FIND_ALL, { userId: user.sub }),
    );
  }

  @Get('search')
  search(@Query() dto: SearchMemoDto, @Req() req: Request) {
    const user = (req as Request & { user: JwtPayload }).user;
    return firstValueFrom(
      this.memoClient.send(MEMO_PATTERNS.SEARCH, { dto, userId: user.sub }),
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: Request) {
    const user = (req as Request & { user: JwtPayload }).user;
    return firstValueFrom(
      this.memoClient.send(MEMO_PATTERNS.FIND_ONE, { id, userId: user.sub }),
    );
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateMemoDto,
    @Req() req: Request,
  ) {
    const user = (req as Request & { user: JwtPayload }).user;
    return firstValueFrom(
      this.memoClient.send(MEMO_PATTERNS.UPDATE, {
        id,
        dto,
        userId: user.sub,
      }),
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: Request) {
    const user = (req as Request & { user: JwtPayload }).user;
    return firstValueFrom(
      this.memoClient.send(MEMO_PATTERNS.REMOVE, { id, userId: user.sub }),
    );
  }
}
