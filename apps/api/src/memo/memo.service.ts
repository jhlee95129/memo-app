import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Memo, MemoDocument } from './schemas/memo.schema.js';
import { AiService } from '../ai/ai.service.js';
import { CreateMemoDto, UpdateMemoDto, SearchMemoDto } from '@memo-app/common';

@Injectable()
export class MemoService {
  constructor(
    @InjectModel(Memo.name) private readonly memoModel: Model<MemoDocument>,
    private readonly aiService: AiService,
  ) {}

  async create(dto: CreateMemoDto, userId: string): Promise<MemoDocument> {
    const memo = await this.memoModel.create({
      ...dto,
      userId,
    });

    // AI 요약 + 태그 생성
    const aiResult = await this.aiService.summarizeAndTag(dto.content);
    memo.summary = aiResult.summary;
    memo.tags = aiResult.tags;
    await memo.save();

    return memo;
  }

  async findAll(userId: string): Promise<MemoDocument[]> {
    return this.memoModel.find({ userId }).sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string, userId: string): Promise<MemoDocument> {
    const memo = await this.memoModel.findOne({ _id: id, userId }).exec();
    if (!memo) {
      throw new NotFoundException('메모를 찾을 수 없습니다');
    }
    return memo;
  }

  async update(
    id: string,
    dto: UpdateMemoDto,
    userId: string,
  ): Promise<MemoDocument> {
    const memo = await this.findOne(id, userId);

    if (dto.title) memo.title = dto.title;
    if (dto.content) {
      memo.content = dto.content;
      // 본문 변경 시 AI 재생성
      const aiResult = await this.aiService.summarizeAndTag(dto.content);
      memo.summary = aiResult.summary;
      memo.tags = aiResult.tags;
    }

    await memo.save();
    return memo;
  }

  async remove(id: string, userId: string): Promise<void> {
    const memo = await this.findOne(id, userId);
    await memo.deleteOne();
  }

  async search(dto: SearchMemoDto, userId: string): Promise<MemoDocument[]> {
    const filter: Record<string, unknown> = { userId };

    if (dto.query) {
      filter['$text'] = { $search: dto.query };
    }
    if (dto.tag) {
      filter['tags'] = dto.tag;
    }

    return this.memoModel.find(filter).sort({ createdAt: -1 }).exec();
  }
}
