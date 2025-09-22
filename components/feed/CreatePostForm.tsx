// components/feed/CreatePostForm.tsx

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import axios from 'axios'; // Ensure axios is imported
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MediaUpload } from '@/components/ui/MediaUpload';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ImagePlus, UserPlus, MapPin } from 'lucide-react';

export default function CreatePostForm() {
  const router = useRouter();
  const { data: session } = useSession();
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [fileToUpload, setFileToUpload] = useState<File | null>(null); // State for the actual file
  const [showUploader, setShowUploader] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !fileToUpload) {
      toast.error('Please write something or upload a file to post.');
      return;
    }

    setIsLoading(true);

    let mediaUrl: string | undefined;
    let mediaType: 'IMAGE' | 'VIDEO' | undefined;

    try {
      // --- UPLOAD LOGIC IS NOW HERE ---
      // Step 1: If there is a file, upload it to Cloudinary first
      if (fileToUpload) {
        // 1a: Get signature from our backend
        const signatureResponse = await axios.post('/api/upload', { folder: 'posts' });
        const { signature, timestamp, api_key, cloud_name } = signatureResponse.data;

        // 1b: Prepare form data and send to Cloudinary
        const formData = new FormData();
        formData.append('file', fileToUpload);
        formData.append('api_key', api_key);
        formData.append('signature', signature);
        formData.append('timestamp', timestamp);
        formData.append('folder', 'posts');

        const uploadUrl = `https://api.cloudinary.com/v1_1/${cloud_name}/auto/upload`;
        const uploadResponse = await axios.post(uploadUrl, formData);
        
        // 1c: Get the URL and type from Cloudinary's response
        mediaUrl = uploadResponse.data.secure_url;
        mediaType = uploadResponse.data.resource_type.toUpperCase();
      }

      // Step 2: Now, create the post in our database
      const body = {
        content,
        mediaUrl,
        mediaType,
      };

      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        document.querySelector('[data-state="open"] [aria-label="Close"]')?.dispatchEvent(
          new MouseEvent('click', { bubbles: true, cancelable: true })
        );
        toast.success('Post created successfully!');
        router.refresh();
      } else {
        const data = await response.json();
        toast.error(data.message || 'Failed to create post.');
      }
    } catch (error) {
      toast.error('An error occurred during post creation.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (file: File | null) => {
    setFileToUpload(file);
    if (!file) {
      setShowUploader(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-4">
      <div className="flex items-start gap-4">
        <Avatar>
          <AvatarImage src={session?.user?.image ?? undefined} />
          <AvatarFallback>{session?.user?.name?.charAt(0)}</AvatarFallback>
        </Avatar>
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={`What's on your mind, ${session?.user?.name}?`}
          className="min-h-[120px] border-none focus-visible:ring-0 resize-none shadow-none text-base"
        />
      </div>

      {showUploader && (
        <div className="pl-14">
          <MediaUpload onFileSelect={handleFileSelect} />
        </div>
      )}

      <div className="flex items-center justify-between border rounded-lg p-2">
        <div className="flex items-center gap-1">
           <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button type="button" variant="ghost" size="icon" onClick={() => setShowUploader(!showUploader)}>
                  <ImagePlus className="h-5 w-5 text-green-600" />
                </Button>
              </TooltipTrigger>
              <TooltipContent><p>Add Photo/Video</p></TooltipContent>
            </Tooltip>
            {/* Other tooltips... */}
          </TooltipProvider>
        </div>
        <Button
          type="submit"
          disabled={isLoading || (!content.trim() && !fileToUpload)}
          className="w-28"
        >
          {isLoading ? 'Posting...' : 'Post'}
        </Button>
      </div>
    </form>
  );
}