import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; // Make sure PrismaService is imported

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {} // Inject PrismaService

  async getDashboardStats() {
    const totalUsers = await this.prisma.user.count();
    const verifiedUsers = await this.prisma.user.count({
      where: { verified: true },
    });
    // const totalReports = await this.prisma.report.count(); // Add this back when reports are implemented

    return {
      totalUsers,
      verifiedUsers,
      // totalReports
    };
  }

}
