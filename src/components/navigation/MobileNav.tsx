import React, { useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, LineChart, User, Book, Plus } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface MobileNavProps {
  onAddClick: () => void;
  onFileSelect?: (file: File) => void;
}

export const MobileNav = ({ onAddClick, onFileSelect }: MobileNavProps) => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isActive = (path: string) => {
    return location.pathname === path
      ? "text-primary"
      : "text-muted-foreground hover:text-primary transition-colors";
  };

  const handlePlusClick = (e: React.MouseEvent) => {
    if (onFileSelect) {
      fileInputRef.current?.click();
    } else {
      onAddClick();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onFileSelect) {
      onFileSelect(file);
      e.target.value = '';
    }
  };

  if (!isMobile) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t z-50 md:hidden">
      <nav className="flex items-center justify-between px-6 py-2 h-16">
        <Link to="/" className={`flex flex-col items-center ${isActive('/')}`}>
          <Home className="h-6 w-6" />
          <span className="text-xs mt-1">Home</span>
        </Link>
        
        <Link to="/reports" className={`flex flex-col items-center ${isActive('/reports')}`}>
          <LineChart className="h-6 w-6" />
          <span className="text-xs mt-1">Reports</span>
        </Link>
        
        <div className="flex flex-col items-center">
          <button 
            onClick={handlePlusClick}
            className="bg-black rounded-full p-4 hover:bg-gray-800 transition-colors"
          >
            <Plus className="h-6 w-6 text-white" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
            capture="environment"
          />
        </div>
        
        <Link to="/food-diary" className={`flex flex-col items-center ${isActive('/food-diary')}`}>
          <Book className="h-6 w-6" />
          <span className="text-xs mt-1">Diary</span>
        </Link>
        
        <Link to="/profile" className={`flex flex-col items-center ${isActive('/profile')}`}>
          <User className="h-6 w-6" />
          <span className="text-xs mt-1">Profile</span>
        </Link>
      </nav>
    </div>
  );
};