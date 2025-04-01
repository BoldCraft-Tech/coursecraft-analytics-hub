
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import AIRecommendations from '@/components/courses/AIRecommendations';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Bot, SendHorizontal, Search } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import CourseGrid from '@/components/courses/CourseGrid';
import { courseService } from '@/services/api';

const CATEGORY_KEYWORDS = {
  Technology: ['technology', 'tech', 'software', 'coding', 'programming', 'computer', 'digital', 'web', 'app', 'mobile', 'data', 'online', 'internet', 'it'],
  Agriculture: ['agriculture', 'farming', 'crop', 'farm', 'soil', 'plant', 'harvest', 'livestock', 'organic', 'sustainable', 'garden', 'seed', 'irrigation'],
  Business: ['business', 'entrepreneur', 'marketing', 'finance', 'management', 'startup', 'sales', 'money', 'profit', 'market', 'company', 'commerce', 'trade'],
  Health: ['health', 'medical', 'healthcare', 'medicine', 'wellness', 'nutrition', 'fitness', 'diet', 'mental health', 'physical', 'therapy', 'disease'],
  Education: ['education', 'learning', 'teach', 'school', 'academic', 'study', 'course', 'knowledge', 'training', 'skill', 'lesson', 'learn']
};

const LEVEL_KEYWORDS = {
  Beginner: ['beginner', 'basic', 'fundamental', 'introduction', 'start', 'new', 'novice', 'elementary', 'first time', 'starting out', 'entry'],
  Intermediate: ['intermediate', 'middle', 'moderate', 'average', 'some experience', 'familiar', 'practiced'],
  Advanced: ['advanced', 'expert', 'professional', 'experienced', 'proficient', 'specialized', 'master', 'high level', 'in-depth']
};

