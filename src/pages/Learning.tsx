
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import AIRecommendations from '@/components/courses/AIRecommendations';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Bot, SendHorizontal } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

const Learning = () => {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'assistant', content: string }[]>([]);
  const [interests, setInterests] = useState<string>('');
  const [level, setLevel] = useState<string>('Beginner');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleMessageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    // Add user message to chat
    const userMessage = { role: 'user' as const, content: message };
    setChatHistory(prev => [...prev, userMessage]);
    
    setIsLoading(true);

    try {
      // Simplified AI processing - in a real app, this would call an AI endpoint
      // For now, we'll extract keywords from the message
      const extractedInterests = extractInterests(message);
      const extractedLevel = extractLevel(message);
      
      // Update state with extracted information
      if (extractedInterests) setInterests(extractedInterests);
      if (extractedLevel) setLevel(extractedLevel);
      
      // Create assistant response
      const responseText = generateResponse(extractedInterests, extractedLevel);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Add assistant response to chat
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

  // Helper function to extract interests from message
  const extractInterests = (text: string): string => {
    const categories = ['Technology', 'Agriculture', 'Business', 'Health', 'Education'];
    for (const category of categories) {
      if (text.toLowerCase().includes(category.toLowerCase())) {
        return category;
      }
    }
    return 'Technology'; // Default
  };

  // Helper function to extract level from message
  const extractLevel = (text: string): string => {
    const levels = ['Beginner', 'Intermediate', 'Advanced'];
    for (const level of levels) {
      if (text.toLowerCase().includes(level.toLowerCase())) {
        return level;
      }
    }
    return 'Beginner'; // Default
  };

  // Generate a response based on extracted info
  const generateResponse = (interests: string, level: string): string => {
    return `I've found some ${level} level courses in ${interests} that might interest you. Take a look at the recommendations below.`;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-16 md:pt-20 pb-8 md:pb-16 overflow-hidden">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-8">Personalized Learning</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
            {/* Chat component - stacked on mobile, side-by-side on desktop */}
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
            
            {/* Recommendations component - stacked on mobile, side-by-side on desktop */}
            <div className={`${isMobile ? 'order-1' : 'order-2'} lg:col-span-2`}>
              <AIRecommendations interests={interests} level={level} />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Learning;
