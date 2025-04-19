import { Controller, Get, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardStatsResponseDto } from './dto/dashboard-stats.dto';
import { ApiDashboardStats } from '../decorators/admin/admin-swagger.decorators';

@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard/stats')
  @ApiDashboardStats()
  async getDashboardStats(): Promise<DashboardStatsResponseDto> {
    return this.adminService.getDashboardStats();
  }
}
