
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { 
  Pencil, Trash2, Plus, BookOpen, Video, Save, X, Search,
  BarChart4, Users, FileText, Graduation
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from '@/components/ui/use-toast';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

// Form validation schema
const courseSchema = z.object({
  title: z.string().min(5, { message: "Title must be at least 5 characters long" }),
  description: z.string().min(20, { message: "Description must be at least 20 characters long" }),
  category: z.string().min(1, { message: "Category is required" }),
  level: z.string().min(1, { message: "Level is required" }),
  duration: z.string().min(1, { message: "Duration is required" }),
  image: z.string().optional(),
});

// Form schema type
type CourseFormValues = z.infer<typeof courseSchema>;

// Initial form values
const defaultValues: CourseFormValues = {
  title: "",
  description: "",
  category: "",
  level: "Beginner",
  duration: "",
  image: "",
};

const AdminDashboard = () => {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<any | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [isAddingLesson, setIsAddingLesson] = useState(false);
  const [activeTab, setActiveTab] = useState("courses");

  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Form setup
  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseSchema),
    defaultValues,
  });

  // Reset form with course data or empty values
  const resetForm = (courseData?: any) => {
    if (courseData) {
      form.reset({
        title: courseData.title || "",
        description: courseData.description || "",
        category: courseData.category || "",
        level: courseData.level || "Beginner",
        duration: courseData.duration || "",
        image: courseData.image || "",
      });
    } else {
      form.reset(defaultValues);
    }
  };

  useEffect(() => {
    // Fetch courses when component mounts
    fetchCourses();
  }, []);

  // Fetch all courses
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

  // Handle course submit (create or update)
  const onSubmit = async (values: CourseFormValues) => {
    try {
      if (isEditing && selectedCourse) {
        // Update existing course
        const { error } = await supabase
          .from('courses')
          .update({
            ...values,
            updated_at: new Date().toISOString()
          })
          .eq('id', selectedCourse.id);

        if (error) throw error;

        toast({
          title: 'Course updated',
          description: 'The course has been updated successfully',
        });
      } else {
        // Create new course
        const { data, error } = await supabase
          .from('courses')
          .insert([{
            ...values,
            students: 0,
            lessons: 0,
          }])
          .select();

        if (error) throw error;

        toast({
          title: 'Course created',
          description: 'The new course has been created successfully',
        });
      }

      // Reset state and refetch courses
      setIsEditing(false);
      setSelectedCourse(null);
      setOpenDialog(false);
      fetchCourses();
    } catch (error: any) {
      toast({
        title: 'Error saving course',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  // Handle course edit
  const handleEditCourse = (course: any) => {
    setSelectedCourse(course);
    setIsEditing(true);
    resetForm(course);
    setOpenDialog(true);
  };

  // Handle course delete
  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm("Are you sure you want to delete this course? This action cannot be undone.")) {
      return;
    }

    try {
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', courseId);

      if (error) throw error;

      toast({
        title: 'Course deleted',
        description: 'The course has been deleted successfully',
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

  // Handle adding a video lesson
  const handleAddVideoLesson = async (courseId: string) => {
    navigate(`/admin/courses/${courseId}/lessons`);
  };

  // Filter courses based on search term
  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Format statistics
  const statistics = {
    totalCourses: courses.length,
    totalStudents: courses.reduce((acc, course) => acc + (course.students || 0), 0),
    categories: new Set(courses.map(course => course.category)).size,
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-20 pb-10">
        <div className="container px-4 mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              Manage your courses, lessons, and monitor student progress
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Courses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <BookOpen className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span className="text-2xl font-bold">{statistics.totalCourses}</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Students</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span className="text-2xl font-bold">{statistics.totalStudents}</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span className="text-2xl font-bold">{statistics.categories}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
            <TabsList className="mb-6">
              <TabsTrigger value="courses">Courses</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>
            
            <TabsContent value="courses">
              <div className="flex justify-between items-center mb-6">
                <div className="relative w-full max-w-sm">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search courses..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                  <DialogTrigger asChild>
                    <Button 
                      onClick={() => {
                        setIsEditing(false);
                        setSelectedCourse(null);
                        resetForm();
                      }}
                    >
                      <Plus className="mr-2 h-4 w-4" /> Add New Course
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[525px]">
                    <DialogHeader>
                      <DialogTitle>{isEditing ? 'Edit Course' : 'Add New Course'}</DialogTitle>
                      <DialogDescription>
                        {isEditing 
                          ? 'Make changes to the course details below.'
                          : 'Fill in the form below to create a new course.'}
                      </DialogDescription>
                    </DialogHeader>
                    
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                          control={form.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Course Title</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g. Introduction to Agriculture" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Enter course description..." 
                                  className="min-h-[100px]"
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="category"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Category</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g. Agriculture" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="level"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Level</FormLabel>
                                <Select 
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select level" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="Beginner">Beginner</SelectItem>
                                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                                    <SelectItem value="Advanced">Advanced</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="duration"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Duration</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g. 4 weeks" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="image"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Image URL (optional)</FormLabel>
                                <FormControl>
                                  <Input placeholder="https://example.com/image.jpg" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
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
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>
              
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" role="status">
                    <span className="sr-only">Loading...</span>
                  </div>
                  <p className="mt-4 text-muted-foreground">Loading courses...</p>
                </div>
              ) : filteredCourses.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="py-3 text-left pl-4">Title</th>
                        <th className="py-3 text-left">Category</th>
                        <th className="py-3 text-left">Level</th>
                        <th className="py-3 text-left">Students</th>
                        <th className="py-3 text-left">Lessons</th>
                        <th className="py-3 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCourses.map((course) => (
                        <tr key={course.id} className="border-b hover:bg-muted/50">
                          <td className="py-4 pl-4">
                            <div className="font-medium">{course.title}</div>
                            <div className="text-xs text-muted-foreground truncate max-w-[300px]">
                              {course.description}
                            </div>
                          </td>
                          <td className="py-4">{course.category}</td>
                          <td className="py-4">{course.level}</td>
                          <td className="py-4">{course.students || 0}</td>
                          <td className="py-4">{course.lessons || 0}</td>
                          <td className="py-4">
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleAddVideoLesson(course.id)}
                                title="Manage Lessons"
                              >
                                <Video className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditCourse(course)}
                                title="Edit Course"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteCourse(course.id)}
                                title="Delete Course"
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
                    {searchTerm ? 'No courses match your search criteria.' : 'Start by adding your first course.'}
                  </p>
                  {searchTerm && (
                    <Button variant="outline" onClick={() => setSearchTerm("")}>
                      Clear Search
                    </Button>
                  )}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="analytics">
              <div className="text-center py-12 bg-muted/30 rounded-lg">
                <BarChart4 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Analytics Coming Soon</h3>
                <p className="text-muted-foreground">
                  Advanced analytics and reporting features will be available soon.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminDashboard;
