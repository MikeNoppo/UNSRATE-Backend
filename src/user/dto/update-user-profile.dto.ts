import {
  IsOptional,
  IsString,
  IsUrl,
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  Min,
  Max,
  MaxLength,
} from 'class-validator';
import { Gender } from '@prisma/client'; 
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserProfileDto {
  @ApiProperty({
    description: 'Full name of the user',
    example: 'John Doe',
    required: false,
    maxLength: 100
  })
  @IsOptional()
  @IsString()
  @MaxLength(100) 
  fullname?: string;

  @ApiProperty({
    description: 'URL to the profile picture',
    example: 'https://example.com/profile.jpg',
    required: false
  })
  @IsOptional()
  @IsUrl()
  profilePicture?: string;

  @ApiProperty({
    description: 'Array of photo URLs',
    example: ['https://example.com/photo1.jpg', 'https://example.com/photo2.jpg'],
    required: false,
    isArray: true
  })
  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  Photos?: string[];

  @ApiProperty({
    description: 'User biography',
    example: 'I am a student studying Computer Science',
    required: false,
    maxLength: 500
  })
  @IsOptional()
  @IsString()
  @MaxLength(500) 
  bio?: string;

  @ApiProperty({
    description: 'Date of birth in ISO format',
    example: '1995-08-24',
    required: false
  })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string; 

  @ApiProperty({
    description: 'User gender',
    enum: Gender,
    example: 'MALE',
    required: false
  })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiProperty({
    description: 'User address',
    example: 'Jalan Dipatiukur No.112-116, Bandung',
    required: false,
    maxLength: 255
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  alamat?: string;

  @ApiProperty({
    description: 'Preferred gender for matching',
    enum: Gender,
    example: 'FEMALE',
    required: false
  })
  @IsOptional()
  @IsEnum(Gender)
  interestedInGender?: Gender;

  @ApiProperty({
    description: 'Minimum age preference for matching',
    example: 18,
    minimum: 18,
    required: false
  })
  @IsOptional()
  @IsInt()
  @Min(18)
  minAgePreference?: number;

  @ApiProperty({
    description: 'Maximum age preference for matching',
    example: 35,
    maximum: 99,
    required: false
  })
  @IsOptional()
  @IsInt()
  @Max(99)
  maxAgePreference?: number;
}
