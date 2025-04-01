
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Create a Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') as string;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') as string;
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Get request data
    const { courseId, numLessons = 5 } = await req.json();

    if (!courseId) {
      throw new Error('Course ID is required');
    }

    // Check if course exists
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .single();

    if (courseError) throw courseError;
    if (!course) throw new Error('Course not found');

    // Count existing lessons
    const { count: existingLessons, error: countError } = await supabase
      .from('lessons')
      .select('*', { count: 'exact', head: true })
      .eq('course_id', courseId);

    if (countError) throw countError;
    if (existingLessons && existingLessons > 0) {
      throw new Error('Course already has lessons');
    }

    // Call the database function to seed lessons
    const { data, error } = await supabase.rpc(
      'seed_course_lessons',
      { course_id: courseId, num_lessons: numLessons }
    );

    if (error) throw error;

    // Update course with number of lessons
    await supabase
      .from('courses')
      .update({ lessons: numLessons })
      .eq('id', courseId);

    return new Response(
      JSON.stringify({ success: true, message: `${numLessons} lessons created for course ${courseId}` }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );
  } catch (error) {
    console.error('Error seeding course lessons:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
