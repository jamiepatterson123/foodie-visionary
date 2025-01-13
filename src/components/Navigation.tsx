import React from "react";
import { DesktopNav } from "./navigation/DesktopNav";
import { MobileNav } from "./navigation/MobileNav";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";

export const Navigation = () => {
  const [analyzing, setAnalyzing] = React.useState(false);
  const [nutritionData, setNutritionData] = React.useState(null);
  const [session, setSession] = useState<Session | null>(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const selectedDate = new Date();

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // If there's no session or we're on the welcome page, don't render the navigation
  if (!session || window.location.pathname === '/welcome') return null;

  const handleShare = () => {
    // Implement share functionality
  };

  const theme = "light" as const;
  const toggleTheme = (checked: boolean) => {
    // Implement theme toggle functionality
  };

  const handleFileSelect = async (file: File) => {
    if (!file) {
      toast.error("No file selected");
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    setAnalyzing(true);

    setTimeout(() => {
      const imageAnalysisSection = document.querySelector('[data-image-analysis]');
      if (imageAnalysisSection && 'handleImageSelect' in imageAnalysisSection) {
        (imageAnalysisSection as any).handleImageSelect(file);
      } else {
        console.error("Image analysis section not found");
        toast.error("Failed to analyze image");
        setAnalyzing(false);
      }
    }, 100);
  };

  return (
    <div className="border-b">
      <div className="max-w-7xl mx-auto px-4 flex justify-between items-center h-16">
        <div className="flex items-center">
          <img 
            src="/lovable-uploads/6ef5be41-0092-4c12-a894-97b1e3f22f72.png" 
            alt="Leena.ai" 
            className="h-8"
          />
        </div>
        <DesktopNav 
          handleShare={handleShare}
          theme={theme}
          toggleTheme={toggleTheme}
        />
        <MobileNav 
          onAddClick={() => {}} 
          onFileSelect={handleFileSelect}
        />
      </div>
    </div>
  );
};