import { useEffect, useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import Breadcrumb from '../../components/ui/Breadcrumb';
import { UserCircleIcon, KeyIcon } from '@heroicons/react/24/outline';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const profileSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number').optional()
});

const passwordSchema = z.object({
  currentPassword: z.string().min(6, 'Current password required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword']
});

export default function Profile() {
  const { user, updateProfile, changePassword, getCurrentUser } = useAuthStore();
  const [profileStatus, setProfileStatus] = useState(null);
  const [passwordStatus, setPasswordStatus] = useState(null);

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    reset: resetProfile,
    formState: { errors: profileErrors, isSubmitting: isProfileSubmitting }
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phone: user?.phone || ''
    }
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
    formState: { errors: passwordErrors, isSubmitting: isPasswordSubmitting }
  } = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' }
  });

  useEffect(() => {
    resetProfile({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phone: user?.phone || ''
    });
  }, [user, resetProfile]);

  const onProfileUpdate = async (data) => {
    setProfileStatus(null);
    const result = await updateProfile(data);
    if (result.success) {
      setProfileStatus({ type: 'success', message: 'Profile updated!' });
      getCurrentUser();
    } else {
      setProfileStatus({ type: 'error', message: result.error || 'Update failed' });
    }
  };

  const onChangePassword = async (data) => {
    setPasswordStatus(null);
    const result = await changePassword(data);
    if (result.success) {
      setPasswordStatus({ type: 'success', message: 'Password changed!' });
      resetPassword();
    } else {
      setPasswordStatus({ type: 'error', message: result.error || 'Change failed' });
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <Breadcrumb
        items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Profile' }]}
      />
      <Card className="mt-6">
        <Card.Header className="flex items-center gap-3">
          <UserCircleIcon className="w-8 h-8 text-blue-500" />
          <Card.Title>Profile</Card.Title>
        </Card.Header>
        <Card.Content>
          <form onSubmit={handleProfileSubmit(onProfileUpdate)} className="space-y-4">
            <Input
              label="First Name"
              {...registerProfile('firstName')}
              error={profileErrors.firstName?.message}
              required
            />
            <Input
              label="Last Name"
              {...registerProfile('lastName')}
              error={profileErrors.lastName?.message}
              required
            />
            <Input
              label="Phone Number"
              {...registerProfile('phone')}
              error={profileErrors.phone?.message}
              placeholder="e.g. +2348012345678"
            />
            {profileStatus && (
              <Alert type={profileStatus.type} message={profileStatus.message} />
            )}
            <div className="flex justify-end">
              <Button type="submit" variant="primary" isLoading={isProfileSubmitting}>
                Save Changes
              </Button>
            </div>
          </form>
        </Card.Content>
      </Card>
      <Card className="mt-8">
        <Card.Header className="flex items-center gap-3">
          <KeyIcon className="w-6 h-6 text-gray-500" />
          <Card.Title>Change Password</Card.Title>
        </Card.Header>
        <Card.Content>
          <form onSubmit={handlePasswordSubmit(onChangePassword)} className="space-y-4">
            <Input
              label="Current Password"
              type="password"
              {...registerPassword('currentPassword')}
              error={passwordErrors.currentPassword?.message}
              required
            />
            <Input
              label="New Password"
              type="password"
              {...registerPassword('newPassword')}
              error={passwordErrors.newPassword?.message}
              required
            />
            <Input
              label="Confirm New Password"
              type="password"
              {...registerPassword('confirmPassword')}
              error={passwordErrors.confirmPassword?.message}
              required
            />
            {passwordStatus && (
              <Alert type={passwordStatus.type} message={passwordStatus.message} />
            )}
            <div className="flex justify-end">
              <Button type="submit" variant="primary" isLoading={isPasswordSubmitting}>
                Change Password
              </Button>
            </div>
          </form>
        </Card.Content>
      </Card>
    </div>
  );
} 