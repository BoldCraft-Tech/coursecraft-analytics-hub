import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Users, Clock, GraduationCap, Award } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import EnrollButton from '@/components/course-detail/EnrollButton';
import CourseProgress from '@/components/course-detail/CourseProgress';
import LessonList from '@/components/course-detail/LessonList';
import { fetchLessonsWithVideos } from '@/utils/courseVideoUtils';

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  level: string;
  duration: string;
  students: number;
  lessons: number;
  image?: string;
}

interface Lesson {
  id: string;
  title: string;
  content: string;
  duration: number;
  order_index: number;
  completed?: boolean;
  videoUrl?: string;
}

interface Enrollment {
  id: string;
  progress: number;
  completed: boolean;
}

const CourseDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [completedLessons, setCompletedLessons] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [loadingCertificate, setLoadingCertificate] = useState(false);
  const [certificateId, setCertificateId] = useState<string | null>(null);
  
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;

    const fetchCourseDetails = async () => {
      setLoading(true);
      try {
        console.log('Fetching course details for ID:', id);
        
        const { data: courseData, error: courseError } = await supabase
          .from('courses')
          .select('*')
          .eq('id', id)
          .single();
          
        if (courseError) throw courseError;
        
        console.log('Course data retrieved:', courseData);
        setCourse(courseData);
        
        const lessonsData = await fetchLessonsWithVideos(id);
        
        console.log('Lessons with videos retrieved:', lessonsData);
        console.log('Number of lessons found:', lessonsData?.length || 0);
        
        if (user) {
          const { data: enrollmentData, error: enrollmentError } = await supabase
            .from('enrollments')
            .select('*')
            .eq('user_id', user.id)
            .eq('course_id', id)
            .maybeSingle();
            
          if (enrollmentError) throw enrollmentError;
          
          setEnrollment(enrollmentData);
          
          const { data: progressData, error: progressError } = await supabase
            .from('user_lesson_progress')
            .select('lesson_id, completed')
            .eq('user_id', user.id);
            
          if (progressError) throw progressError;
          
          const completionMap = progressData.reduce((map: Record<string, boolean>, item) => {
            map[item.lesson_id] = item.completed;
            return map;
          }, {});
          
          const lessonsWithProgress = lessonsData.map(lesson => ({
            ...lesson,
            completed: completionMap[lesson.id] || false
          }));
          
          setLessons(lessonsWithProgress);
          
          const completed = progressData.filter(p => p.completed).length;
          setCompletedLessons(completed);
          
          const { data: certificateData, error: certificateError } = await supabase
            .from('certificates')
            .select('id')
            .eq('user_id', user.id)
            .eq('course_id', id)
            .maybeSingle();
            
          if (certificateError) throw certificateError;
          
          if (certificateData) {
            setCertificateId(certificateData.id);
          }
        } else {
          setLessons(lessonsData);
        }
      } catch (error: any) {
        console.error('Error fetching course details:', error);
        toast({
          title: 'Error loading course',
          description: error.message || 'Please try again later',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetails();
  }, [id, user, toast]);

  const handleEnrollmentChange = (enrolled: boolean) => {
    if (enrolled && !enrollment) {
      setEnrollment({
        id: 'new-enrollment',
        progress: 0,
        completed: false
      });
    } else if (!enrolled && enrollment) {
      setEnrollment(null);
      setCompletedLessons(0);
      
      setLessons(prev => prev.map(lesson => ({
        ...lesson,
        completed: false
      })));
    }
  };

  const handleLessonComplete = async (lessonId: string, completed: boolean) => {
    setLessons(prev => prev.map(lesson => 
      lesson.id === lessonId 
        ? { ...lesson, completed } 
        : lesson
    ));
    
    const newCompletedCount = completed 
      ? completedLessons + 1 
      : completedLessons - 1;
    
    setCompletedLessons(newCompletedCount);
    
    if (lessons.length > 0) {
      const progressPercentage = Math.round((newCompletedCount / lessons.length) * 100);
      
      if (enrollment) {
        setEnrollment(prev => prev ? {
          ...prev,
          progress: progressPercentage,
          completed: progressPercentage === 100
        } : null);
        
        await supabase
          .from('enrollments')
          .update({ 
            progress: progressPercentage,
            completed: progressPercentage === 100
          })
          .eq('user_id', user?.id)
          .eq('course_id', id);
          
        if (progressPercentage === 100 && !certificateId) {
          await generateCertificate();
        }
      }
    }
  };

  const generateCertificate = async () => {
    if (!user || !id) return;
    
    setLoadingCertificate(true);
    
    try {
      const { data, error } = await supabase.rpc(
        'generate_certificate',
        { course_id: id }
      );
      
      if (error) throw error;
      
      if (data) {
        setCertificateId(data);
        toast({
          title: 'Certificate generated!',
          description: 'Congratulations on completing this course',
        });
      } else {
        toast({
          title: 'Cannot generate certificate',
          description: 'Please complete all lessons first',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      console.error('Error generating certificate:', error);
      toast({
        title: 'Error generating certificate',
        description: error.message || 'Please try again later',
        variant: 'destructive',
      });
    } finally {
      setLoadingCertificate(false);
    }
  };

  const getProgressPercentage = (): number => {
    if (!lessons.length) return 0;
    return Math.round((completedLessons / lessons.length) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow pt-20 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" role="status">
              <span className="sr-only">Loading...</span>
            </div>
            <p className="mt-4 text-muted-foreground">Loading course details...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow pt-20 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Course not found</h2>
            <p className="text-muted-foreground mb-6">The course you're looking for doesn't exist or has been removed</p>
            <Button onClick={() => navigate('/courses')}>Browse Courses</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-20">
        <section className="py-16">
          <div className="container px-4 mx-auto">
            <div className="max-w-4xl mx-auto">
              <div className="mb-8">
                <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
                <p className="text-lg text-muted-foreground mb-6">{course.description}</p>
                
                <div className="flex flex-wrap gap-4 mb-6">
                  <div className="flex items-center">
                    <GraduationCap className="h-5 w-5 mr-2 text-muted-foreground" />
                    <span>{course.level}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-muted-foreground" />
                    <span>{course.duration}</span>
                  </div>
                  <div className="flex items-center">
                    <BookOpen className="h-5 w-5 mr-2 text-muted-foreground" />
                    <span>{course.lessons} lessons</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-5 w-5 mr-2 text-muted-foreground" />
                    <span>{course.students} students</span>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                    {course.category}
                  </span>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="w-full sm:w-auto">
                    <EnrollButton 
                      courseId={course.id} 
                      isEnrolled={!!enrollment}
                      onEnrollmentChange={handleEnrollmentChange} 
                    />
                  </div>
                  
                  {certificateId && (
                    <Button 
                      variant="outline"
                      onClick={() => navigate(`/certificates?course=${course.id}`)}
                      className="w-full sm:w-auto"
                    >
                      <Award className="h-4 w-4 mr-2" />
                      View Certificate
                    </Button>
                  )}
                  
                  {enrollment && enrollment.progress === 100 && !certificateId && (
                    <Button 
                      variant="outline"
                      onClick={generateCertificate}
                      disabled={loadingCertificate}
                      className="w-full sm:w-auto"
                    >
                      {loadingCertificate ? (
                        <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-solid border-current border-r-transparent" />
                      ) : (
                        <Award className="h-4 w-4 mr-2" />
                      )}
                      Get Certificate
                    </Button>
                  )}
                  
                  {user && (
                    <Button 
                      variant="outline"
                      onClick={() => navigate(`/admin/courses/${course.id}/lessons`)}
                      className="w-full sm:w-auto"
                    >
                      Manage Lessons
                    </Button>
                  )}
                </div>
              </div>
              
              {enrollment && (
                <div className="mb-8">
                  <CourseProgress 
                    progress={getProgressPercentage()}
                    totalLessons={lessons.length}
                    completedLessons={completedLessons}
                  />
                </div>
              )}
              
              <div className="glass-panel p-6 rounded-xl mb-8">
                <Tabs defaultValue="curriculum">
                  <TabsList className="mb-6">
                    <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
                    <TabsTrigger value="about">About</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="curriculum" className="space-y-6">
                    <div>
                      <h2 className="text-xl font-semibold mb-4">Course Curriculum</h2>
                      
                      <div className="mb-4">
                        <div className="flex justify-between text-sm text-muted-foreground mb-2">
                          <span>{course.lessons} lessons</span>
                          <span>{course.duration} total</span>
                        </div>
                      </div>
                      
                      {console.log('Rendering lessons section, count:', lessons.length)}
                      {lessons && lessons.length > 0 ? (
                        <LessonList 
                          courseId={course.id}
                          lessons={lessons} 
                          isEnrolled={!!enrollment}
                          onLessonComplete={handleLessonComplete}
                        />
                      ) : (
                        <div className="text-center py-8 bg-muted/30 rounded-lg">
                          <p className="text-muted-foreground">No lessons available for this course yet</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="about">
                    <div className="space-y-6">
                      <div>
                        <h2 className="text-xl font-semibold mb-4">About This Course</h2>
                        <p className="text-muted-foreground">{course.description}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-semibold mb-3">What You'll Learn</h3>
                        <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                          <li>Practical knowledge applicable to rural settings</li>
                          <li>Hands-on skills you can apply immediately</li>
                          <li>Best practices specific to your field</li>
                          <li>Solutions to common challenges in rural areas</li>
                        </ul>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-semibold mb-3">Requirements</h3>
                        <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                          <li>Basic understanding of the subject area</li>
                          <li>Willingness to learn and apply new concepts</li>
                          <li>Access to basic tools relevant to the course</li>
                        </ul>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default CourseDetail;
