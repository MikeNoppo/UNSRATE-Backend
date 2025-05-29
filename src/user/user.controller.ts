import {
  Controller,
  Patch,
  Body,
  UseGuards,
  Get,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { UsersService } from './user.service';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
// import { ManageUserPhotosDto } from './dto/manage-user-photos.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../decorators/user.decorator';
import { ApiTags } from '@nestjs/swagger';
import {
  ApiUpdateUserProfile,
  ApiManageUserPhotos,
} from '../decorators/user/user-swagger.decorators';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getUserProfile(@User('id') userid: string) {
    return this.usersService.getUserProfile(userid);
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  @ApiUpdateUserProfile()
  async updateProfile(
    @User('id') userId: string,
    @Body() updateProfileDto: UpdateUserProfileDto,
  ) {
    return this.usersService.updateUserProfile(userId, updateProfileDto);
  }

  @Patch('photo')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadProfilePhoto(
    @User('id') userId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.usersService.uploadProfilePhoto(userId, file);
  }
}
