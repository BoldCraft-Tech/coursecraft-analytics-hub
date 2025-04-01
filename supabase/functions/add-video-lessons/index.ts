
// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

console.log("Hello from Supabase Functions - add-video-lessons!");

// Define video lesson data
const videoLessons = [
  {
    title: "Introduction to Course",
    content: "This lesson introduces the course and its objectives.",
    duration: 15,
    order_index: 1,
    video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
  },
  {
    title: "Basic Concepts",
    content: "Learn the fundamental concepts of this subject.",
    duration: 20,
    order_index: 2,
    video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4"
  },
  {
    title: "Practical Applications",
    content: "See how these concepts are applied in real-world scenarios.",
    duration: 25,
    order_index: 3,
    video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
  },
  {
    title: "Advanced Techniques",
    content: "Explore advanced techniques and methodologies.",
    duration: 30,
    order_index: 4,
    video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4"
  },
  {
    title: "Case Studies",
    content: "Analyze real-world case studies and examples.",
    duration: 35,
    order_index: 5,
    video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4"
  }
];

Deno.serve(async (req) => {
  // This is needed if you're planning to invoke your function from a browser.
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the Auth context of the logged-in user
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get course ID from the request
    const { courseId } = await req.json();
    
    if (!courseId) {
      throw new Error("Course ID is required");
    }

    console.log(`Adding video lessons for course: ${courseId}`);

    // Check if the course exists
    const { data: courseData, error: courseError } = await supabase
      .from("courses")
      .select("id")
      .eq("id", courseId)
      .single();

    if (courseError || !courseData) {
      throw new Error(`Course not found: ${courseId}`);
    }

    // Delete any existing lessons for this course
    await supabase
      .from("lessons")
      .delete()
      .eq("course_id", courseId);

    // Insert the video lessons
    const { data, error } = await supabase
      .from("lessons")
      .insert(
        videoLessons.map(lesson => ({
          ...lesson,
          course_id: courseId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }))
      )
      .select();

    if (error) {
      throw error;
    }

    // Update the course's lesson count
    await supabase
      .from("courses")
      .update({ 
        lessons: videoLessons.length,
        updated_at: new Date().toISOString()
      })
      .eq("id", courseId);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Added ${videoLessons.length} video lessons to course ${courseId}`,
        lessons: data
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
