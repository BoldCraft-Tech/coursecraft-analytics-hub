
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import BlurredBackground from '@/components/ui/BlurredBackground';
import { ArrowRight } from 'lucide-react';

const Hero = () => {
  return (
    <BlurredBackground className="pt-24 pb-16 md:py-32">
      <div className="container px-4 mx-auto">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block mb-4">
            <div className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium animate-fade-in">
              Transforming Education in Rural Communities
            </div>
          </div>
          <h1 className="mb-6 animate-slide-down opacity-0" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
            <span className="block font-medium leading-tight">
              Education Without <span className="text-gradient">Boundaries</span>
            </span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-slide-down opacity-0" style={{ animationDelay: '0.4s', animationFillMode: 'forwards' }}>
            Access world-class education designed specifically for rural communities. Learn practical skills, gain valuable knowledge, and connect with a global community.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-slide-down opacity-0" style={{ animationDelay: '0.6s', animationFillMode: 'forwards' }}>
            <Link to="/courses">
              <Button size="lg" className="button-animation w-full sm:w-auto">
                Explore Courses
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/about">
              <Button variant="outline" size="lg" className="button-animation w-full sm:w-auto">
                Learn More
              </Button>
            </Link>
          </div>
          
          {/* Dashboard Preview */}
          <div className="relative mx-auto max-w-4xl animate-scale-in opacity-0" style={{ animationDelay: '0.8s', animationFillMode: 'forwards' }}>
            <div className="relative overflow-hidden rounded-xl border border-border shadow-glass">
              <div className="absolute inset-0 bg-gradient-to-b from-background/0 to-background/40"></div>
              
              {/* Placeholder Image */}
              <div className="aspect-[16/9] bg-gradient-to-br from-white to-gray-100 dark:from-gray-900 dark:to-black flex items-center justify-center">
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-4/5 p-6 glass-panel rounded-xl">
                    <div className="flex justify-between items-center mb-4">
                      <div className="space-y-1">
                        <h3 className="text-lg font-medium">My Learning Dashboard</h3>
                        <p className="text-sm text-muted-foreground">Continue where you left off</p>
                      </div>
                      <div className="flex space-x-2">
                        <div className="w-10 h-10 rounded-full bg-primary/20"></div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="bg-white dark:bg-black/60 rounded-lg p-4 shadow-subtle">
                        <div className="text-3xl font-medium">7</div>
                        <div className="text-sm text-muted-foreground">Courses</div>
                      </div>
                      <div className="bg-white dark:bg-black/60 rounded-lg p-4 shadow-subtle">
                        <div className="text-3xl font-medium">24</div>
                        <div className="text-sm text-muted-foreground">Hours</div>
                      </div>
                      <div className="bg-white dark:bg-black/60 rounded-lg p-4 shadow-subtle">
                        <div className="text-3xl font-medium">3</div>
                        <div className="text-sm text-muted-foreground">Certificates</div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="bg-white dark:bg-black/60 rounded-lg p-4 shadow-subtle flex">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg mr-4"></div>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <h4 className="font-medium">Sustainable Farming Techniques</h4>
                            <span className="text-sm text-primary">64%</span>
                          </div>
                          <div className="h-1.5 bg-secondary rounded-full mt-2 overflow-hidden">
                            <div className="h-full bg-primary rounded-full" style={{ width: '64%' }}></div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-white dark:bg-black/60 rounded-lg p-4 shadow-subtle flex">
                        <div className="w-12 h-12 bg-blue-500/10 rounded-lg mr-4"></div>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <h4 className="font-medium">Digital Marketing Basics</h4>
                            <span className="text-sm text-primary">32%</span>
                          </div>
                          <div className="h-1.5 bg-secondary rounded-full mt-2 overflow-hidden">
                            <div className="h-full bg-primary rounded-full" style={{ width: '32%' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="absolute -bottom-4 inset-x-0 h-20 bg-gradient-to-t from-background to-transparent z-10"></div>
          </div>
        </div>
      </div>
    </BlurredBackground>
  );
};

export default Hero;
