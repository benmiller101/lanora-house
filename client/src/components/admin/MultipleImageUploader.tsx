import { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { FiUpload, FiImage, FiX, FiPlus } from 'react-icons/fi';

interface MultipleImageUploaderProps {
  onImagesChanged: (imageUrls: string[]) => void;
  existingImages?: string[];
  maxImages?: number;
  mainImageUrl?: string;
}

const MultipleImageUploader = ({ 
  onImagesChanged, 
  existingImages = [], 
  maxImages = 5,
  mainImageUrl 
}: MultipleImageUploaderProps) => {
  const [images, setImages] = useState<string[]>(existingImages);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    // Check if adding these files would exceed the limit
    if (images.length + files.length > maxImages) {
      toast({
        title: "Too many images",
        description: `You can only upload up to ${maxImages} additional images`,
        variant: "destructive"
      });
      return;
    }
    
    setIsUploading(true);
    const uploadedUrls: string[] = [];
    
    try {
      for (const file of Array.from(files)) {
        // Basic validation
        if (!file.type.startsWith('image/')) {
          toast({
            title: "Invalid file type",
            description: `${file.name} is not a valid image file`,
            variant: "destructive"
          });
          continue;
        }
        
        // Create form data and upload
        const formData = new FormData();
        formData.append('image', file);
        
        const response = await fetch('/api/upload/raffle-image', {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) {
          throw new Error(`Failed to upload ${file.name}`);
        }
        
        const data = await response.json();
        uploadedUrls.push(data.fileUrl);
      }
      
      const newImages = [...images, ...uploadedUrls];
      setImages(newImages);
      onImagesChanged(newImages);
      
      toast({
        title: "Images uploaded",
        description: `${uploadedUrls.length} image(s) uploaded successfully.`
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleRemoveImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    onImagesChanged(newImages);
  };
  
  const canAddMore = images.length < maxImages;
  
  return (
    <div className="space-y-4">
      {/* Main Image Reference */}
      {mainImageUrl && (
        <div className="mb-4">
          <p className="text-sm font-medium text-neutral-700 mb-2">Main Image</p>
          <div className="relative inline-block">
            <img 
              src={mainImageUrl} 
              alt="Main raffle image" 
              className="rounded-md max-h-[150px] object-contain border-2 border-primary/20"
            />
            <div className="absolute -top-2 -left-2 bg-primary text-white text-xs px-2 py-1 rounded-full">
              Main
            </div>
          </div>
        </div>
      )}
      
      {/* Additional Images Grid */}
      {images.length > 0 && (
        <div className="mb-4">
          <p className="text-sm font-medium text-neutral-700 mb-2">
            Additional Images ({images.length}/{maxImages})
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {images.map((imageUrl, index) => (
              <div key={index} className="relative group">
                <img 
                  src={imageUrl} 
                  alt={`Additional image ${index + 1}`} 
                  className="rounded-md h-32 w-full object-cover border border-neutral-200"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <FiX size={14} />
                </button>
                <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                  {index + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Upload Area */}
      {canAddMore && (
        <div className="border-2 border-dashed border-neutral-300 rounded-md p-6 text-center hover:border-primary transition-colors">
          {images.length === 0 ? (
            <div className="space-y-4">
              <FiImage size={48} className="text-neutral-400 mx-auto" />
              <div>
                <p className="text-neutral-700 font-medium">Upload Additional Images</p>
                <p className="text-sm text-neutral-500 mt-1">
                  Add up to {maxImages} additional photos to showcase your raffle item
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <FiPlus size={24} className="text-neutral-400 mx-auto" />
              <p className="text-sm text-neutral-600">Add More Images</p>
            </div>
          )}
          
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleButtonClick}
            disabled={isUploading}
            className="mt-4"
          >
            {isUploading ? (
              <div className="flex items-center">
                <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2" />
                <span>Uploading...</span>
              </div>
            ) : (
              <div className="flex items-center">
                <FiUpload className="mr-2" />
                <span>Select Images</span>
              </div>
            )}
          </Button>
          
          <Input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleUpload}
            disabled={isUploading}
          />
        </div>
      )}
      
      {!canAddMore && (
        <p className="text-sm text-neutral-500 text-center py-4">
          Maximum number of additional images reached ({maxImages})
        </p>
      )}
    </div>
  );
};

export { MultipleImageUploader };
export default MultipleImageUploader;