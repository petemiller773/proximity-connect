import { useState, useEffect } from "react";
import BottomNav from "@/components/BottomNav";
import ProfileCard from "@/components/ProfileCard";
import { NearbyPerson } from "@/lib/mockData";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Clock } from "lucide-react";

const History = () => {
  const { user } = useAuth();
  const [selectedPerson, setSelectedPerson] = useState<NearbyPerson | null>(null);
  const [history, setHistory] = useState<(NearbyPerson & { crossedAt: string })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const loadHistory = async () => {
      // Show accepted connections as "crossed paths"
      const { data: connections } = await supabase
        .from("connections")
        .select("*")
        .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .eq("status", "accepted")
        .order("updated_at", { ascending: false });

      if (!connections) {
        setLoading(false);
        return;
      }

      const otherIds = connections.map((c) =>
        c.requester_id === user.id ? c.receiver_id : c.requester_id
      );

      if (otherIds.length === 0) {
        setLoading(false);
        return;
      }

      const { data: profiles } = await supabase
        .from("profiles")
        .select("*")
        .in("user_id", otherIds);

      const items = connections.map((conn) => {
        const otherId = conn.requester_id === user.id ? conn.receiver_id : conn.requester_id;
        const profile = profiles?.find((p) => p.user_id === otherId);
        return {
          id: conn.id,
          userId: otherId,
          name: profile?.display_name || "User",
          bio: profile?.bio || "",
          avatar: profile?.avatar_url || "",
          distance: "",
          distanceMiles: 0,
          socials: [],
          angle: 0,
          radius: 0,
          isVerified: profile?.is_verified || false,
          crossedAt: new Date(conn.updated_at).toLocaleDateString(undefined, {
            month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
          }),
        };
      });

      setHistory(items);
      setLoading(false);
    };
    loadHistory();
  }, [user]);

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="pt-14 pb-4 px-6">
        <h1 className="text-2xl font-bold text-foreground">Connections</h1>
        <p className="text-sm text-muted-foreground mt-1">
          People you've connected with
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <p className="text-muted-foreground text-sm">Loading...</p>
        </div>
      ) : history.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] px-6 text-center">
          <Clock className="w-12 h-12 text-muted-foreground/40 mb-3" />
          <p className="text-foreground font-medium">No connections yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Your accepted connections will appear here
          </p>
        </div>
      ) : (
        <div className="px-4">
          {history.map((person) => (
            <button
              key={person.id}
              onClick={() => setSelectedPerson(person)}
              className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-surface-warm active:scale-[0.99] transition-all"
            >
              {person.avatar ? (
                <img
                  src={person.avatar}
                  alt={person.name}
                  className="w-14 h-14 rounded-full object-cover border-2 border-primary/10"
                />
              ) : (
                <div className="w-14 h-14 rounded-full border-2 border-primary/10 bg-primary/10 flex items-center justify-center">
                  <span className="text-lg font-bold text-primary">{person.name[0]?.toUpperCase()}</span>
                </div>
              )}
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
      )}

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
