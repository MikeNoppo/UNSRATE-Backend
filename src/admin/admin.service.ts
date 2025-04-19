import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DashboardStatsResponseDto } from './dto/dashboard-stats.dto';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats(): Promise<DashboardStatsResponseDto> {
    const totalUsers = await this.prisma.user.count();
    const verifiedUsers = await this.prisma.user.count({
      where: { verified: true },
    });
    
    // Calculate verification rate (as a percentage)
    const verificationRate = totalUsers > 0 
      ? Math.round((verifiedUsers / totalUsers) * 100) 
      : 0;

    return {
      totalUsers,
      verifiedUsers,
      verificationRate,
      // Future fields for when report feature is implemented:
      // totalReports: 0,
      // reportedUsers: 0,
    };
  }
}
