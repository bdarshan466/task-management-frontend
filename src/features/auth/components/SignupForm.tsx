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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UserPlus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { signUpApi } from '@/services/authApi';

export default function SignupForm() {
  const navigate = useNavigate();

  const [signUpFormData, setSignUpFormData] = useState({
    name: '',
    email: '',
    role: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // API Call goes here
    console.log('Signup logic triggered');

    const response = await signUpApi(
      signUpFormData.name,
      signUpFormData.email,
      signUpFormData.role,
      signUpFormData.password
    );

    // if user signup successfully then nevigate it to login page
    if (response.success) {
      navigate('/login');
    }
  };

  return (
    <Card className="border-none shadow-none md:border md:shadow-sm">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold tracking-tight">Create an account</CardTitle>
        <CardDescription>Enter your information below to create your account</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              required
              className="transition-all focus:ring-primary"
              value={signUpFormData.name}
              onChange={(e) => setSignUpFormData({ ...signUpFormData, name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              required
              className="transition-all focus:ring-primary"
              value={signUpFormData.email}
              onChange={(e) => setSignUpFormData({ ...signUpFormData, email: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select
              required
              value={signUpFormData.role}
              onValueChange={(value) =>
                setSignUpFormData({
                  ...signUpFormData,
                  role: value || '',
                })
              }
            >
              <SelectTrigger id="role" className="w-full transition-all focus:ring-primary">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="user">User</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <PasswordInput
              id="password"
              required
              className="transition-all focus:ring-primary"
              value={signUpFormData.password}
              onChange={(e) => setSignUpFormData({ ...signUpFormData, password: e.target.value })}
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button
            type="submit"
            className="w-full font-medium h-11 transition-transform active:scale-[0.98]"
          >
            <UserPlus className="mr-2 h-4 w-4" /> Sign Up
          </Button>
          <div className="text-center text-sm text-muted-foreground w-full">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-primary hover:underline">
              Sign in
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
