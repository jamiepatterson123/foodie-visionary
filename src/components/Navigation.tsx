import React, { useState } from "react";
import { DesktopNav } from "./navigation/DesktopNav";
import { MobileNav } from "./navigation/MobileNav";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ImageAnalysisSection } from "@/components/analysis/ImageAnalysisSection";
import { WeightInput } from "@/components/WeightInput";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";

export const Navigation = () => {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [nutritionData, setNutritionData] = React.useState<any>(null);
  const [activeTab, setActiveTab] = useState("food");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const isMobile = useIsMobile();
  const imageAnalysisSectionRef = React.useRef<any>(null);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "Check out this app!",
        text: "Track your nutrition and fitness goals",
        url: window.location.origin,
      }).catch(console.error);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const toggleTheme = (checked: boolean) => {
    setTheme(checked ? "dark" : "light");
  };

  const handleFileSelect = async (file: File) => {
    if (imageAnalysisSectionRef.current) {
      await imageAnalysisSectionRef.current.handleImageSelect(file);
    }
  };

  return (
    <>
      {!isMobile && (
        <div className="fixed left-0 top-0 h-full w-64 bg-background border-r flex flex-col">
          <div className="p-4 border-b">
            <h1 className="text-2xl font-bold text-primary">Leena.ai</h1>
          </div>
          <DesktopNav 
            handleShare={handleShare}
            handleSignOut={handleSignOut}
            theme={theme}
            toggleTheme={toggleTheme}
          />
        </div>
      )}

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl">
          <div className="space-y-4">
            {activeTab === "food" ? (
              <ImageAnalysisSection
                ref={imageAnalysisSectionRef}
                analyzing={analyzing}
                setAnalyzing={setAnalyzing}
                nutritionData={nutritionData}
                setNutritionData={setNutritionData}
                selectedDate={new Date()}
                onSuccess={() => setShowAddDialog(false)}
              />
            ) : (
              <WeightInput onSuccess={() => setShowAddDialog(false)} />
            )}
          </div>
        </DialogContent>
      </Dialog>

      <MobileNav onAddClick={() => setShowAddDialog(true)} />
    </>
  );
};