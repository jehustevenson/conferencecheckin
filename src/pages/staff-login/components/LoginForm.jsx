import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabase';

const LoginForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!formData?.email?.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/?.test(formData?.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData?.password?.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData?.password?.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e?.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors?.[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    const { data, error } = await signIn(formData?.email, formData?.password);

    if (error) {
      setErrors({
        general: error?.message || 'Invalid email or password. Please check your credentials and try again.'
      });
      setLoading(false);
      return;
    }

    // Fetch role from user_profiles table (most reliable source)
    let role = 'staff';
    try {
      const { data: profile } = await supabase
        ?.from('user_profiles')
        ?.select('role')
        ?.eq('id', data?.user?.id)
        ?.single();
      if (profile?.role) {
        role = profile.role;
      } else {
        // Fallback to metadata
        role = data?.user?.user_metadata?.role || data?.user?.app_metadata?.role || 'staff';
      }
    } catch {
      role = data?.user?.user_metadata?.role || data?.user?.app_metadata?.role || 'staff';
    }

    // Redirect: admin → dashboard, staff → QR scanner (check-in hub)
    const from = location?.state?.from?.pathname;
    if (role === 'admin') {
      navigate(from && from !== '/staff-login' ? from : '/admin-dashboard', { replace: true });
    } else {
      navigate('/qr-code-scanner', { replace: true });
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-4 md:space-y-6">
      {errors?.general && (
        <div className="p-3 md:p-4 bg-error/10 border border-error/20 rounded-lg md:rounded-xl flex items-start gap-3">
          <Icon name="AlertCircle" size={20} color="var(--color-error)" className="flex-shrink-0 mt-0.5" />
          <p className="text-sm md:text-base text-error">{errors?.general}</p>
        </div>
      )}
      <Input
        label="Email Address"
        type="email"
        name="email"
        placeholder="Enter your email"
        value={formData?.email}
        onChange={handleChange}
        error={errors?.email}
        required
        disabled={loading}
        className="w-full"
      />
      <div className="relative">
        <Input
          label="Password"
          type={showPassword ? 'text' : 'password'}
          name="password"
          placeholder="Enter your password"
          value={formData?.password}
          onChange={handleChange}
          error={errors?.password}
          required
          disabled={loading}
          className="w-full"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-[42px] md:top-[44px] p-2 hover:bg-muted rounded-lg transition-colors"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          disabled={loading}
        >
          <Icon name={showPassword ? 'EyeOff' : 'Eye'} size={20} color="var(--color-muted-foreground)" />
        </button>
      </div>
      <Button
        type="submit"
        variant="default"
        size="lg"
        fullWidth
        loading={loading}
        iconName="LogIn"
        iconPosition="right"
        className="mt-6 md:mt-8"
      >
        Sign In
      </Button>
    </form>
  );
};

export default LoginForm;