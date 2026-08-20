'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { forgotPasswordSchema, ForgotPasswordInput } from '@/lib/validations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Bus, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    // Simulate password reset request
    await new Promise((resolve) => setTimeout(resolve, 800));
    setSubmitted(true);
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-4">
      <div className="w-full max-w-md animate-in fade-in-50 zoom-in-95 duration-200">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0f172a] shadow-lg shadow-black/50 mb-3 ring-4 ring-white/10">
            <img src="/logo-icon.svg" alt="Logo" className="h-10 w-10 object-contain" />
          </div>
          <h1 className="text-2xl font-extrabold text-white">Password Recovery</h1>
        </div>

        <Card className="border-slate-800/80 bg-white/95 dark:bg-slate-900/95 shadow-2xl backdrop-blur-md">
          {submitted ? (
            <CardContent className="pt-6 space-y-4 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-foreground">Recovery Instructions Sent</h3>
                <p className="text-xs text-muted-foreground">
                  If an account exists with this email address, you will receive password reset instructions shortly.
                </p>
              </div>
              <div className="pt-2">
                <Link href="/login">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold">
                    Return to Login
                  </Button>
                </Link>
              </div>
            </CardContent>
          ) : (
            <>
              <CardHeader className="space-y-1 pb-4">
                <CardTitle className="text-xl font-bold">Reset Password</CardTitle>
                <CardDescription className="text-xs">
                  Enter your registered admin or manager email address to receive recovery instructions.
                </CardDescription>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-xs font-semibold">
                      Email Address
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="admin@gajagamini.com"
                        className="pl-9 h-10"
                        {...register('email')}
                      />
                    </div>
                    {errors.email && <p className="text-[11px] font-medium text-red-500">{errors.email.message}</p>}
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold"
                  >
                    {isSubmitting ? 'Sending Request...' : 'Send Recovery Link'}
                  </Button>
                </form>
              </CardContent>
            </>
          )}

          <CardFooter className="justify-center border-t bg-slate-50 dark:bg-slate-900/60 p-4">
            <Link href="/login" className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:underline">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Sign In
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
