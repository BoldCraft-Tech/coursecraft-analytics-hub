
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, Trash2, Edit, MoveUp, MoveDown, Video } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { searchYouTubeVideos } from '@/utils/courseVideoUtils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const YOUTUBE_API_KEY = 'AIzaSyAWiuy8hMIeBj2BWKPCSgO_kILcsDhpB1E';

const AdminLessons = () => {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddLessonOpen, setIsAddLessonOpen] = useState(false);
  const [isEditLessonOpen, setIsEditLessonOpen] = useState(false);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [videoSearchQuery, setVideoSearchQuery] = useState('');
  const [videoSearchResults, setVideoSearchResults] = useState([]);
  const [isSearchingVideos, setIsSearchingVideos] = useState(false);
  
  // Form state for adding/editing lessons
  const [lessonForm, setLessonForm] = useState({
    title: '',
    content: '',
    duration: 30,
    video_url: '',
  });
  
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!courseId) return;
    fetchCourseAndLessons();
  }, [courseId]);

  const fetchCourseAndLessons = async () => {
    try {
      setLoading(true);
      
      // Fetch course details
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single();
        
      if (courseError) throw courseError;
      setCourse(courseData);
      
      // Fetch lessons
      const { data: lessonsData, error: lessonsError } = await supabase
        .from('lessons')
        .select('*')
        .eq('course_id', courseId)
        .order('order_index', { ascending: true });
        
      if (lessonsError) throw lessonsError;
      setLessons(lessonsData || []);
      
    } catch (error) {
      console.error('Error fetching course or lessons:', error);
      toast({
        title: 'Error loading data',
        description: error.message || 'Please try again later',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const searchVideos = async () => {
    if (!videoSearchQuery.trim()) {
      toast({
        title: 'Please enter a search query',
        description: 'Enter keywords to search for videos',
      });
      return;
    }
    
    try {
      setIsSearchingVideos(true);
      
      // Make sure to append the course topic to get more relevant results
      const searchTerm = course ? `${videoSearchQuery} ${course.category} ${course.title}` : videoSearchQuery;
      
      const results = await searchYouTubeVideos(searchTerm, YOUTUBE_API_KEY, 8);
      setVideoSearchResults(results);
      
    } catch (error) {
      console.error('Error searching videos:', error);
      toast({
        title: 'Error searching videos',
        description: error.message || 'Please try again later',
        variant: 'destructive',
      });
    } finally {
      setIsSearchingVideos(false);
    }
  };

  const selectVideo = (video) => {
    const videoId = video.id.videoId;
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    
    setLessonForm({
      ...lessonForm,
      video_url: videoUrl,
    });
    
    toast({
      title: 'Video selected',
      description: 'YouTube video added to lesson',
    });
  };

  const handleAddLesson = async (e) => {
    e.preventDefault();
    
    if (!lessonForm.title || !lessonForm.content || !lessonForm.duration) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Calculate the next order index
      const nextOrderIndex = lessons.length > 0 
        ? Math.max(...lessons.map(lesson => lesson.order_index)) + 1 
        : 1;
      
      const { data, error } = await supabase
        .from('lessons')
        .insert({
          title: lessonForm.title,
          content: lessonForm.content,
          duration: parseInt(lessonForm.duration),
          order_index: nextOrderIndex,
          course_id: courseId,
          video_url: lessonForm.video_url || null,
        })
        .select()
        .single();
        
      if (error) throw error;
      
      // Update course lessons count
      await supabase
        .from('courses')
        .update({ lessons: lessons.length + 1 })
        .eq('id', courseId);
      
      toast({
        title: 'Lesson added',
        description: 'The lesson has been added successfully',
      });
      
      // Reset form and close dialog
      setLessonForm({
        title: '',
        content: '',
        duration: 30,
        video_url: '',
      });
      setIsAddLessonOpen(false);
      
      // Refresh lessons
      fetchCourseAndLessons();
      
    } catch (error) {
      console.error('Error adding lesson:', error);
      toast({
        title: 'Error adding lesson',
        description: error.message || 'Please try again later',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditLesson = async (e) => {
    e.preventDefault();
    
    if (!currentLesson) return;
    
    if (!lessonForm.title || !lessonForm.content || !lessonForm.duration) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const { error } = await supabase
        .from('lessons')
        .update({
          title: lessonForm.title,
          content: lessonForm.content,
          duration: parseInt(lessonForm.duration),
          video_url: lessonForm.video_url || null,
        })
        .eq('id', currentLesson.id);
        
      if (error) throw error;
      
      toast({
        title: 'Lesson updated',
        description: 'The lesson has been updated successfully',
      });
      
      // Reset form and close dialog
      setLessonForm({
        title: '',
        content: '',
        duration: 30,
        video_url: '',
      });
      setIsEditLessonOpen(false);
      setCurrentLesson(null);
      
      // Refresh lessons
      fetchCourseAndLessons();
      
    } catch (error) {
      console.error('Error updating lesson:', error);
      toast({
        title: 'Error updating lesson',
        description: error.message || 'Please try again later',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteLesson = async (lessonId) => {
    try {
      const { error } = await supabase
        .from('lessons')
        .delete()
        .eq('id', lessonId);
        
      if (error) throw error;
      
      // Update course lessons count
      await supabase
        .from('courses')
        .update({ lessons: lessons.length - 1 })
        .eq('id', courseId);
      
      toast({
        title: 'Lesson deleted',
        description: 'The lesson has been deleted successfully',
      });
      
      // Refresh lessons
      fetchCourseAndLessons();
      
    } catch (error) {
      console.error('Error deleting lesson:', error);
      toast({
        title: 'Error deleting lesson',
        description: error.message || 'Please try again later',
        variant: 'destructive',
      });
    }
  };

  const openEditLessonDialog = (lesson) => {
    setCurrentLesson(lesson);
    setLessonForm({
      title: lesson.title,
      content: lesson.content,
      duration: lesson.duration,
      video_url: lesson.video_url || '',
    });
    setIsEditLessonOpen(true);
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;
    
    const startIndex = result.source.index;
    const endIndex = result.destination.index;
    
    if (startIndex === endIndex) return;
    
    try {
      const updatedLessons = Array.from(lessons);
      const [removed] = updatedLessons.splice(startIndex, 1);
      updatedLessons.splice(endIndex, 0, removed);
      
      // Update lessons with new order indices
      setLessons(updatedLessons.map((lesson, index) => ({
        ...lesson,
        order_index: index + 1,
      })));
      
      // Update order indices in database
      for (const [index, lesson] of updatedLessons.entries()) {
        await supabase
          .from('lessons')
          .update({ order_index: index + 1 })
          .eq('id', lesson.id);
      }
      
      toast({
        title: 'Order updated',
        description: 'Lesson order has been updated successfully',
      });
      
    } catch (error) {
      console.error('Error updating lesson order:', error);
      toast({
        title: 'Error updating order',
        description: error.message || 'Please try again later',
        variant: 'destructive',
      });
      
      // Revert to previous state
      fetchCourseAndLessons();
    }
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
            <p className="mt-4 text-muted-foreground">Loading course and lessons...</p>
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
            <Button onClick={() => navigate('/courses')}>Back to Courses</Button>
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
        <section className="py-12">
          <div className="container px-4 mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Button variant="outline" size="sm" onClick={() => navigate(`/courses/${courseId}`)}>
                    Back to Course
                  </Button>
                  <h1 className="text-2xl font-bold">Manage Lessons</h1>
                </div>
                <h2 className="text-xl font-semibold">{course.title}</h2>
                <p className="text-muted-foreground mt-1">
                  {course.lessons} {course.lessons === 1 ? 'lesson' : 'lessons'} | {course.category} | {course.level}
                </p>
              </div>
              
              <Dialog open={isAddLessonOpen} onOpenChange={setIsAddLessonOpen}>
                <DialogTrigger asChild>
                  <Button className="mt-4 md:mt-0">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Lesson
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[700px]">
                  <DialogHeader>
                    <DialogTitle>Add New Lesson</DialogTitle>
                    <DialogDescription>
                      Create a new lesson for this course.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <Tabs defaultValue="details">
                    <TabsList className="mb-4">
                      <TabsTrigger value="details">Lesson Details</TabsTrigger>
                      <TabsTrigger value="video">Add Video</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="details">
                      <form onSubmit={handleAddLesson} className="space-y-4 mt-4">
                        <div className="space-y-2">
                          <Label htmlFor="title">Lesson Title</Label>
                          <Input
                            id="title"
                            placeholder="Enter lesson title"
                            value={lessonForm.title}
                            onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="content">Content</Label>
                          <Textarea
                            id="content"
                            placeholder="Enter lesson content"
                            value={lessonForm.content}
                            onChange={(e) => setLessonForm({ ...lessonForm, content: e.target.value })}
                            rows={5}
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="duration">Duration (minutes)</Label>
                            <Input
                              id="duration"
                              type="number"
                              min="1"
                              placeholder="Enter duration in minutes"
                              value={lessonForm.duration}
                              onChange={(e) => setLessonForm({ ...lessonForm, duration: e.target.value })}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="video_url">Video URL (optional)</Label>
                            <Input
                              id="video_url"
                              placeholder="Enter YouTube or video URL"
                              value={lessonForm.video_url}
                              onChange={(e) => setLessonForm({ ...lessonForm, video_url: e.target.value })}
                            />
                          </div>
                        </div>
                        
                        <DialogFooter>
                          <Button
                            type="submit"
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? 'Creating...' : 'Create Lesson'}
                          </Button>
                        </DialogFooter>
                      </form>
                    </TabsContent>
                    
                    <TabsContent value="video">
                      <div className="space-y-4">
                        <div className="flex gap-2">
                          <Input
                            placeholder="Search for YouTube videos"
                            value={videoSearchQuery}
                            onChange={(e) => setVideoSearchQuery(e.target.value)}
                            className="flex-grow"
                          />
                          <Button 
                            onClick={searchVideos}
                            disabled={isSearchingVideos}
                          >
                            {isSearchingVideos ? 'Searching...' : 'Search'}
                          </Button>
                        </div>
                        
                        {lessonForm.video_url && (
                          <div className="p-3 border rounded-md bg-muted/30">
                            <p className="font-medium text-sm mb-1">Selected Video</p>
                            <p className="text-xs text-muted-foreground break-all">{lessonForm.video_url}</p>
                          </div>
                        )}
                        
                        {videoSearchResults.length > 0 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto p-1">
                            {videoSearchResults.map((video) => (
                              <Card key={video.id.videoId} className="overflow-hidden hover:shadow-md transition-shadow">
                                <img
                                  src={video.snippet.thumbnails.medium.url}
                                  alt={video.snippet.title}
                                  className="w-full h-32 object-cover"
                                />
                                <CardContent className="p-3">
                                  <p className="font-medium text-sm line-clamp-2">{video.snippet.title}</p>
                                  <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{video.snippet.channelTitle}</p>
                                </CardContent>
                                <CardFooter className="p-3 pt-0">
                                  <Button
                                    size="sm"
                                    variant="secondary"
                                    className="w-full"
                                    onClick={() => selectVideo(video)}
                                  >
                                    <Video className="h-3 w-3 mr-1" />
                                    Select Video
                                  </Button>
                                </CardFooter>
                              </Card>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 bg-muted/30 rounded-lg">
                            {isSearchingVideos ? (
                              <div className="flex flex-col items-center">
                                <div className="h-6 w-6 animate-spin rounded-full border-2 border-solid border-current border-r-transparent" />
                                <p className="text-muted-foreground mt-2">Searching for videos...</p>
                              </div>
                            ) : (
                              <p className="text-muted-foreground">Search for YouTube videos to add to this lesson</p>
                            )}
                          </div>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                </DialogContent>
              </Dialog>
            </div>
            
            <div className="glass-panel p-6 rounded-xl mb-8">
              {lessons.length > 0 ? (
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="lessons">
                    {(provided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="space-y-3"
                      >
                        {lessons.map((lesson, index) => (
                          <Draggable key={lesson.id} draggableId={lesson.id} index={index}>
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className="border rounded-lg p-4 bg-card hover:shadow-sm transition-shadow"
                              >
                                <div className="flex justify-between items-start">
                                  <div>
                                    <div className="flex items-center">
                                      <span className="text-sm font-medium text-muted-foreground mr-2">
                                        {lesson.order_index}.
                                      </span>
                                      <h3 className="text-lg font-medium">{lesson.title}</h3>
                                      
                                      {lesson.video_url && (
                                        <span className="ml-2 text-xs bg-blue-100 text-blue-800 rounded-full px-2 py-0.5 flex items-center">
                                          <Video className="h-3 w-3 mr-1" />
                                          Video
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-muted-foreground text-sm mt-1 line-clamp-2">
                                      {lesson.content}
                                    </p>
                                    <div className="text-xs text-muted-foreground mt-2">
                                      Duration: {lesson.duration} minutes
                                    </div>
                                  </div>
                                  
                                  <div className="flex gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => openEditLessonDialog(lesson)}
                                    >
                                      <Edit className="h-4 w-4" />
                                      <span className="sr-only">Edit</span>
                                    </Button>
                                    
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="text-destructive border-destructive hover:bg-destructive/10"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                          <span className="sr-only">Delete</span>
                                        </Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>Delete Lesson</AlertDialogTitle>
                                          <AlertDialogDescription>
                                            Are you sure you want to delete "{lesson.title}"? This action cannot be undone.
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                                          <AlertDialogAction
                                            onClick={() => handleDeleteLesson(lesson.id)}
                                            className="bg-destructive hover:bg-destructive/90"
                                          >
                                            Delete
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              ) : (
                <div className="text-center py-8 bg-muted/30 rounded-lg">
                  <p className="text-muted-foreground mb-4">No lessons added for this course yet</p>
                  <Button
                    onClick={() => setIsAddLessonOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Lesson
                  </Button>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
      
      <Dialog open={isEditLessonOpen} onOpenChange={setIsEditLessonOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Edit Lesson</DialogTitle>
            <DialogDescription>
              Update this lesson's details.
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="details">
            <TabsList className="mb-4">
              <TabsTrigger value="details">Lesson Details</TabsTrigger>
              <TabsTrigger value="video">Add Video</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details">
              <form onSubmit={handleEditLesson} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-title">Lesson Title</Label>
                  <Input
                    id="edit-title"
                    placeholder="Enter lesson title"
                    value={lessonForm.title}
                    onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-content">Content</Label>
                  <Textarea
                    id="edit-content"
                    placeholder="Enter lesson content"
                    value={lessonForm.content}
                    onChange={(e) => setLessonForm({ ...lessonForm, content: e.target.value })}
                    rows={5}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-duration">Duration (minutes)</Label>
                    <Input
                      id="edit-duration"
                      type="number"
                      min="1"
                      placeholder="Enter duration in minutes"
                      value={lessonForm.duration}
                      onChange={(e) => setLessonForm({ ...lessonForm, duration: e.target.value })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="edit-video-url">Video URL (optional)</Label>
                    <Input
                      id="edit-video-url"
                      placeholder="Enter YouTube or video URL"
                      value={lessonForm.video_url}
                      onChange={(e) => setLessonForm({ ...lessonForm, video_url: e.target.value })}
                    />
                  </div>
                </div>
                
                <DialogFooter>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Updating...' : 'Update Lesson'}
                  </Button>
                </DialogFooter>
              </form>
            </TabsContent>
            
            <TabsContent value="video">
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Search for YouTube videos"
                    value={videoSearchQuery}
                    onChange={(e) => setVideoSearchQuery(e.target.value)}
                    className="flex-grow"
                  />
                  <Button 
                    onClick={searchVideos}
                    disabled={isSearchingVideos}
                  >
                    {isSearchingVideos ? 'Searching...' : 'Search'}
                  </Button>
                </div>
                
                {lessonForm.video_url && (
                  <div className="p-3 border rounded-md bg-muted/30">
                    <p className="font-medium text-sm mb-1">Selected Video</p>
                    <p className="text-xs text-muted-foreground break-all">{lessonForm.video_url}</p>
                  </div>
                )}
                
                {videoSearchResults.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto p-1">
                    {videoSearchResults.map((video) => (
                      <Card key={video.id.videoId} className="overflow-hidden hover:shadow-md transition-shadow">
                        <img
                          src={video.snippet.thumbnails.medium.url}
                          alt={video.snippet.title}
                          className="w-full h-32 object-cover"
                        />
                        <CardContent className="p-3">
                          <p className="font-medium text-sm line-clamp-2">{video.snippet.title}</p>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{video.snippet.channelTitle}</p>
                        </CardContent>
                        <CardFooter className="p-3 pt-0">
                          <Button
                            size="sm"
                            variant="secondary"
                            className="w-full"
                            onClick={() => selectVideo(video)}
                          >
                            <Video className="h-3 w-3 mr-1" />
                            Select Video
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-muted/30 rounded-lg">
                    {isSearchingVideos ? (
                      <div className="flex flex-col items-center">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-solid border-current border-r-transparent" />
                        <p className="text-muted-foreground mt-2">Searching for videos...</p>
                      </div>
                    ) : (
                      <p className="text-muted-foreground">Search for YouTube videos to add to this lesson</p>
                    )}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
      
      <Footer />
    </div>
  );
};

export default AdminLessons;
