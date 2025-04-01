
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

const Learning = () => {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'assistant', content: string }[]>([]);
  const [interests, setInterests] = useState<string>('');
  const [level, setLevel] = useState<string>('Beginner');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

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
      <main className="flex-grow pt-20 pb-16">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8">Personalized Learning</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Bot className="h-5 w-5 mr-2 text-primary" />
                    Learning Assistant
                  </CardTitle>
                  <CardDescription>
                    Ask me about courses or topics you're interested in
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col h-full">
                  <div className="flex-grow mb-4 overflow-y-auto max-h-[400px] space-y-4 bg-muted/50 rounded-lg p-4">
                    {chatHistory.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Bot className="h-12 w-12 mx-auto mb-2 text-muted-foreground/50" />
                        <p>Hi! I can help you find the perfect courses.</p>
                        <p>Try asking about a topic you're interested in.</p>
                      </div>
                    ) : (
                      chatHistory.map((msg, index) => (
                        <div
                          key={index}
                          className={`p-3 rounded-lg ${
                            msg.role === 'user'
                              ? 'bg-primary text-primary-foreground ml-12'
                              : 'bg-muted mr-12'
                          }`}
                        >
                          {msg.content}
                        </div>
                      ))
                    )}
                  </div>
                  <form onSubmit={handleMessageSubmit} className="flex gap-2">
                    <Textarea
                      placeholder="Ask about courses or topics..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="min-h-[60px] flex-grow"
                    />
                    <Button
                      type="submit"
                      size="icon"
                      disabled={isLoading || !message.trim()}
                      className="h-auto"
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
            
            <div className="lg:col-span-2">
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
