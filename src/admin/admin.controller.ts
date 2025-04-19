import { Controller, Get, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; 
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger'; 

@ApiTags('Admin')
@ApiBearerAuth() 
@UseGuards(JwtAuthGuard) 
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard/stats')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  @ApiResponse({
    status: 200,
    description: 'Returns dashboard statistics.',
    // You might want to create a DTO for this response structure later
    schema: {
      example: {
        totalUsers: 150,
        verifiedUsers: 75,
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getDashboardStats() {
    return this.adminService.getDashboardStats();
  }
}
