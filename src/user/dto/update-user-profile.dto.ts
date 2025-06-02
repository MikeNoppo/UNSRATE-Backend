import { Gender, UserInterest } from '@prisma/client';
import { 
  FullnameProperty,
  ProfilePictureProperty,
  PhotosArrayProperty,
  BioProperty,
  DateOfBirthProperty,
  GenderProperty,
  AddressProperty,
  GenderPreferenceProperty,
  MinAgePreferenceProperty,
  MaxAgePreferenceProperty
} from '../../decorators/user/user-property.decorators';
import { IsString } from 'class-validator';

export class UpdateUserProfileDto {
  @FullnameProperty()
  @IsString()
  fullname?: string;

  @ProfilePictureProperty()
  @IsString()
  profilePicture?: string;

  @PhotosArrayProperty()
  Photos?: string[];

  @BioProperty()
  bio?: string;

  @DateOfBirthProperty()
  dateOfBirth?: string;

  @GenderProperty()
  gender?: Gender;

  addInterests?: string[];
  removeInterests?: string[];
  setInterests?: string[];

  @IsString()
  fakultas?: string;

  @IsString()
  prodi?: string;

  age?: number;
  
  @AddressProperty()
  alamat?: string;

  @GenderPreferenceProperty()
  interestedInGender?: Gender;

  @MinAgePreferenceProperty()
  minAgePreference?: number;

  @MaxAgePreferenceProperty()
  maxAgePreference?: number;
}
