import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findById(id: number): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async create(dto: CreateUserDto): Promise<User> {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(dto.password, saltRounds);

    return this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        name: dto.name,
      },
    });
  }

  async getProfile(userId: number) {
    let profile = await this.prisma.userProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      profile = await this.prisma.userProfile.create({
        data: { userId },
      });
    }

    return profile;
  }

  async updateProfile(userId: number, dto: any) {
    return this.prisma.userProfile.upsert({
      where: { userId },
      update: {
        username: dto.username,
        bio: dto.bio,
        phoneNumber: dto.phoneNumber,
        address: dto.address,
        dob: dto.dob,
        occupation: dto.occupation,
        interests: dto.interests,
      },
      create: {
        userId,
        username: dto.username,
        bio: dto.bio,
        phoneNumber: dto.phoneNumber,
        address: dto.address,
        dob: dto.dob,
        occupation: dto.occupation,
        interests: dto.interests,
      },
    });
  }
}
