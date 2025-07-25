'use client';

import { User } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
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

// --- IMPROVED CROP FUNCTION ---
async function getCroppedImg(
  image: HTMLImageElement,
  crop: Crop,
  fileName: string = 'avatar.png'
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

  ctx.clearRect(0, 0, targetWidth, targetHeight);

  const cropX = crop.x * scaleX;
  const cropY = crop.y * scaleY;
  const cropWidth = crop.width * scaleX;
  const cropHeight = crop.height * scaleY;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  ctx.drawImage(
    image,
    cropX,
    cropY,
    cropWidth,
    cropHeight,
    0,
    0,
    targetWidth,
    targetHeight
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Canvas is empty"));
        return;
      }
      const file = new File([blob], fileName, { 
        type: "image/png",
        lastModified: Date.now()
      });
      resolve(file);
    }, "image/png", 0.95);
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
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user.image);
  
  const [imgSrc, setImgSrc] = useState('');
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<Crop>();
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [isCropping, setIsCropping] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files && files.length > 0) {
      const file = files[0];
      
      if (name === 'avatar' && !file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      
      if (name === 'avatar') {
        setCrop(undefined);
        setCompletedCrop(undefined);
        const reader = new FileReader();
        reader.addEventListener('load', () => {
          const result = reader.result?.toString() || '';
          setImgSrc(result);
          setIsCropperOpen(true);
        });
        reader.readAsDataURL(file);
      } else if (name === 'document') {
        setDocumentFile(file);
      }
    }
    
    e.target.value = '';
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCropAndSave = async () => {
    if (!imgRef.current || !completedCrop?.width || !completedCrop?.height) {
      toast.error('Please select a crop area');
      return;
    }

    try {
      setIsCropping(true);
      const croppedImageFile = await getCroppedImg(
        imgRef.current, 
        completedCrop, 
        `avatar-${Date.now()}.png`
      );
      
      setAvatarFile(croppedImageFile);
      
      if (avatarPreview && avatarPreview.startsWith('blob:')) {
        URL.revokeObjectURL(avatarPreview);
      }
      
      const newPreviewUrl = URL.createObjectURL(croppedImageFile);
      setAvatarPreview(newPreviewUrl);
      
      setIsCropperOpen(false);
      toast.success('Profile picture updated');
    } catch (error) {
      console.error('Error cropping image:', error);
      toast.error('Failed to crop image. Please try again.');
    } finally {
      setIsCropping(false);
    }
  };

  const handleCropperCancel = () => {
    setIsCropperOpen(false);
    setImgSrc('');
    setCrop(undefined);
    setCompletedCrop(undefined);
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
      let docUrl = user.documentUrl;

      if (avatarFile) {
        toast.loading('Uploading profile picture...', { id: toastId });
        avatarUrl = await handleUpload(avatarFile, 'avatars');
      }
      if (documentFile) {
        toast.loading('Uploading document...', { id: toastId });
        docUrl = await handleUpload(documentFile, 'documents');
      }
      
      toast.loading('Saving profile data...', { id: toastId });
      
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, image: avatarUrl, documentUrl: docUrl }),
      });

      if (!response.ok) throw new Error('Failed to update profile.');
      
      toast.success('Profile updated successfully!', { id: toastId });
      router.push(`/profile`);
      router.refresh();

    } catch (error: any) {
      toast.error(error.message || 'An unexpected error occurred.', { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget;
    const initialCrop = centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 80,
        },
        1,
        width,
        height
      ),
      width,
      height
    );
    setCrop(initialCrop);
    setCompletedCrop(initialCrop);
  }

  useEffect(() => {
    return () => {
      if (avatarPreview && avatarPreview.startsWith('blob:')) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Public Profile</CardTitle>
              <CardDescription>This information will be displayed on your public profile.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={avatarPreview || ''} />
                  <AvatarFallback className="text-2xl">{getInitials(formData.name)}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => avatarInputRef.current?.click()}
                    disabled={isLoading}
                  >
                    Change Picture
                  </Button>
                  {avatarFile && (
                    <p className="text-sm text-muted-foreground">
                      New image ready to save
                    </p>
                  )}
                </div>
                <Input 
                  ref={avatarInputRef} 
                  id="avatar" 
                  name="avatar" 
                  type="file" 
                  accept="image/jpeg,image/jpg,image/png,image/webp" 
                  onChange={handleFileChange} 
                  className="hidden"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input 
                  id="name" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleChange} 
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea 
                  id="bio" 
                  name="bio" 
                  value={formData.bio} 
                  onChange={handleChange} 
                  placeholder="Tell us a little about your travel style." 
                  disabled={isLoading}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>This information is private and used for verification.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="dob">Date of Birth</Label>
                  <Input id="dob" name="dob" type="date" value={formData.dob} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nationality">Nationality</Label>
                  <Input id="nationality" name="nationality" value={formData.nationality} onChange={handleChange} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="document">Identity Document (ID/Passport)</Label>
                <div className="flex items-center gap-4">
                  <Button type="button" variant="outline" onClick={() => documentInputRef.current?.click()}>
                    Upload Document
                  </Button>
                  <Input ref={documentInputRef} id="document" name="document" type="file" accept=".pdf,image/*" onChange={handleFileChange} className="hidden" />
                  <span className="text-xs text-muted-foreground">
                    {documentFile ? documentFile.name : (user.documentUrl ? 'A document is already on file.' : 'No document selected.')}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 flex justify-end gap-4">
          <Button type="button" variant="ghost" onClick={() => router.back()} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>

      <Dialog open={isCropperOpen} onOpenChange={setIsCropperOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Crop Your Profile Picture</DialogTitle>
          </DialogHeader>
          {imgSrc && (
            <div className="flex justify-center p-4">
              <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={(c) => setCompletedCrop(c)}
                circularCrop
                aspect={1}
                minWidth={50}
                minHeight={50}
                keepSelection
              >
                <img 
                  ref={imgRef} 
                  alt="Crop preview" 
                  src={imgSrc} 
                  onLoad={onImageLoad}
                  style={{ maxHeight: '70vh' }}
                />
              </ReactCrop>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={handleCropperCancel} disabled={isCropping}>
              Cancel
            </Button>
            <Button onClick={handleCropAndSave} disabled={isCropping}>
              {isCropping ? 'Cropping...' : 'Crop & Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}