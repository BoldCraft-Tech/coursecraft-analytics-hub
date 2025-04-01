
import { Controller, Get, Post, Body, Param, UseGuards, Query } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CourseRecommendationDto } from './dto/course-recommendation.dto';

@ApiTags('courses')
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new course' })
  @ApiResponse({ status: 201, description: 'Course created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(@Body() createCourseDto: CreateCourseDto) {
    return this.coursesService.create(createCourseDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all courses' })
  @ApiResponse({ status: 200, description: 'Return all courses' })
  findAll() {
    return this.coursesService.findAll();
  }

  @Get('recommendations')
  @ApiOperation({ summary: 'Get course recommendations' })
  @ApiResponse({ status: 200, description: 'Return course recommendations' })
  getRecommendations(@Query() courseRecommendationDto: CourseRecommendationDto) {
    return this.coursesService.getRecommendations(
      courseRecommendationDto.interests,
      courseRecommendationDto.level
    );
  }

  @Post(':id/seed-lessons')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Seed lessons for a course' })
  @ApiResponse({ status: 200, description: 'Course lessons seeded successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  seedLessons(@Param('id') id: string, @Body() data: { numLessons: number }) {
    return this.coursesService.seedLessons(id, data.numLessons);
  }

  @Post(':id/add-video-lessons')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add video lessons to a course' })
  @ApiResponse({ status: 200, description: 'Video lessons added successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  addVideoLessons(@Param('id') id: string) {
    return this.coursesService.addVideoLessons(id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get course by id' })
  @ApiResponse({ status: 200, description: 'Return course by id' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  findOne(@Param('id') id: string) {
    return this.coursesService.findById(id);
  }
}
