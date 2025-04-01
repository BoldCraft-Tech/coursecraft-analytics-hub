
import { Link } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import AuthForm from '@/components/auth/AuthForm';
import BlurredBackground from '@/components/ui/BlurredBackground';

const SignUp = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-20">
        <BlurredBackground className="py-20">
          <div className="container px-4 mx-auto">
            <div className="max-w-md mx-auto text-center mb-8">
              <h1 className="mb-4">Sign Up</h1>
              <p className="text-muted-foreground">
                Join thousands of learners from rural communities around the world
              </p>
            </div>
            
            <AuthForm type="signup" />
            
            <div className="max-w-md mx-auto mt-6 text-center text-sm text-muted-foreground">
              <p>By signing up, you'll automatically be logged in and can start exploring courses right away.</p>
            </div>
          </div>
        </BlurredBackground>
      </main>
      <Footer />
    </div>
  );
};

export default SignUp;
