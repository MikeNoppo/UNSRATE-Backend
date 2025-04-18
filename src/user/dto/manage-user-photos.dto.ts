import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString, IsUrl } from 'class-validator';

export class ManageUserPhotosDto {
  @ApiProperty({
    description: 'Array of photo URLs to add to the user profile',
    example: ['https://example.com/photo1.jpg', 'https://example.com/photo2.jpg'],
    required: false,
    isArray: true
  })
  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  addPhotos?: string[];

  @ApiProperty({
    description: 'Array of photo URLs to remove from the user profile',
    example: ['https://example.com/old-photo.jpg'],
    required: false,
    isArray: true
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  removePhotos?: string[];

  @ApiProperty({
    description: 'URL for the profile picture (main photo)',
    example: 'https://example.com/main-profile.jpg',
    required: false
  })
  @IsOptional()
  @IsUrl()
  profilePicture?: string;
}