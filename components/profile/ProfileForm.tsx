'use client';

import { User } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import 'react-image-crop/dist/ReactCrop.css';
import { Separator } from '@/components/ui/separator';

interface ProfileFormProps {
  user: User;
}

const getInitials = (name: string | null | undefined) => {
  if (!name) return 'U';
  const names = name.split(' ');
  return names[0][0] + (names.length > 1 ? names[names.length - 1][0] : '');
};

export default function ProfileForm({ user }: ProfileFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: user.name || '',
    bio: user.bio || '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user.image);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpload = async (file: File) => {
    const sigResponse = await fetch('/api/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ folder: 'avatars' }),
    });
    const { signature, timestamp, api_key, cloud_name } = await sigResponse.json();
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('signature', signature);
    formData.append('timestamp', timestamp.toString());
    formData.append('api_key', api_key);
    formData.append('folder', 'avatars');

    const uploadResponse = await fetch(`https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`, {
      method: 'POST',
      body: formData,
    });
    
    const uploadedFileData = await uploadResponse.json();
    return uploadedFileData.secure_url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    let toastId = toast.loading('Updating profile...');

    try {
      let avatarUrl = user.image;
      if (avatarFile) {
        avatarUrl = await handleUpload(avatarFile);
      }
      
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, image: avatarUrl }),
      });

      if (!response.ok) throw new Error('Failed to update profile.');
      
      toast.success('Profile updated successfully!', { id: toastId });
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || 'An error occurred.', { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Avatar Section */}
      <div className="flex items-center gap-5">
        <Avatar className="h-16 w-16">
          <AvatarImage src={avatarPreview || ''} />
          <AvatarFallback className="text-xl">{getInitials(formData.name)}</AvatarFallback>
        </Avatar>
        <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => avatarInputRef.current?.click()}>Update</Button>
            <Button type="button" variant="ghost" className="text-destructive hover:bg-destructive/10">Delete</Button>
            <Input ref={avatarInputRef} id="avatar" name="avatar" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
        </div>
      </div>
      
      <Separator />

      {/* Form Fields */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Username</Label>
          <Input id="name" name="name" value={formData.name} onChange={handleChange} className="max-w-sm"/>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={user.email} disabled className="max-w-sm"/>
        </div>
        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea id="bio" name="bio" value={formData.bio} onChange={handleChange} placeholder="Tell us about yourself." className="max-w-lg"/>
        </div>
      </div>

      <div className="flex justify-start">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Updating...' : 'Update profile'}
        </Button>
      </div>
    </form>
  );
}