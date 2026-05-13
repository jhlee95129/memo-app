import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { createHash } from 'crypto';
import Anthropic from '@anthropic-ai/sdk';
import { AiSummaryResult } from '@memo-app/common';
import { AI_CACHE_TTL, SUMMARIZE_PROMPT } from './ai.constants.js';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly client: Anthropic;

  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly configService: ConfigService,
  ) {
    this.client = new Anthropic({
      apiKey: this.configService.get<string>('ANTHROPIC_API_KEY'),
    });
  }

  async summarizeAndTag(content: string): Promise<AiSummaryResult> {
    const cacheKey = `ai:summary:${this.hashContent(content)}`;
    const cached = await this.cacheManager.get<AiSummaryResult>(cacheKey);
    if (cached) {
      this.logger.log('캐시 적중');
      return cached;
    }

    const result = await this.callClaudeApi(content);
    await this.cacheManager.set(cacheKey, result, AI_CACHE_TTL);
    return result;
  }

  private hashContent(content: string): string {
    return createHash('sha256').update(content).digest('hex');
  }

  private async callClaudeApi(content: string): Promise<AiSummaryResult> {
    try {
      const response = await this.client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: SUMMARIZE_PROMPT + content,
          },
        ],
      });

      const text =
        response.content[0].type === 'text' ? response.content[0].text : '';
      const parsed: AiSummaryResult = JSON.parse(text);

      return {
        summary: parsed.summary,
        tags: parsed.tags.slice(0, 5),
      };
    } catch (error) {
      this.logger.error('Claude API 호출 실패', error);
      return {
        summary: '',
        tags: [],
      };
    }
  }
}
