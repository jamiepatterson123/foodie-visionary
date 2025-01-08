import React, { useState, forwardRef, useImperativeHandle } from "react";
import { ImageUpload } from "@/components/ImageUpload";
import { toast } from "sonner";
import { analyzeImage } from "./ImageAnalyzer";
import { saveFoodEntries } from "./FoodEntrySaver";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { FoodVerificationDialog } from "./FoodVerificationDialog";
import { useIsMobile } from "@/hooks/use-mobile";

interface ImageAnalysisSectionProps {
  analyzing: boolean;
  setAnalyzing: (analyzing: boolean) => void;
  nutritionData: any;
  setNutritionData: (data: any) => void;
  selectedDate: Date;
  onSuccess?: () => void;
}

export const ImageAnalysisSection = forwardRef<any, ImageAnalysisSectionProps>(({
  analyzing,
  setAnalyzing,
  nutritionData,
  setNutritionData,
  selectedDate,
  onSuccess,
}, ref) => {
  const [resetUpload, setResetUpload] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [analyzedFoods, setAnalyzedFoods] = useState([]);
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  const componentRef = React.useRef<HTMLDivElement>(null);

  const handleImageSelect = async (image: File) => {
    if (!image) {
      toast.error("No image selected");
      return;
    }

    console.log("handleImageSelect called with image:", image);
    
    if (analyzing) {
      toast.error("Please wait for the current analysis to complete");
      return;
    }

    setAnalyzing(true);
    setResetUpload(false);
    
    try {
      console.log("Starting image analysis...");
      const result = await analyzeImage(image, {
        setNutritionData,
        saveFoodEntries: async () => {}, // Don't save immediately
      });
      
      console.log("Analysis result:", result);
      
      if (result?.foods) {
        setAnalyzedFoods(result.foods);
        setShowVerification(true);
      } else {
        throw new Error("Invalid analysis result");
      }
    } catch (error) {
      console.error("Error analyzing image:", error);
      const errorMessage = error instanceof Error ? error.message : "Error analyzing image";
      toast.error(errorMessage);
    } finally {
      setAnalyzing(false);
    }
  };

  useImperativeHandle(ref, () => ({
    handleImageSelect
  }));

  // Expose handleImageSelect to the window for the mobile navigation
  React.useEffect(() => {
    if (componentRef.current) {
      (componentRef.current as any).handleImageSelect = handleImageSelect;
    }
  }, []);

  const handleConfirmFoods = async (foods: any[]) => {
    try {
      await saveFoodEntries(foods, selectedDate);
      await queryClient.invalidateQueries({ 
        queryKey: ["foodDiary", format(selectedDate, "yyyy-MM-dd")] 
      });
      setResetUpload(true);
      setShowVerification(false);
      toast.success("Food added to diary!");
      onSuccess?.();
    } catch (error) {
      console.error("Error saving food entries:", error);
      toast.error("Failed to save food entries");
    }
  };

  return (
    <div className="space-y-8" ref={componentRef} data-image-analysis>
      <ImageUpload onImageSelect={handleImageSelect} resetPreview={resetUpload} />
      {analyzing && (
        <p className="text-center text-gray-600 animate-pulse">
          Analyzing your meal...
        </p>
      )}
      <FoodVerificationDialog
        isOpen={showVerification}
        onClose={() => setShowVerification(false)}
        foods={analyzedFoods}
        onConfirm={handleConfirmFoods}
      />
    </div>
  );
});

ImageAnalysisSection.displayName = "ImageAnalysisSection";