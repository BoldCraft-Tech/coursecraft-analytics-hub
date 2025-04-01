
import { IsString, IsOptional, IsInt, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCourseDto {
  @ApiProperty({ example: 'Introduction to Agriculture' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Learn the basics of agriculture and farming techniques.' })
  @IsString()
  description: string;

  @ApiProperty({ example: 'Agriculture' })
  @IsString()
  category: string;

  @ApiProperty({ example: 'Beginner' })
  @IsString()
  level: string;

  @ApiProperty({ example: '2 weeks' })
  @IsString()
  duration: string;

  @ApiPropertyOptional({ example: 'https://example.com/course-image.jpg' })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  students?: number;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  lessons?: number;
}
