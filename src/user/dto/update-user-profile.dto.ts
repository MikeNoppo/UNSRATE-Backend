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
  gender?: any; // Using any to avoid import issues with Gender enum

  @AddressProperty()
  alamat?: string;

  @GenderPreferenceProperty()
  interestedInGender?: any;

  @MinAgePreferenceProperty()
  minAgePreference?: number;

  @MaxAgePreferenceProperty()
  maxAgePreference?: number;
}
