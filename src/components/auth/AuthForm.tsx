
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { useAuth } from '@/hooks/useAuth';

interface AuthFormProps {
  type: 'signin' | 'signup';
}

const signinSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type SigninValues = z.infer<typeof signinSchema>;
type SignupValues = z.infer<typeof signupSchema>;

const AuthForm = ({ type }: AuthFormProps) => {
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  
  const signinForm = useForm<SigninValues>({
    resolver: zodResolver(signinSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const signupForm = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  const onSignin = async (values: SigninValues) => {
    setLoading(true);
    try {
      await signIn(values.email, values.password);
    } finally {
      setLoading(false);
    }
  };

  const onSignup = async (values: SignupValues) => {
    setLoading(true);
    try {
      await signUp(values.email, values.password, values.name);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="p-6 bg-card rounded-lg border border-border shadow-sm">
        {type === 'signin' ? (
          <Form {...signinForm}>
            <form onSubmit={signinForm.handleSubmit(onSignin)} className="space-y-6">
              <FormField
                control={signinForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="your@email.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={signinForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <span className="flex items-center">
                    <span className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-background border-t-transparent"></span>
                    Signing in...
                  </span>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>
          </Form>
        ) : (
          <Form {...signupForm}>
            <form onSubmit={signupForm.handleSubmit(onSignup)} className="space-y-6">
              <FormField
                control={signupForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={signupForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="your@email.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={signupForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <span className="flex items-center">
                    <span className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-background border-t-transparent"></span>
                    Creating account...
                  </span>
                ) : (
                  'Sign Up'
                )}
              </Button>
            </form>
          </Form>
        )}
      </div>
      
      <div className="text-center mt-6">
        {type === 'signin' ? (
          <p className="text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary hover:underline">
              Sign up
            </Link>
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/signin" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default AuthForm;
