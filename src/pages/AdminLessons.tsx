import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
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
  ArrowLeft, 
  Pencil, 
  Trash2, 
  Plus, 
  MoveUp, 
  MoveDown, 
  Book, 
  Video, 
  Youtube 
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { searchYouTubeVideos } from '@/utils/courseVideoUtils';

const lessonSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters long" }),
  content: z.string().min(10, { message: "Content must be at least 10 characters long" }),
  duration: z.number().min(1, { message: "Duration must be at least 1 minute" }),
  video_url: z.string().url({ message: "Please enter a valid URL" }).optional().or(z.literal(''))
});

type LessonFormValues = z.infer<typeof lessonSchema>;

const defaultValues: LessonFormValues = {
  title: "",
  content: "",
  duration: 30,
  video_url: ""
};

interface Lesson {
  id: string;
  title: string;
  content: string;
  duration: number;
  order_index: number;
  course_id: string;
  created_at: string;
  updated_at: string;
  video_url?: string;
}

interface Course {
  id: string;
  title: string;
  category: string;
  lessons: number;
}

const AdminLessons = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [youtubeSearchTerm, setYoutubeSearchTerm] = useState('');
  const [youtubeResults, setYoutubeResults] = useState<any[]>([]);
  const [youtubeSearching, setYoutubeSearching] = useState(false);
  const [showYoutubeSearch, setShowYoutubeSearch] = useState(false);

  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const form = useForm<LessonFormValues>({
    resolver: zodResolver(lessonSchema),
    defaultValues,
  });

  const resetForm = (lessonData?: any) => {
    if (lessonData) {
      form.reset({
        title: lessonData.title || "",
        content: lessonData.content || "",
        duration: lessonData.duration || 30,
        video_url: lessonData.video_url || ""
      });
    } else {
      form.reset(defaultValues);
    }
  };

  useEffect(() => {
    if (!courseId) return;
    
    fetchCourseAndLessons();
  }, [courseId]);

  const fetchCourseAndLessons = async () => {
    setLoading(true);
    try {
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single();

      if (courseError) throw courseError;
      setCourse(courseData);

      const { data: lessonsData, error: lessonsError } = await supabase
        .from('lessons')
        .select('*')
        .eq('course_id', courseId)
        .order('order_index', { ascending: true });

      if (lessonsError) throw lessonsError;
      setLessons(lessonsData || []);
    } catch (error: any) {
      toast({
        title: 'Error fetching data',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (values: LessonFormValues) => {
    if (!courseId) return;
    
    try {
      if (isEditing && selectedLesson) {
        const { error } = await supabase
          .from('lessons')
          .update({
            title: values.title,
            content: values.content,
            duration: values.duration,
            video_url: values.video_url || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', selectedLesson.id);

        if (error) throw error;

        toast({
          title: 'Lesson updated',
          description: 'The lesson has been updated successfully',
        });
      } else {
        const nextOrderIndex = lessons.length > 0 
          ? Math.max(...lessons.map(l => l.order_index)) + 1 
          : 1;

        const { data, error } = await supabase
          .from('lessons')
          .insert({
            title: values.title,
            content: values.content,
            duration: values.duration,
            video_url: values.video_url || null,
            course_id: courseId,
            order_index: nextOrderIndex,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select();

        if (error) throw error;

        await supabase
          .from('courses')
          .update({ 
            lessons: lessons.length + 1,
            updated_at: new Date().toISOString()
          })
          .eq('id', courseId);

        toast({
          title: 'Lesson created',
          description: 'The new lesson has been created successfully',
        });
      }

      setIsEditing(false);
      setSelectedLesson(null);
      setOpenDialog(false);
      fetchCourseAndLessons();
    } catch (error: any) {
      toast({
        title: 'Error saving lesson',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleEditLesson = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setIsEditing(true);
    resetForm(lesson);
    setOpenDialog(true);
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm("Are you sure you want to delete this lesson? This action cannot be undone.")) {
      return;
    }

    try {
      const { error } = await supabase
        .from('lessons')
        .delete()
        .eq('id', lessonId);

      if (error) throw error;

      await supabase
        .from('courses')
        .update({ 
          lessons: Math.max(0, (course?.lessons || lessons.length) - 1),
          updated_at: new Date().toISOString()
        })
        .eq('id', courseId);

      toast({
        title: 'Lesson deleted',
        description: 'The lesson has been deleted successfully',
      });

      fetchCourseAndLessons();
    } catch (error: any) {
      toast({
        title: 'Error deleting lesson',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleReorderLesson = async (lessonId: string, direction: 'up' | 'down') => {
    const lessonIndex = lessons.findIndex(l => l.id === lessonId);
    if (lessonIndex === -1) return;

    if ((direction === 'up' && lessonIndex === 0) || 
        (direction === 'down' && lessonIndex === lessons.length - 1)) {
      return;
    }

    const newIndex = direction === 'up' ? lessonIndex - 1 : lessonIndex + 1;
    const updatedLessons = [...lessons];
    
    const tempOrderIndex = updatedLessons[lessonIndex].order_index;
    updatedLessons[lessonIndex].order_index = updatedLessons[newIndex].order_index;
    updatedLessons[newIndex].order_index = tempOrderIndex;

    try {
      await supabase
        .from('lessons')
        .update({ order_index: updatedLessons[lessonIndex].order_index })
        .eq('id', updatedLessons[lessonIndex].id);

      await supabase
        .from('lessons')
        .update({ order_index: updatedLessons[newIndex].order_index })
        .eq('id', updatedLessons[newIndex].id);

      fetchCourseAndLessons();
    } catch (error: any) {
      toast({
        title: 'Error reordering lessons',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleYoutubeSearch = async () => {
    if (!youtubeSearchTerm) return;
    
    setYoutubeSearching(true);
    try {
      const apiKey = 'AIzaSyAWiuy8hMIeBj2BWKPCSgO_kILcsDhpB1E';
      const results = await searchYouTubeVideos(youtubeSearchTerm, apiKey, 5);
      setYoutubeResults(results);
    } catch (error) {
      console.error('Error searching YouTube:', error);
      toast({
        title: 'YouTube search failed',
        description: 'Could not fetch YouTube videos. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setYoutubeSearching(false);
    }
  };

  const useYoutubeVideo = (video: any) => {
    const videoId = video.id.videoId;
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const title = video.snippet.title;
    
    form.setValue('video_url', videoUrl);
    if (!form.getValues('title')) {
      form.setValue('title', title);
    }
    
    setShowYoutubeSearch(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-20 pb-10">
        <div className="container px-4 mx-auto">
          <div className="flex items-center mb-8">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/admin')}
              className="mr-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold mb-2">
                {course ? `Manage Lessons: ${course.title}` : 'Manage Lessons'}
              </h1>
              {course && (
                <p className="text-muted-foreground">
                  {course.lessons || 0} lessons · {course.category}
                </p>
              )}
            </div>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Course Lessons</CardTitle>
                  <CardDescription>
                    Create, edit, and reorder lessons for this course
                  </CardDescription>
                </div>
                <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                  <DialogTrigger asChild>
                    <Button 
                      onClick={() => {
                        setIsEditing(false);
                        setSelectedLesson(null);
                        resetForm();
                      }}
                    >
                      <Plus className="mr-2 h-4 w-4" /> Add New Lesson
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                      <DialogTitle>{isEditing ? 'Edit Lesson' : 'Add New Lesson'}</DialogTitle>
                      <DialogDescription>
                        {isEditing 
                          ? 'Make changes to the lesson details below.'
                          : 'Fill in the form below to create a new lesson.'}
                      </DialogDescription>
                    </DialogHeader>
                    
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                          control={form.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Lesson Title</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g. Introduction to Soil Management" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="content"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Content</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Enter lesson content..." 
                                  className="min-h-[150px]"
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
                            name="duration"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Duration (minutes)</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    placeholder="30" 
                                    {...field}
                                    onChange={e => field.onChange(Number(e.target.value))}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="video_url"
                            render={({ field }) => (
                              <FormItem>
                                <div className="flex justify-between items-center">
                                  <FormLabel>Video URL</FormLabel>
                                  <Button 
                                    type="button" 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => setShowYoutubeSearch(!showYoutubeSearch)}
                                    className="h-6 px-2 text-xs"
                                  >
                                    <Youtube className="h-3 w-3 mr-1" />
                                    {showYoutubeSearch ? 'Hide' : 'Search YouTube'}
                                  </Button>
                                </div>
                                <FormControl>
                                  <Input 
                                    placeholder="https://example.com/video.mp4 or YouTube URL" 
                                    {...field}
                                    value={field.value || ''}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        {showYoutubeSearch && (
                          <div className="border rounded-md p-3 bg-muted/20">
                            <h4 className="text-sm font-medium mb-2">Search YouTube Videos</h4>
                            <div className="flex gap-2 mb-3">
                              <Input
                                value={youtubeSearchTerm}
                                onChange={(e) => setYoutubeSearchTerm(e.target.value)}
                                placeholder="Search for educational videos..."
                                className="flex-1"
                              />
                              <Button 
                                type="button" 
                                onClick={handleYoutubeSearch}
                                disabled={youtubeSearching}
                                size="sm"
                              >
                                {youtubeSearching ? 
                                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent" /> : 
                                  'Search'
                                }
                              </Button>
                            </div>
                            
                            {youtubeResults.length > 0 && (
                              <div className="max-h-[200px] overflow-y-auto space-y-2">
                                {youtubeResults.map((video) => (
                                  <div 
                                    key={video.id.videoId} 
                                    className="flex gap-2 p-2 hover:bg-muted rounded cursor-pointer"
                                    onClick={() => useYoutubeVideo(video)}
                                  >
                                    <img 
                                      src={video.snippet.thumbnails.default.url} 
                                      alt={video.snippet.title}
                                      className="w-16 h-12 object-cover rounded"
                                    />
                                    <div className="flex-1">
                                      <p className="text-xs font-medium line-clamp-2">{video.snippet.title}</p>
                                      <p className="text-xs text-muted-foreground">{video.snippet.channelTitle}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                        
                        <DialogFooter>
                          <Button type="button" variant="outline" onClick={() => setOpenDialog(false)}>
                            Cancel
                          </Button>
                          <Button type="submit">
                            {isEditing ? 'Update Lesson' : 'Create Lesson'}
                          </Button>
                        </DialogFooter>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" role="status">
                    <span className="sr-only">Loading...</span>
                  </div>
                  <p className="mt-4 text-muted-foreground">Loading lessons...</p>
                </div>
              ) : lessons.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="py-3 text-left pl-4">#</th>
                        <th className="py-3 text-left">Title</th>
                        <th className="py-3 text-left">Duration</th>
                        <th className="py-3 text-left">Type</th>
                        <th className="py-3 text-left">Order</th>
                        <th className="py-3 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lessons.map((lesson, index) => (
                        <tr key={lesson.id} className="border-b hover:bg-muted/50">
                          <td className="py-4 pl-4">{index + 1}</td>
                          <td className="py-4">
                            <div className="font-medium">{lesson.title}</div>
                            <div className="text-xs text-muted-foreground truncate max-w-[300px]">
                              {lesson.content}
                            </div>
                          </td>
                          <td className="py-4">{lesson.duration} min</td>
                          <td className="py-4">
                            {lesson.video_url ? (
                              <div className="flex items-center">
                                <Video className="h-4 w-4 mr-1 text-blue-500" />
                                <span>Video</span>
                              </div>
                            ) : (
                              <div className="flex items-center">
                                <Book className="h-4 w-4 mr-1 text-orange-500" />
                                <span>Text</span>
                              </div>
                            )}
                          </td>
                          <td className="py-4">
                            <div className="flex space-x-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleReorderLesson(lesson.id, 'up')}
                                disabled={index === 0}
                                className={index === 0 ? 'opacity-50 cursor-not-allowed' : ''}
                              >
                                <MoveUp className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleReorderLesson(lesson.id, 'down')}
                                disabled={index === lessons.length - 1}
                                className={index === lessons.length - 1 ? 'opacity-50 cursor-not-allowed' : ''}
                              >
                                <MoveDown className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                          <td className="py-4">
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditLesson(lesson)}
                                title="Edit Lesson"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteLesson(lesson.id)}
                                title="Delete Lesson"
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
                  <Book className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Lessons Found</h3>
                  <p className="text-muted-foreground mb-4">
                    Start by adding your first lesson to this course.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminLessons;
