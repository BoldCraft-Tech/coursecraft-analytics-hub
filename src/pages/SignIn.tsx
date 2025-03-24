
import { Link } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import AuthForm from '@/components/auth/AuthForm';
import BlurredBackground from '@/components/ui/BlurredBackground';

const SignIn = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-20">
        <BlurredBackground className="py-20">
          <div className="container px-4 mx-auto">
            <div className="max-w-md mx-auto text-center mb-8">
              <h1 className="mb-4">Sign In</h1>
              <p className="text-muted-foreground">
                Welcome back! Sign in to continue your learning journey
              </p>
            </div>
            
            <AuthForm type="signin" />
          </div>
        </BlurredBackground>
      </main>
      <Footer />
    </div>
  );
};

export default SignIn;