const Learning = () => {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'assistant', content: string }[]>([]);
  const [interests, setInterests] = useState<string>('');
  const [level, setLevel] = useState<string>('Beginner');
  const [keywords, setKeywords] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [matchedCourses, setMatchedCourses] = useState<any[]>([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (keywords.length > 0) {
      const extractedInterests = extractInterests(keywords.join(' '));
      const extractedLevel = extractLevel(keywords.join(' '));
      
      if (extractedInterests) setInterests(extractedInterests);
      if (extractedLevel) setLevel(extractedLevel);
    }
  }, [keywords]);

  // Fetch courses when interests or level change and a search has been performed
  useEffect(() => {
    if (searchPerformed && (interests || level)) {
      fetchMatchingCourses();
    }
  }, [interests, level, searchPerformed]);

  const fetchMatchingCourses = async () => {
    setIsLoadingCourses(true);
    try {
      const data = await courseService.getAIRecommendations(interests, level);
      if (data && data.recommendations) {
        setMatchedCourses(data.recommendations);
      }
    } catch (error) {
      console.error('Error fetching courses based on chat:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch matching courses. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingCourses(false);
    }
  };

  const handleMessageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const userMessage = { role: 'user' as const, content: message };
    setChatHistory(prev => [...prev, userMessage]);
    
    setIsLoading(true);

    try {
      const extractedKeywords = extractKeywords(message);
      setKeywords(prev => [...prev, ...extractedKeywords]);
      
      const extractedInterests = extractInterests(message);
      const extractedLevel = extractLevel(message);
      
      if (extractedInterests) setInterests(extractedInterests);
      if (extractedLevel) setLevel(extractedLevel);
      
      setSearchPerformed(true);
      
      const responseText = generateResponse(extractedInterests, extractedLevel, extractedKeywords);
      
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setChatHistory(prev => [...prev, { role: 'assistant', content: responseText }]);
    } catch (error) {
      console.error('Error processing message:', error);
      toast({
        title: 'Error',
        description: 'Failed to process your message. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      setMessage('');
    }
  };

  const extractKeywords = (text: string): string[] => {
    const lowerText = text.toLowerCase();
    
    const words = lowerText.split(/\s+/);
    const phrases = [];
    
    for (let i = 0; i < words.length; i++) {
      phrases.push(words[i]);
      if (i + 1 < words.length) phrases.push(`${words[i]} ${words[i + 1]}`);
      if (i + 2 < words.length) phrases.push(`${words[i]} ${words[i + 1]} ${words[i + 2]}`);
    }
    
    const stopWords = ['the', 'and', 'or', 'in', 'on', 'at', 'to', 'for', 'with', 'about', 'is', 'are', 'was', 'were', 'be', 'been'];
    const filteredKeywords = phrases.filter(word => 
      word.length > 2 && !stopWords.includes(word)
    );
    
    return [...new Set(filteredKeywords)];
  };

  const extractInterests = (text: string): string => {
    const lowerText = text.toLowerCase();
    
    for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
      for (const keyword of keywords) {
        if (lowerText.includes(keyword.toLowerCase())) {
          return category;
        }
      }
    }
    return 'Technology'; // Default
  };

  const extractLevel = (text: string): string => {
    const lowerText = text.toLowerCase();
    
    for (const [level, keywords] of Object.entries(LEVEL_KEYWORDS)) {
      for (const keyword of keywords) {
        if (lowerText.includes(keyword.toLowerCase())) {
          return level;
        }
      }
    }
    return 'Beginner'; // Default
  };

  const generateResponse = (interests: string, level: string, keywords: string[]): string => {
    let response = `I've found some ${level} level courses in ${interests} that might interest you.`;
    
    if (keywords.length > 0) {
      const keywordPreview = keywords.slice(0, 3).join(', ');
      response += ` Based on keywords like "${keywordPreview}", I've tailored these recommendations for you.`;
    }
    
    response += " Take a look at the courses below.";
    return response;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-16 md:pt-20 pb-8 md:pb-16 overflow-hidden">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-8">Personalized Learning</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
            <div className={`${isMobile ? 'order-2' : 'order-1'} lg:col-span-1`}>
              <Card className="h-full shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center text-xl">
                    <Bot className="h-5 w-5 mr-2 text-primary" />
                    Learning Assistant
                  </CardTitle>
                  <CardDescription>
                    Ask me about courses you're interested in
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col h-[350px] md:h-[450px] lg:h-[500px]">
                  <div className="flex-grow mb-4 overflow-y-auto max-h-full space-y-4 bg-muted/50 rounded-lg p-3 scrollbar-hide">
                    {chatHistory.length === 0 ? (
                      <div className="text-center py-6 text-muted-foreground">
                        <Bot className="h-12 w-12 mx-auto mb-2 text-muted-foreground/50" />
                        <p className="text-sm md:text-base">Hi! I can help you find the perfect courses.</p>
                        <p className="text-sm md:text-base">Try asking about a topic you're interested in.</p>
                      </div>
                    ) : (
                      chatHistory.map((msg, index) => (
                        <div
                          key={index}
                          className={`p-3 rounded-lg text-sm md:text-base break-words ${
                            msg.role === 'user'
                              ? 'bg-primary text-primary-foreground ml-8 md:ml-12'
                              : 'bg-muted mr-8 md:mr-12'
                          }`}
                        >
                          {msg.content}
                        </div>
                      ))
                    )}
                  </div>
                  <form onSubmit={handleMessageSubmit} className="flex gap-2 mt-auto">
                    <Textarea
                      placeholder="Ask about courses or topics..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="min-h-[60px] flex-grow resize-none text-sm md:text-base"
                      maxLength={500}
                    />
                    <Button
                      type="submit"
                      size="icon"
                      disabled={isLoading || !message.trim()}
                      className="h-auto"
                      aria-label="Send message"
                    >
                      {isLoading ? (
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      ) : (
                        <SendHorizontal className="h-5 w-5" />
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
            
            <div className={`${isMobile ? 'order-1' : 'order-2'} lg:col-span-2`}>
              {searchPerformed ? (
                <Card className="shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center text-xl">
                      <Search className="h-5 w-5 mr-2 text-primary" />
                      Courses For You
                    </CardTitle>
                    <CardDescription>
                      {matchedCourses.length > 0 
                        ? `Found ${matchedCourses.length} ${interests ? interests : ''} courses ${level ? `for ${level} level` : ''}`
                        : 'Searching for matching courses...'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <CourseGrid 
                      courses={matchedCourses}
                      loading={isLoadingCourses}
                      emptyMessage="No courses found matching your request. Try a different topic or level."
                    />
                  </CardContent>
                </Card>
              ) : (
                <AIRecommendations interests={interests} level={level} />
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Learning;
