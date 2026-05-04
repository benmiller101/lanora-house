import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Upload, Image as ImageIcon, X } from "lucide-react";

interface ImageUploaderProps {
  onImageUploaded: (url: string) => void;
  currentImageUrl?: string;
  className?: string;
  endpoint?: string;
  buttonLabel?: React.ReactNode;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
}

export function ImageUploader({ 
  onImageUploaded, 
  currentImageUrl, 
  className,
  endpoint = "product-image",
  buttonLabel,
  variant = "outline" 
}: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImageUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

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
      const response = await fetch(`/api/upload/${endpoint}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const data = await response.json();
      
      // Pass the URL back
      onImageUploaded(data.fileUrl);
      
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
    onImageUploaded('');
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // If we're just showing a button (for additional images)
  if (buttonLabel) {
    return (
      <>
        <Input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/jpeg,image/png,image/gif,image/webp"
          onChange={handleFileChange}
        />
        <Button
          type="button"
          variant={variant}
          onClick={triggerFileInput}
          disabled={isUploading}
          className={className}
        >
          {isUploading ? "Uploading..." : buttonLabel}
        </Button>
      </>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Hidden file input */}
      <Input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/jpeg,image/png,image/gif,image/webp"
        onChange={handleFileChange}
      />
      
      {/* Image preview */}
      {preview ? (
        <div className="relative rounded-md overflow-hidden border border-border">
          <img 
            src={preview} 
            alt="Preview" 
            className="w-full h-40 object-contain bg-secondary/20"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8 rounded-full"
            onClick={handleRemoveImage}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div 
          className="border-2 border-dashed border-border rounded-md p-6 flex flex-col items-center justify-center h-40 bg-secondary/10 cursor-pointer hover:bg-secondary/20 transition-colors"
          onClick={triggerFileInput}
        >
          <ImageIcon className="h-10 w-10 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">
            Click to upload an image
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            JPEG, PNG, GIF or WebP (max 5MB)
          </p>
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