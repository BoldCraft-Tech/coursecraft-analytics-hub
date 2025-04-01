import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  ArrowRight, 
  Pencil, 
  Trash2, 
  Plus, 
  BookOpen,
  GraduationCap,
  Users
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Course {
  id: string;
  title: string;
  description: string;
  image?: string;
  level: string;
  category: string;
  duration: string;
  lessons: number;
  students: number;
  created_at?: string;
  updated_at?: string;
}

const AdminDashboard = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [level, setLevel] = useState('Beginner');
  const [category, setCategory] = useState('Agriculture');
  const [duration, setDuration] = useState('2 hours');
  
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      setCourses(data || []);
    } catch (error: any) {
      toast({
        title: 'Error fetching courses',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setImage('');
    setLevel('Beginner');
    setCategory('Agriculture');
    setDuration('2 hours');
    setIsEditing(false);
    setSelectedCourse(null);
  };

  const handleOpenDialog = (course?: Course) => {
    if (course) {
      setIsEditing(true);
      setSelectedCourse(course);
      setTitle(course.title);
      setDescription(course.description);
      setImage(course.image || '');
      setLevel(course.level);
      setCategory(course.category);
      setDuration(course.duration);
    } else {
      resetForm();
    }
    setOpenDialog(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !description || !level || !category || !duration) {
      toast({
        title: 'Missing fields',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      const courseData = {
        title,
        description,
        image: image || null,
        level,
        category,
        duration,
        updated_at: new Date().toISOString()
      };
      
      if (isEditing && selectedCourse) {
        const { error } = await supabase
          .from('courses')
          .update(courseData)
          .eq('id', selectedCourse.id);
          
        if (error) throw error;
        
        toast({
          title: 'Course updated',
          description: 'The course has been updated successfully',
        });
      } else {
        const newCourse = {
          ...courseData,
          students: 0,
          lessons: 0,
          created_at: new Date().toISOString()
        };
        
        const { error } = await supabase
          .from('courses')
          .insert([newCourse]);
          
        if (error) throw error;
        
        toast({
          title: 'Course created',
          description: 'The new course has been created successfully',
        });
      }
      
      setOpenDialog(false);
      resetForm();
      fetchCourses();
    } catch (error: any) {
      toast({
        title: 'Error saving course',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm("Are you sure you want to delete this course? This action cannot be undone.")) {
      return;
    }
    
    try {
      const { error: lessonsError } = await supabase
        .from('lessons')
        .delete()
        .eq('course_id', courseId);
        
      if (lessonsError) throw lessonsError;
      
      const { error: courseError } = await supabase
        .from('courses')
        .delete()
        .eq('id', courseId);
        
      if (courseError) throw courseError;
      
      toast({
        title: 'Course deleted',
        description: 'The course and all its lessons have been deleted',
      });
      
      fetchCourses();
    } catch (error: any) {
      toast({
        title: 'Error deleting course',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow p-6">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" /> Add New Course
            </Button>
          </div>
          
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Manage Courses</CardTitle>
              <CardDescription>
                Create, edit and delete courses in your platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" role="status">
                    <span className="sr-only">Loading...</span>
                  </div>
                  <p className="mt-4 text-muted-foreground">Loading courses...</p>
                </div>
              ) : courses.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="py-3 text-left">Title</th>
                        <th className="py-3 text-left">Category</th>
                        <th className="py-3 text-left">Level</th>
                        <th className="py-3 text-left">Students</th>
                        <th className="py-3 text-left">Lessons</th>
                        <th className="py-3 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {courses.map((course) => (
                        <tr key={course.id} className="border-b hover:bg-muted/50">
                          <td className="py-4">
                            <div className="font-medium">{course.title}</div>
                            <div className="text-xs text-muted-foreground truncate max-w-[300px]">
                              {course.description}
                            </div>
                          </td>
                          <td className="py-4">{course.category}</td>
                          <td className="py-4">{course.level}</td>
                          <td className="py-4">{course.students}</td>
                          <td className="py-4">{course.lessons}</td>
                          <td className="py-4">
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate(`/admin/courses/${course.id}/lessons`)}
                              >
                                <BookOpen className="h-4 w-4 mr-1" />
                                Lessons
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenDialog(course)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteCourse(course.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 bg-muted/30 rounded-lg">
                  <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Courses Found</h3>
                  <p className="text-muted-foreground mb-4">
                    You haven't created any courses yet. Get started by adding your first course.
                  </p>
                  <Button onClick={() => handleOpenDialog()}>
                    <Plus className="mr-2 h-4 w-4" /> Add Your First Course
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-2xl">{courses.length}</CardTitle>
                <CardDescription>Total Courses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  <BookOpen className="inline-block h-4 w-4 mr-1" />
                  Courses available on the platform
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-2xl">
                  {courses.reduce((total, course) => total + course.students, 0)}
                </CardTitle>
                <CardDescription>Total Students</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  <Users className="inline-block h-4 w-4 mr-1" />
                  Students enrolled in all courses
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-2xl">
                  {courses.reduce((total, course) => total + course.lessons, 0)}
                </CardTitle>
                <CardDescription>Total Lessons</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  <GraduationCap className="inline-block h-4 w-4 mr-1" />
                  Lessons created across all courses
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>{isEditing ? 'Edit Course' : 'Create New Course'}</DialogTitle>
              <DialogDescription>
                {isEditing 
                  ? 'Make changes to the course details below.'
                  : 'Fill in the form below to create a new course.'}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="title" className="block text-sm font-medium">
                  Course Title
                </label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Sustainable Farming Techniques"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="description" className="block text-sm font-medium">
                  Description
                </label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter course description..."
                  className="min-h-[100px]"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="category" className="block text-sm font-medium">
                    Category
                  </label>
                  <select
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="Agriculture">Agriculture</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Education">Education</option>
                    <option value="Technology">Technology</option>
                    <option value="Business">Business</option>
                    <option value="Environment">Environment</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="level" className="block text-sm font-medium">
                    Level
                  </label>
                  <select
                    id="level"
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="duration" className="block text-sm font-medium">
                    Duration
                  </label>
                  <Input
                    id="duration"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="e.g. 2 hours"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="image" className="block text-sm font-medium">
                    Image URL (optional)
                  </label>
                  <Input
                    id="image"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpenDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {isEditing ? 'Update Course' : 'Create Course'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default AdminDashboard;
