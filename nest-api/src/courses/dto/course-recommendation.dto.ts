
import { IsString, IsOptional } from 'class-validator';
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
}
