import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Apple, Activity, Ring } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface HealthKitWindow extends Window {
  webkit?: {
    messageHandlers?: {
      healthKit?: {
        postMessage: (message: any) => Promise<any>;
      };
    };
  };
}

export const HealthDataConnect = () => {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    };
    getUser();
  }, []);

  const handleAppleHealthConnect = async () => {
    try {
      const healthKitWindow = window as HealthKitWindow;
      const healthData = await healthKitWindow.webkit?.messageHandlers?.healthKit?.postMessage({
        request: 'authorize',
        dataTypes: ['steps', 'weight', 'activeEnergy', 'heartRate']
      });

      if (healthData && userId) {
        const { error } = await supabase.functions.invoke('sync-apple-health', {
          body: { healthData, userId }
        });

        if (error) throw error;
        toast.success('Apple Health data synced successfully');
      }
    } catch (error) {
      console.error('Error connecting to Apple Health:', error);
      toast.error('Failed to connect to Apple Health');
    }
  };

  const handleWhoopConnect = async () => {
    try {
      window.open('https://api.whoop.com/oauth/authorize', '_blank');
      toast.success('Connected to Whoop successfully');
    } catch (error) {
      console.error('Error connecting to Whoop:', error);
      toast.error('Failed to connect to Whoop');
    }
  };

  const handleOuraConnect = async () => {
    try {
      window.open('https://cloud.ouraring.com/oauth/authorize', '_blank');
      toast.success('Connected to Oura Ring successfully');
    } catch (error) {
      console.error('Error connecting to Oura Ring:', error);
      toast.error('Failed to connect to Oura Ring');
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="p-6">
        <div className="flex items-center gap-4">
          <Apple className="h-8 w-8" />
          <div>
            <h3 className="text-lg font-semibold">Apple Health</h3>
            <p className="text-sm text-muted-foreground">
              Connect your Apple Health data for personalized insights
            </p>
          </div>
        </div>
        <Button 
          onClick={handleAppleHealthConnect}
          className="mt-4 w-full"
        >
          Connect Apple Health
        </Button>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-4">
          <Activity className="h-8 w-8" />
          <div>
            <h3 className="text-lg font-semibold">Whoop</h3>
            <p className="text-sm text-muted-foreground">
              Connect your Whoop data for recovery insights
            </p>
          </div>
        </div>
        <Button 
          onClick={handleWhoopConnect}
          className="mt-4 w-full"
        >
          Connect Whoop
        </Button>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-4">
          <Ring className="h-8 w-8" />
          <div>
            <h3 className="text-lg font-semibold">Oura Ring</h3>
            <p className="text-sm text-muted-foreground">
              Connect your Oura Ring for sleep and recovery data
            </p>
          </div>
        </div>
        <Button 
          onClick={handleOuraConnect}
          className="mt-4 w-full"
        >
          Connect Oura Ring
        </Button>
      </Card>
    </div>
  );
};