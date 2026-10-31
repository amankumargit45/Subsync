import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { toast } from 'sonner';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      toast.success('Password reset instructions sent!');
    }, 600);
  };

  return (
    <div className="card p-6 sm:p-8 shadow-lg border border-surface-200 dark:border-surface-800">
      <div className="text-center mb-6">
        <h1 className="text-xl font-bold text-surface-900 dark:text-surface-100 tracking-tight">
          Reset Your Password
        </h1>
        <p className="text-xs text-surface-500 mt-1">
          Enter your email and we'll send a link to recover your account
        </p>
      </div>

      {submitted ? (
        <div className="text-center space-y-4 py-4">
          <div className="w-12 h-12 rounded-full bg-success-50 dark:bg-success-500/10 text-success-600 dark:text-success-400 mx-auto flex items-center justify-center">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-100">Check your inbox</h3>
            <p className="text-xs text-surface-500 mt-1">
              We sent instructions to <span className="font-semibold text-surface-800 dark:text-surface-200">{email}</span>
            </p>
          </div>
          <Link to="/login" className="inline-block mt-4">
            <Button variant="secondary" size="sm">
              <ArrowLeft className="h-4 w-4" /> Back to Login
            </Button>
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            icon={Mail}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@subflow.io"
            required
          />

          <Button type="submit" variant="primary" className="w-full" loading={loading}>
            Send Reset Instructions
          </Button>

          <div className="text-center pt-2">
            <Link to="/login" className="inline-flex items-center gap-1.5 text-xs text-surface-500 hover:text-surface-700 dark:hover:text-surface-300">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to sign in
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}

