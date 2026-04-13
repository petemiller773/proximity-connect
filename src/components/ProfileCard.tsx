import { NearbyPerson } from "@/lib/mockData";
import { X, CheckCircle, UserPlus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";

interface ProfileCardProps {
  person: NearbyPerson;
  onClose: () => void;
}

const ProfileCard = ({ person, onClose }: ProfileCardProps) => {
  const { user } = useAuth();
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);

  const handleConnect = async () => {
    if (!user || !person.userId) return;
    setConnecting(true);

    const { error } = await supabase.from("connections").insert({
      requester_id: user.id,
      receiver_id: person.userId,
    });

    if (error) {
      if (error.code === "23505") {
        toast.info("Connection request already sent!");
      } else {
        toast.error("Failed to send request");
      }
    } else {
      toast.success("Connection request sent!");
      setConnected(true);
    }
    setConnecting(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/30 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-card rounded-t-3xl p-6 pb-10 animate-fade-in-up shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 rounded-full bg-muted mx-auto mb-4" />

        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="relative">
            {person.avatar ? (
              <img
                src={person.avatar}
                alt={person.name}
                className="w-24 h-24 rounded-full object-cover border-4 border-primary/20 shadow-lg mb-2"
              />
            ) : (
              <div className="w-24 h-24 rounded-full border-4 border-primary/20 shadow-lg bg-primary/10 flex items-center justify-center mb-2">
                <span className="text-2xl font-bold text-primary">{person.name[0]?.toUpperCase()}</span>
              </div>
            )}
            {person.isVerified && (
              <div className="absolute bottom-1 right-0 w-7 h-7 rounded-full bg-green-500 flex items-center justify-center border-2 border-card">
                <CheckCircle className="w-4 h-4 text-primary-foreground" />
              </div>
            )}
          </div>

          <h2 className="text-xl font-bold text-foreground">{person.name}</h2>
          {person.isVerified && (
            <span className="text-xs text-green-600 font-medium flex items-center gap-1 mt-0.5">
              <CheckCircle className="w-3 h-3" /> Verified
            </span>
          )}
          <span className="text-sm text-primary font-medium mt-1">{person.distance}</span>
          {person.bio && (
            <p className="text-muted-foreground mt-3 text-sm leading-relaxed max-w-xs">
              {person.bio}
            </p>
          )}

          {person.socials.length > 0 && (
            <div className="mt-5 flex flex-col gap-2 w-full max-w-xs">
              {person.socials.map((social) => (
                <div
                  key={social.handle}
                  className="flex items-center justify-between px-4 py-3 rounded-xl bg-surface-warm"
                >
                  <span className="text-sm font-medium text-foreground">{social.platform}</span>
                  <span className="text-sm text-primary font-medium">{social.handle}</span>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={handleConnect}
            disabled={connecting || connected}
            className="mt-6 w-full max-w-xs py-3.5 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-primary/25 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            {connected ? "Request Sent" : connecting ? "Sending..." : "Connect"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
