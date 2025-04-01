
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CertificatesService {
  constructor(private prisma: PrismaService) {}

  async generate(userId: string, courseId: string) {
    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Check if course exists
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: {
        lessonsList: true,
      },
    });

    if (!course) {
      throw new NotFoundException(`Course with ID ${courseId} not found`);
    }

    // Check if user is enrolled in the course
    const enrollment = await this.prisma.enrollment.findFirst({
      where: {
        user_id: userId,
        course_id: courseId,
      },
    });

    if (!enrollment) {
      throw new BadRequestException(`User is not enrolled in the course`);
    }

    // Count total lessons in course
    const totalLessons = course.lessonsList.length;

    // Count completed lessons by user
    const completedLessons = await this.prisma.userLessonProgress.count({
      where: {
        user_id: userId,
        lesson: {
          course_id: courseId,
        },
        completed: true,
      },
    });

    // If all lessons completed, generate certificate
    if (totalLessons > 0 && completedLessons === totalLessons) {
      // Update enrollment status
      await this.prisma.enrollment.updateMany({
        where: {
          user_id: userId,
          course_id: courseId,
        },
        data: {
          completed: true,
        },
      });

      // Generate certificate URL
      const certificateUrl = `https://example.com/cert/${userId}/${courseId}`;

      // Insert certificate if it doesn't exist
      const certificate = await this.prisma.certificate.upsert({
        where: {
          user_id_course_id: {
            user_id: userId,
            course_id: courseId,
          },
        },
        update: {
          certificate_url: certificateUrl,
          issue_date: new Date(),
        },
        create: {
          user_id: userId,
          course_id: courseId,
          certificate_url: certificateUrl,
        },
      });

      return certificate;
    } else {
      throw new BadRequestException(`Not all lessons completed (${completedLessons}/${totalLessons})`);
    }
  }

  async findByUserId(userId: string) {
    return this.prisma.certificate.findMany({
      where: { user_id: userId },
      include: {
        course: true,
      },
      orderBy: {
        issue_date: 'desc',
      },
    });
  }
}
