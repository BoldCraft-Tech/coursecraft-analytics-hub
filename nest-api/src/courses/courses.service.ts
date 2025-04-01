import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCourseDto } from './dto/create-course.dto';

@Injectable()
export class CoursesService {
  constructor(private prisma: PrismaService) {}

  async create(createCourseDto: CreateCourseDto) {
    return this.prisma.course.create({
      data: createCourseDto,
    });
  }

  async findAll() {
    return this.prisma.course.findMany();
  }

  async findById(id: string) {
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: {
        lessonsList: {
          orderBy: {
            order_index: 'asc',
          },
        },
      },
    });

    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }

    return course;
  }

  async getRecommendations(interests?: string, level?: string) {
    // Fetch all courses
    const courses = await this.prisma.course.findMany();
    
    // Filter courses based on user preferences
    let filteredCourses = [...courses];
    
    if (interests) {
      filteredCourses = filteredCourses.filter(
        course => course.category.toLowerCase() === interests.toLowerCase()
      );
    }
    
    if (level) {
      filteredCourses = filteredCourses.filter(
        course => course.level.toLowerCase() === level.toLowerCase()
      );
    }

    // If no courses match the filters, return a subset of all courses
    if (filteredCourses.length === 0) {
      filteredCourses = courses.slice(0, 3);
    } else if (filteredCourses.length > 5) {
      // Limit to 5 recommendations if there are many matches
      filteredCourses = filteredCourses.slice(0, 5);
    }

    // Generate a recommendation message based on filters
    let message = "Based on your interests";
    if (interests) message += ` in ${interests}`;
    if (level) message += ` and ${level} level`;
    message += ", I recommend these courses to help you develop valuable skills for rural areas.";

    return {
      recommendations: filteredCourses,
      message: message
    };
  }

  async getAIRecommendations(interests?: string, level?: string, userPreferences?: any) {
    // Fetch all courses
    const courses = await this.prisma.course.findMany();
    
    // Filter courses based on user preferences
    let filteredCourses = [...courses];
    
    if (interests) {
      filteredCourses = filteredCourses.filter(
        course => course.category.toLowerCase() === interests.toLowerCase()
      );
    }
    
    if (level) {
      filteredCourses = filteredCourses.filter(
        course => course.level.toLowerCase() === level.toLowerCase()
      );
    }

    // Use user preferences for more personalized filtering if provided
    if (userPreferences) {
      // Sort by preference relevance 
      filteredCourses.sort((a, b) => {
        const aRelevance = this.calculateRelevance(a, userPreferences);
        const bRelevance = this.calculateRelevance(b, userPreferences);
        return bRelevance - aRelevance;
      });
    }

    // If no courses match the filters, return a subset of all courses
    if (filteredCourses.length === 0) {
      filteredCourses = courses.slice(0, 3);
    } else if (filteredCourses.length > 5) {
      // Limit to 5 recommendations if there are many matches
      filteredCourses = filteredCourses.slice(0, 5);
    }

    // Generate a personalized recommendation message
    let message = "Based on your interests";
    if (interests) message += ` in ${interests}`;
    if (level) message += ` and ${level} level`;
    
    if (userPreferences) {
      message += ", and your learning profile";
    }
    
    message += ", our AI recommends these courses to help you develop valuable skills for rural areas.";

    return {
      recommendations: filteredCourses,
      message: message
    };
  }

  private calculateRelevance(course, userPreferences) {
    let relevance = 0;
    
    // Match category preferences
    if (userPreferences.categories && 
        userPreferences.categories.includes(course.category)) {
      relevance += 3;
    }
    
    // Match level preferences
    if (userPreferences.preferredLevel === course.level) {
      relevance += 2;
    }
    
    // Consider previously completed courses in similar categories
    if (userPreferences.completedCategories && 
        userPreferences.completedCategories.includes(course.category)) {
      relevance += 1;
    }
    
    return relevance;
  }

  async seedLessons(courseId: string, numLessons: number = 5) {
    // Check if course exists
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException(`Course with ID ${courseId} not found`);
    }

    // Count existing lessons
    const existingLessons = await this.prisma.lesson.count({
      where: { course_id: courseId },
    });

    if (existingLessons > 0) {
      throw new Error('Course already has lessons');
    }

    // Create lessons
    const lessons = [];

    for (let i = 1; i <= numLessons; i++) {
      const lesson = await this.prisma.lesson.create({
        data: {
          title: `Lesson ${i}`,
          content: `Content for lesson ${i}. This is detailed content for the lesson.`,
          duration: 30 + (i * 5), // Duration increases slightly for each lesson
          order_index: i,
          course_id: courseId,
        },
      });
      lessons.push(lesson);
    }

    // Update course with number of lessons
    await this.prisma.course.update({
      where: { id: courseId },
      data: { lessons: numLessons },
    });

    return {
      success: true,
      message: `${numLessons} lessons created for course ${courseId}`,
      lessons,
    };
  }

  async addVideoLessons(courseId: string) {
    // Check if course exists
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException(`Course with ID ${courseId} not found`);
    }

    // Define video lesson data
    const videoLessons = [
      {
        title: "Introduction to Course",
        content: "This lesson introduces the course and its objectives.",
        duration: 15,
        order_index: 1,
        video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
      },
      {
        title: "Basic Concepts",
        content: "Learn the fundamental concepts of this subject.",
        duration: 20,
        order_index: 2,
        video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4"
      },
      {
        title: "Practical Applications",
        content: "See how these concepts are applied in real-world scenarios.",
        duration: 25,
        order_index: 3,
        video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
      },
      {
        title: "Advanced Techniques",
        content: "Explore advanced techniques and methodologies.",
        duration: 30,
        order_index: 4,
        video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4"
      },
      {
        title: "Case Studies",
        content: "Analyze real-world case studies and examples.",
        duration: 35,
        order_index: 5,
        video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4"
      }
    ];

    // Delete any existing lessons for this course
    await this.prisma.lesson.deleteMany({
      where: { course_id: courseId },
    });

    // Insert the video lessons
    const lessons = [];
    for (const lessonData of videoLessons) {
      const lesson = await this.prisma.lesson.create({
        data: {
          ...lessonData,
          course_id: courseId,
        },
      });
      lessons.push(lesson);
    }

    // Update the course's lesson count
    await this.prisma.course.update({
      where: { id: courseId },
      data: { 
        lessons: videoLessons.length,
        updated_at: new Date(),
      },
    });

    return {
      success: true,
      message: `Added ${videoLessons.length} video lessons to course ${courseId}`,
      lessons,
    };
  }
}
