import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Home, UtensilsCrossed, LogOut, Key, UserRound, Send, ClipboardList, PlusCircle, UserCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setIsAuthenticated(!!session);
    });

    // Initialize theme from localStorage
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle("dark", savedTheme === "dark");
    }

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const handleShare = () => {
    try {
      const instagramUrl = `https://www.instagram.com/create/story?url=${encodeURIComponent(window.location.origin)}`;
      window.open(instagramUrl, '_blank');
      toast.success("Opening Instagram Stories...");
    } catch (error) {
      console.error('Error sharing:', error);
      toast.error("Couldn't open Instagram Stories. Please try again.");
    }
  };

  const toggleTheme = (checked: boolean) => {
    const newTheme = checked ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", checked);
  };

  const handleAddFood = () => {
    if (location.pathname !== '/') {
      navigate('/');
      // Add a small delay to ensure the image upload element is mounted
      setTimeout(() => {
        const imageUploadInput = document.getElementById('image-upload');
        if (imageUploadInput) {
          imageUploadInput.click();
        }
      }, 100);
    } else {
      const imageUploadInput = document.getElementById('image-upload');
      if (imageUploadInput) {
        imageUploadInput.click();
      }
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="border-b mb-6">
      <div className="max-w-4xl mx-auto p-4 flex justify-between items-center">
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <Link to="/">
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  <Home className="w-4 h-4 mr-2" />
                  Home
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <button
                onClick={handleAddFood}
                className={navigationMenuTriggerStyle()}
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                Add Food
              </button>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link to="/food-diary">
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  <UtensilsCrossed className="w-4 h-4 mr-2" />
                  Food Diary
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link to="/profile">
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  <UserRound className="w-4 h-4 mr-2" />
                  Biometrics
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link to="/reports">
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  <ClipboardList className="w-4 h-4 mr-2" />
                  Reports
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link to="/coach">
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  <UserCheck className="w-4 h-4 mr-2" />
                  Coach
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleShare}
            className="text-white"
          >
            <Send className="w-4 h-4" />
          </Button>
          <Link to="/api-settings">
            <Button
              variant="ghost"
              size="icon"
              className="text-white"
            >
              <Key className="w-4 h-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Light</span>
            <Switch
              checked={theme === "dark"}
              onCheckedChange={toggleTheme}
              className="data-[state=checked]:bg-primary"
            />
            <span className="text-sm text-muted-foreground">Dark</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="text-gray-600"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
};