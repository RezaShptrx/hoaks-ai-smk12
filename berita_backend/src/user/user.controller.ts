import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UserService } from './user.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('User')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user account info' })
  @ApiResponse({ status: 200, description: 'User info returned successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getMe(@CurrentUser() user: any) {
    return user;
  }

  @Get('profile')
  @ApiOperation({ summary: 'Get authenticated user profile' })
  @ApiResponse({ status: 200, description: 'Profile returned successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getProfile(@CurrentUser() user: any) {
    return this.userService.getProfile(user.id);
  }

  @Post('profile')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update or create user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully.' })
  @ApiResponse({ status: 400, description: 'Validation failed.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async updateProfile(
    @CurrentUser() user: any,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.userService.updateProfile(user.id, updateProfileDto);
  }
}
