import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import CourseProgress from '@/components/course-detail/CourseProgress';
import CourseHeader from '@/components/course-detail/CourseHeader';
import CourseAbout from '@/components/course-detail/CourseAbout';
import CourseCurriculum from '@/components/course-detail/CourseCurriculum';
import CertificateDebugInfo from '@/components/course-detail/CertificateDebugInfo';
import useCourseDetail from '@/hooks/useCourseDetail';

const CourseDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const {
    course,
    lessons,
    enrollment,
    completedLessons,
    loading,
    loadingCertificate,
    certificateId,
    handleEnrollmentChange,
    handleLessonComplete,
    generateCertificate,
    getProgressPercentage
  } = useCourseDetail(id);

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
              <CourseHeader 
                course={course}
                isEnrolled={!!enrollment}
                certificateId={certificateId}
                onEnrollmentChange={handleEnrollmentChange}
                generateCertificate={generateCertificate}
                loadingCertificate={loadingCertificate}
                enrollmentCompleted={enrollment?.completed || false}
                isAdmin={!!user}
              />
              
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
                    <CourseCurriculum 
                      courseId={course.id}
                      lessons={lessons}
                      isEnrolled={!!enrollment}
                      onLessonComplete={handleLessonComplete}
                      totalLessons={course.lessons}
                      totalDuration={course.duration}
                    />
                    
                    {user && id && (
                      <CertificateDebugInfo userId={user.id} courseId={id} />
                    )}
                  </TabsContent>
                  
                  <TabsContent value="about">
                    <CourseAbout description={course.description} />
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
