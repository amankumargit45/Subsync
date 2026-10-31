import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { toast } from 'sonner';

export function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success('Password successfully reset! Please sign in.');
      navigate('/login');
    }, 600);
  };

  return (
    <div className="card p-6 sm:p-8 shadow-lg border border-surface-200 dark:border-surface-800">
      <div className="text-center mb-6">
        <h1 className="text-xl font-bold text-surface-900 dark:text-surface-100 tracking-tight">
          Create New Password
        </h1>
        <p className="text-xs text-surface-500 mt-1">
          Enter a secure password for your account
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="New Password"
          type="password"
          icon={Lock}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
        />

        <Input
          label="Confirm New Password"
          type="password"
          icon={Lock}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="••••••••"
          required
        />

        <Button type="submit" variant="primary" className="w-full" loading={loading}>
          <span>Update Password</span>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}

