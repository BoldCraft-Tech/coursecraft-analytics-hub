import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CourseGridWrapper from '@/components/courses/CourseGridWrapper';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';

const CATEGORIES = [
  'Agriculture', 
  'Healthcare', 
  'Education', 
  'Business', 
  'Technology', 
  'Crafts',
  'Community Development'
];

const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [addCourseOpen, setAddCourseOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [newCourse, setNewCourse] = useState({
    title: '',
    description: '',
    category: '',
    level: '',
    duration: '',
  });
  
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    filterCourses();
  }, [courses, searchQuery, selectedCategory]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      setCourses(data || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast({
        title: 'Error fetching courses',
        description: 'Please try again later',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filterCourses = () => {
    let filtered = [...courses];
    
    if (searchQuery) {
      filtered = filtered.filter(course => 
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (selectedCategory && selectedCategory !== 'all') {
      filtered = filtered.filter(course => 
        course.category === selectedCategory
      );
    }
    
    setFilteredCourses(filtered);
  };

  const handleAddCourse = async (e) => {
    e.preventDefault();
    
    if (!newCourse.title || !newCourse.description || !newCourse.category || !newCourse.level) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const { data, error } = await supabase
        .from('courses')
        .insert({
          title: newCourse.title,
          description: newCourse.description,
          category: newCourse.category,
          level: newCourse.level,
          duration: newCourse.duration || '1-2 hours',
          lessons: 0,
          students: 0,
        })
        .select()
        .single();
        
      if (error) throw error;
      
      toast({
        title: 'Course created',
        description: 'Your course has been created successfully',
      });
      
      setNewCourse({
        title: '',
        description: '',
        category: '',
        level: '',
        duration: '',
      });
      setAddCourseOpen(false);
      
      fetchCourses();
      
      navigate(`/admin/courses/${data.id}/lessons`);
      
    } catch (error) {
      console.error('Error creating course:', error);
      toast({
        title: 'Error creating course',
        description: error.message || 'Please try again later',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-20">
        <section className="py-12">
          <div className="container px-4 mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold mb-2">Courses</h1>
                <p className="text-muted-foreground">
                  Discover our collection of courses designed for rural development
                </p>
              </div>
              
              {user && (
                <Dialog open={addCourseOpen} onOpenChange={setAddCourseOpen}>
                  <DialogTrigger asChild>
                    <Button className="mt-4 md:mt-0">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Course
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[525px]">
                    <DialogHeader>
                      <DialogTitle>Add New Course</DialogTitle>
                      <DialogDescription>
                        Create a new course. You'll be able to add lessons after creating the course.
                      </DialogDescription>
                    </DialogHeader>
                    
                    <form onSubmit={handleAddCourse} className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <Label htmlFor="title">Course Title</Label>
                        <Input
                          id="title"
                          placeholder="Enter course title"
                          value={newCourse.title}
                          onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          placeholder="Enter course description"
                          value={newCourse.description}
                          onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                          rows={3}
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="category">Category</Label>
                          <Select
                            value={newCourse.category}
                            onValueChange={(value) => setNewCourse({ ...newCourse, category: value })}
                          >
                            <SelectTrigger id="category">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              {CATEGORIES.map((category) => (
                                <SelectItem key={category} value={category}>
                                  {category}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="level">Level</Label>
                          <Select
                            value={newCourse.level}
                            onValueChange={(value) => setNewCourse({ ...newCourse, level: value })}
                          >
                            <SelectTrigger id="level">
                              <SelectValue placeholder="Select level" />
                            </SelectTrigger>
                            <SelectContent>
                              {LEVELS.map((level) => (
                                <SelectItem key={level} value={level}>
                                  {level}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="duration">Duration (e.g., "2-3 hours", "1 week")</Label>
                        <Input
                          id="duration"
                          placeholder="Enter course duration"
                          value={newCourse.duration}
                          onChange={(e) => setNewCourse({ ...newCourse, duration: e.target.value })}
                        />
                      </div>
                      
                      <DialogFooter>
                        <Button
                          type="submit"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? 'Creating...' : 'Create Course'}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              )}
            </div>
            
            <div className="flex flex-col md:flex-row gap-4 mb-8">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search courses"
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <CourseGridWrapper 
              courses={filteredCourses}
              isLoading={loading}
              emptyMessage="No courses found. Try adjusting your search or filters."
            />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Courses;
