import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Lock, Mail, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { authApi } from '@/api';
import { useAuthStore } from '@/store/authStore';
import { DEMO_ACCOUNTS } from '@/lib/constants';
import { toast } from 'sonner';

export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const { login } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    defaultValues: {
      email: 'admin@subflow.app',
      password: 'Admin@12345',
      remember: true,
    },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    setErrorMsg('');
    try {
      const response = await authApi.login({ email: data.email, password: data.password });
      login(response.user, response.token);
      toast.success(`Welcome back, ${response.user.name}!`);

      const destination = location.state?.from?.pathname || (response.user.role === 'CUSTOMER' ? '/portal' : '/dashboard');
      navigate(destination, { replace: true });
    } catch (err) {
      setErrorMsg(err.message || 'Invalid email or password');
      toast.error('Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demo) => {
    setValue('email', demo.email);
    setValue('password', demo.password);
    onSubmit({ email: demo.email, password: demo.password });
  };

  return (
    <div className="card p-6 sm:p-8 shadow-lg border border-surface-200 dark:border-surface-800">
      <div className="text-center mb-6">
        <h1 className="text-xl font-bold text-surface-900 dark:text-surface-100 tracking-tight">
          Sign in to SubFlow
        </h1>
        <p className="text-xs text-surface-500 mt-1">
          Unified Subscription & Recurring Billing Platform
        </p>
      </div>

      {errorMsg && (
        <div className="mb-4 p-3 rounded-lg bg-danger-50 dark:bg-danger-500/10 border border-danger-200 dark:border-danger-800/30 text-danger-700 dark:text-danger-400 text-xs flex items-center gap-2">
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Demo Account Pills */}
      <div className="mb-6">
        <div className="text-[11px] font-semibold text-surface-400 uppercase tracking-wider mb-2 text-center">
          ⚡ 1-Click Demo Login
        </div>
        <div className="grid grid-cols-3 gap-2">
          {DEMO_ACCOUNTS.map((demo) => (
            <button
              key={demo.role}
              type="button"
              onClick={() => handleQuickLogin(demo)}
              className="px-2.5 py-1.5 rounded-lg border border-surface-200 dark:border-surface-700 hover:border-primary-500 hover:bg-primary-50/50 dark:hover:bg-primary-950/30 transition-all text-left flex flex-col group"
            >
              <span className="text-[11px] font-bold text-surface-900 dark:text-surface-100 group-hover:text-primary-600 dark:group-hover:text-primary-400">
                {demo.role}
              </span>
              <span className="text-[10px] text-surface-400 truncate">
                {demo.name.split(' ')[0]}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-surface-200 dark:border-surface-800" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-white dark:bg-surface-900 px-2 text-surface-400">or sign in with email</span>
        </div>
      </div>

      {/* Login Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Input
            label="Email Address"
            type="email"
            icon={Mail}
            placeholder="admin@subflow.io"
            {...register('email', {
              required: 'Email is required',
              pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' },
            })}
            error={errors.email?.message}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">
              Password
            </label>
            <Link
              to="/forgot-password"
              className="text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400 hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              className={`input-base pl-9 pr-10 ${errors.password ? 'border-danger-500' : ''}`}
              placeholder="••••••••"
              {...register('password', { required: 'Password is required' })}
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-surface-400">
              <Lock className="h-4 w-4" />
            </div>
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-surface-400 hover:text-surface-600 dark:hover:text-surface-300"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-danger-500 mt-1">{errors.password.message}</p>}
        </div>

        <div className="flex items-center">
          <input
            id="remember"
            type="checkbox"
            className="h-4 w-4 rounded border-surface-300 text-primary-600 focus:ring-primary-500"
            {...register('remember')}
          />
          <label htmlFor="remember" className="ml-2 block text-xs text-surface-600 dark:text-surface-400">
            Remember my session for 30 days
          </label>
        </div>

        <Button type="submit" variant="primary" className="w-full mt-2" loading={loading}>
          <span>Sign In</span>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </form>

      <div className="mt-6 text-center text-xs text-surface-500">
        Don't have an account?{' '}
        <Link to="/register" className="font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400 hover:underline">
          Create company account
        </Link>
      </div>
    </div>
  );
}

