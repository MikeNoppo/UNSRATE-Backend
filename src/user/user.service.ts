import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { ManageUserPhotosDto } from './dto/manage-user-photos.dto';
import { GetUserProfileResponseDto, UserProfileDto } from './dto/get-userProfile.dto';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';

// Helper function to generate a unique file name
function generateUniqueFileName(originalname: string): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = originalname.split('.').pop();
  return `${timestamp}-${randomString}.${extension}`;
}

@Injectable()
export class UsersService {
  private supabase: SupabaseClient;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    // Initialize Supabase client
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseKey = this.configService.get<string>('SUPABASE_KEY');
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase URL and Key must be provided in environment variables');
    }
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  // Method to save file to Supabase Storage and get URL
  private async saveFileToSupabaseAndGetUrl(file: Express.Multer.File): Promise<string> {
    const uniqueFileName = generateUniqueFileName(file.originalname);
    const filePath = `user-photos/${uniqueFileName}`; // Define a path/bucket in Supabase

    const { data, error } = await this.supabase.storage
      .from('photos') // Replace 'photos' with your Supabase bucket name
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false, // true to overwrite existing file with same name
      });

    if (error) {
      console.error('Error uploading to Supabase:', error);
      throw new BadRequestException('Failed to upload photo.');
    }

    // Construct the public URL. Adjust if you have RLS policies or different URL structure.
    // This typically is: SUPABASE_URL/storage/v1/object/public/BUCKET_NAME/FILE_PATH
    const { data: publicUrlData } = this.supabase.storage
      .from('photos') // Replace 'photos' with your Supabase bucket name
      .getPublicUrl(filePath);

    if (!publicUrlData || !publicUrlData.publicUrl) {
        console.error('Error getting public URL from Supabase for:', filePath);
        throw new BadRequestException('Failed to get photo URL after upload.');
    }
    
    return publicUrlData.publicUrl;
  }

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
        // Exclude sensitive information
        email: false,
        password: false,
      },
    });
  }

  async manageUserPhotos(userId: string, photosDto: ManageUserPhotosDto, files?: Array<Express.Multer.File>) {
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

    // Add new photos from uploaded files
    if (files && files.length > 0) {
      const newPhotoUrls = await Promise.all(files.map(file => this.saveFileToSupabaseAndGetUrl(file)));
      // Filter out duplicates (photos that already exist based on URL - simplistic check)
      const uniqueNewPhotos = newPhotoUrls.filter(
        (url) => !updatedPhotos.includes(url),
      );
      updatedPhotos = [...updatedPhotos, ...uniqueNewPhotos];
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
}
