import { Controller, Patch, Body, UseGuards } from '@nestjs/common';
import { UsersService } from './user.service';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { UserProfileResponse } from './dto/user-profile-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../auth/decorators/user.decorator';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Update user profile',
    description: 'Updates the authenticated user\'s profile information including personal details and preferences.'
  })
  @ApiBody({
    description: 'User profile data to update',
    type: UpdateUserProfileDto,
    examples: {
      basicInfo: {
        summary: 'Basic Profile Update',
        description: 'Update basic profile information',
        value: {
          fullname: 'John Doe',
          bio: 'Software Engineering student at University',
          dateOfBirth: '1995-08-24'
        }
      },
      preferences: {
        summary: 'Dating Preferences Update',
        description: 'Update matching preferences',
        value: {
          interestedInGender: 'FEMALE',
          minAgePreference: 18,
          maxAgePreference: 30
        }
      },
      fullProfile: {
        summary: 'Complete Profile Update',
        description: 'Update all profile fields',
        value: {
          fullname: 'John Doe',
          bio: 'Software Engineering student at University',
          dateOfBirth: '1995-08-24',
          gender: 'MALE',
          alamat: 'Jalan Dipatiukur No.112-116, Bandung',
          profilePicture: 'https://example.com/profile.jpg',
          Photos: ['https://example.com/photo1.jpg', 'https://example.com/photo2.jpg'],
          interestedInGender: 'FEMALE',
          minAgePreference: 18,
          maxAgePreference: 30
        }
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Profile updated successfully',
    type: UserProfileResponse
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Valid JWT token is required'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'User not found'
  })
  async updateProfile(
    @User('id') userId: string,
    @Body() updateProfileDto: UpdateUserProfileDto,
  ) {
    return this.usersService.updateUserProfile(userId, updateProfileDto);
  }
}
