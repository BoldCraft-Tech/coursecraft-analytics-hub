
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
    const { interests, level, userPreferences } = await req.json();

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

    // Use user preferences for more personalized filtering
    if (userPreferences) {
      // Sort by preference relevance (simplified example)
      filteredCourses.sort((a, b) => {
        const aRelevance = calculateRelevance(a, userPreferences);
        const bRelevance = calculateRelevance(b, userPreferences);
        return bRelevance - aRelevance;
      });
    }

    // If no courses match the filters, return a subset of all courses
    if (filteredCourses.length === 0) {
      filteredCourses = courses.slice(0, 3);
    } else if (filteredCourses.length > 5) {
      // Limit to 5 recommendations if there are many matches
      filteredCourses = filteredCourses.slice(0, 5);
    }

    // Generate a personalized recommendation message
    let message = "Based on your interests";
    if (interests) message += ` in ${interests}`;
    if (level) message += ` and ${level} level`;
    
    if (userPreferences) {
      message += ", and your learning profile";
    }
    
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

// Helper function to calculate course relevance based on user preferences
function calculateRelevance(course, userPreferences) {
  let relevance = 0;
  
  // Match category preferences
  if (userPreferences.categories && userPreferences.categories.includes(course.category)) {
    relevance += 3;
  }
  
  // Match level preferences
  if (userPreferences.preferredLevel === course.level) {
    relevance += 2;
  }
  
  // Consider previously completed courses in similar categories
  if (userPreferences.completedCategories && userPreferences.completedCategories.includes(course.category)) {
    relevance += 1;
  }
  
  return relevance;
}
