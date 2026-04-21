import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { LogIn } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import AuthService from '@/services/authApi';

export default function LoginForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const response = await AuthService.loginApi(formData.email, formData.password);
    console.log(response);

    // on success of the apicall nevigate to dashboard page
    if (response.success) {
      navigate('/dashboard');
    } else {
      setError(response.message || 'Something went wrong');
    }
    // store the tokens in local storage
    localStorage.setItem('accessToken', response.data.auth.accessToken);
    localStorage.setItem('refreshToken', response.data.auth.refreshToken);
    localStorage.setItem('loggedInUserName', response.data.user.name);
    localStorage.setItem("loggedInUserID", response.data.user.userID);
  };

  return (
    <Card className="border-none shadow-none md:border md:shadow-sm">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold tracking-tight">Welcome back</CardTitle>
        <CardDescription>Enter your email and password to sign in to your account</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">

          {error && (
            <div className="p-3 text-sm text-destructive bg-muted border border-border rounded-md font-medium">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              required
              className="transition-all focus:ring-primary"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link
                to="/forgot-password"
                className="text-sm text-primary hover:underline font-medium"
              >
                Forgot password?
              </Link>
            </div>
            <PasswordInput
              id="password"
              required
              className="transition-all focus:ring-primary"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button
            type="submit"
            className="w-full font-medium h-11 transition-transform active:scale-[0.98]"
          >
            <LogIn className="mr-2 h-4 w-4" /> Sign In
          </Button>
          <div className="text-center text-sm text-muted-foreground w-full">
            Don't have an account?{' '}
            <Link to="/signup" className="font-semibold text-primary hover:underline">
              Sign up
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
