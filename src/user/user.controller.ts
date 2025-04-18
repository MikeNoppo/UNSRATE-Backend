import { Controller, Patch, Body, UseGuards } from '@nestjs/common';
import { UsersService } from './user.service';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { ManageUserPhotosDto } from './dto/manage-user-photos.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../decorators/user.decorator';
import { ApiTags } from '@nestjs/swagger';
import { ApiUpdateUserProfile, ApiManageUserPhotos } from '../decorators/user-swagger.decorators';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  @ApiUpdateUserProfile()
  async updateProfile(
    @User('id') userId: string,
    @Body() updateProfileDto: UpdateUserProfileDto,
  ) {
    return this.usersService.updateUserProfile(userId, updateProfileDto);
  }

  @Patch('photos')
  @UseGuards(JwtAuthGuard)
  @ApiManageUserPhotos()
  async managePhotos(
    @User('id') userId: string,
    @Body() photosDto: ManageUserPhotosDto,
  ) {
    return this.usersService.manageUserPhotos(userId, photosDto);
  }
}
