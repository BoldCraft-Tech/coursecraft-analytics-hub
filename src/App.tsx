
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
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/courses/:id" element={<CourseDetail />} />
        <Route path="/courses/:courseId/lessons/:lessonId" element={<LessonView />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/learning" element={<LearningDashboard />} />
        <Route path="/dashboard/courses" element={<MyCourses />} />
        <Route path="/dashboard/certificates" element={<MyCertificates />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/courses/:courseId/lessons" element={<AdminLessons />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;
