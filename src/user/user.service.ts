import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { ManageUserPhotosDto } from './dto/manage-user-photos.dto';

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

  async manageUserPhotos(userId: string, photosDto: ManageUserPhotosDto) {
    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        Photos: true,
        profilePicture: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Initialize current photos array
    const currentPhotos = user.Photos || [];
    let updatedPhotos = [...currentPhotos];
    
    // Add new photos
    if (photosDto.addPhotos && photosDto.addPhotos.length > 0) {
      // Filter out duplicates (photos that already exist)
      const newPhotos = photosDto.addPhotos.filter(
        photo => !updatedPhotos.includes(photo)
      );
      updatedPhotos = [...updatedPhotos, ...newPhotos];
    }
    
    // Remove photos
    if (photosDto.removePhotos && photosDto.removePhotos.length > 0) {
      updatedPhotos = updatedPhotos.filter(
        photo => !photosDto.removePhotos.includes(photo)
      );
      
      // Check if trying to remove profile picture
      if (photosDto.removePhotos.includes(user.profilePicture)) {
        // If no profilePicture provided in the DTO, this will reset it
        if (!photosDto.profilePicture) {
          // Set to first available photo or null if no photos left
          photosDto.profilePicture = updatedPhotos.length > 0 ? updatedPhotos[0] : null;
        }
      }
    }

    // Update user with new photo data
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        Photos: updatedPhotos,
        profilePicture: photosDto.profilePicture,
      },
      select: {
        id: true,
        fullname: true,
        profilePicture: true,
        Photos: true,
      },
    });
  }
}
