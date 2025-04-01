import { useState, useEffect, useNavigate } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CourseGrid, { Course } from '@/components/courses/CourseGrid';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Search, Bot, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';

const Courses = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('all-categories');
  const [level, setLevel] = useState('all-levels');
  const [duration, setDuration] = useState([12]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiRecommendations, setAiRecommendations] = useState<{ courses: Course[], message: string } | null>(null);
  const [showingRecommendations, setShowingRecommendations] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('courses')
          .select('*');
        
        if (error) {
          throw error;
        }
        
        const formattedCourses = data.map(course => ({
          id: course.id,
          title: course.title,
          description: course.description,
          category: course.category,
          level: course.level,
          duration: course.duration,
          students: course.students || 0,
          lessons: course.lessons || 0,
        }));
        
        setCourses(formattedCourses);
        setFilteredCourses(formattedCourses);
      } catch (error) {
        console.error('Error fetching courses:', error);
        toast({
          title: "Failed to load courses",
          description: "Please try again later",
          variant: "destructive",
        });
        setCourses([]);
        setFilteredCourses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [toast]);
  
  useEffect(() => {
    if (showingRecommendations) {
      setShowingRecommendations(false);
    }
    
    let result = courses;
    
    if (searchTerm) {
      result = result.filter((course) => 
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (category && category !== 'all-categories') {
      result = result.filter((course) => course.category === category);
    }
    
    if (level && level !== 'all-levels') {
      result = result.filter((course) => course.level === level);
    }
    
    if (duration[0] < 12) {
      result = result.filter((course) => {
        const weeks = parseInt(course.duration.split(' ')[0]);
        return weeks <= duration[0];
      });
    }
    
    setFilteredCourses(result);
  }, [searchTerm, category, level, duration, courses, showingRecommendations]);
  
  const resetFilters = () => {
    setSearchTerm('');
    setCategory('all-categories');
    setLevel('all-levels');
    setDuration([12]);
    setShowingRecommendations(false);
  };

  const getAiRecommendations = async () => {
    try {
      setLoading(true);
      
      const interests = category !== 'all-categories' ? category : '';
      
      const response = await fetch('https://lmizrylbhbapimyuyajc.functions.supabase.co/course-recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          interests,
          level: level !== 'all-levels' ? level : '',
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to get recommendations');
      }
      
      const data = await response.json();
      setAiRecommendations({
        courses: data.recommendations,
        message: data.message
      });
      
      setShowingRecommendations(true);
      
      toast({
        title: "AI Recommendation",
        description: data.message,
        duration: 6000,
      });
      
    } catch (error) {
      console.error('Error getting AI recommendations:', error);
      toast({
        title: "Failed to get recommendations",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddCourse = () => {
    navigate('/admin');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-20">
        <section className="py-16">
          <div className="container px-4 mx-auto">
            <div className="max-w-2xl mx-auto text-center mb-12">
              <h1 className="mb-4">Explore Our Courses</h1>
              <p className="text-muted-foreground text-lg">
                Discover practical courses designed specifically for rural learners. Filter by topic, difficulty, or duration to find the perfect fit for your goals.
              </p>
              {user && (
                <Button 
                  onClick={handleAddCourse}
                  className="mt-6 bg-primary text-white"
                >
                  <Plus className="mr-2 h-4 w-4" /> Add New Course
                </Button>
              )}
            </div>
            
            <div className="glass-panel rounded-xl p-6 mb-12">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="col-span-1 md:col-span-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                    <Input
                      type="text"
                      placeholder="Search courses..."
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="category" className="block mb-2">Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all-categories">All Categories</SelectItem>
                      <SelectItem value="Agriculture">Agriculture</SelectItem>
                      <SelectItem value="Business">Business</SelectItem>
                      <SelectItem value="Healthcare">Healthcare</SelectItem>
                      <SelectItem value="Technology">Technology</SelectItem>
                      <SelectItem value="Environment">Environment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="level" className="block mb-2">Level</Label>
                  <Select value={level} onValueChange={setLevel}>
                    <SelectTrigger id="level">
                      <SelectValue placeholder="All Levels" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all-levels">All Levels</SelectItem>
                      <SelectItem value="Beginner">Beginner</SelectItem>
                      <SelectItem value="Intermediate">Intermediate</SelectItem>
                      <SelectItem value="Advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label htmlFor="duration">Duration (up to {duration[0]} weeks)</Label>
                  </div>
                  <Slider
                    id="duration"
                    defaultValue={[12]}
                    max={12}
                    min={1}
                    step={1}
                    value={duration}
                    onValueChange={setDuration}
                  />
                </div>
              </div>
              
              <div className="flex justify-between flex-wrap gap-2">
                <Button 
                  variant="outline" 
                  onClick={resetFilters}
                  disabled={loading}
                >
                  Reset Filters
                </Button>
                
                <Button 
                  onClick={getAiRecommendations}
                  disabled={loading}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  <Bot className="mr-2 h-4 w-4" />
                  Get AI Recommendations
                </Button>
              </div>
              
              {showingRecommendations && aiRecommendations && (
                <div className="mt-6 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                  <div className="flex items-start">
                    <Bot className="h-5 w-5 text-indigo-600 mt-0.5 mr-2" />
                    <p className="text-sm text-indigo-800">{aiRecommendations.message}</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="mb-6">
              <h2 className="text-xl font-semibold">
                {showingRecommendations 
                  ? "AI Recommended Courses" 
                  : "All Courses"}
                {!loading && (
                  <span className="ml-2 text-sm font-normal text-muted-foreground">
                    ({showingRecommendations ? aiRecommendations?.courses.length : filteredCourses.length} courses)
                  </span>
                )}
              </h2>
            </div>
            
            {loading && (
              <div className="text-center py-12">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
                  <span className="sr-only">Loading...</span>
                </div>
                <p className="mt-4 text-muted-foreground">Loading courses...</p>
              </div>
            )}
            
            {!loading && (showingRecommendations ? (
              aiRecommendations && aiRecommendations.courses.length > 0 ? (
                <CourseGrid courses={aiRecommendations.courses} />
              ) : (
                <div className="text-center py-12">
                  <h3 className="text-xl font-medium mb-2">No recommendations found</h3>
                  <p className="text-muted-foreground">Try adjusting your filters to get better recommendations.</p>
                  <Button variant="outline" onClick={resetFilters} className="mt-4">
                    Reset Filters
                  </Button>
                </div>
              )
            ) : (
              filteredCourses.length > 0 ? (
                <CourseGrid courses={filteredCourses} />
              ) : (
                <div className="text-center py-12">
                  <h3 className="text-xl font-medium mb-2">No courses found</h3>
                  <p className="text-muted-foreground">Try adjusting your filters to find what you're looking for.</p>
                  <Button variant="outline" onClick={resetFilters} className="mt-4">
                    Reset Filters
                  </Button>
                </div>
              )
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Courses;
