import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import { Bell, Check, X, CircleAlert as AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Notifications = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    loadRequests();
  }, [user]);

  const loadRequests = async () => {
    if (!user) return;
    const { data: connections } = await supabase
      .from("connections")
      .select("*")
      .eq("receiver_id", user.id)
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (!connections) {
      setLoading(false);
      return;
    }

    const requesterIds = connections.map((c) => c.requester_id);
    const { data: profiles } = await supabase
      .from("profiles")
      .select("*")
      .in("user_id", requesterIds);

    const reqs = connections.map((conn) => {
      const profile = profiles?.find((p) => p.user_id === conn.requester_id);
      return { connection: conn, profile };
    });

    setRequests(reqs);
    setLoading(false);
  };

  const handleAccept = async (connectionId: string) => {
    if (!user) return;
    setProcessingId(connectionId);

    const { error } = await supabase
      .from("connections")
      .update({ status: "accepted" })
      .eq("id", connectionId);

    if (error) {
      toast.error("Failed to accept request");
    } else {
      toast.success("Connection accepted!");
      setRequests(requests.filter((r) => r.connection.id !== connectionId));
    }
    setProcessingId(null);
  };

  const handleDecline = async (connectionId: string) => {
    if (!user) return;
    setProcessingId(connectionId);

    const { error } = await supabase
      .from("connections")
      .update({ status: "declined" })
      .eq("id", connectionId);

    if (error) {
      toast.error("Failed to decline request");
    } else {
      toast.success("Request declined");
      setRequests(requests.filter((r) => r.connection.id !== connectionId));
    }
    setProcessingId(null);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="sticky top-0 z-30 bg-card/80 backdrop-blur-xl border-b border-border">
        <div className="flex items-center gap-3 px-4 py-4">
          <Bell className="w-6 h-6 text-primary" />
          <h1 className="text-xl font-bold text-foreground">Connection Requests</h1>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      ) : requests.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] px-6 text-center">
          <AlertCircle className="w-12 h-12 text-muted-foreground/40 mb-3" />
          <p className="text-foreground font-medium">No pending requests</p>
          <p className="text-sm text-muted-foreground mt-1">
            When people want to connect with you, they'll appear here
          </p>
        </div>
      ) : (
        <div className="max-w-md mx-auto px-4 py-4 space-y-3">
          {requests.map((req) => (
            <div
              key={req.connection.id}
              className="bg-card rounded-2xl p-4 border border-border flex items-start gap-3"
            >
              <div className="flex-1">
                {req.profile?.avatar_url ? (
                  <img
                    src={req.profile.avatar_url}
                    alt={req.profile.display_name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-primary/20"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
                    {req.profile?.display_name?.[0]?.toUpperCase()}
                  </div>
                )}
              </div>

              <div className="flex-1 flex-grow">
                <p className="font-semibold text-foreground">
                  {req.profile?.display_name || "Unknown"}
                </p>
                {req.profile?.bio && (
                  <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                    {req.profile.bio}
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleDecline(req.connection.id)}
                  disabled={processingId === req.connection.id}
                  className="flex items-center justify-center w-9 h-9 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors disabled:opacity-50"
                >
                  <X className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleAccept(req.connection.id)}
                  disabled={processingId === req.connection.id}
                  className="flex items-center justify-center w-9 h-9 rounded-lg bg-green-500/10 text-green-600 hover:bg-green-500/20 transition-colors disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <BottomNav />
    </div>
  );
};

export default Notifications;
