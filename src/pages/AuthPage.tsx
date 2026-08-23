import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, Mail, Lock, ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/Button';
import { useToast } from '@/components/Toast';

export function AuthPage({ mode }: { mode: 'login' | 'signup' }) {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const isSignup = mode === 'signup';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const from =
    (location.state as { from?: string } | null)?.from ?? '/app';

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      if (isSignup) {
        const { error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        });
        if (signUpError) throw signUpError;
        toast('Account created! Welcome to BizKit.');
      } else {
        const { error: signInError } =
          await supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
          });
        if (signInError) throw signInError;
      }
      navigate(from, { replace: true });
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Something went wrong.';
      if (msg.toLowerCase().includes('already registered')) {
        setError('This email is already registered. Try signing in instead.');
      } else if (msg.toLowerCase().includes('invalid credentials')) {
        setError('Incorrect email or password.');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-stone-50">
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <Link
            to="/"
            className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-stone-500 transition hover:text-stone-800"
          >
            <ArrowLeft size={15} />
            Back to home
          </Link>

          <div className="rounded-3xl border border-stone-200 bg-white p-8 shadow-sm">
            <div className="mb-6 flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-700 text-white">
                <Sparkles size={18} />
              </div>
              <span className="text-xl font-semibold tracking-tight text-stone-900">
                BizKit
              </span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-stone-900">
              {isSignup ? 'Create your account' : 'Welcome back'}
            </h1>
            <p className="mt-1.5 text-sm text-stone-500">
              {isSignup
                ? 'Start building your business page in minutes.'
                : 'Sign in to manage your business page.'}
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-stone-700">
                  Email
                </label>
                <div className="relative">
                  <Mail
                    size={17}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-stone-300 bg-white py-2.5 pl-10 pr-3 text-sm text-stone-900 placeholder:text-stone-400 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-stone-700">
                  Password
                </label>
                <div className="relative">
                  <Lock
                    size={17}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
                  />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full rounded-xl border border-stone-300 bg-white py-2.5 pl-10 pr-3 text-sm text-stone-900 placeholder:text-stone-400 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20"
                    autoComplete={
                      isSignup ? 'new-password' : 'current-password'
                    }
                  />
                </div>
              </div>

              {error && (
                <div className="rounded-lg bg-red-50 px-3 py-2.5 text-sm font-medium text-red-700">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                loading={loading}
                className="w-full"
              >
                {isSignup ? 'Create account' : 'Sign in'}
              </Button>
            </form>

            <p className="mt-5 text-center text-sm text-stone-500">
              {isSignup ? (
                <>
                  Already have an account?{' '}
                  <Link
                    to="/login"
                    className="font-semibold text-teal-700 hover:text-teal-800"
                  >
                    Sign in
                  </Link>
                </>
              ) : (
                <>
                  Don't have an account?{' '}
                  <Link
                    to="/signup"
                    className="font-semibold text-teal-700 hover:text-teal-800"
                  >
                    Sign up
                  </Link>
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
