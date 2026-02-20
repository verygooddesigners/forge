'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, AccountStatus, STATUS_LABELS } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/client';
import { ArrowLeft, Edit, Save, X, UserCircle, Mail, Shield, Calendar, Briefcase, Camera, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';

interface ProfilePageClientProps {
  user: User;
}

export function ProfilePageClient({ user }: ProfilePageClientProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(user.full_name || '');
  const [jobTitle, setJobTitle] = useState(user.job_title || '');
  const [avatarUrl, setAvatarUrl] = useState(user.avatar_url || '');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const supabase = createClient();

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be under 2MB');
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `avatars/${user.id}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setAvatarUrl(publicUrl);

      // Save immediately
      await supabase
        .from('users')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      toast.success('Photo uploaded');
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error('Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({
          full_name: fullName.trim() || null,
          job_title: jobTitle.trim() || null,
        })
        .eq('id', user.id);

      if (error) throw error;

      toast.success('Profile updated successfully');
      setIsEditing(false);
      router.refresh();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFullName(user.full_name || '');
    setJobTitle(user.job_title || '');
    setIsEditing(false);
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'Super Administrator':
        return 'text-red-400 border-red-500/30 bg-red-500/10';
      case 'Administrator':
        return 'text-violet-400 border-violet-500/30 bg-violet-500/10';
      case 'Manager':
        return 'text-blue-400 border-blue-500/30 bg-blue-500/10';
      case 'Team Leader':
        return 'text-green-400 border-green-500/30 bg-green-500/10';
      case 'Content Creator':
        return 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10';
      default:
        return 'text-text-secondary border-border-subtle bg-bg-elevated';
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push('/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-text-primary">Profile</h1>
          <p className="text-text-secondary mt-1">Manage your account information</p>
        </div>

        {/* Profile Card */}
        <Card className="mb-6 bg-bg-surface border-border-default">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-text-primary">
                  <UserCircle className="h-5 w-5 text-accent-primary" />
                  Account Information
                </CardTitle>
                <CardDescription className="text-text-secondary">Your personal details and account settings</CardDescription>
              </div>
              {!isEditing && (
                <Button onClick={() => setIsEditing(true)} variant="outline">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar */}
            <div className="flex items-center gap-4">
              <div className="relative group/avatar">
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt="Profile photo"
                    width={80}
                    height={80}
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-accent-primary to-accent-dark flex items-center justify-center font-bold text-white text-2xl">
                    {user.full_name
                      ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase()
                      : user.email[0].toUpperCase()}
                  </div>
                )}
                {isEditing && (
                  <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg opacity-0 group-hover/avatar:opacity-100 transition-opacity cursor-pointer">
                    {uploading ? (
                      <Loader2 className="h-6 w-6 text-white animate-spin" />
                    ) : (
                      <Camera className="h-6 w-6 text-white" />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePhotoUpload}
                      disabled={uploading}
                    />
                  </label>
                )}
              </div>
              <div>
                <p className="text-sm text-text-secondary">Profile Picture</p>
                {isEditing && (
                  <p className="text-xs text-text-tertiary mt-1">Hover photo to change (max 2MB)</p>
                )}
              </div>
            </div>

            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-text-primary">
                Full Name
              </Label>
              {isEditing ? (
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                />
              ) : (
                <p className="text-sm font-medium text-text-primary">
                  {user.full_name || <span className="text-text-tertiary italic">Not set</span>}
                </p>
              )}
            </div>

            {/* Job Title */}
            <div className="space-y-2">
              <Label htmlFor="jobTitle" className="flex items-center gap-2 text-text-primary">
                <Briefcase className="h-4 w-4 text-text-tertiary" />
                Job Title
              </Label>
              {isEditing ? (
                <Input
                  id="jobTitle"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="Enter your job title"
                />
              ) : (
                <p className="text-sm font-medium text-text-primary">
                  {user.job_title || <span className="text-text-tertiary italic">Not set</span>}
                </p>
              )}
            </div>

            {/* Email (read-only) */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-text-primary">
                <Mail className="h-4 w-4 text-text-tertiary" />
                Email Address
              </Label>
              <p className="text-sm font-medium text-text-secondary">{user.email}</p>
              <p className="text-xs text-text-tertiary">Email cannot be changed</p>
            </div>

            {/* Role (read-only) */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-text-primary">
                <Shield className="h-4 w-4 text-text-tertiary" />
                Role
              </Label>
              <Badge variant="outline" className={getRoleBadgeVariant(user.role)}>
                {user.role}
              </Badge>
              <p className="text-xs text-text-tertiary">Role is managed by administrators</p>
            </div>

            {/* Account Status (read-only) */}
            <div className="space-y-2">
              <Label className="text-text-primary">Account Status</Label>
              <Badge variant="outline" className={
                user.account_status === 'confirmed'
                  ? 'text-green-400 border-green-500/30 bg-green-500/10'
                  : 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10'
              }>
                {STATUS_LABELS[user.account_status as AccountStatus] || user.account_status}
              </Badge>
            </div>

            {/* Created Date */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-text-primary">
                <Calendar className="h-4 w-4 text-text-tertiary" />
                Member Since
              </Label>
              <p className="text-sm text-text-secondary">
                {new Date(user.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>

            {/* Action Buttons */}
            {isEditing && (
              <div className="flex gap-2 pt-4">
                <Button onClick={handleSave} disabled={saving} className="flex-1">
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button onClick={handleCancel} variant="outline" disabled={saving}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Account Security Card */}
        <Card className="bg-bg-surface border-border-default">
          <CardHeader>
            <CardTitle className="text-text-primary">Security</CardTitle>
            <CardDescription className="text-text-secondary">Manage your password and security settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-text-primary">Password</Label>
              <p className="text-sm text-text-secondary">••••••••</p>
              <Button variant="outline" size="sm" onClick={() => router.push('/reset-password')}>
                Change Password
              </Button>
            </div>

            {user.auth_provider && (
              <div className="space-y-2">
                <Label className="text-text-primary">Authentication Provider</Label>
                <Badge variant="outline">
                  {user.auth_provider === 'azure' ? 'Microsoft SSO' : user.auth_provider}
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
