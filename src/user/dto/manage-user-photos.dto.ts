import { IsArray, IsOptional, IsString, IsUrl } from 'class-validator';
import { AddPhotosProperty, ProfilePictureProperty, RemovePhotosProperty } from '../../decorators/user/user-property.decorators';

export class ManageUserPhotosDto {
  @AddPhotosProperty()
  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  addPhotos?: string[];

  @RemovePhotosProperty()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  removePhotos?: string[];

  @ProfilePictureProperty()
  profilePicture?: string;
}