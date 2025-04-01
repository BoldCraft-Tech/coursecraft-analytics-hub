
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
    const { interests, level } = await req.json();

    // Create a client with the supabaseKey
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://lmizrylbhbapimyuyajc.supabase.co';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Query courses based on user interests and level
    let query = supabase.from('courses').select('*');
    
    if (interests) {
      // If interests are provided, use them to filter
      query = query.ilike('category', `%${interests}%`);
    }
    
    if (level && level !== 'all-levels') {
      // If level is provided and not 'all-levels', filter by level
      query = query.eq('level', level);
    }
    
    // Limit to 3 courses for recommendations
    const { data: courses, error } = await query.limit(3);

    if (error) throw error;

    // Prepare AI-style recommendation message
    const recommendationMessage = generateRecommendationMessage(courses, interests, level);

    return new Response(
      JSON.stringify({
        recommendations: courses,
        message: recommendationMessage
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

// Helper function to generate personalized recommendation messages
function generateRecommendationMessage(courses, interests, level) {
  if (courses.length === 0) {
    return "I couldn't find any courses matching your criteria. Consider broadening your search.";
  }

  const levelPhrase = level && level !== 'all-levels' ? `${level} level` : 'all levels';
  const interestsPhrase = interests ? `related to ${interests}` : 'across various categories';
  
  const courseNames = courses.map(course => `"${course.title}"`).join(', ');
  
  return `Based on your interest in ${interestsPhrase} at ${levelPhrase}, I recommend checking out ${courseNames}. These courses are tailored to help you develop skills in this area.`;
}
