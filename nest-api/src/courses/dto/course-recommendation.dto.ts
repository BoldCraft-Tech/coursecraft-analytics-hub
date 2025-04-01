
import { IsString, IsOptional, IsObject } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CourseRecommendationDto {
  @ApiPropertyOptional({ example: 'Agriculture' })
  @IsOptional()
  @IsString()
  interests?: string;

  @ApiPropertyOptional({ example: 'Beginner' })
  @IsOptional()
  @IsString()
  level?: string;

  @ApiPropertyOptional({ 
    example: {
      userId: '123',
      preferredLevel: 'Beginner',
      categories: ['Technology'],
      completedCategories: ['Agriculture']
    }
  })
  @IsOptional()
  @IsObject()
  userPreferences?: Record<string, any>;
}
