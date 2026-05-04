import { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { FiUpload, FiImage, FiX } from 'react-icons/fi';

interface RaffleImageUploaderProps {
  onImageUploaded: (imageUrl: string) => void;
  existingImageUrl?: string;
}

const RaffleImageUploader = ({ onImageUploaded, existingImageUrl }: RaffleImageUploaderProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(existingImageUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    // Basic validation
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (JPEG, PNG, etc.)",
        variant: "destructive"
      });
      return;
    }
    
    // Show preview immediately
    const previewUrl = URL.createObjectURL(file);
    setPreviewImage(previewUrl);
    
    // Create form data and upload
    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await fetch('/api/upload/raffle-image', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload image');
      }
      
      const data = await response.json();
      onImageUploaded(data.fileUrl);
      
      toast({
        title: "Image uploaded",
        description: "Your image has been uploaded successfully."
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
      
      // If upload fails, remove the preview
      if (!existingImageUrl) {
        setPreviewImage(null);
      } else {
        setPreviewImage(existingImageUrl);
      }
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleRemoveImage = () => {
    setPreviewImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onImageUploaded(''); // Clear the image URL
  };
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center justify-center border-2 border-dashed border-neutral-paper rounded-md p-6 transition-colors hover:border-primary">
        {previewImage ? (
          <div className="relative w-full">
            <img 
              src={previewImage} 
              alt="Raffle preview" 
              className="rounded-md max-h-[250px] mx-auto object-contain"
            />
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
            >
              <FiX size={16} />
            </button>
          </div>
        ) : (
          <div className="text-center p-8">
            <FiImage size={48} className="text-neutral-wood mx-auto mb-4" />
            <p className="text-neutral-wood mb-2">Upload a raffle image</p>
            <p className="text-xs text-neutral-wood/70 mb-4">Supports JPEG, PNG, GIF, and WebP</p>
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleButtonClick}
              disabled={isUploading}
            >
              {isUploading ? (
                <div className="flex items-center">
                  <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2" />
                  <span>Uploading...</span>
                </div>
              ) : (
                <div className="flex items-center">
                  <FiUpload className="mr-2" />
                  <span>Select Image</span>
                </div>
              )}
            </Button>
          </div>
        )}
        <Input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleUpload}
          disabled={isUploading}
        />
      </div>
    </div>
  );
};

export default RaffleImageUploader;