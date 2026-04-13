import { Radar, Clock, MessageCircle, Bell, User } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const tabs = [
  { path: "/", icon: Radar, label: "Discover" },
  { path: "/history", icon: Clock, label: "History" },
  { path: "/messages", icon: MessageCircle, label: "Messages" },
  { path: "/notifications", icon: Bell, label: "Requests" },
  { path: "/profile", icon: User, label: "Profile" },
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [pendingRequests, setPendingRequests] = useState(0);

  useEffect(() => {
    if (!user) return;

    const loadCounts = async () => {
      const [msgRes, reqRes] = await Promise.all([
        supabase
          .from("messages")
          .select("id", { count: "exact", head: true })
          .eq("receiver_id", user.id)
          .eq("is_read", false),
        supabase
          .from("connections")
          .select("id", { count: "exact", head: true })
          .eq("receiver_id", user.id)
          .eq("status", "pending"),
      ]);
      setUnreadMessages(msgRes.count || 0);
      setPendingRequests(reqRes.count || 0);
    };

    loadCounts();
    const interval = setInterval(loadCounts, 15000);
    return () => clearInterval(interval);
  }, [user]);

  const getBadge = (path: string) => {
    if (path === "/messages" && unreadMessages > 0) return unreadMessages;
    if (path === "/notifications" && pendingRequests > 0) return pendingRequests;
    return 0;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-card/80 backdrop-blur-xl border-t border-border">
      <div className="flex items-center justify-around max-w-md mx-auto h-16 px-2">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          const badge = getBadge(tab.path);
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`relative flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-colors ${
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className="relative">
                <tab.icon className={`w-5 h-5 ${isActive ? "stroke-[2.5]" : ""}`} />
                {badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-destructive text-destructive-foreground text-[9px] font-bold flex items-center justify-center">
                    {badge > 99 ? "99+" : badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-semibold">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
