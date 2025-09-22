// components/ui/MediaUpload.tsx

'use client';

import { useState, useRef } from 'react';
import { UploadCloud, X } from 'lucide-react';

// Props are simpler now: it just passes the selected file back
interface MediaUploadProps {
  onFileSelect: (file: File | null) => void;
}

export function MediaUpload({ onFileSelect }: MediaUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'IMAGE' | 'VIDEO' | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      handleRemove();
      return;
    }

    // Validation
    if (file.type.startsWith('image/')) {
      setMediaType('IMAGE');
    } else if (file.type.startsWith('video/')) {
      setMediaType('VIDEO');
    } else {
      alert('Unsupported file type. Please select an image or video.');
      handleRemove();
      return;
    }
    
    // Create a URL for preview and pass the file to the parent
    setPreviewUrl(URL.createObjectURL(file));
    onFileSelect(file);
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    setMediaType(null);
    onFileSelect(null); // Inform parent that the file was removed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full">
      <div
        className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-gray-50 transition-colors relative"
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/mp4,video/quicktime"
          className="hidden"
          onChange={handleFileChange}
        />
        {!previewUrl ? (
          <div className="text-center text-gray-500">
            <UploadCloud className="mx-auto h-12 w-12" />
            <p className="mt-2">Click to add an image or video</p>
            <p className="text-xs text-gray-400">MP4, JPG, PNG, GIF up to 50MB</p>
          </div>
        ) : (
          <div className="w-full h-full p-2">
            {mediaType === 'IMAGE' ? (
              <img src={previewUrl} alt="Preview" className="w-full h-full object-contain rounded-md" />
            ) : (
              <video src={previewUrl} controls className="w-full h-full object-contain rounded-md" />
            )}
          </div>
        )}
      </div>
      {previewUrl && (
          <button
            type="button" // Important: type="button" to prevent form submission
            onClick={handleRemove}
            className="absolute top-1 right-1 bg-black bg-opacity-50 text-white rounded-full p-1 hover:bg-opacity-75"
          >
            <X size={16} />
          </button>
      )}
    </div>
  );
}