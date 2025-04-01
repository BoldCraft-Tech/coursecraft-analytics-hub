
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LessonsService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id },
    });

    if (!lesson) {
      throw new NotFoundException(`Lesson with ID ${id} not found`);
    }

    return lesson;
  }

  async updateProgress(lessonId: string, userId: string, completed: boolean) {
    // Check if lesson exists
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { course: true },
    });

    if (!lesson) {
      throw new NotFoundException(`Lesson with ID ${lessonId} not found`);
    }

    // Update or create lesson progress
    const progress = await this.prisma.userLessonProgress.upsert({
      where: {
        user_id_lesson_id: {
          user_id: userId,
          lesson_id: lessonId,
        },
      },
      update: {
        completed,
        last_accessed: new Date(),
      },
      create: {
        user_id: userId,
        lesson_id: lessonId,
        completed,
        last_accessed: new Date(),
      },
    });

    // If lesson is completed, update enrollment progress
    if (completed) {
      // Get course lessons
      const courseLessons = await this.prisma.lesson.findMany({
        where: { course_id: lesson.course_id },
      });

      // Get completed lessons
      const completedLessons = await this.prisma.userLessonProgress.count({
        where: {
          user_id: userId,
          lesson: {
            course_id: lesson.course_id,
          },
          completed: true,
        },
      });

      // Calculate progress percentage
      const progressPercentage = Math.round((completedLessons / courseLessons.length) * 100);

      // Update enrollment
      await this.prisma.enrollment.updateMany({
        where: {
          user_id: userId,
          course_id: lesson.course_id,
        },
        data: {
          progress: progressPercentage,
          completed: progressPercentage === 100,
          last_accessed: new Date(),
        },
      });
    }

    return progress;
  }
}
