
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import Index from '@/pages/Index';
import Courses from '@/pages/Courses';
import CourseDetail from '@/pages/CourseDetail';
import LessonView from '@/pages/LessonView';
import SignIn from '@/pages/SignIn';
import SignUp from '@/pages/SignUp';
import Dashboard from '@/pages/Dashboard';
import LearningDashboard from '@/pages/LearningDashboard';
import MyCourses from '@/pages/MyCourses';
import MyCertificates from '@/pages/MyCertificates';
import NotFound from '@/pages/NotFound';
import AdminDashboard from '@/pages/AdminDashboard';
import AdminLessons from '@/pages/AdminLessons';
import { AuthProvider, RequireAuth } from '@/hooks/useAuth';
import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/courses/:id" element={<CourseDetail />} />
          <Route path="/courses/:courseId/lessons/:lessonId" element={<LessonView />} />
          <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
          <Route path="/dashboard/learning" element={<RequireAuth><LearningDashboard /></RequireAuth>} />
          <Route path="/my-courses" element={<RequireAuth><MyCourses /></RequireAuth>} />
          <Route path="/dashboard/courses" element={<RequireAuth><MyCourses /></RequireAuth>} />
          <Route path="/dashboard/certificates" element={<RequireAuth><MyCertificates /></RequireAuth>} />
          <Route path="/certificates" element={<RequireAuth><MyCertificates /></RequireAuth>} />
          <Route path="/admin" element={<RequireAuth><AdminDashboard /></RequireAuth>} />
          <Route path="/admin/courses/:courseId/lessons" element={<RequireAuth><AdminLessons /></RequireAuth>} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </AuthProvider>
    </Router>
  );
}

export default App;
