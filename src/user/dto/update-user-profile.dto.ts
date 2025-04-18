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

export class UpdateUserProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(100) 
  fullname?: string;

  @IsOptional()
  @IsUrl()
  profilePicture?: string; // Assuming URL is provided

  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true }) // Validate each element in the array is a URL
  Photos?: string[]; // Assuming array of URLs

  @IsOptional()
  @IsString()
  @MaxLength(500) 
  bio?: string;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: string; 

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  alamat?: string;

  // Note: Updating interests requires more complex logic (connecting/disconnecting relations)
  // We'll omit it from this basic DTO for now. If needed, we can add `interestIds: string[]` later.

  @IsOptional()
  @IsEnum(Gender)
  interestedInGender?: Gender;

  @IsOptional()
  @IsInt()
  @Min(18)
  minAgePreference?: number;

  @IsOptional()
  @IsInt()
  @Max(99)
  maxAgePreference?: number;
}
