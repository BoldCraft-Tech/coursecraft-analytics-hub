
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { RequireAuth, useAuth } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Courses from "./pages/Courses";
import CourseDetail from "./pages/CourseDetail";
import Dashboard from "./pages/Dashboard";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import NotFound from "./pages/NotFound";
import LearningDashboard from "./pages/LearningDashboard";
import MyCourses from "./pages/MyCourses";
import MyCertificates from "./pages/MyCertificates";
import LessonView from "./pages/LessonView";

const queryClient = new QueryClient();

// Home page router that redirects authenticated users to learning dashboard
const HomeRoute = () => {
  const { user } = useAuth();
  return user ? <Navigate to="/learning" /> : <Index />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<HomeRoute />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/courses/:id" element={<CourseDetail />} />
            <Route path="/courses/:courseId/lessons/:lessonId" element={<LessonView />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            
            {/* Protected routes */}
            <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
            <Route path="/learning" element={<RequireAuth><LearningDashboard /></RequireAuth>} />
            <Route path="/my-courses" element={<RequireAuth><MyCourses /></RequireAuth>} />
            <Route path="/certificates" element={<RequireAuth><MyCertificates /></RequireAuth>} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
