import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { MemoService } from './memo.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CreateMemoDto, UpdateMemoDto, SearchMemoDto, JwtPayload } from '@memo-app/common';
import { MemoDocument } from './schemas/memo.schema.js';

@Controller('memos')
@UseGuards(JwtAuthGuard)
export class MemoController {
  constructor(private readonly memoService: MemoService) {}

  @Post()
  create(
    @Body() dto: CreateMemoDto,
    @Req() req: Request,
  ): Promise<MemoDocument> {
    const user = req.user as JwtPayload;
    return this.memoService.create(dto, user.sub);
  }

  @Get()
  findAll(@Req() req: Request): Promise<MemoDocument[]> {
    const user = req.user as JwtPayload;
    return this.memoService.findAll(user.sub);
  }

  @Get('search')
  search(
    @Query() dto: SearchMemoDto,
    @Req() req: Request,
  ): Promise<MemoDocument[]> {
    const user = req.user as JwtPayload;
    return this.memoService.search(dto, user.sub);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<MemoDocument> {
    const user = req.user as JwtPayload;
    return this.memoService.findOne(id, user.sub);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateMemoDto,
    @Req() req: Request,
  ): Promise<MemoDocument> {
    const user = req.user as JwtPayload;
    return this.memoService.update(id, dto, user.sub);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<void> {
    const user = req.user as JwtPayload;
    return this.memoService.remove(id, user.sub);
  }
}
