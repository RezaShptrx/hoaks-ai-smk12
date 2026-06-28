import { IsString, IsOptional, IsUrl } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class BookmarkNewsDto {
  @ApiProperty({
    description: 'Title of the news article',
    example: 'CNN News Title',
  })
  @IsString({ message: 'Title is required' })
  title!: string;

  @ApiProperty({
    description: 'Direct link/URL to the news article',
    example: 'https://cnn.com/article-url',
  })
  @IsUrl({}, { message: 'Please provide a valid URL' })
  link!: string;

  @ApiPropertyOptional({
    description: 'Brief content snippet or summary of the article',
    example: 'This is a brief summary of the article...',
  })
  @IsOptional()
  @IsString()
  contentSnippet?: string;

  @ApiPropertyOptional({
    description: 'ISO Date string of the article release',
    example: '2026-06-28T14:30:00.000Z',
  })
  @IsOptional()
  @IsString()
  isoDate?: string;

  @ApiPropertyOptional({
    description: 'URL of the large preview image',
    example: 'https://cnn.com/image-large.jpg',
  })
  @IsOptional()
  @IsString()
  imageLarge?: string;

  @ApiPropertyOptional({
    description: 'URL of the small preview image',
    example: 'https://cnn.com/image-small.jpg',
  })
  @IsOptional()
  @IsString()
  imageSmall?: string;
}
