import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create a client with the supabaseKey
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://lmizrylbhbapimyuyajc.supabase.co';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    const sampleCourses = [
      {
        title: 'Sustainable Farming Techniques',
        description: 'Learn modern and sustainable methods to improve crop yields while protecting the environment.',
        category: 'Agriculture',
        level: 'Beginner',
        duration: '6 weeks',
        students: 1250,
        lessons: 24,
      },
      {
        title: 'Digital Marketing for Small Businesses',
        description: 'Master digital marketing strategies to grow your business in rural markets.',
        category: 'Business',
        level: 'Intermediate',
        duration: '8 weeks',
        students: 845,
        lessons: 32,
      },
      {
        title: 'Community Healthcare Basics',
        description: 'Essential healthcare knowledge for community health workers in rural areas.',
        category: 'Healthcare',
        level: 'Beginner',
        duration: '4 weeks',
        students: 1632,
        lessons: 18,
      },
      {
        title: 'Rural Entrepreneurship',
        description: 'Start and grow a successful business in rural settings with limited resources.',
        category: 'Business',
        level: 'Advanced',
        duration: '10 weeks',
        students: 720,
        lessons: 42,
      },
      {
        title: 'Renewable Energy Solutions',
        description: 'Practical guide to implementing renewable energy systems in off-grid communities.',
        category: 'Technology',
        level: 'Intermediate',
        duration: '7 weeks',
        students: 530,
        lessons: 28,
      },
      {
        title: 'Water Conservation and Management',
        description: 'Techniques for efficient water usage and conservation in drought-prone areas.',
        category: 'Environment',
        level: 'Beginner',
        duration: '5 weeks',
        students: 915,
        lessons: 20,
      },
    ];

    // Delete existing courses (optional - remove if you want to keep existing data)
    const { error: deleteError } = await supabase
      .from('courses')
      .delete()
      .gte('id', '0'); // Delete all records
    
    if (deleteError) {
      throw deleteError;
    }

    // Insert sample courses
    const { data, error } = await supabase
      .from('courses')
      .insert(sampleCourses)
      .select();
    
    if (error) {
      throw error;
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Sample courses added successfully',
        courses: data
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
