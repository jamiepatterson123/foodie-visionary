import React, { useState } from "react";
import { Home, BookOpen, Plus, Target, ChartBar } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImageAnalysisSection } from "@/components/analysis/ImageAnalysisSection";
import { WeightInput } from "@/components/WeightInput";

interface MobileNavProps {
  isAuthenticated: boolean;
}

export const MobileNav = ({ isAuthenticated }: MobileNavProps) => {
  const location = useLocation();
  const [analyzing, setAnalyzing] = useState(false);
  const [nutritionData, setNutritionData] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const isActive = (path: string) => {
    return location.pathname === path ? "text-primary" : "text-muted-foreground";
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t z-50">
        <nav className="flex items-center justify-between px-6 h-16">
          <Link to="/" className={`flex flex-col items-center ${isActive('/')}`}>
            <Home className="h-6 w-6" />
            <span className="text-xs mt-1">Home</span>
          </Link>
          
          <Link to="/food-diary" className={`flex flex-col items-center ${isActive('/food-diary')}`}>
            <BookOpen className="h-6 w-6" />
            <span className="text-xs mt-1">Diary</span>
          </Link>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger className="flex flex-col items-center -mt-8 relative">
              <div className="bg-primary rounded-full p-4">
                <Plus className="h-6 w-6 text-primary-foreground" />
              </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add Entry</DialogTitle>
              </DialogHeader>
              <Tabs defaultValue="food" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="food">Add Food</TabsTrigger>
                  <TabsTrigger value="weight">Update Weight</TabsTrigger>
                </TabsList>
                <TabsContent value="food" className="mt-4">
                  <ImageAnalysisSection
                    analyzing={analyzing}
                    setAnalyzing={setAnalyzing}
                    nutritionData={nutritionData}
                    setNutritionData={setNutritionData}
                    selectedDate={new Date()}
                    onSuccess={() => setDialogOpen(false)}
                  />
                </TabsContent>
                <TabsContent value="weight" className="mt-4">
                  <WeightInput onSuccess={() => setDialogOpen(false)} />
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
          
          <Link to="/profile" className={`flex flex-col items-center ${isActive('/profile')}`}>
            <Target className="h-6 w-6" />
            <span className="text-xs mt-1">Targets</span>
          </Link>
          
          <Link to="/reports" className={`flex flex-col items-center ${isActive('/reports')}`}>
            <ChartBar className="h-6 w-6" />
            <span className="text-xs mt-1">Dashboard</span>
          </Link>
        </nav>
      </div>
    </>
  );
};