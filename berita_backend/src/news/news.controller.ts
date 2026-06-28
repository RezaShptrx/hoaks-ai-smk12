import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { NewsService } from './news.service';
import { BookmarkNewsDto } from './dto/bookmark-news.dto';
import { PaginationQueryDto } from './dto/pagination-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('News')
@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  /**
   * GET /news
   * Public route — fetches real-time news from the external CNN News API with pagination
   */
  @Get()
  @ApiOperation({ summary: 'Fetch live CNN news with pagination' })
  @ApiResponse({ status: 200, description: 'Live news data retrieved and paginated successfully.' })
  @ApiResponse({ status: 502, description: 'External API failure.' })
  async getLatestNews(@Query() paginationQueryDto: PaginationQueryDto) {
    return this.newsService.getLatestNews(
      paginationQueryDto.page,
      paginationQueryDto.limit,
    );
  }

  /**
   * POST /news/bookmark
   * JWT-protected — saves a news article to the user's bookmarks
   */
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('bookmark')
  @ApiOperation({ summary: 'Bookmark a news article' })
  @ApiResponse({ status: 201, description: 'Article bookmarked successfully.' })
  @ApiResponse({ status: 400, description: 'Validation failed.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 409, description: 'Article already bookmarked.' })
  async bookmarkNews(
    @Body() bookmarkNewsDto: BookmarkNewsDto,
    @CurrentUser() user: any,
  ) {
    return this.newsService.bookmarkNews(bookmarkNewsDto, user.id);
  }

  /**
   * GET /news/bookmarks
   * JWT-protected — retrieves all bookmarked news for the authenticated user
   */
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('bookmarks')
  @ApiOperation({ summary: 'Retrieve user bookmarked articles' })
  @ApiResponse({ status: 200, description: 'Bookmarked list returned successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getUserBookmarks(@CurrentUser() user: any) {
    return this.newsService.getUserBookmarks(user.id);
  }

  /**
   * DELETE /news/bookmark/:id
   * JWT-protected — removes a bookmark by its ID (only if owned by the user)
   */
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete('bookmark/:id')
  @ApiOperation({ summary: 'Remove a bookmarked article by ID' })
  @ApiResponse({ status: 200, description: 'Bookmark removed successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Bookmark not found.' })
  async removeBookmark(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
  ) {
    return this.newsService.removeBookmark(id, user.id);
  }
}
