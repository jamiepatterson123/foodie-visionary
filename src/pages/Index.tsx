import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ProfileHeader } from "@/components/home/ProfileHeader";
import { HomeDataSection } from "@/components/home/HomeDataSection";

const Index = () => {
  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error) {
        toast.error("Error fetching profile");
        throw error;
      }

      return data;
    },
  });

  const { data: apiKey } = useQuery({
    queryKey: ["openai-api-key"],
    queryFn: async () => {
      const savedKey = localStorage.getItem("openai_api_key");
      if (savedKey) {
        return savedKey;
      }

      const { data, error } = await supabase
        .from("secrets")
        .select("value")
        .eq("name", "OPENAI_API_KEY")
        .maybeSingle();

      if (error) {
        toast.error("Error fetching API key");
        throw error;
      }

      if (!data) {
        toast.error("Please set your OpenAI API key in API Settings first");
        return null;
      }

      return data.value;
    },
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 pb-20 md:pb-8">
      <ProfileHeader profile={profile} />
      <HomeDataSection apiKey={apiKey} />
    </div>
  );
};

export default Index;