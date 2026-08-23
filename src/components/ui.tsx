import { useEffect, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Sparkles, LogOut, LayoutDashboard } from 'lucide-react';

export function OwnerShell({ children }: { children: ReactNode }) {
  const { profile, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="sticky top-0 z-30 border-b border-stone-200/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link to="/app" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-700 text-white">
              <Sparkles size={18} />
            </div>
            <span className="text-lg font-semibold tracking-tight text-stone-900">
              BizKit
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              to="/app"
              className="hidden items-center gap-1.5 text-sm font-medium text-stone-600 transition hover:text-stone-900 sm:flex"
            >
              <LayoutDashboard size={16} />
              Dashboard
            </Link>
            <div className="hidden text-sm text-stone-500 sm:block">
              {profile?.email}
            </div>
            <button
              onClick={signOut}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-stone-600 transition hover:bg-stone-100 hover:text-stone-900"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        {children}
      </main>
    </div>
  );
}

export function Spinner({ size = 20 }: { size?: number }) {
  return (
    <div
      className="animate-spin rounded-full border-2 border-stone-200 border-t-teal-700"
      style={{ width: size, height: size }}
    />
  );
}

export function FullPageLoader({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-stone-50">
      <Spinner size={32} />
      <p className="text-sm text-stone-500">{label}</p>
    </div>
  );
}

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-red-100 bg-red-50 p-8 text-center">
      <p className="text-sm font-medium text-red-700">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
        >
          Try again
        </button>
      )}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-stone-300 bg-white p-10 text-center">
      {icon && <div className="text-stone-400">{icon}</div>}
      <h3 className="text-base font-semibold text-stone-800">{title}</h3>
      {description && (
        <p className="max-w-sm text-sm text-stone-500">{description}</p>
      )}
      {action}
    </div>
  );
}

/**
 * Prevent body scroll while a modal is open and restore on unmount.
 */
export function useLockBodyScroll(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [locked]);
}
