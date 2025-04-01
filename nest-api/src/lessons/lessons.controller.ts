
import { Controller, Get, Param, UseGuards, Post, Body, Patch } from '@nestjs/common';
import { LessonsService } from './lessons.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UpdateLessonProgressDto } from './dto/update-lesson-progress.dto';

@ApiTags('lessons')
@Controller('lessons')
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get lesson by id' })
  @ApiResponse({ status: 200, description: 'Return lesson by id' })
  @ApiResponse({ status: 404, description: 'Lesson not found' })
  findOne(@Param('id') id: string) {
    return this.lessonsService.findById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/progress')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update lesson progress' })
  @ApiResponse({ status: 200, description: 'Lesson progress updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Lesson not found' })
  updateProgress(
    @Param('id') id: string,
    @Body() updateLessonProgressDto: UpdateLessonProgressDto
  ) {
    return this.lessonsService.updateProgress(
      id,
      updateLessonProgressDto.userId,
      updateLessonProgressDto.completed
    );
  }
}
