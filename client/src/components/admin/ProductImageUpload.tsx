import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FiUpload, FiLink } from "react-icons/fi";
import {
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useFormContext, Controller } from "react-hook-form";

export function ProductImageUpload({ name = "imageUrl" }) {
  const form = useFormContext();
  
  return (
    <Controller
      control={form.control}
      name={name}
      render={({ field }) => {
        const [inputType, setInputType] = useState<"file" | "url">(
          typeof field.value === "string" ? "url" : "file"
        );
        
        const [preview, setPreview] = useState<string | null>(
          typeof field.value === "string" ? field.value : null
        );
        
        // Handle file selection
        const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          const file = e.target.files?.[0];
          if (file) {
            // Create preview URL
            const objectUrl = URL.createObjectURL(file);
            setPreview(objectUrl);
            field.onChange(file);
            setInputType("file");
            
            // Clean up preview URL when component unmounts
            return () => URL.revokeObjectURL(objectUrl);
          }
        };
        
        // Handle URL input
        const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          const url = e.target.value;
          setPreview(url);
          field.onChange(url);
        };
        
        return (
          <FormItem>
            <FormLabel>Product Image</FormLabel>
            <FormControl>
              <div className="space-y-4">
                {/* Image preview */}
                {preview && (
                  <div className="mb-4 border rounded-md overflow-hidden">
                    <img 
                      src={preview} 
                      alt="Image preview" 
                      className="h-40 w-auto object-contain"
                    />
                  </div>
                )}
                
                {/* Toggle buttons */}
                <div className="flex space-x-2">
                  <Button
                    type="button"
                    size="sm"
                    variant={inputType === "file" ? "default" : "outline"}
                    onClick={() => setInputType("file")}
                  >
                    <FiUpload className="mr-2 h-4 w-4" />
                    Upload File
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={inputType === "url" ? "default" : "outline"}
                    onClick={() => setInputType("url")}
                  >
                    <FiLink className="mr-2 h-4 w-4" />
                    Enter URL
                  </Button>
                </div>
                
                {/* Input field based on selected type */}
                {inputType === "file" ? (
                  <div>
                    <Label htmlFor="image-upload">Upload image file</Label>
                    <Input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="cursor-pointer"
                    />
                  </div>
                ) : (
                  <div>
                    <Label htmlFor="image-url">Image URL</Label>
                    <Input
                      id="image-url"
                      type="url"
                      placeholder="https://example.com/image.jpg"
                      value={typeof field.value === "string" ? field.value : ""}
                      onChange={handleUrlChange}
                    />
                  </div>
                )}
              </div>
            </FormControl>
            <FormDescription>
              Upload an image file or provide a URL
            </FormDescription>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}