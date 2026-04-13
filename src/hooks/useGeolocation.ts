import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  error: string | null;
  isTracking: boolean;
  lastUpdate: Date | null;
}

export const useGeolocation = () => {
  const { user } = useAuth();
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    error: null,
    isTracking: false,
    lastUpdate: null,
  });
  const watchIdRef = useRef<number | null>(null);
  const updateTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const latestCoordsRef = useRef<{ lat: number; lng: number } | null>(null);

  const updateLocationInDb = useCallback(
    async (lat: number, lng: number) => {
      if (!user) return;
      await supabase
        .from("profiles")
        .update({
          latitude: lat,
          longitude: lng,
          last_location_update: new Date().toISOString(),
        } as any)
        .eq("user_id", user.id);
      setState((s) => ({ ...s, lastUpdate: new Date() }));
    },
    [user]
  );

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setState((s) => ({ ...s, error: "Geolocation is not supported by your browser" }));
      return;
    }

    // Watch position continuously
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        latestCoordsRef.current = { lat: latitude, lng: longitude };
        setState((s) => ({
          ...s,
          latitude,
          longitude,
          error: null,
          isTracking: true,
        }));
      },
      (err) => {
        let errorMsg = "Location access denied. Please enable location in your device settings.";
        if (err.code === 2) errorMsg = "Location unavailable. Please try again.";
        if (err.code === 3) errorMsg = "Location request timed out.";
        setState((s) => ({ ...s, error: errorMsg, isTracking: false }));
      },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 }
    );
    watchIdRef.current = watchId;

    // Update DB every 30 seconds
    updateTimerRef.current = setInterval(() => {
      if (latestCoordsRef.current) {
        updateLocationInDb(latestCoordsRef.current.lat, latestCoordsRef.current.lng);
      }
    }, 30000);

    // Initial update
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        latestCoordsRef.current = { lat: latitude, lng: longitude };
        setState((s) => ({ ...s, latitude, longitude, isTracking: true, error: null }));
        updateLocationInDb(latitude, longitude);
      },
      () => {},
      { enableHighAccuracy: true, timeout: 15000 }
    );
  }, [updateLocationInDb]);

  useEffect(() => {
    if (user) startTracking();
    return () => {
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
      if (updateTimerRef.current) clearInterval(updateTimerRef.current);
    };
  }, [user, startTracking]);

  return state;
};
