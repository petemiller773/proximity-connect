import { useState } from "react";
import BottomNav from "@/components/BottomNav";
import ProfileCard from "@/components/ProfileCard";
import { crossedPaths, NearbyPerson } from "@/lib/mockData";

const History = () => {
  const [selectedPerson, setSelectedPerson] = useState<NearbyPerson | null>(null);

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="pt-14 pb-4 px-6">
        <h1 className="text-2xl font-bold text-foreground">Crossed Paths</h1>
        <p className="text-sm text-muted-foreground mt-1">
          People you've been near recently
        </p>
      </div>

      <div className="px-4">
        {crossedPaths.map((person) => (
          <button
            key={person.id + person.crossedAt}
            onClick={() => setSelectedPerson(person)}
            className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-surface-warm active:scale-[0.99] transition-all"
          >
            <img
              src={person.avatar}
              alt={person.name}
              className="w-14 h-14 rounded-full object-cover border-2 border-primary/10"
            />
            <div className="flex-1 text-left">
              <h3 className="font-semibold text-foreground">{person.name}</h3>
              <p className="text-sm text-muted-foreground line-clamp-1">{person.bio}</p>
            </div>
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {person.crossedAt}
            </span>
          </button>
        ))}
      </div>

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

export default History;
