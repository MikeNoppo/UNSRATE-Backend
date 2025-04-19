import { ApiProperty } from '@nestjs/swagger';

/**
 * Response DTO for Admin Dashboard Statistics
 * Contains counters for various user metrics used in the admin dashboard
 */
export class DashboardStatsResponseDto {
  @ApiProperty({
    description: 'Total number of users in the system',
    example: 150,
  })
  totalUsers: number;

  @ApiProperty({
    description: 'Number of verified users',
    example: 75,
  })
  verifiedUsers: number;

  @ApiProperty({
    description: 'Percentage of verified users',
    example: 50,
  })
  verificationRate: number;

  // For future implementation when report feature is added
  /*
  @ApiProperty({
    description: 'Total number of reports in the system',
    example: 10,
  })
  totalReports: number;

  @ApiProperty({
    description: 'Number of users with at least one report against them',
    example: 5,
  })
  reportedUsers: number;
  */
}