'use client';

import { User } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { toast } from "sonner";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import ReactCrop, { centerCrop, makeAspectCrop, type Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

interface EditProfileFormProps {
  user: User;
}

const getInitials = (name: string | null | undefined) => {
  if (!name) return 'U';
  const names = name.split(' ');
  return names[0][0] + (names.length > 1 ? names[names.length - 1][0] : '');
};

// --- HIGH-QUALITY CROP FUNCTION ---
async function getCroppedImg(
  image: HTMLImageElement,
  crop: Crop,
  fileName: string
): Promise<File> {
  const canvas = document.createElement("canvas");
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  
  const targetWidth = 256;
  const targetHeight = 256;
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("No 2d context");
  }

  const cropX = crop.x * scaleX;
  const cropY = crop.y * scaleY;
  const cropWidth = crop.width * scaleX;
  const cropHeight = crop.height * scaleY;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(image, cropX, cropY, cropWidth, cropHeight, 0, 0, targetWidth, targetHeight);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Canvas is empty"));
        return;
      }
      const file = new File([blob], fileName, { type: "image/png" });
      resolve(file);
    }, "image/png", 1);
  });
}

export default function EditProfileForm({ user }: EditProfileFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: user.name || '',
    bio: user.bio || '',
    dob: user.dob ? new Date(user.dob).toISOString().split('T')[0] : '',
    nationality: user.nationality || '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user.image);
  
  const [imgSrc, setImgSrc] = useState('');
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<Crop>();
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files && files.length > 0) {
      const file = files[0];
      if (name === 'avatar') {
        setCrop(undefined);
        const reader = new FileReader();
        reader.addEventListener('load', () => setImgSrc(reader.result?.toString() || ''));
        reader.readAsDataURL(file);
        setIsCropperOpen(true);
      } else if (name === 'cover') {
        setCoverFile(file);
      } else if (name === 'document') {
        setDocumentFile(file);
      }
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCropAndSave = async () => {
    if (imgRef.current && completedCrop?.width && completedCrop?.height) {
      const croppedImageFile = await getCroppedImg(imgRef.current, completedCrop, 'avatar.png');
      setAvatarFile(croppedImageFile);
      setAvatarPreview(URL.createObjectURL(croppedImageFile));
    }
    setIsCropperOpen(false);
  };
  
  const handleUpload = async (file: File, folder: string) => {
    const sigResponse = await fetch('/api/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ folder }),
    });
    if (!sigResponse.ok) throw new Error('Failed to get upload signature.');
    const { signature, timestamp, api_key, cloud_name } = await sigResponse.json();
    
    const uploadFormData = new FormData();
    uploadFormData.append('file', file);
    uploadFormData.append('signature', signature);
    uploadFormData.append('timestamp', timestamp.toString());
    uploadFormData.append('api_key', api_key);
    uploadFormData.append('folder', folder);

    const uploadResponse = await fetch(`https://api.cloudinary.com/v1_1/${cloud_name}/auto/upload`, {
      method: 'POST',
      body: uploadFormData,
    });
    
    if (!uploadResponse.ok) throw new Error(`File upload failed.`);
    const uploadedFileData = await uploadResponse.json();
    return uploadedFileData.secure_url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    let toastId = toast.loading('Saving profile...');

    try {
      let avatarUrl = user.image;
      let coverUrl = user.coverImage;
      let docUrl = user.documentUrl;

      if (avatarFile) {
        avatarUrl = await handleUpload(avatarFile, 'avatars');
      }
      if (coverFile) {
        coverUrl = await handleUpload(coverFile, 'covers');
      }
      if (documentFile) {
        docUrl = await handleUpload(documentFile, 'documents');
      }
      
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, image: avatarUrl, coverImage: coverUrl, documentUrl: docUrl }),
      });

      if (!response.ok) throw new Error('Failed to update profile.');
      
      toast.success('Profile updated successfully!', { id: toastId });
      router.push(`/profile/${user.id}`);
      router.refresh();

    } catch (error: any) {
      toast.error(error.message || 'An unexpected error occurred.', { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget;
    const crop = centerCrop(makeAspectCrop({ unit: '%', width: 90 }, 1, width, height), width, height);
    setCrop(crop);
  }

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Public Profile</CardTitle><CardDescription>This information will be displayed on your public profile.</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Profile Picture</Label>
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20"><AvatarImage src={avatarPreview || ''} /><AvatarFallback className="text-2xl">{getInitials(formData.name)}</AvatarFallback></Avatar>
                  <Button type="button" variant="outline" onClick={() => avatarInputRef.current?.click()}>Change</Button>
                  <Input ref={avatarInputRef} id="avatar" name="avatar" type="file" accept="image/*" onChange={handleFileChange} className="hidden"/>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cover">Cover Photo</Label>
                <div className="flex items-center gap-4">
                  <Button type="button" variant="outline" onClick={() => coverInputRef.current?.click()}>Upload Cover</Button>
                  <Input ref={coverInputRef} id="cover" name="cover" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                  <span className="text-xs text-muted-foreground">{coverFile ? coverFile.name : 'No new cover selected.'}</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" name="name" value={formData.name} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea id="bio" name="bio" value={formData.bio} onChange={handleChange} placeholder="Tell us a little about your travel style." />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Personal Information</CardTitle><CardDescription>This information is private and used for verification.</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label htmlFor="dob">Date of Birth</Label><Input id="dob" name="dob" type="date" value={formData.dob} onChange={handleChange} /></div>
                <div className="space-y-2"><Label htmlFor="nationality">Nationality</Label><Input id="nationality" name="nationality" value={formData.nationality} onChange={handleChange} /></div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="document">Identity Document</Label>
                <div className="flex items-center gap-4">
                  <Button type="button" variant="outline" onClick={() => documentInputRef.current?.click()}>Upload Document</Button>
                  <Input ref={documentInputRef} id="document" name="document" type="file" accept=".pdf,image/*" onChange={handleFileChange} className="hidden" />
                  <span className="text-xs text-muted-foreground">{documentFile ? documentFile.name : (user.documentUrl ? 'Document on file.' : 'No document selected.')}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="mt-8 flex justify-end gap-4">
          <Button type="button" variant="ghost" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" disabled={isLoading}>{isLoading ? 'Saving...' : 'Save Changes'}</Button>
        </div>
      </form>
      <Dialog open={isCropperOpen} onOpenChange={setIsCropperOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Crop Profile Picture</DialogTitle></DialogHeader>
          {imgSrc && (
            <div className="flex justify-center p-4">
              <ReactCrop crop={crop} onChange={(_, percentCrop) => setCrop(percentCrop)} onComplete={(c) => setCompletedCrop(c)} circularCrop aspect={1}>
                <img ref={imgRef} alt="Crop me" src={imgSrc} onLoad={onImageLoad} />
              </ReactCrop>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCropperOpen(false)}>Cancel</Button>
            <Button onClick={handleCropAndSave}>Crop & Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}