
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';

@Injectable()
export class EnrollmentsService {
  constructor(private prisma: PrismaService) {}

  async create(createEnrollmentDto: CreateEnrollmentDto) {
    return this.prisma.enrollment.create({
      data: createEnrollmentDto,
    });
  }

  async findByUserId(userId: string) {
    return this.prisma.enrollment.findMany({
      where: { user_id: userId },
      include: {
        course: true,
      },
    });
  }

  async delete(userId: string, courseId: string) {
    const enrollment = await this.prisma.enrollment.findFirst({
      where: {
        user_id: userId,
        course_id: courseId,
      },
    });

    if (!enrollment) {
      throw new NotFoundException(`Enrollment not found`);
    }

    return this.prisma.enrollment.delete({
      where: { id: enrollment.id },
    });
  }
}
