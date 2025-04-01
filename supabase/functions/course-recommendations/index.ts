
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
    const { interests, level } = await req.json();

    // Fetch all courses
    const { data: courses, error } = await supabase
      .from('courses')
      .select('*');

    if (error) throw error;

    // Filter courses based on user preferences
    let filteredCourses = [...courses];
    
    if (interests) {
      filteredCourses = filteredCourses.filter(
        course => course.category.toLowerCase() === interests.toLowerCase()
      );
    }
    
    if (level) {
      filteredCourses = filteredCourses.filter(
        course => course.level.toLowerCase() === level.toLowerCase()
      );
    }

    // If no courses match the filters, return a subset of all courses
    if (filteredCourses.length === 0) {
      filteredCourses = courses.slice(0, 3);
    } else if (filteredCourses.length > 5) {
      // Limit to 5 recommendations if there are many matches
      filteredCourses = filteredCourses.slice(0, 5);
    }

    // Generate a recommendation message based on filters
    let message = "Based on your interests";
    if (interests) message += ` in ${interests}`;
    if (level) message += ` and ${level} level`;
    message += ", I recommend these courses to help you develop valuable skills for rural areas.";

    return new Response(
      JSON.stringify({
        recommendations: filteredCourses,
        message: message
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );
  } catch (error) {
    console.error('Error generating recommendations:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
