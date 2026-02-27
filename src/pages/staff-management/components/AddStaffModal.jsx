import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import { supabase } from '../../../lib/supabase';

const AddStaffModal = ({ isOpen, onClose, onAddStaff }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'staff',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState('');

  const roleOptions = [
    { value: 'staff', label: 'Check-In Staff' },
    { value: 'admin', label: 'Administrator' }
  ];

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError('');
    if (!validateForm()) return;

    setIsSubmitting(true);

    const { data, error } = await supabase.rpc('create_staff_user', {
      user_email: formData.email.toLowerCase().trim(),
      user_password: formData.password,
      user_full_name: formData.name.trim(),
      user_role: formData.role
    });

    if (error) {
      setGeneralError(error.message || 'Failed to create staff member. Please try again.');
      setIsSubmitting(false);
      return;
    }

    // Success
    setFormData({ name: '', email: '', role: 'staff', password: '' });
    setErrors({});
    setIsSubmitting(false);
    onAddStaff(data);
    onClose();
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
    if (generalError) setGeneralError('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-xl shadow-elevation-5 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-card border-b border-border px-4 md:px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg md:text-xl font-semibold text-foreground">Add New Staff Member</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-muted transition-colors duration-250"
            aria-label="Close modal"
          >
            <Icon name="X" size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-4">

          {generalError && (
            <div className="flex items-center gap-2 p-3 bg-error/10 border border-error/20 rounded-lg text-error text-sm">
              <Icon name="AlertCircle" size={16} />
              {generalError}
            </div>
          )}

          <Input
            label="Full Name"
            type="text"
            placeholder="Enter staff member name"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            error={errors.name}
            required
          />

          <Input
            label="Email Address"
            type="email"
            placeholder="staff@conference.com"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            error={errors.email}
            required
          />

          <Input
            label="Password"
            type="password"
            placeholder="Minimum 6 characters"
            value={formData.password}
            onChange={(e) => handleChange('password', e.target.value)}
            error={errors.password}
            required
          />

          <Select
            label="Role"
            options={roleOptions}
            value={formData.role}
            onChange={(value) => handleChange('role', value)}
            required
          />

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              fullWidth
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="default"
              loading={isSubmitting}
              fullWidth
            >
              {isSubmitting ? 'Creating...' : 'Add Staff Member'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddStaffModal;