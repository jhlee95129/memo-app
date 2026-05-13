import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AiService } from './ai.service.js';
import { AI_PATTERNS, AiSummaryResult } from '@memo-app/common';

@Controller()
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @MessagePattern(AI_PATTERNS.SUMMARIZE_AND_TAG)
  summarizeAndTag(
    @Payload() data: { content: string },
  ): Promise<AiSummaryResult> {
    return this.aiService.summarizeAndTag(data.content);
  }
}
