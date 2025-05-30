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
  gender?: string; 

  @AddressProperty()
  alamat?: string;

  @GenderPreferenceProperty()
  interestedInGender?: string;

  @MinAgePreferenceProperty()
  minAgePreference?: number;

  @MaxAgePreferenceProperty()
  maxAgePreference?: number;
}
