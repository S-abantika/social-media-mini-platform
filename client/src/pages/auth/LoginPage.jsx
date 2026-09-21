import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Sparkles, User, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

export const LoginPage = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      showToast('Please enter your email or username and password', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await login(identifier.trim(), password);
      showToast('Welcome back to Connectly!', 'success');
      navigate(from, { replace: true });
    } catch (err) {
      showToast(err.response?.data?.message || err.message || 'Login failed', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = async (demoEmail, demoPass) => {
    setIdentifier(demoEmail);
    setPassword(demoPass);
    setIsSubmitting(true);
    try {
      await login(demoEmail, demoPass);
      showToast('Demo login successful!', 'success');
      navigate(from, { replace: true });
    } catch (err) {
      showToast(err.response?.data?.message || err.message || 'Demo login failed.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 mb-3">
          <Sparkles className="w-6 h-6" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Welcome to Connectly
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          The collaborative campus social network for universities
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white dark:bg-slate-900 py-8 px-6 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200/80 dark:border-slate-800 sm:rounded-3xl">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              label="Email or Username"
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="e.g. alex@connectly.edu"
              icon={Mail}
              required
            />

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  icon={Lock}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isSubmitting}
              className="w-full mt-2"
            >
              Sign In to Campus
            </Button>
          </form>

          {/* Quick Demo Login Credentials Bar */}
          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2.5">
              Quick Demo Access
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleDemoLogin('alex@connectly.edu', 'Password123!')}
                className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition flex flex-col items-center gap-1"
              >
                <User className="w-4 h-4 text-indigo-500" />
                <span className="truncate w-full text-center">Alex (CS)</span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin('sarah@connectly.edu', 'Password123!')}
                className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition flex flex-col items-center gap-1"
              >
                <User className="w-4 h-4 text-purple-500" />
                <span className="truncate w-full text-center">Sarah (HCI)</span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin('admin@connectly.edu', 'AdminPass123!')}
                className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-amber-50 dark:hover:bg-amber-950/40 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition flex flex-col items-center gap-1"
              >
                <ShieldCheck className="w-4 h-4 text-amber-500" />
                <span className="truncate w-full text-center">Admin Dean</span>
              </button>
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-slate-500">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Create student profile
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
