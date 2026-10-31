import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Lock, Mail, User, Check, X, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { authApi } from '@/api';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';

export function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const password = watch('password', '');

  // Password rules validation
  const rules = useMemo(() => {
    return [
      { label: 'Minimum 8 characters', met: password.length >= 8 },
      { label: 'At least one uppercase letter (A-Z)', met: /[A-Z]/.test(password) },
      { label: 'At least one lowercase letter (a-z)', met: /[a-z]/.test(password) },
      { label: 'At least one special character (!@#$%^&*)', met: /[^A-Za-z0-9]/.test(password) },
    ];
  }, [password]);

  const strengthCount = rules.filter(r => r.met).length;
  const strengthColor =
    strengthCount <= 1 ? 'bg-danger-500' :
    strengthCount <= 3 ? 'bg-warning-500' :
    'bg-success-500';

  const onSubmit = async (data) => {
    if (strengthCount < 4) {
      toast.error('Please meet all password security requirements');
      return;
    }
    setLoading(true);
    try {
      const response = await authApi.register({
        name: data.name,
        email: data.email,
        company: data.company || 'New Subscription Corp',
      });
      login(response.user, response.token);
      toast.success('Account created successfully! Welcome to SubFlow.');
      navigate('/portal');
    } catch (err) {
      toast.error(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-6 sm:p-8 shadow-lg border border-surface-200 dark:border-surface-800">
      <div className="text-center mb-6">
        <h1 className="text-xl font-bold text-surface-900 dark:text-surface-100 tracking-tight">
          Create SubFlow Account
        </h1>
        <p className="text-xs text-surface-500 mt-1">
          Start managing subscriptions and billing seamlessly
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Input
            label="Full Name"
            type="text"
            icon={User}
            placeholder="John Doe"
            {...register('name', { required: 'Name is required' })}
            error={errors.name?.message}
          />
        </div>

        <div>
          <Input
            label="Company Name"
            type="text"
            placeholder="Acme Technologies"
            {...register('company')}
          />
        </div>

        <div>
          <Input
            label="Work Email"
            type="email"
            icon={Mail}
            placeholder="john@company.com"
            {...register('email', {
              required: 'Email is required',
              pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' },
            })}
            error={errors.email?.message}
          />
        </div>

        <div>
          <Input
            label="Password"
            type="password"
            icon={Lock}
            placeholder="••••••••"
            {...register('password', { required: 'Password is required' })}
            error={errors.password?.message}
          />

          {/* Strength Bar */}
          <div className="mt-2 space-y-2">
            <div className="h-1.5 w-full bg-surface-200 dark:bg-surface-800 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${strengthColor}`}
                style={{ width: `${(strengthCount / 4) * 100}%` }}
              />
            </div>

            {/* Checklist */}
            <div className="space-y-1 pt-1">
              {rules.map((rule, idx) => (
                <div key={idx} className="flex items-center gap-1.5 text-[11px]">
                  {rule.met ? (
                    <Check className="h-3 w-3 text-success-600 dark:text-success-500 shrink-0" />
                  ) : (
                    <X className="h-3 w-3 text-surface-400 shrink-0" />
                  )}
                  <span className={rule.met ? 'text-surface-700 dark:text-surface-300 font-medium' : 'text-surface-400'}>
                    {rule.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <Input
            label="Confirm Password"
            type="password"
            icon={Lock}
            placeholder="••••••••"
            {...register('confirmPassword', {
              required: 'Please confirm password',
              validate: val => val === password || 'Passwords do not match',
            })}
            error={errors.confirmPassword?.message}
          />
        </div>

        <Button type="submit" variant="primary" className="w-full mt-2" loading={loading}>
          <span>Create Account</span>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </form>

      <div className="mt-6 text-center text-xs text-surface-500">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400 hover:underline">
          Sign in
        </Link>
      </div>
    </div>
  );
}

