import { useState, useRef } from 'react';
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { FiUpload, FiX, FiImage, FiLoader } from 'react-icons/fi';

interface BeforeAfterImageUploaderProps {
  onImagesChanged: (beforeImages: string[], afterImages: string[]) => void;
  existingBeforeImages?: string[];
  existingAfterImages?: string[];
  maxImagesPerType?: number;
}

const BeforeAfterImageUploader = ({
  onImagesChanged,
  existingBeforeImages = [],
  existingAfterImages = [],
  maxImagesPerType = 10,
}: BeforeAfterImageUploaderProps) => {
  const { toast } = useToast();
  const [beforeImages, setBeforeImages] = useState<string[]>(existingBeforeImages);
  const [afterImages, setAfterImages] = useState<string[]>(existingAfterImages);
  const [uploadingBefore, setUploadingBefore] = useState(false);
  const [uploadingAfter, setUploadingAfter] = useState(false);

  const beforeInputRef = useRef<HTMLInputElement>(null);
  const afterInputRef = useRef<HTMLInputElement>(null);

  // Drag state — tracked per grid with separate state objects
  const [beforeDrag, setBeforeDrag] = useState<{ src: number | null; over: number | null }>({ src: null, over: null });
  const [afterDrag, setAfterDrag] = useState<{ src: number | null; over: number | null }>({ src: null, over: null });

  const uploadFiles = async (files: FileList, type: 'before' | 'after') => {
    const currentCount = type === 'before' ? beforeImages.length : afterImages.length;
    const remaining = maxImagesPerType - currentCount;
    if (remaining <= 0) {
      toast({ title: 'Limit reached', description: `Maximum ${maxImagesPerType} images per section`, variant: 'destructive' });
      return;
    }

    const filesToUpload = Array.from(files).slice(0, remaining);
    if (type === 'before') setUploadingBefore(true);
    else setUploadingAfter(true);

    try {
      const formData = new FormData();
      filesToUpload.forEach(f => formData.append('images', f));

      const res = await fetch('/api/upload/before-after', { method: 'POST', body: formData });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      const newUrls: string[] = data.urls || [];

      if (type === 'before') {
        setBeforeImages(prev => {
          const updated = [...prev, ...newUrls];
          onImagesChanged(updated, afterImages);
          return updated;
        });
      } else {
        setAfterImages(prev => {
          const updated = [...prev, ...newUrls];
          onImagesChanged(beforeImages, updated);
          return updated;
        });
      }

      toast({ title: 'Uploaded', description: `${newUrls.length} photo${newUrls.length !== 1 ? 's' : ''} added` });
    } catch {
      toast({ title: 'Upload failed', description: 'Could not upload photos. Please try again.', variant: 'destructive' });
    } finally {
      if (type === 'before') setUploadingBefore(false);
      else setUploadingAfter(false);
      if (type === 'before' && beforeInputRef.current) beforeInputRef.current.value = '';
      if (type === 'after' && afterInputRef.current) afterInputRef.current.value = '';
    }
  };

  const removeImage = (type: 'before' | 'after', index: number) => {
    if (type === 'before') {
      const updated = beforeImages.filter((_, i) => i !== index);
      setBeforeImages(updated);
      onImagesChanged(updated, afterImages);
    } else {
      const updated = afterImages.filter((_, i) => i !== index);
      setAfterImages(updated);
      onImagesChanged(beforeImages, updated);
    }
  };

  // Swap two positions in an array immutably
  const swapItems = (arr: string[], a: number, b: number): string[] => {
    const next = [...arr];
    [next[a], next[b]] = [next[b], next[a]];
    return next;
  };

  const renderUploadZone = (
    type: 'before' | 'after',
    images: string[],
    uploading: boolean,
    inputRef: React.RefObject<HTMLInputElement>
  ) => {
    const label = type === 'before' ? 'Before Photos' : 'After Photos';
    const hint = type === 'before'
      ? 'Position 1 pairs with After photo #1, position 2 with #2, and so on.'
      : 'Position 1 pairs with Before photo #1, position 2 with #2, and so on.';
    const iconColour  = type === 'before' ? 'text-red-500' : 'text-green-500';
    const borderColour = type === 'before'
      ? 'border-red-200 hover:border-red-400'
      : 'border-green-200 hover:border-green-400';
    const accentBorder = type === 'before' ? 'border-red-400' : 'border-green-400';
    const badgeColour  = type === 'before' ? 'bg-red-600' : 'bg-green-600';

    const drag   = type === 'before' ? beforeDrag : afterDrag;
    const setDrag = type === 'before' ? setBeforeDrag : setAfterDrag;

    const handleDragStart = (idx: number) => {
      setDrag({ src: idx, over: null });
    };

    const handleDragOver = (e: React.DragEvent, idx: number) => {
      e.preventDefault();
      if (drag.src === null || drag.src === idx) return;
      setDrag(d => ({ ...d, over: idx }));
    };

    const handleDrop = (e: React.DragEvent, idx: number) => {
      e.preventDefault();
      if (drag.src === null || drag.src === idx) {
        setDrag({ src: null, over: null });
        return;
      }

      const reordered = swapItems(images, drag.src, idx);
      setDrag({ src: null, over: null });

      if (type === 'before') {
        setBeforeImages(reordered);
        onImagesChanged(reordered, afterImages);
      } else {
        setAfterImages(reordered);
        onImagesChanged(beforeImages, reordered);
      }
    };

    const handleDragEnd = () => {
      setDrag({ src: null, over: null });
    };

    return (
      <div className="space-y-3">
        <div>
          <Label className="text-base font-semibold flex items-center gap-2">
            <FiImage className={iconColour} />
            {label} ({images.length}/{maxImagesPerType})
          </Label>
          <p className="text-xs text-neutral-400 mt-0.5">{hint}</p>
        </div>

        {images.length < maxImagesPerType && (
          <div
            className={`border-2 border-dashed rounded-lg p-5 text-center cursor-pointer transition-colors ${borderColour}`}
            onDrop={(e) => { e.preventDefault(); e.dataTransfer.files.length && uploadFiles(e.dataTransfer.files, type); }}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => inputRef.current?.click()}
          >
            <input
              ref={inputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              multiple
              className="hidden"
              onChange={(e) => e.target.files && uploadFiles(e.target.files, type)}
            />
            {uploading ? (
              <div className="flex flex-col items-center gap-2 text-neutral-500">
                <FiLoader className="animate-spin w-8 h-8" />
                <span className="text-sm">Uploading…</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-neutral-500">
                <FiUpload className="w-8 h-8" />
                <span className="text-sm font-medium">Click to upload or drag &amp; drop</span>
                <span className="text-xs">PNG, JPG, WEBP — up to 10 images</span>
              </div>
            )}
          </div>
        )}

        {images.length > 0 ? (
          <div className="grid grid-cols-3 gap-2">
            {images.map((url, idx) => {
              const isDragging = drag.src === idx;
              const isTarget   = drag.over === idx && drag.src !== null && drag.src !== idx;

              return (
                <div
                  key={url + idx}
                  draggable
                  onDragStart={() => handleDragStart(idx)}
                  onDragOver={(e) => handleDragOver(e, idx)}
                  onDrop={(e) => handleDrop(e, idx)}
                  onDragEnd={handleDragEnd}
                  className={[
                    'relative group aspect-square rounded border overflow-hidden bg-gray-100 cursor-grab active:cursor-grabbing transition-all duration-150',
                    isDragging  ? 'opacity-40 scale-95 shadow-lg'                           : '',
                    isTarget    ? `border-2 border-dashed ${accentBorder} ring-2 ring-offset-1 ring-current scale-[1.03] shadow-md` : '',
                  ].join(' ')}
                >
                  <img
                    src={url}
                    alt={`${type} ${idx + 1}`}
                    className="w-full h-full object-cover pointer-events-none select-none"
                    draggable={false}
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />

                  {/* Remove button — visible on hover */}
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); removeImage(type, idx); }}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow z-10"
                    title="Remove photo"
                  >
                    <FiX size={12} />
                  </button>

                  {/* Position badge — updates live after reorder */}
                  <span className={`absolute bottom-0 left-0 right-0 ${badgeColour} text-white text-xs text-center py-0.5 font-bold pointer-events-none`}>
                    {idx + 1}
                  </span>

                  {/* Drag-target overlay text */}
                  {isTarget && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/30 z-10 pointer-events-none">
                      <span className="text-xs font-semibold text-white drop-shadow">Drop here</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-neutral-400 text-center">No photos yet</p>
        )}

        {images.length > 1 && (
          <p className="text-xs text-neutral-400">
            Drag thumbnails to reorder — position numbers update automatically.
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {renderUploadZone('before', beforeImages, uploadingBefore, beforeInputRef)}
      {renderUploadZone('after', afterImages, uploadingAfter, afterInputRef)}
    </div>
  );
};

export { BeforeAfterImageUploader };
