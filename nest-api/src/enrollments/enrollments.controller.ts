
import { Controller, Post, Body, Delete, Param, Get, UseGuards } from '@nestjs/common';
import { EnrollmentsService } from './enrollments.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('enrollments')
@Controller('enrollments')
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new enrollment' })
  @ApiResponse({ status: 201, description: 'Enrollment created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(@Body() createEnrollmentDto: CreateEnrollmentDto) {
    return this.enrollmentsService.create(createEnrollmentDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('user/:userId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get enrollments by user ID' })
  @ApiResponse({ status: 200, description: 'Return enrollments by user ID' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findByUserId(@Param('userId') userId: string) {
    return this.enrollmentsService.findByUserId(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('user/:userId/course/:courseId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete enrollment' })
  @ApiResponse({ status: 200, description: 'Enrollment deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Enrollment not found' })
  remove(@Param('userId') userId: string, @Param('courseId') courseId: string) {
    return this.enrollmentsService.delete(userId, courseId);
  }
}
