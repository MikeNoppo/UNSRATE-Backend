import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async updateUserProfile(userId: string, updateProfileDto: UpdateUserProfileDto) {
    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Update user profile
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        ...updateProfileDto,
        // Convert dateOfBirth string to Date if provided
        dateOfBirth: updateProfileDto.dateOfBirth ? new Date(updateProfileDto.dateOfBirth) : undefined,
      },
      select: {
        id: true,
        fullname: true,
        profilePicture: true,
        Photos: true,
        bio: true,
        dateOfBirth: true,
        gender: true,
        alamat: true,
        interestedInGender: true,
        minAgePreference: true,
        maxAgePreference: true,
        // Exclude sensitive information
        email: false,
        password: false,
      },
    });
  }
}
