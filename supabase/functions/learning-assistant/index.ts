
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

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
    const { message, chatHistory } = await req.json();
    console.log("Received message:", message);
    console.log("Chat history length:", chatHistory?.length || 0);

    // Initialize Supabase client with service role key for admin access
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch courses data to include in AI context
    const { data: courses, error: coursesError } = await supabase
      .from('courses')
      .select('*');

    if (coursesError) {
      console.error("Error fetching courses:", coursesError);
      throw new Error('Failed to fetch course data');
    }

    let recommendedCourses = [];
    let assistantResponse = "";

    try {
      // We'll use a rule-based approach with NLP techniques to generate responses
      // This avoids needing any external paid API

      // Process the user message
      const lowerMessage = message.toLowerCase();
      console.log("Processing message:", lowerMessage);
      
      // Extract potential keywords from the message
      let level = null;
      if (lowerMessage.includes('beginner')) level = 'Beginner';
      else if (lowerMessage.includes('intermediate')) level = 'Intermediate';
      else if (lowerMessage.includes('advanced')) level = 'Advanced';

      // Check for category mentions
      let category = null;
      if (lowerMessage.includes('technology') || lowerMessage.includes('tech') || lowerMessage.includes('programming') || 
          lowerMessage.includes('coding') || lowerMessage.includes('software') || lowerMessage.includes('digital')) {
        category = 'Technology';
      }
      else if (lowerMessage.includes('business') || lowerMessage.includes('management') || 
               lowerMessage.includes('entrepreneur') || lowerMessage.includes('marketing')) {
        category = 'Business';
      }
      else if (lowerMessage.includes('agriculture') || lowerMessage.includes('farming') || 
               lowerMessage.includes('farm') || lowerMessage.includes('crop')) {
        category = 'Agriculture';
      }
      else if (lowerMessage.includes('health') || lowerMessage.includes('healthcare') || 
               lowerMessage.includes('medical') || lowerMessage.includes('fitness')) {
        category = 'Health';
      }
      else if (lowerMessage.includes('education') || lowerMessage.includes('learning') || 
               lowerMessage.includes('teach') || lowerMessage.includes('school')) {
        category = 'Education';
      }

      // Generate a response based on the user's query
      if (lowerMessage.includes('hello') || lowerMessage.includes('hi ') || lowerMessage.includes('hey')) {
        assistantResponse = "Hello! I'm your learning assistant. How can I help you find the right courses today?";
      }
      else if (lowerMessage.includes('recommend') || lowerMessage.includes('suggest') || lowerMessage.includes('find me')) {
        assistantResponse = `I'd be happy to recommend some courses for you${category ? ' in ' + category : ''}${level ? ' at ' + level + ' level' : ''}. Here are some options that might interest you:`;
      }
      else if (lowerMessage.includes('what courses') || lowerMessage.includes('which courses')) {
        assistantResponse = `Here are some courses${category ? ' in ' + category : ''}${level ? ' at ' + level + ' level' : ''} that you might find interesting:`;
      }
      else if (lowerMessage.includes('difference between') || lowerMessage.includes('compare')) {
        assistantResponse = "When comparing courses, it's important to consider your current skill level, time commitment, and learning goals. Let me suggest some courses that might help you make a decision:";
      }
      else if (lowerMessage.includes('thank')) {
        assistantResponse = "You're welcome! If you have any other questions about our courses or need more recommendations, feel free to ask.";
      }
      else if (lowerMessage.includes('how long') || lowerMessage.includes('duration')) {
        assistantResponse = "Course durations vary based on the complexity of the material and the depth of content. Here are some courses with their estimated completion times:";
      }
      else {
        // Default response for other queries
        assistantResponse = `I've found some courses${category ? ' in ' + category : ''}${level ? ' at ' + level + ' level' : ''} that might help answer your question about "${message}":`;
      }

      // Add more context about the found categories/levels
      if (category || level) {
        if (category && level) {
          assistantResponse += `\n\nI noticed you're interested in ${category} courses at ${level} level. That's a great choice! `;
          
          if (level === 'Beginner') {
            assistantResponse += `${category} has many opportunities for beginners to learn fundamental skills.`;
          } else if (level === 'Intermediate') {
            assistantResponse += `With some background knowledge, these ${category} courses will help you advance your skills further.`;
          } else if (level === 'Advanced') {
            assistantResponse += `These advanced ${category} courses will help you master complex concepts and techniques.`;
          }
        } else if (category) {
          assistantResponse += `\n\nI noticed you're interested in ${category}. This is a great field with many learning opportunities!`;
        } else if (level) {
          assistantResponse += `\n\nI've focused on ${level} level courses that match your experience level.`;
        }
      }

      // Find matching courses based on extracted category and level
      if (category || level) {
        let query = supabase.from('courses').select('*');
        
        if (level) query = query.eq('level', level);
        if (category) query = query.eq('category', category);
        
        const { data: filteredCourses } = await query;
        if (filteredCourses && filteredCourses.length > 0) {
          recommendedCourses = filteredCourses;
          const courseCount = Math.min(filteredCourses.length, 3);
          assistantResponse += `\n\nHere are ${courseCount} recommended courses that match your interests:`;
          
          for (let i = 0; i < courseCount; i++) {
            const course = filteredCourses[i];
            assistantResponse += `\n\n- "${course.title}" - ${course.description.substring(0, 100)}...`;
          }
        }
      }
      
      // If no specific matches, provide general recommendations
      if (recommendedCourses.length === 0) {
        // Get a mix of courses to recommend
        const { data: mixedCourses } = await supabase
          .from('courses')
          .select('*')
          .limit(3);
        
        if (mixedCourses && mixedCourses.length > 0) {
          recommendedCourses = mixedCourses;
          assistantResponse += "\n\nHere are some popular courses you might enjoy:";
          
          for (let i = 0; i < mixedCourses.length; i++) {
            const course = mixedCourses[i];
            assistantResponse += `\n\n- "${course.title}" (${course.level}) - ${course.description.substring(0, 100)}...`;
          }
        }
      }
      
      // Add a helpful closing
      assistantResponse += "\n\nWould you like more specific recommendations or information about any of these courses?";
      
    } catch (aiError) {
      console.error("Error processing message:", aiError);
      
      // Fallback to a simple response
      assistantResponse = `I'm sorry, I'm having trouble understanding your request about "${message}". Could you try rephrasing or being more specific about what kind of courses you're looking for?`;
      
      // Get random courses as recommendations
      try {
        const { data: randomCourses } = await supabase
          .from('courses')
          .select('*')
          .limit(3);
        
        if (randomCourses && randomCourses.length > 0) {
          recommendedCourses = randomCourses;
          assistantResponse += "\n\nIn the meantime, here are some popular courses:";
          
          for (let i = 0; i < randomCourses.length; i++) {
            const course = randomCourses[i];
            assistantResponse += `\n\n- ${course.title} (${course.level})`;
          }
        }
      } catch (e) {
        console.error("Error fetching random courses:", e);
      }
    }

    return new Response(
      JSON.stringify({
        response: assistantResponse,
        recommendedCourses: recommendedCourses
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      },
    );
  } catch (error) {
    console.error("Error in learning-assistant function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "Unknown error occurred",
        response: "I'm sorry, I'm currently experiencing technical difficulties. Please try again later or browse our courses directly.",
        recommendedCourses: []
      }),
      {
        status: 200, // Return 200 even on error to avoid client-side error handling
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      },
    );
  }
});
