import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { PrismaService } from '../prisma/prisma.service';
import { BookmarkNewsDto } from './dto/bookmark-news.dto';
import { firstValueFrom } from 'rxjs';

export interface CnnNewsItem {
  title: string;
  link: string;
  contentSnippet: string;
  isoDate: string;
  image: {
    large: string;
    small: string;
  };
}

export interface CnnNewsApiResponse {
  messages: string;
  total: number;
  data: CnnNewsItem[];
}

@Injectable()
export class NewsService {
  private readonly API_URL =
    'https://berita-indo-api-next.vercel.app/api/cnn-news';

  constructor(
    private readonly httpService: HttpService,
    private readonly prisma: PrismaService,
  ) {}

  async getLatestNews(page: number, limit: number) {
    try {
      const response = await firstValueFrom(
        this.httpService.get<CnnNewsApiResponse>(this.API_URL),
      );

      const allData = response.data.data || [];
      const totalItems = allData.length;
      const totalPages = Math.ceil(totalItems / limit);
      
      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;
      const paginatedData = allData.slice(startIndex, endIndex);

      return {
        messages: response.data.messages,
        page,
        limit,
        totalItems,
        totalPages,
        data: paginatedData,
      };
    } catch (error) {
      throw new HttpException(
        'Failed to fetch news from external API',
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  async bookmarkNews(dto: BookmarkNewsDto, userId: number) {
    // Check if the user already bookmarked this exact article (by link)
    const existingBookmark = await this.prisma.news.findFirst({
      where: {
        link: dto.link,
        userId: userId,
      },
    });

    if (existingBookmark) {
      throw new HttpException(
        'You have already bookmarked this article',
        HttpStatus.CONFLICT,
      );
    }

    const bookmark = await this.prisma.news.create({
      data: {
        title: dto.title,
        link: dto.link,
        contentSnippet: dto.contentSnippet ?? null,
        isoDate: dto.isoDate ?? null,
        imageLarge: dto.imageLarge ?? null,
        imageSmall: dto.imageSmall ?? null,
        userId: userId,
      },
    });

    return {
      message: 'News article bookmarked successfully',
      bookmark,
    };
  }

  async getUserBookmarks(userId: number) {
    const bookmarks = await this.prisma.news.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return {
      total: bookmarks.length,
      bookmarks,
    };
  }

  async removeBookmark(bookmarkId: number, userId: number) {
    const bookmark = await this.prisma.news.findFirst({
      where: {
        id: bookmarkId,
        userId: userId,
      },
    });

    if (!bookmark) {
      throw new HttpException('Bookmark not found', HttpStatus.NOT_FOUND);
    }

    await this.prisma.news.delete({
      where: { id: bookmarkId },
    });

    return { message: 'Bookmark removed successfully' };
  }
}
