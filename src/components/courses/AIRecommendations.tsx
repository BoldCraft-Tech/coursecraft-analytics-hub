
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import CourseGridWrapper from '@/components/courses/CourseGridWrapper';
import { courseService } from '@/services/api';
import { Sparkles } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface AIRecommendationsProps {
  interests?: string;
  level?: string;
}

const AIRecommendations = ({ interests, level }: AIRecommendationsProps) => {
  const [recommendations, setRecommendations] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchRecommendations = async (useAI = true) => {
    setLoading(true);
    try {
      // Prepare user preferences if user is logged in
      const userPreferences = user ? {
        userId: user.id,
        preferredLevel: level || 'Beginner',
        categories: [interests || 'Technology'],
        completedCategories: [] // This could be fetched from user history
      } : undefined;

      // Choose between AI and regular recommendations
      const data = useAI 
        ? await courseService.getAIRecommendations(interests, level, userPreferences)
        : await courseService.getRecommendations(interests, level);
      
      setRecommendations(data.recommendations || []);
      setMessage(data.message || 'Here are some recommended courses for you.');
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      toast({
        title: 'Error',
        description: 'Failed to load course recommendations',
        variant: 'destructive',
      });
      setRecommendations([]);
      setMessage('Unable to load recommendations at this time.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [interests, level, user]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Sparkles className="h-5 w-5 mr-2 text-amber-500" />
          AI Recommendations
        </CardTitle>
        <CardDescription>{message}</CardDescription>
      </CardHeader>
      <CardContent>
        <CourseGridWrapper 
          courses={recommendations}
          isLoading={loading}
          emptyMessage="No recommendations found. Try adjusting your preferences."
        />
        <div className="flex justify-center mt-6">
          <Button
            variant="outline"
            onClick={() => fetchRecommendations(false)}
            className="mr-2"
            disabled={loading}
          >
            Standard Recommendations
          </Button>
          <Button
            onClick={() => fetchRecommendations(true)}
            disabled={loading}
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            AI Recommendations
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIRecommendations;
