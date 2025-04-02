
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import AIRecommendations from '@/components/courses/AIRecommendations';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Bot, SendHorizontal, Search, Sparkles } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import CourseGrid from '@/components/courses/CourseGrid';
import { supabase } from '@/integrations/supabase/client';

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
  const [useAI, setUseAI] = useState(true);
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

  useEffect(() => {
    if (searchPerformed && message && !useAI) {
      searchCoursesByKeywords(keywords);
    }
  }, [keywords, searchPerformed, useAI]);

  const searchCoursesByKeywords = async (searchKeywords: string[]) => {
    if (!searchKeywords.length) return;
    
    setIsLoadingCourses(true);
    try {
      console.log('Searching for courses with keywords:', searchKeywords);
      
      const detectedLevel = extractLevel(searchKeywords.join(' '));
      console.log('Detected level from keywords:', detectedLevel);
      
      let query = supabase
        .from('courses')
        .select('*');
      
      if (detectedLevel) {
        query = query.eq('level', detectedLevel);
        console.log('Filtering courses by level:', detectedLevel);
      }
      
      const { data: courses, error } = await query;
        
      if (error) throw error;
      
      if (!courses || courses.length === 0) {
        console.log('No courses found matching the level filter');
        setMatchedCourses([]);
        setIsLoadingCourses(false);
        return;
      }
      
      if (detectedLevel) {
        console.log(`Found ${courses.length} courses matching ${detectedLevel} level`);
        
        const nonLevelKeywords = searchKeywords.filter(keyword => {
          const lowerKeyword = keyword.toLowerCase();
          return !Object.values(LEVEL_KEYWORDS).flat().some(levelWord => 
            lowerKeyword.includes(levelWord.toLowerCase())
          );
        });
        
        if (nonLevelKeywords.length > 0) {
          console.log('Further filtering by non-level keywords:', nonLevelKeywords);
          
          const filteredResults = courses.filter(course => {
            return nonLevelKeywords.some(keyword => 
              course.title.toLowerCase().includes(keyword.toLowerCase()) ||
              course.description.toLowerCase().includes(keyword.toLowerCase()) ||
              course.category.toLowerCase().includes(keyword.toLowerCase())
            );
          });
          
          console.log(`Found ${filteredResults.length} courses after additional keyword filtering`);
          setMatchedCourses(filteredResults.length > 0 ? filteredResults : courses);
        } else {
          setMatchedCourses(courses);
        }
      } else {
        const lowerKeywords = searchKeywords.map(kw => kw.toLowerCase());
        
        const matchedResults = courses.filter(course => {
          return lowerKeywords.some(keyword => 
            course.title.toLowerCase().includes(keyword) ||
            course.description.toLowerCase().includes(keyword) ||
            course.category.toLowerCase().includes(keyword) ||
            course.level.toLowerCase().includes(keyword)
          );
        });
        
        console.log(`Found ${matchedResults.length} courses matching general keywords`);
        setMatchedCourses(matchedResults);
      }
    } catch (error) {
      console.error('Error searching courses:', error);
      toast({
        title: 'Error',
        description: 'Could not search for courses. Please try again.',
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
      if (useAI) {
        // Use the AI assistant for more intelligent responses
        await handleAIAssistant(message);
      } else {
        // Use the original keyword-based search
        const extractedKeywords = extractKeywords(message);
        setKeywords(prev => [...prev, ...extractedKeywords]);
        
        const extractedInterests = extractInterests(message);
        const extractedLevel = extractLevel(message);
        
        if (extractedInterests) setInterests(extractedInterests);
        if (extractedLevel) setLevel(extractedLevel);
        
        setSearchPerformed(true);
        
        await searchCoursesByKeywords(extractedKeywords);
        
        let responseText = '';
        if (matchedCourses.length > 0) {
          responseText = `I found ${matchedCourses.length} courses that match your keywords. Take a look at these courses related to ${extractedInterests || 'your interests'}!`;
        } else {
          responseText = `I couldn't find exact matches for "${message}", but here are some ${extractedInterests || 'recommended'} courses at ${extractedLevel || 'your'} level that might interest you.`;
        }
        
        await new Promise(resolve => setTimeout(resolve, 800));
        
        setChatHistory(prev => [...prev, { role: 'assistant', content: responseText }]);
      }
    } catch (error) {
      console.error('Error processing message:', error);
      toast({
        title: 'Error',
        description: 'Failed to process your message. Please try again.',
        variant: 'destructive',
      });
      
      setChatHistory(prev => [...prev, { 
        role: 'assistant', 
        content: "I'm sorry, I encountered an error while processing your request. Please try again or contact support if the issue persists." 
      }]);
    } finally {
      setIsLoading(false);
      setMessage('');
    }
  };

  const handleAIAssistant = async (userMessage: string) => {
    setSearchPerformed(true);
    setIsLoadingCourses(true);
    
    try {
      const response = await supabase.functions.invoke('learning-assistant', {
        body: { message: userMessage, chatHistory },
      });
      
      // Even if there's an error in the edge function, it will now return a 200 status
      // with an error field in the response, so we don't need to check for response.error
      const { response: aiResponse, recommendedCourses, error } = response.data;
      
      if (error) {
        console.warn('AI assistant warning:', error);
        toast({
          title: 'AI Assistant',
          description: 'Using basic mode due to AI service limitations.',
          variant: 'default',
        });
      }
      
      // Update chat with AI response
      setChatHistory(prev => [...prev, { 
        role: 'assistant', 
        content: aiResponse 
      }]);
      
      // Update matched courses with AI recommendations
      if (recommendedCourses && recommendedCourses.length > 0) {
        setMatchedCourses(recommendedCourses);
      } else {
        // If no specific courses were recommended, fallback to keyword search
        const extractedKeywords = extractKeywords(userMessage);
        await searchCoursesByKeywords(extractedKeywords);
      }
    } catch (error) {
      console.error('Error with AI assistant:', error);
      toast({
        title: 'AI Assistant Error',
        description: 'Switching to basic mode. Try again later.',
        variant: 'destructive',
      });
      
      // Add fallback response to chat
      setChatHistory(prev => [...prev, { 
        role: 'assistant', 
        content: "I'm experiencing technical difficulties. Let me help you with basic course matching instead." 
      }]);
      
      // Switch to basic mode
      setUseAI(false);
      
      // Fallback to keyword search
      const extractedKeywords = extractKeywords(userMessage);
      setKeywords(prev => [...prev, ...extractedKeywords]);
      await searchCoursesByKeywords(extractedKeywords);
    } finally {
      setIsLoadingCourses(false);
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
    return ''; // Return empty string instead of default to enable more precise filtering
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
    return ''; // Return empty string instead of default to enable more precise filtering
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
                  <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center text-xl">
                      {useAI ? (
                        <>
                          <Sparkles className="h-5 w-5 mr-2 text-primary" />
                          AI Learning Assistant
                        </>
                      ) : (
                        <>
                          <Bot className="h-5 w-5 mr-2 text-primary" />
                          Learning Assistant
                        </>
                      )}
                    </CardTitle>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setUseAI(!useAI)}
                      className="text-xs"
                    >
                      {useAI ? "Switch to Basic" : "Switch to AI"}
                    </Button>
                  </div>
                  <CardDescription>
                    {useAI 
                      ? "Ask me anything about courses or learning topics" 
                      : "Ask me about courses you're interested in"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col h-[350px] md:h-[450px] lg:h-[500px]">
                  <div className="flex-grow mb-4 overflow-y-auto max-h-full space-y-4 bg-muted/50 rounded-lg p-3 scrollbar-hide">
                    {chatHistory.length === 0 ? (
                      <div className="text-center py-6 text-muted-foreground">
                        {useAI ? (
                          <>
                            <Sparkles className="h-12 w-12 mx-auto mb-2 text-muted-foreground/50" />
                            <p className="text-sm md:text-base">Hello! I'm your AI learning assistant.</p>
                            <p className="text-sm md:text-base">Ask me anything about courses or learning topics!</p>
                          </>
                        ) : (
                          <>
                            <Bot className="h-12 w-12 mx-auto mb-2 text-muted-foreground/50" />
                            <p className="text-sm md:text-base">Hi! I can help you find the perfect courses.</p>
                            <p className="text-sm md:text-base">Try asking about a topic you're interested in.</p>
                          </>
                        )}
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
                      placeholder={useAI 
                        ? "Ask about anything related to learning..." 
                        : "Ask about courses or topics..."}
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
                      {isLoadingCourses 
                        ? "Searching for the best courses for you..." 
                        : matchedCourses.length > 0 
                          ? `Found ${matchedCourses.length} courses that might interest you`
                          : "No specific courses found for your query"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <CourseGrid 
                      courses={matchedCourses}
                      loading={isLoadingCourses}
                      emptyMessage="No courses found matching your request. Try different keywords or topics."
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
