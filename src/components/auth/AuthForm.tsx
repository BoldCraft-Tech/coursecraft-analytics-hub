
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { EyeIcon, EyeOffIcon } from 'lucide-react';

interface AuthFormProps {
  type: 'signin' | 'signup';
}

const AuthForm = ({ type }: AuthFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ email, password, name });
    // Authentication logic would go here
  };
  
  return (
    <div className="glass-panel p-8 rounded-xl w-full max-w-md mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-medium">
          {type === 'signin' ? 'Welcome back' : 'Create your account'}
        </h2>
        <p className="text-muted-foreground mt-1">
          {type === 'signin' 
            ? 'Sign in to access your account' 
            : 'Start your learning journey today'}
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {type === 'signup' && (
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input 
              id="name"
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full"
            />
          </div>
        )}
        
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input 
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full"
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="password">Password</Label>
            {type === 'signin' && (
              <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                Forgot password?
              </Link>
            )}
          </div>
          <div className="relative">
            <Input 
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder={type === 'signin' ? 'Enter your password' : 'Create a password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full pr-10"
            />
            <button 
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <EyeOffIcon className="h-4 w-4" />
              ) : (
                <EyeIcon className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
        
        {type === 'signup' && (
          <div className="flex items-center space-x-2">
            <Checkbox id="terms" />
            <label
              htmlFor="terms"
              className="text-sm text-muted-foreground leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              I agree to the{' '}
              <Link to="/terms" className="text-primary hover:underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </Link>
            </label>
          </div>
        )}
        
        <Button type="submit" className="w-full button-animation">
          {type === 'signin' ? 'Sign In' : 'Create Account'}
        </Button>
      </form>
      
      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
          </div>
        </div>
        
        <div className="mt-4 grid grid-cols-2 gap-4">
          <Button variant="outline" className="w-full button-animation">
            <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
              <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
            </svg>
            Google
          </Button>
          <Button variant="outline" className="w-full button-animation">
            <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="apple" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
              <path fill="currentColor" d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"></path>
            </svg>
            Apple
          </Button>
        </div>
      </div>
      
      <div className="mt-6 text-center text-sm">
        {type === 'signin' ? (
          <p className="text-muted-foreground">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary font-medium hover:underline">
              Sign up
            </Link>
          </p>
        ) : (
          <p className="text-muted-foreground">
            Already have an account?{' '}
            <Link to="/signin" className="text-primary font-medium hover:underline">
              Sign in
            </Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default AuthForm;
