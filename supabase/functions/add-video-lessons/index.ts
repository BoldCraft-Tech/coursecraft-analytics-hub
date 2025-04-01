
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.33.1'

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create a Supabase client with the Admin key
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // First, let's check if we have already added the video_url column
    const { error: columnCheckError } = await supabase.rpc('column_exists', { 
      t_name: 'lessons', 
      c_name: 'video_url' 
    });

    // If the column doesn't exist, add it
    if (columnCheckError) {
      // Add the video_url column to lessons table
      await supabase.rpc('execute_sql', { 
        sql_query: 'ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS video_url TEXT' 
      });
      console.log('Added video_url column to lessons table');
    }

    // Sample YouTube videos for lessons
    const videoSources = [
      'https://www.youtube.com/embed/dQw4w9WgXcQ',
      'https://www.youtube.com/embed/jNQXAC9IVRw',
      'https://www.youtube.com/embed/6M5VXKLf4D4',
      'https://www.youtube.com/embed/fHI8X4OXluQ',
      'https://www.youtube.com/embed/AZgNrWp09s4'
    ];

    // Get all courses
    const { data: courses, error: coursesError } = await supabase
      .from('courses')
      .select('id');

    if (coursesError) {
      throw new Error(`Error fetching courses: ${coursesError.message}`);
    }

    let updatedLessonsCount = 0;

    // For each course, update its lessons with video URLs
    for (const course of courses) {
      // Get lessons for the course
      const { data: lessons, error: lessonsError } = await supabase
        .from('lessons')
        .select('id')
        .eq('course_id', course.id);

      if (lessonsError) {
        console.error(`Error fetching lessons for course ${course.id}: ${lessonsError.message}`);
        continue;
      }

      // Update each lesson with a video URL
      for (const lesson of lessons) {
        const randomVideoUrl = videoSources[Math.floor(Math.random() * videoSources.length)];
        
        const { error: updateError } = await supabase
          .from('lessons')
          .update({ video_url: randomVideoUrl })
          .eq('id', lesson.id);

        if (updateError) {
          console.error(`Error updating lesson ${lesson.id}: ${updateError.message}`);
        } else {
          updatedLessonsCount++;
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Successfully updated ${updatedLessonsCount} lessons with video URLs` 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error in add-video-lessons function:', error);
    
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
