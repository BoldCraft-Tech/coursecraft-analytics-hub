import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, Pencil, Trash2, GripVertical } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useAuth } from '@/hooks/useAuth';

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

const AdminLessons = () => {
  const { courseId } = useParams();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [addLessonOpen, setAddLessonOpen] = useState(false);
  const [editLessonOpen, setEditLessonOpen] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [newLesson, setNewLesson] = useState({
    title: '',
    content: '',
    duration: '',
    video_url: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      navigate('/signin');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (courseId) {
      fetchLessons();
    }
  }, [courseId]);

  const fetchLessons = async () => {
    try {
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('course_id', courseId)
        .order('order_index', { ascending: true });
        
      if (error) throw error;
      
      setLessons(data || []);
    } catch (error) {
      console.error('Error fetching lessons:', error);
      toast({
        title: 'Error fetching lessons',
        description: 'Please try again later',
        variant: 'destructive',
      });
    }
  };

  const handleAddLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newLesson.title || !newLesson.content) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const durationNumber = parseInt(newLesson.duration) || 0;
      
      const { data, error } = await supabase
        .from('lessons')
        .insert({
          title: newLesson.title,
          content: newLesson.content,
          course_id: courseId,
          video_url: newLesson.video_url || null,
          order_index: lessons.length,
          duration: durationNumber,
        })
        .select()
        .single();
        
      if (error) throw error;
      
      toast({
        title: 'Lesson created',
        description: 'Your lesson has been created successfully',
      });
      
      setNewLesson({
        title: '',
        content: '',
        duration: '',
        video_url: '',
      });
      
      setAddLessonOpen(false);
      await fetchLessons();
      
      setTimeout(() => {
        document.getElementById('lessons-table')?.scrollIntoView({ behavior: 'smooth' });
      }, 500);
      
    } catch (error) {
      console.error('Error creating lesson:', error);
      toast({
        title: 'Error creating lesson',
        description: error.message || 'Please try again later',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedLesson?.id) return;
    
    try {
      setIsSubmitting(true);
      
      const { error } = await supabase
        .from('lessons')
        .update({
          title: selectedLesson.title,
          content: selectedLesson.content,
          duration: selectedLesson.duration,
          video_url: selectedLesson.video_url || null,
        })
        .eq('id', selectedLesson.id);
        
      if (error) throw error;
      
      toast({
        title: 'Lesson updated',
        description: 'Lesson updated successfully',
      });
      
      setEditLessonOpen(false);
      fetchLessons();
      
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

  const handleDeleteLesson = async (lessonId: string) => {
    if (!window.confirm('Are you sure you want to delete this lesson?')) {
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const { error } = await supabase
        .from('lessons')
        .delete()
        .eq('id', lessonId);
        
      if (error) throw error;
      
      toast({
        title: 'Lesson deleted',
        description: 'Lesson deleted successfully',
      });
      
      fetchLessons();
      
    } catch (error) {
      console.error('Error deleting lesson:', error);
      toast({
        title: 'Error deleting lesson',
        description: error.message || 'Please try again later',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const moveLesson = async (lessonId: string, direction: 'up' | 'down') => {
    try {
      const currentIndex = lessons.findIndex(lesson => lesson.id === lessonId);
      const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      
      if (newIndex < 0 || newIndex >= lessons.length) return;
      
      const updatedLessons = [...lessons];
      const [movedLesson] = updatedLessons.splice(currentIndex, 1);
      updatedLessons.splice(newIndex, 0, movedLesson);
      
      const updatedWithIndices = updatedLessons.map((lesson, idx) => ({
        ...lesson,
        order_index: idx
      }));
      
      setLessons(updatedWithIndices);
      
      await Promise.all(
        updatedWithIndices
          .filter((_, idx) => idx === newIndex || idx === currentIndex)
          .map(lesson => 
            supabase
              .from('lessons')
              .update({ order_index: lesson.order_index })
              .eq('id', lesson.id)
          )
      );
      
      toast({
        title: 'Lesson reordered',
        description: 'Lesson position updated successfully',
      });
    } catch (error) {
      console.error('Error reordering lesson:', error);
      toast({
        title: 'Error reordering lesson',
        description: error.message || 'Please try again later',
        variant: 'destructive',
      });
    }
  };

  const handleDragStart = (lessonId: string) => {
    console.log(`Dragging started for lesson: ${lessonId}`);
  };
  
  const handleDrop = async (draggedLessonId: string, targetLessonId: string) => {
    if (draggedLessonId === targetLessonId) {
      return;
    }
  
    try {
      const draggedIndex = lessons.findIndex(lesson => lesson.id === draggedLessonId);
      const targetIndex = lessons.findIndex(lesson => lesson.id === targetLessonId);
  
      if (draggedIndex === -1 || targetIndex === -1) {
        console.error("Dragged or target lesson not found in the array.");
        return;
      }
  
      const updatedLessons = [...lessons];
      const [draggedLesson] = updatedLessons.splice(draggedIndex, 1);
      updatedLessons.splice(targetIndex, 0, draggedLesson);
  
      const updatedWithIndices = updatedLessons.map((lesson, idx) => ({
        ...lesson,
        order_index: idx
      }));
      setLessons(updatedWithIndices);
  
      const updates = updatedWithIndices.map(lesson =>
        supabase
          .from('lessons')
          .update({ order_index: lesson.order_index })
          .eq('id', lesson.id)
      );
  
      await Promise.all(updates);
  
      toast({
        title: 'Lessons reordered',
        description: 'Lesson positions updated successfully',
      });
    } catch (error) {
      console.error('Error reordering lessons:', error);
      toast({
        title: 'Error reordering lessons',
        description: 'Failed to update lesson order. Please try again.',
        variant: 'destructive',
      });
      fetchLessons();
    }
  };

  const DraggableRow = ({ lesson }: { lesson: Lesson }) => {
    const [, drag] = useDrag({
      type: 'LESSON',
      item: { id: lesson.id },
      collect: (monitor) => {
        if (monitor.isDragging()) {
          handleDragStart(lesson.id);
        }
        return {};
      },
    });
  
    const [{ isOver }, drop] = useDrop({
      accept: 'LESSON',
      drop: (item: any) => {
        handleDrop(item.id, lesson.id);
      },
      collect: (monitor) => ({
        isOver: !!monitor.isOver(),
      }),
    });
  
    return (
      <TableRow
        ref={(node) => drag(drop(node))}
        style={{
          cursor: 'grab',
          backgroundColor: isOver ? 'rgba(0,0,0,0.05)' : 'transparent',
        }}
      >
        <TableCell className="font-medium">{lesson.title}</TableCell>
        <TableCell>{lesson.duration} minutes</TableCell>
        <TableCell className="text-right">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedLesson(lesson);
              setEditLessonOpen(true);
            }}
          >
            <Pencil className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => handleDeleteLesson(lesson.id)}
            disabled={isSubmitting}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {isSubmitting ? 'Deleting...' : 'Delete'}
          </Button>
        </TableCell>
      </TableRow>
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-20">
        <section className="py-12">
          <div className="container px-4 mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold">Manage Lessons</h1>
              <Button onClick={() => navigate('/admin')}>Back to Dashboard</Button>
            </div>
            
            <div className="mb-4">
              <Dialog open={addLessonOpen} onOpenChange={setAddLessonOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Lesson
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[525px]">
                  <DialogHeader>
                    <DialogTitle>Add New Lesson</DialogTitle>
                    <DialogDescription>
                      Create a new lesson for this course.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <form onSubmit={handleAddLesson} className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Lesson Title</Label>
                      <Input
                        id="title"
                        placeholder="Enter lesson title"
                        value={newLesson.title}
                        onChange={(e) => setNewLesson({ ...newLesson, title: e.target.value })}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="content">Content</Label>
                      <Textarea
                        id="content"
                        placeholder="Enter lesson content"
                        value={newLesson.content}
                        onChange={(e) => setNewLesson({ ...newLesson, content: e.target.value })}
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="video_url">Video URL (Optional)</Label>
                      <Input
                        id="video_url"
                        placeholder="Enter YouTube video URL"
                        value={newLesson.video_url}
                        onChange={(e) => setNewLesson({ ...newLesson, video_url: e.target.value })}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="duration">Duration (minutes)</Label>
                      <Input
                        id="duration"
                        type="number"
                        placeholder="Enter lesson duration in minutes"
                        value={newLesson.duration}
                        onChange={(e) => setNewLesson({ ...newLesson, duration: e.target.value })}
                      />
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
                </DialogContent>
              </Dialog>
            </div>

            <Dialog open={editLessonOpen} onOpenChange={setEditLessonOpen}>
              <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                  <DialogTitle>Edit Lesson</DialogTitle>
                  <DialogDescription>
                    Edit the details of the selected lesson.
                  </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleEditLesson} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-title">Lesson Title</Label>
                    <Input
                      id="edit-title"
                      placeholder="Enter lesson title"
                      value={selectedLesson?.title || ''}
                      onChange={(e) => setSelectedLesson({ ...selectedLesson, title: e.target.value } as Lesson)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="edit-content">Content</Label>
                    <Textarea
                      id="edit-content"
                      placeholder="Enter lesson content"
                      value={selectedLesson?.content || ''}
                      onChange={(e) => setSelectedLesson({ ...selectedLesson, content: e.target.value } as Lesson)}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-video_url">Video URL (Optional)</Label>
                    <Input
                      id="edit-video_url"
                      placeholder="Enter YouTube video URL"
                      value={selectedLesson?.video_url || ''}
                      onChange={(e) => setSelectedLesson({ ...selectedLesson, video_url: e.target.value } as Lesson)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="edit-duration">Duration (minutes)</Label>
                    <Input
                      id="edit-duration"
                      type="number"
                      placeholder="Enter lesson duration in minutes"
                      value={String(selectedLesson?.duration || '')}
                      onChange={(e) => setSelectedLesson({ ...selectedLesson, duration: parseInt(e.target.value) } as Lesson)}
                    />
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
              </DialogContent>
            </Dialog>
            
            {lessons.length === 0 ? (
              <p>No lessons found. Add a lesson to get started.</p>
            ) : (
              <DndProvider backend={HTML5Backend}>
                <Table id="lessons-table">
                  <TableCaption>A list of your lessons.</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lessons.map((lesson) => (
                      <DraggableRow key={lesson.id} lesson={lesson} />
                    ))}
                  </TableBody>
                </Table>
              </DndProvider>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default AdminLessons;
