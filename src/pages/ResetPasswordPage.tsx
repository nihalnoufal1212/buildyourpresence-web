import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Lock, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/Button';
import { useToast } from '@/components/Toast';
import { Spinner } from '@/components/ui';

export function ResetPasswordPage() {
  const { session, loading } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleUpdate(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setSaving(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });
      if (updateError) throw updateError;
      toast('Password updated! You can now sign in with your new password.');
      await supabase.auth.signOut();
      navigate('/login', { replace: true });
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Something went wrong.';
      setError(msg);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50">
        <Spinner size={28} />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex min-h-screen flex-col bg-stone-50">
        <div className="flex flex-1 items-center justify-center px-4 py-12">
          <div className="w-full max-w-md text-center">
            <Link
              to="/login"
              className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-stone-500 transition hover:text-stone-800"
            >
              <ArrowLeft size={15} />
              Back to sign in
            </Link>
            <p className="text-stone-600">
              This password reset link is invalid or has expired. Please
              request a new one.
            </p>
            <Link to="/login">
              <Button className="mt-4">Go to sign in</Button>
            </Link>
          </div>
        </div>
      </div>
    );
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
              Set a new password
            </h1>
            <p className="mt-1.5 text-sm text-stone-500">
              Enter your new password below. You'll be signed in with it after.
            </p>

            <form onSubmit={handleUpdate} className="mt-6 space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-stone-700">
                  New password
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
                    autoComplete="new-password"
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-stone-700">
                  Confirm password
                </label>
                <div className="relative">
                  <Lock
                    size={17}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
                  />
                  <input
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="Re-enter your new password"
                    className="w-full rounded-xl border border-stone-300 bg-white py-2.5 pl-10 pr-3 text-sm text-stone-900 placeholder:text-stone-400 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20"
                    autoComplete="new-password"
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
                loading={saving}
                className="w-full"
              >
                Update password
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
