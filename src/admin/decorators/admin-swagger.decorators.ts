import { applyDecorators } from '@nestjs/common';
import { 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth
} from '@nestjs/swagger';
import { DashboardStatsResponseDto } from '../dto/dashboard-stats.dto';

/**
 * Swagger decorator factory for admin dashboard statistics endpoint
 */
export function ApiDashboardStats() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ 
      summary: 'Get admin dashboard statistics',
      description: 'Retrieves key metrics for the admin dashboard including user counts and verification rates.'
    }),
    ApiResponse({ 
      status: 200, 
      description: 'Statistics retrieved successfully',
      type: DashboardStatsResponseDto,
      schema: {
        properties: {
          totalUsers: { type: 'number', example: 150, description: 'Total number of users in the system' },
          verifiedUsers: { type: 'number', example: 75, description: 'Number of verified users' },
          verificationRate: { type: 'number', example: 50, description: 'Percentage of verified users (0-100)' },
          // Future fields:
          // totalReports: { type: 'number', example: 8, description: 'Total number of reports submitted' },
          // reportedUsers: { type: 'number', example: 5, description: 'Number of users with at least one report' },
        }
      }
    }),
    ApiResponse({ 
      status: 401, 
      description: 'Unauthorized - Valid JWT token is required'
    }),
    ApiResponse({ 
      status: 403, 
      description: 'Forbidden - User does not have admin privileges'
    })
  );
}