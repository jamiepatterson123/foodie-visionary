import React, { useState } from "react";
import { Upload, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

interface ImageUploadProps {
  onImageSelect: (image: File) => void;
  resetPreview?: boolean;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ onImageSelect, resetPreview }) => {
  const [preview, setPreview] = useState<string | null>(null);

  React.useEffect(() => {
    if (resetPreview) {
      setPreview(null);
    }
  }, [resetPreview]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    onImageSelect(file);
    
    e.target.value = '';
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <label
        htmlFor="image-upload"
        className="relative block w-full h-64 border border-solid border-gray-200 dark:border-gray-800 rounded-lg cursor-pointer hover:border-gray-300 dark:hover:border-gray-700 transition-colors"
      >
        <input
          id="image-upload"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageChange}
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
          {preview ? (
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover rounded-lg animate-fade-in"
            />
          ) : (
            <div className="text-center">
              <Upload className="mx-auto h-12 w-12 text-red-500" />
              <p className="mt-2 text-sm text-gray-600">
                Click or drag image to upload
              </p>
            </div>
          )}
        </div>
      </label>
    </div>
  );
};