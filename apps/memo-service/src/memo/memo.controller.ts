import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { MemoService } from './memo.service.js';
import {
  MEMO_PATTERNS,
  CreateMemoDto,
  UpdateMemoDto,
  SearchMemoDto,
} from '@memo-app/common';

@Controller()
export class MemoController {
  constructor(private readonly memoService: MemoService) {}

  @MessagePattern(MEMO_PATTERNS.CREATE)
  create(@Payload() data: { dto: CreateMemoDto; userId: string }) {
    return this.memoService.create(data.dto, data.userId);
  }

  @MessagePattern(MEMO_PATTERNS.FIND_ALL)
  findAll(@Payload() data: { userId: string }) {
    return this.memoService.findAll(data.userId);
  }

  @MessagePattern(MEMO_PATTERNS.FIND_ONE)
  findOne(@Payload() data: { id: string; userId: string }) {
    return this.memoService.findOne(data.id, data.userId);
  }

  @MessagePattern(MEMO_PATTERNS.UPDATE)
  update(@Payload() data: { id: string; dto: UpdateMemoDto; userId: string }) {
    return this.memoService.update(data.id, data.dto, data.userId);
  }

  @MessagePattern(MEMO_PATTERNS.REMOVE)
  remove(@Payload() data: { id: string; userId: string }) {
    return this.memoService.remove(data.id, data.userId);
  }

  @MessagePattern(MEMO_PATTERNS.SEARCH)
  search(@Payload() data: { dto: SearchMemoDto; userId: string }) {
    return this.memoService.search(data.dto, data.userId);
  }
}
