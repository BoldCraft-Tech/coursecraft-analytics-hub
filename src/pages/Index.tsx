
import { useEffect, useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Hero from '@/components/home/Hero';
import Features from '@/components/home/Features';
import Testimonials from '@/components/home/Testimonials';
import CallToAction from '@/components/home/CallToAction';
import AIRecommendations from '@/components/courses/AIRecommendations';
import { courseService } from '@/services/api';

const Index = () => {
  const [courses, setCourses] = useState([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await courseService.getAllCourses();
        setCourses(data.slice(0, 6)); // Get first 6 courses for featured section
      } catch (error) {
        console.error('Error fetching courses:', error);
        toast({
          title: 'Error',
          description: 'Failed to load courses',
          variant: 'destructive',
        });
      }
    };

    fetchCourses();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Hero />
        <Features />
        
        <section className="py-16 bg-gray-50">
          <div className="container px-4 mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Personalized Learning Recommendations</h2>
            <AIRecommendations />
          </div>
        </section>
        
        <Testimonials />
        <CallToAction />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
