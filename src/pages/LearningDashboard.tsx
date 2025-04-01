
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Award, Clock, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface EnrollmentWithCourse {
  id: string;
  progress: number;
  completed: boolean;
  enrolled_at: string;
  last_accessed: string;
  course: {
    id: string;
    title: string;
    description: string;
    category: string;
    level: string;
    duration: string;
    lessons: number;
  };
}

const LearningDashboard = () => {
  const [enrollments, setEnrollments] = useState<EnrollmentWithCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    const fetchEnrollments = async () => {
      try {
        // Get enrollments with course information
        const { data, error } = await supabase
          .from('enrollments')
          .select(`
            *,
            course:courses(*)
          `)
          .eq('user_id', user.id)
          .order('last_accessed', { ascending: false });

        if (error) throw error;

        setEnrollments(data as EnrollmentWithCourse[]);
      } catch (error: any) {
        console.error('Error fetching enrollments:', error);
        toast({
          title: 'Error fetching your courses',
          description: error.message || 'Please try again later',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchEnrollments();
  }, [user, toast]);

  const continueLatestCourse = () => {
    if (enrollments.length > 0) {
      navigate(`/courses/${enrollments[0].course.id}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-20">
        <section className="py-12">
          <div className="container px-4 mx-auto">
            <div className="mb-10">
              <h1 className="text-3xl font-bold mb-2">Learning Dashboard</h1>
              <p className="text-muted-foreground">Track your progress and continue learning</p>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" role="status">
                  <span className="sr-only">Loading...</span>
                </div>
                <p className="mt-4 text-muted-foreground">Loading your courses...</p>
              </div>
            ) : (
              <>
                {enrollments.length === 0 ? (
                  <div className="glass-panel p-8 rounded-xl text-center">
                    <h2 className="text-xl font-medium mb-4">You haven't enrolled in any courses yet</h2>
                    <p className="text-muted-foreground mb-6">Explore our courses to start your learning journey</p>
                    <Button onClick={() => navigate('/courses')}>Browse Courses</Button>
                  </div>
                ) : (
                  <div className="space-y-8">
                    <div className="glass-panel p-6 rounded-xl">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h2 className="text-xl font-medium mb-4">Continue Learning</h2>
                          <p className="text-muted-foreground mb-6">
                            Pick up where you left off with your most recent course
                          </p>
                          <div className="flex items-center space-x-4">
                            <Button onClick={continueLatestCourse}>Continue Learning</Button>
                            <Button variant="outline" onClick={() => navigate('/my-courses')}>View All Courses</Button>
                          </div>
                        </div>
                        <div>
                          <Card>
                            <CardHeader className="pb-2">
                              <CardTitle>{enrollments[0].course.title}</CardTitle>
                              <CardDescription>
                                Last accessed {new Date(enrollments[0].last_accessed).toLocaleDateString()}
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="flex justify-between mb-2">
                                <span className="text-sm text-muted-foreground">Progress</span>
                                <span className="text-sm font-medium">{enrollments[0].progress}%</span>
                              </div>
                              <Progress value={enrollments[0].progress} className="h-2" />
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h2 className="text-xl font-medium mb-4">Your Courses</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {enrollments.slice(0, 3).map((enrollment) => (
                          <Card key={enrollment.id} className="hover:shadow-md transition-shadow">
                            <CardHeader>
                              <CardTitle className="line-clamp-1">{enrollment.course.title}</CardTitle>
                              <CardDescription className="line-clamp-2">
                                {enrollment.course.description}
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="flex justify-between mb-2">
                                <span className="text-sm text-muted-foreground">Progress</span>
                                <span className="text-sm font-medium">{enrollment.progress}%</span>
                              </div>
                              <Progress value={enrollment.progress} className="h-2 mb-4" />
                              <div className="flex flex-wrap gap-3 text-sm">
                                <div className="flex items-center">
                                  <BookOpen className="h-4 w-4 mr-1" />
                                  <span>{enrollment.course.lessons} lessons</span>
                                </div>
                                <div className="flex items-center">
                                  <Clock className="h-4 w-4 mr-1" />
                                  <span>{enrollment.course.duration}</span>
                                </div>
                                {enrollment.completed && (
                                  <div className="flex items-center text-green-600">
                                    <CheckCircle2 className="h-4 w-4 mr-1" />
                                    <span>Completed</span>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                            <CardFooter>
                              <Button className="w-full" onClick={() => navigate(`/courses/${enrollment.course.id}`)}>
                                {enrollment.progress > 0 ? 'Continue Learning' : 'Start Learning'}
                              </Button>
                            </CardFooter>
                          </Card>
                        ))}
                      </div>
                      {enrollments.length > 3 && (
                        <div className="mt-4 text-center">
                          <Button variant="outline" onClick={() => navigate('/my-courses')}>
                            View All ({enrollments.length}) Courses
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default LearningDashboard;
