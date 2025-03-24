
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import BlurredBackground from '@/components/ui/BlurredBackground';

const CallToAction = () => {
  return (
    <BlurredBackground className="py-20">
      <div className="container px-4 mx-auto">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="mb-4">Start Your Learning Journey Today</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of learners from rural communities around the world who are transforming their lives through education.
          </p>
          
          <div className="glass-card p-8 rounded-xl mb-8 flex flex-col sm:flex-row justify-between items-center gap-6">
            <div className="flex-1 text-left">
              <h3 className="text-xl font-medium mb-2">Free Access for 7 Days</h3>
              <p className="text-muted-foreground text-sm">
                Explore all courses, features, and resources with no commitment.
              </p>
            </div>
            <Link to="/signup">
              <Button size="lg" className="button-animation w-full sm:w-auto">
                Sign Up for Free
              </Button>
            </Link>
          </div>
          
          <div className="glass-card p-8 rounded-xl flex flex-col sm:flex-row justify-between items-center gap-6">
            <div className="flex-1 text-left">
              <h3 className="text-xl font-medium mb-2">Scholarship Program</h3>
              <p className="text-muted-foreground text-sm">
                We offer scholarships to eligible students from underprivileged backgrounds.
              </p>
            </div>
            <Link to="/scholarships">
              <Button variant="outline" size="lg" className="button-animation w-full sm:w-auto">
                Apply Now
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </BlurredBackground>
  );
};

export default CallToAction;
