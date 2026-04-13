import { useState, useEffect, useCallback } from "react";
import RadarView from "@/components/RadarView";
import ProfileCard from "@/components/ProfileCard";
import BottomNav from "@/components/BottomNav";
import { NearbyPerson } from "@/lib/mockData";
import { useGeolocation } from "@/hooks/useGeolocation";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { MapPin, AlertTriangle, Loader2 } from "lucide-react";

const Discover = () => {
  const { user } = useAuth();
  const geo = useGeolocation();
  usePushNotifications();
  const [selectedPerson, setSelectedPerson] = useState<NearbyPerson | null>(null);
  const [nearbyPeople, setNearbyPeople] = useState<NearbyPerson[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNearby = useCallback(async () => {
    if (!user || !geo.latitude || !geo.longitude) return;

    const { data, error } = await supabase.rpc("get_nearby_users", {
      p_user_id: user.id,
      p_lat: geo.latitude,
      p_lng: geo.longitude,
      p_radius_miles: 2.5,
    });

    if (!error && data) {
      const people: NearbyPerson[] = (data as any[]).map((u, i) => {
        const distMiles = u.distance_miles as number;
        let distLabel: string;
        if (distMiles < 0.1) distLabel = `${Math.round(distMiles * 5280)} ft away`;
        else distLabel = `${distMiles.toFixed(1)} mi away`;

        return {
          id: u.user_id,
          userId: u.user_id,
          name: u.display_name || "Nearby User",
          bio: u.bio || "",
          avatar: u.avatar_url || "",
          distance: distLabel,
          distanceMiles: distMiles,
          socials: [],
          angle: (i * (360 / Math.max((data as any[]).length, 1))) + (Math.random() * 20 - 10),
          radius: Math.min(0.2 + distMiles / 2.5 * 0.7, 0.95),
          isVerified: u.is_verified,
        };
      });
      setNearbyPeople(people);
    }
    setLoading(false);
  }, [user, geo.latitude, geo.longitude]);

  useEffect(() => {
    fetchNearby();
    const interval = setInterval(fetchNearby, 15000);
    return () => clearInterval(interval);
  }, [fetchNearby]);

  // Location error screen
  if (geo.error) {
    return (
      <div className="min-h-screen bg-background pb-20 flex flex-col">
        <div className="pt-14 pb-4 px-6 text-center">
          <h1 className="text-2xl font-bold text-foreground">Nearby</h1>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
          <AlertTriangle className="w-12 h-12 text-destructive mb-4" />
          <h2 className="text-lg font-semibold text-foreground mb-2">Location Required</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {geo.error}
          </p>
          <p className="text-xs text-muted-foreground mt-4">
            Go to your device Settings → Privacy → Location Services and enable location for your browser.
          </p>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="pt-14 pb-4 px-6 text-center">
        <h1 className="text-2xl font-bold text-foreground">Nearby</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {loading ? "Scanning..." : `${nearbyPeople.length} people within 2.5 miles`}
        </p>
      </div>

      {/* Location tracking indicator */}
      <div className="flex items-center justify-center gap-2 mb-2">
        <div className={`w-2 h-2 rounded-full ${geo.isTracking ? "bg-green-500 animate-pulse" : "bg-muted-foreground"}`} />
        <span className="text-[10px] text-muted-foreground">
          {geo.isTracking ? "Location active" : "Acquiring location..."}
        </span>
        {geo.lastUpdate && (
          <span className="text-[10px] text-muted-foreground">
            • Updated {Math.round((Date.now() - geo.lastUpdate.getTime()) / 1000)}s ago
          </span>
        )}
      </div>

      {/* Radar */}
      <div className="px-6 py-8">
        {!geo.latitude ? (
          <div className="flex flex-col items-center justify-center h-[340px]">
            <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
            <p className="text-sm text-muted-foreground">Getting your location...</p>
          </div>
        ) : (
          <RadarView people={nearbyPeople} onPersonTap={setSelectedPerson} />
        )}
      </div>

      {/* Hint */}
      {nearbyPeople.length > 0 && (
        <p className="text-center text-xs text-muted-foreground px-8">
          Tap on a person to view their profile and connect
        </p>
      )}
      {!loading && nearbyPeople.length === 0 && geo.latitude && (
        <p className="text-center text-sm text-muted-foreground px-8">
          No one nearby right now. Check back soon!
        </p>
      )}

      {/* Profile Card */}
      {selectedPerson && (
        <ProfileCard
          person={selectedPerson}
          onClose={() => setSelectedPerson(null)}
        />
      )}

      <BottomNav />
    </div>
  );
};

export default Discover;
