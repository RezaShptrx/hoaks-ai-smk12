import { Controller, Post, Get, Body, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AiChatService } from './ai-chat.service';
import { AiChatDto } from './dto/ai-chat.dto';

@ApiTags('AI Chat')
@Controller('ai-chat')
export class AiChatController {
  constructor(private readonly aiChatService: AiChatService) {}

  /**
   * POST /ai-chat
   * Sends a message to the selected LLM model and returns the AI reply.
   * Rate-limited by global throttler.
   */
  @Post()
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @ApiOperation({ summary: 'Send a message to the selected AI model for fact-checking' })
  @ApiResponse({ status: 200, description: 'AI reply returned successfully.' })
  @ApiResponse({ status: 400, description: 'Validation failed or unknown model.' })
  @ApiResponse({ status: 503, description: 'All AI models unavailable.' })
  async chat(@Body() dto: AiChatDto) {
    return this.aiChatService.chat(dto);
  }

  /**
   * GET /ai-chat/models
   * Returns the list of available AI models and their configuration status.
   */
  @Get('models')
  @ApiOperation({ summary: 'Get list of available AI models' })
  @ApiResponse({ status: 200, description: 'Model list returned.' })
  getModels() {
    return this.aiChatService.getAvailableModels();
  }
}
