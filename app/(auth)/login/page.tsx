'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginInput } from '@/lib/validations';
import { useAuthStore } from '@/lib/store/use-auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Hotel, Lock, Mail, AlertCircle, CheckCircle, ShieldCheck, Sparkles, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading: authLoading, error: authError, clearError } = useAuthStore();
  const [successMsg, setSuccessMsg] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: true,
    },
  });

  const onSubmit = async (data: LoginInput) => {
    clearError();
    setSuccessMsg('');
    try {
      await login(data.email, data.password, data.rememberMe);
      setSuccessMsg('Authentication successful! Redirecting to dashboard...');
      setTimeout(() => {
        router.push('/');
      }, 600);
    } catch (e) {
      // Error is caught and stored in authError
    }
  };

  const fillDemoAccount = (email: string, pass: string) => {
    setValue('email', email);
    setValue('password', pass);
    clearError();
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Decorative Himalayan Silhouette & Glows */}
      <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-sky-500/15 blur-3xl pointer-events-none" />
      
      <div className="w-full max-w-md relative z-10 animate-in fade-in-50 zoom-in-95 duration-300">
        {/* Brand Header */}
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0f172a] shadow-lg shadow-black/50 mb-3 ring-4 ring-white/10">
            <img src="/logo.png" alt="Logo" className="h-10 w-10 object-contain" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Gajagamini Resort
          </h1>
          <p className="text-xs font-semibold tracking-widest text-blue-300/80 uppercase mt-1">
            Enterprise Hotel & Quotation Portal
          </p>
        </div>

        <Card className="border-slate-800/80 bg-white/95 dark:bg-slate-900/95 shadow-2xl backdrop-blur-md">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">Sign In to Portal</CardTitle>
            <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
              Enter your credentials to manage bookings, rooms, and billing.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Error Message Alert */}
            {authError && (
              <div className="flex items-start gap-2 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 p-3 text-xs text-red-600 dark:text-red-400 animate-in fade-in-50">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{authError}</span>
              </div>
            )}

            {/* Success Message Alert */}
            {successMsg && (
              <div className="flex items-center gap-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 p-3 text-xs font-semibold text-emerald-700 dark:text-emerald-400 animate-in fade-in-50">
                <CheckCircle className="h-4 w-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@gmail.com"
                    className="pl-9 h-10 bg-slate-50/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 font-medium"
                    {...register('email')}
                  />
                </div>
                {errors.email && <p className="text-[11px] font-medium text-red-500">{errors.email.message}</p>}
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Password
                  </Label>
                  <Link
                    href="/forgot"
                    className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-9 h-10 bg-slate-50/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 font-medium"
                    {...register('password')}
                  />
                </div>
                {errors.password && <p className="text-[11px] font-medium text-red-500">{errors.password.message}</p>}
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <Checkbox id="rememberMe" defaultChecked {...register('rememberMe')} />
                <label
                  htmlFor="rememberMe"
                  className="text-xs font-medium text-slate-600 dark:text-slate-400 leading-none cursor-pointer select-none"
                >
                  Remember session on this device
                </label>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting || authLoading}
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-500/20 transition-all text-sm flex items-center justify-center gap-2 mt-2"
              >
                {isSubmitting || authLoading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Portal</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>

          {/* Demo Accounts Panel */}
          <CardFooter className="flex flex-col gap-3 rounded-b-lg bg-slate-50 dark:bg-slate-900/60 p-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider w-full justify-center">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span>Instant Demo Accounts</span>
            </div>
            <div className="grid grid-cols-2 gap-2 w-full">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fillDemoAccount('admin@gmail.com', 'admin123')}
                className="flex flex-col items-start p-2 h-auto border-blue-200 dark:border-blue-900/50 hover:bg-blue-50 dark:hover:bg-blue-950/30 text-left"
              >
                <div className="flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400">
                  <ShieldCheck className="h-3.5 w-3.5" /> Admin Role
                </div>
                <div className="text-[10px] text-slate-500 truncate w-full">admin@gmail.com</div>
              </Button>
              
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fillDemoAccount('manager@gajagamini.com', 'demo1234')}
                className="flex flex-col items-start p-2 h-auto border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-left"
              >
                <div className="flex items-center gap-1 text-xs font-bold text-slate-700 dark:text-slate-300">
                  <Hotel className="h-3.5 w-3.5" /> Manager Role
                </div>
                <div className="text-[10px] text-slate-500 truncate w-full">manager@gajagamini.com</div>
              </Button>
            </div>
            <div className="text-[10px] text-center text-slate-400 dark:text-slate-500 w-full pt-1">
              Admin Password: <strong className="font-mono text-slate-600 dark:text-slate-400">admin123</strong>
            </div>
          </CardFooter>
        </Card>

        <div className="mt-6 text-center text-[11px] text-slate-400 dark:text-slate-500">
          © {new Date().getFullYear()} Gajagamini Forest Resort. All rights reserved.
        </div>
      </div>
    </div>
  );
}
