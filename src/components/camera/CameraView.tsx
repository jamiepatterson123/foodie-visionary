import React from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface CameraViewProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  onCapture: () => void;
  onClose: () => void;
}

export const CameraView: React.FC<CameraViewProps> = ({
  videoRef,
  onCapture,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      <div className="relative flex-1">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />
        
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 text-white hover:bg-white/20"
          onClick={onClose}
        >
          <X className="h-6 w-6" />
        </Button>
      </div>

      <div className="bg-black/90 p-8">
        <div className="flex justify-center items-center">
          <Button
            size="lg"
            variant="outline"
            className="rounded-full w-20 h-20 p-0 border-4 border-white hover:bg-white/20"
            onClick={onCapture}
          >
            <div className="w-16 h-16 rounded-full bg-white" />
          </Button>
        </div>
      </div>
    </div>
  );
};