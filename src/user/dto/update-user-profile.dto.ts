import { Gender } from '@prisma/client';
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

export class UpdateUserProfileDto {
  @FullnameProperty()
  fullname?: string;

  @ProfilePictureProperty()
  profilePicture?: string;

  @PhotosArrayProperty()
  Photos?: string[];

  @BioProperty()
  bio?: string;

  @DateOfBirthProperty()
  dateOfBirth?: string;

  @GenderProperty()
  gender?: Gender;

  @AddressProperty()
  alamat?: string;

  @GenderPreferenceProperty()
  interestedInGender?: Gender;

  @MinAgePreferenceProperty()
  minAgePreference?: number;

  @MaxAgePreferenceProperty()
  maxAgePreference?: number;
}
