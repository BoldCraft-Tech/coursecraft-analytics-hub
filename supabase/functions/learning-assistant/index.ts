
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
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
      // Try to get response from OpenAI
      if (!openAIApiKey) {
        throw new Error('OpenAI API key is not configured');
      }

      // Prepare system message with information about available courses
      const courseInfo = courses.map(c => 
        `Title: ${c.title}, Category: ${c.category}, Level: ${c.level}, Description: ${c.description}`
      ).join('\n');

      // Create messages array for OpenAI
      const messages = [
        {
          role: "system",
          content: `You are a helpful learning assistant that helps users find and understand courses on our platform. 
          You provide personalized recommendations, answer questions about course content, and offer guidance on learning paths.
          
          Here are the courses available in our database:
          ${courseInfo}
          
          When users ask about courses, use this information to provide relevant recommendations.
          Always be supportive, encouraging, and positive about learning.
          If a user asks for courses of a specific level (Beginner, Intermediate, Advanced), make sure to only recommend courses of that level.
          Provide concise but detailed responses.`
        }
      ];

      // Add chat history for context (limit to last 10 messages for token efficiency)
      if (chatHistory && Array.isArray(chatHistory)) {
        const recentHistory = chatHistory.slice(-10);
        messages.push(...recentHistory);
      }

      // Add the current user message
      messages.push({
        role: "user",
        content: message
      });

      console.log("Sending request to OpenAI");
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: messages,
          temperature: 0.7,
          max_tokens: 1000
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("OpenAI API Error:", JSON.stringify(errorData));
        throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      console.log("Received response from OpenAI");
      
      assistantResponse = data.choices[0].message.content;
    } catch (aiError) {
      console.error("Error with OpenAI:", aiError);
      
      // Fallback to a rule-based approach
      assistantResponse = `I'm sorry, I'm currently experiencing some technical difficulties with my AI capabilities. 
      
Let me try to help you with your query about "${message}" using our course information.`;

      // Extract potential keywords from the message
      const lowerMessage = message.toLowerCase();
      
      // Check for level mentions
      let level = null;
      if (lowerMessage.includes('beginner')) level = 'Beginner';
      else if (lowerMessage.includes('intermediate')) level = 'Intermediate';
      else if (lowerMessage.includes('advanced')) level = 'Advanced';

      // Check for category mentions
      let category = null;
      if (lowerMessage.includes('technology')) category = 'Technology';
      else if (lowerMessage.includes('business')) category = 'Business';
      else if (lowerMessage.includes('agriculture')) category = 'Agriculture';
      else if (lowerMessage.includes('health')) category = 'Health';
      else if (lowerMessage.includes('education')) category = 'Education';
      
      if (level || category) {
        assistantResponse += `\n\nI found some courses that match your interests in ${category || 'various categories'}${level ? ` at ${level} level` : ''}.`;
      } else {
        assistantResponse += "\n\nHere are some courses that might interest you:";
      }
    }

    // Extract course recommendations from the AI response or fallback to keyword matching
    recommendedCourses = [];
    
    // Check if courses were mentioned in AI response
    for (const course of courses) {
      // Check if course title is mentioned in the response
      if (assistantResponse.includes(course.title)) {
        recommendedCourses.push(course);
      }
    }

    // If no courses were explicitly mentioned, try to extract level/category information
    if (recommendedCourses.length === 0) {
      const lowerMessage = message.toLowerCase();
      
      // Check for level mentions
      let level = null;
      if (lowerMessage.includes('beginner')) level = 'Beginner';
      else if (lowerMessage.includes('intermediate')) level = 'Intermediate';
      else if (lowerMessage.includes('advanced')) level = 'Advanced';

      // Check for category mentions
      let category = null;
      if (lowerMessage.includes('technology')) category = 'Technology';
      else if (lowerMessage.includes('business')) category = 'Business';
      else if (lowerMessage.includes('agriculture')) category = 'Agriculture';
      else if (lowerMessage.includes('health')) category = 'Health';
      else if (lowerMessage.includes('education')) category = 'Education';

      // Query based on these filters if found
      if (level || category) {
        let query = supabase.from('courses').select('*');
        
        if (level) query = query.eq('level', level);
        if (category) query = query.eq('category', category);
        
        const { data: filteredCourses } = await query;
        recommendedCourses = filteredCourses || [];
      } else {
        // If no specific filters, return a few random courses as recommendations
        recommendedCourses = courses.slice(0, Math.min(3, courses.length));
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
