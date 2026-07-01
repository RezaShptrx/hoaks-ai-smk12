import { IsString, IsOptional } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  dob?: string;

  @IsOptional()
  @IsString()
  occupation?: string;

  @IsOptional()
  @IsString()
  interests?: string;
}
