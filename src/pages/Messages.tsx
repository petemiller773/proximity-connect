import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import { MessageCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const Messages = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      // Get all accepted connections
      const { data: connections } = await supabase
        .from("connections")
        .select("*")
        .eq("status", "accepted")
        .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`);

      if (!connections || connections.length === 0) {
        setLoading(false);
        return;
      }

      // Get profiles for other users
      const otherIds = connections.map((c: any) =>
        c.requester_id === user.id ? c.receiver_id : c.requester_id
      );

      const { data: profiles } = await supabase
        .from("profiles")
        .select("*")
        .in("user_id", otherIds);

      const convos = connections.map((conn: any) => {
        const otherId = conn.requester_id === user.id ? conn.receiver_id : conn.requester_id;
        const profile = profiles?.find((p: any) => p.user_id === otherId);
        return { connection: conn, profile };
      });

      setConversations(convos);
      setLoading(false);
    };

    load();
  }, [user]);

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="pt-14 pb-4 px-6">
        <h1 className="text-2xl font-bold text-foreground">Messages</h1>
        <p className="text-sm text-muted-foreground mt-1">Your connections</p>
      </div>

      {loading ? (
        <div className="px-6 py-12 text-center text-muted-foreground text-sm">Loading...</div>
      ) : conversations.length === 0 ? (
        <div className="px-6 py-12 text-center">
          <MessageCircle className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">No connections yet</p>
          <p className="text-muted-foreground/60 text-xs mt-1">
            Connect with someone nearby to start chatting
          </p>
        </div>
      ) : (
        <div className="px-4">
          {conversations.map(({ connection, profile }) => (
            <button
              key={connection.id}
              onClick={() => navigate(`/chat/${connection.id}`)}
              className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-surface-warm active:scale-[0.99] transition-all"
            >
              <img
                src={profile?.avatar_url || ""}
                alt={profile?.display_name || "User"}
                className="w-14 h-14 rounded-full object-cover border-2 border-primary/10 bg-primary/10"
              />
              <div className="flex-1 text-left">
                <h3 className="font-semibold text-foreground">
                  {profile?.display_name || "User"}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-1">
                  {profile?.bio || "Tap to chat"}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      <BottomNav />
    </div>
  );
};

export default Messages;
