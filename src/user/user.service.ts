import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { ManageUserPhotosDto } from './dto/manage-user-photos.dto';
import { GetUserProfileResponseDto, UserProfileDto } from './dto/get-userProfile.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getUserProfile(userId: string): Promise<GetUserProfileResponseDto> {
    // Validasi User ID
    if(!userId) {
      throw new BadRequestException('User ID is required');
    }
    
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          fullname: true,
          nim: true,
          email: true,
          profilePicture: true,
          Photos: true,
          bio: true,
          fakultas: true,
          prodi: true,
          age: true,
          gender: true,
          alamat: true,
          verified: true,
          // relasi interests untuk minat pengguna
          interests: {
            select: {
              interest: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });
      
      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Hitung persentase kelengkapan profil
      const profileFields = [
        user.fullname, 
        user.profilePicture, 
        user.bio, 
        user.gender, 
        user.fakultas,
        user.prodi,
        user.alamat,
      ];
      
      const filledFields = profileFields.filter(field => field !== null && field !== undefined).length;
      const completionPercentage = Math.round((filledFields / profileFields.length) * 100);
      
      // Transform minat pengguna ke format yang lebih baik
      const interests = user.interests?.map(item => ({
        id: item.interest.id,
        name: item.interest.name,
      })) || [];

      // Transform data untuk format response yang konsisten
      const profileData = {
        ...user,
        interests: undefined, // Remove original format
      };

      // Tambahkan informasi yang lebih relevan untuk self-viewing
      const missingFields = profileFields
        .map((field, index) => ({ field: field, name: ['fullname', 'profilePicture', 'bio', 'gender', 
                                                       'fakultas', 'prodi', 'alamat', 'interestedInGender', 
                                                       'minAgePreference', 'maxAgePreference'][index] }))
        .filter(item => item.field === null || item.field === undefined)
        .map(item => item.name);

      return {
        statusCode: 200,
        message: 'User profile retrieved successfully',
        data: {
          ...profileData,
          profileCompletion: completionPercentage,
          missingFields: missingFields.length > 0 ? missingFields : undefined,
          interests,
        },
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new NotFoundException('User not found or error occurred');
    }
  }

  async updateUserProfile(
    userId: string,
    updateProfileDto: UpdateUserProfileDto,
  ) {
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
        dateOfBirth: updateProfileDto.dateOfBirth
          ? new Date(updateProfileDto.dateOfBirth)
          : undefined,
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
        fakultas: true,
        prodi: true,
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
        (photo) => !updatedPhotos.includes(photo),
      );
      updatedPhotos = [...updatedPhotos, ...newPhotos];
    }

    // Remove photos
    if (photosDto.removePhotos && photosDto.removePhotos.length > 0) {
      updatedPhotos = updatedPhotos.filter(
        (photo) => !photosDto.removePhotos.includes(photo),
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

  private async uploadToStorage(file: Express.Multer.File): Promise<string> {
  return `https://bvfgbtpd-2020.asse.devtunnels.ms/${file.originalname}`;
}

  async uploadProfilePhoto(userId: string, file: Express.Multer.File) {
  if (!file) {
    throw new BadRequestException('No file uploaded');
  }

  // Misal upload ke cloud storage, lalu dapat URL:
  const uploadedUrl = await this.uploadToStorage(file); // Simulasi upload

  return this.prisma.user.update({
    where: { id: userId },
    data: {
      profilePicture: uploadedUrl,
      Photos: {
        push: uploadedUrl
      }
    },
    select: {
      id: true,
      profilePicture: true,
      Photos: true,
    }
  });
}

}
