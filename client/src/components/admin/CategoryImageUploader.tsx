import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CategoryImageUploaderProps {
  value?: string;
  onChange: (url: string) => void;
  uploadUrl?: string;
  onImageChange?: (url: string) => void;
  currentImageUrl?: string;
  className?: string;
}

export function CategoryImageUploader({ 
  value,
  onChange,
  uploadUrl = "/api/upload/category-image",
  onImageChange, 
  currentImageUrl = "", 
  className 
}: CategoryImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(value || currentImageUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Use either onChange (form field) or onImageChange (legacy)
  const handleChange = onChange || onImageChange;

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a JPEG, PNG, GIF or WebP image.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Maximum file size is 5MB.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUploading(true);

      // Create a temporary preview
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);

      // Create form data for upload
      const formData = new FormData();
      formData.append('image', file);

      // Upload the file
      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const data = await response.json();
      
      // Clean up the temporary object URL
      if (preview && preview.startsWith('blob:')) {
        URL.revokeObjectURL(preview);
      }
      
      // Update preview with the actual uploaded image URL
      setPreview(data.fileUrl);
      
      // Pass the URL back to the form
      handleChange?.(data.fileUrl);
      
      toast({
        title: "Upload successful",
        description: "Your image has been uploaded.",
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload image",
        variant: "destructive",
      });
      
      // Remove preview if upload failed
      if (preview && !currentImageUrl) {
        URL.revokeObjectURL(preview);
        setPreview(null);
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    // Clean up object URL if it's a preview
    if (preview && preview !== currentImageUrl) {
      URL.revokeObjectURL(preview);
    }
    
    setPreview(null);
    handleChange?.('');
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
        accept="image/jpeg,image/png,image/gif,image/webp"
      />
      
      {/* Image preview */}
      {preview && (
        <div className="relative w-full">
          <img 
            src={preview} 
            alt="Category preview" 
            className="h-40 w-full object-cover rounded-md border" 
          />
          <button
            type="button"
            onClick={handleRemoveImage}
            className="absolute top-2 right-2 bg-black bg-opacity-50 rounded-full p-1"
          >
            <X className="h-4 w-4 text-white" />
          </button>
        </div>
      )}
      
      {/* Upload button */}
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={triggerFileInput}
        disabled={isUploading}
      >
        {isUploading ? (
          <>
            <span className="animate-spin mr-2">⏳</span>
            Uploading...
          </>
        ) : (
          <>
            <Upload className="mr-2 h-4 w-4" />
            {preview ? "Replace Image" : "Upload Image"}
          </>
        )}
      </Button>
    </div>
  );
}