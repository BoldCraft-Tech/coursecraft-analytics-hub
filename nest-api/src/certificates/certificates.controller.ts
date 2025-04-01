
import { Controller, Post, Body, Get, Param, UseGuards } from '@nestjs/common';
import { CertificatesService } from './certificates.service';
import { GenerateCertificateDto } from './dto/generate-certificate.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('certificates')
@Controller('certificates')
export class CertificatesController {
  constructor(private readonly certificatesService: CertificatesService) {}

  @UseGuards(JwtAuthGuard)
  @Post('generate')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Generate a certificate' })
  @ApiResponse({ status: 201, description: 'Certificate generated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Course or user not found' })
  generate(@Body() generateCertificateDto: GenerateCertificateDto) {
    return this.certificatesService.generate(
      generateCertificateDto.userId,
      generateCertificateDto.courseId
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('user/:userId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get certificates by user ID' })
  @ApiResponse({ status: 200, description: 'Return certificates by user ID' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findByUserId(@Param('userId') userId: string) {
    return this.certificatesService.findByUserId(userId);
  }
}
