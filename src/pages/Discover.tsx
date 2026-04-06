import { useState } from "react";
import RadarView from "@/components/RadarView";
import ProfileCard from "@/components/ProfileCard";
import BottomNav from "@/components/BottomNav";
import { nearbyPeople, NearbyPerson } from "@/lib/mockData";

const Discover = () => {
  const [selectedPerson, setSelectedPerson] = useState<NearbyPerson | null>(null);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="pt-14 pb-4 px-6 text-center">
        <h1 className="text-2xl font-bold text-foreground">Nearby</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {nearbyPeople.length} people around you
        </p>
      </div>

      {/* Radar */}
      <div className="px-6 py-8">
        <RadarView people={nearbyPeople} onPersonTap={setSelectedPerson} />
      </div>

      {/* Hint */}
      <p className="text-center text-xs text-muted-foreground px-8">
        Tap on a person to view their profile and connect
      </p>

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
