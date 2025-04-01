
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { BookOpen, GraduationCap, Award, BarChart3, Clock } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import CourseCard from '@/components/dashboard/CourseCard';

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

interface DashboardStat {
  enrollments: number;
  inProgress: number;
  completed: number;
  certificates: number;
}

const Dashboard = () => {
  const [enrollments, setEnrollments] = useState<EnrollmentWithCourse[]>([]);
  const [recentEnrollments, setRecentEnrollments] = useState<EnrollmentWithCourse[]>([]);
  const [stats, setStats] = useState<DashboardStat>({
    enrollments: 0,
    inProgress: 0,
    completed: 0,
    certificates: 0
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    const fetchDashboardData = async () => {
      try {
        // Get enrollments with course information
        const { data: enrollmentsData, error: enrollmentsError } = await supabase
          .from('enrollments')
          .select(`
            *,
            course:courses(*)
          `)
          .eq('user_id', user.id)
          .order('last_accessed', { ascending: false });
          
        if (enrollmentsError) throw enrollmentsError;

        // Get certificates count
        const { count: certificatesCount, error: certificatesError } = await supabase
          .from('certificates')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);
          
        if (certificatesError) throw certificatesError;

        // Format data
        const formattedEnrollments = enrollmentsData as EnrollmentWithCourse[];
        
        // Set recent enrollments (up to 3)
        setRecentEnrollments(formattedEnrollments.slice(0, 3));
        
        // Set all enrollments
        setEnrollments(formattedEnrollments);
        
        // Calculate stats
        setStats({
          enrollments: formattedEnrollments.length,
          inProgress: formattedEnrollments.filter(e => e.progress > 0 && !e.completed).length,
          completed: formattedEnrollments.filter(e => e.completed).length,
          certificates: certificatesCount || 0
        });
      } catch (error: any) {
        console.error('Error fetching dashboard data:', error);
        toast({
          title: 'Failed to load dashboard',
          description: error.message || 'Please try again later',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, toast]);

  const calculateAverageProgress = () => {
    if (enrollments.length === 0) return 0;
    const totalProgress = enrollments.reduce((sum, enrollment) => sum + enrollment.progress, 0);
    return Math.round(totalProgress / enrollments.length);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-20">
        <section className="py-12">
          <div className="container px-4 mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
              <p className="text-muted-foreground">Track your learning progress and achievements</p>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" role="status">
                  <span className="sr-only">Loading...</span>
                </div>
                <p className="mt-4 text-muted-foreground">Loading your dashboard...</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  <StatCard 
                    title="Enrolled Courses" 
                    value={stats.enrollments.toString()} 
                    icon={<BookOpen className="h-5 w-5" />}
                    color="blue"
                    onClick={() => navigate('/my-courses')}
                  />
                  <StatCard 
                    title="In Progress" 
                    value={stats.inProgress.toString()} 
                    icon={<Clock className="h-5 w-5" />}
                    color="indigo"
                    onClick={() => navigate('/my-courses?tab=in-progress')}
                  />
                  <StatCard 
                    title="Completed" 
                    value={stats.completed.toString()} 
                    icon={<GraduationCap className="h-5 w-5" />}
                    color="green"
                    onClick={() => navigate('/my-courses?tab=completed')}
                  />
                  <StatCard 
                    title="Certificates Earned" 
                    value={stats.certificates.toString()} 
                    icon={<Award className="h-5 w-5" />}
                    color="amber"
                    onClick={() => navigate('/certificates')}
                  />
                </div>

                {enrollments.length === 0 ? (
                  <div className="glass-panel p-8 rounded-xl text-center">
                    <h2 className="text-xl font-medium mb-4">Let's start your learning journey!</h2>
                    <p className="text-muted-foreground mb-6">Explore our courses and enroll to track your progress</p>
                    <Button onClick={() => navigate('/courses')}>Browse Courses</Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                      <Card>
                        <CardHeader>
                          <CardTitle>Learning Overview</CardTitle>
                          <CardDescription>Track your overall learning progress</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-6">
                            <div>
                              <div className="flex justify-between items-center mb-2">
                                <h3 className="text-sm font-medium">Average Course Progress</h3>
                                <span className="text-sm font-medium">{calculateAverageProgress()}%</span>
                              </div>
                              <Progress value={calculateAverageProgress()} className="h-2" />
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="p-4 bg-blue-50 rounded-lg">
                                <div className="flex items-center justify-between">
                                  <p className="text-sm font-medium text-blue-800">Total Courses</p>
                                  <BookOpen className="h-4 w-4 text-blue-600" />
                                </div>
                                <p className="text-2xl font-bold text-blue-700 mt-2">{stats.enrollments}</p>
                              </div>
                              
                              <div className="p-4 bg-green-50 rounded-lg">
                                <div className="flex items-center justify-between">
                                  <p className="text-sm font-medium text-green-800">Completed</p>
                                  <GraduationCap className="h-4 w-4 text-green-600" />
                                </div>
                                <p className="text-2xl font-bold text-green-700 mt-2">{stats.completed}</p>
                              </div>
                              
                              <div className="p-4 bg-amber-50 rounded-lg">
                                <div className="flex items-center justify-between">
                                  <p className="text-sm font-medium text-amber-800">Certificates</p>
                                  <Award className="h-4 w-4 text-amber-600" />
                                </div>
                                <p className="text-2xl font-bold text-amber-700 mt-2">{stats.certificates}</p>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <div className="mt-8">
                        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
                        <div className="space-y-4">
                          {recentEnrollments.map((enrollment) => (
                            <Card key={enrollment.id} className="overflow-hidden">
                              <div className="flex flex-col md:flex-row">
                                <div className="p-4 flex-grow">
                                  <h3 className="font-medium line-clamp-1">{enrollment.course.title}</h3>
                                  <div className="text-sm text-muted-foreground mt-1 mb-2">
                                    {enrollment.course.category} • {enrollment.course.level}
                                  </div>
                                  <div className="flex justify-between mb-1">
                                    <span className="text-xs">Progress</span>
                                    <span className="text-xs font-medium">{enrollment.progress}%</span>
                                  </div>
                                  <Progress value={enrollment.progress} className="h-1" />
                                </div>
                                <div className="p-4 md:border-l flex items-center justify-center bg-muted/30 md:w-36">
                                  <Button size="sm" onClick={() => navigate(`/courses/${enrollment.course.id}`)}>
                                    {enrollment.progress > 0 ? 'Continue' : 'Start'}
                                  </Button>
                                </div>
                              </div>
                            </Card>
                          ))}
                          
                          {recentEnrollments.length > 0 && (
                            <div className="text-center mt-4">
                              <Button variant="outline" onClick={() => navigate('/my-courses')}>
                                View All Courses
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <Card className="sticky top-24">
                        <CardHeader>
                          <CardTitle>Your Learning Journey</CardTitle>
                          <CardDescription>
                            Track your progress and view learning statistics
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm">Learning Progress</span>
                              <span className="text-sm font-medium">{calculateAverageProgress()}%</span>
                            </div>
                            <Progress value={calculateAverageProgress()} className="h-2" />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 pt-2">
                            <Button onClick={() => navigate('/learning')} className="w-full">
                              Learning Dashboard
                            </Button>
                            <Button onClick={() => navigate('/certificates')} variant="outline" className="w-full">
                              Certificates
                            </Button>
                          </div>
                          
                          <div className="pt-4 border-t">
                            <h3 className="font-medium mb-3">Quick Stats</h3>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Enrolled courses</span>
                                <span>{stats.enrollments}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">In progress</span>
                                <span>{stats.inProgress}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Completed courses</span>
                                <span>{stats.completed}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Certificates earned</span>
                                <span>{stats.certificates}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="pt-4">
                            <Button 
                              variant="outline" 
                              className="w-full"
                              onClick={() => navigate('/courses')}
                            >
                              Explore More Courses
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
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

// Helper component for stat cards
interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'indigo' | 'amber' | 'red';
  onClick?: () => void;
}

const StatCard = ({ title, value, icon, color, onClick }: StatCardProps) => {
  const colorMap = {
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    green: 'bg-green-50 border-green-200 text-green-700',
    indigo: 'bg-indigo-50 border-indigo-200 text-indigo-700',
    amber: 'bg-amber-50 border-amber-200 text-amber-700',
    red: 'bg-red-50 border-red-200 text-red-700',
  };

  return (
    <div 
      className={`${colorMap[color]} border rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow`}
      onClick={onClick}
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium mb-1">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        <div className={`p-2 rounded-full bg-white bg-opacity-50`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
