import { Controller, Patch, Body, UseGuards, Get, UseInterceptors, UploadedFiles, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator } from '@nestjs/common';
import { UsersService } from './user.service';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { ManageUserPhotosDto } from './dto/manage-user-photos.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../decorators/user.decorator';
import { ApiTags, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { ApiUpdateUserProfile, ApiManageUserPhotos } from '../decorators/user/user-swagger.decorators';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getUserProfile(@User('id') userid : string) {
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

  @Patch('photos')
  @UseGuards(JwtAuthGuard)
  @ApiManageUserPhotos()
  async managePhotos(
    @User('id') userId: string,
    @Body() photosDto: ManageUserPhotosDto,
    @UploadedFiles() files: Array<Express.Multer.File> // Still use Express.Multer.File for type hinting with fastify-multipart when attachFieldsToBody is true
  ) {
    // files will be available here if fastify-multipart is configured with attachFieldsToBody: true
    // or handle them directly from the request object if not.
    // For simplicity with attachFieldsToBody: true, files might be part of photosDto or a separate property on the request.
    // Let's assume files are passed separately for clarity in the service.
    return this.usersService.manageUserPhotos(userId, photosDto, files);
  }
}
