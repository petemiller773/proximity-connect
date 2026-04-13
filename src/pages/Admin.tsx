import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Shield, Users, Flag, MessageSquare, ArrowLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";

const Admin = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [tab, setTab] = useState<"reports" | "feedback" | "users">("reports");
  const [reports, setReports] = useState<any[]>([]);
  const [feedback, setFeedback] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    checkAdmin();
  }, [user]);

  const checkAdmin = async () => {
    if (!user) return;
    const { data } = await supabase.rpc("has_role", {
      _user_id: user.id,
      _role: "admin",
    });
    setIsAdmin(!!data);
    if (data) loadData();
    else setLoading(false);
  };

  const loadData = async () => {
    const [reportsRes, feedbackRes, usersRes] = await Promise.all([
      supabase.from("reports").select("*").order("created_at", { ascending: false }),
      supabase.from("feedback").select("*").order("created_at", { ascending: false }),
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
    ]);
    setReports(reportsRes.data || []);
    setFeedback(feedbackRes.data || []);
    setUsers(usersRes.data || []);
    setLoading(false);
  };

  const updateReportStatus = async (id: string, status: string) => {
    await supabase.from("reports").update({ status }).eq("id", id);
    setReports(reports.map((r) => (r.id === id ? { ...r, status } : r)));
    toast.success(`Report marked as ${status}`);
  };

  const updateFeedbackStatus = async (id: string, status: string) => {
    await supabase.from("feedback").update({ status }).eq("id", id);
    setFeedback(feedback.map((f) => (f.id === id ? { ...f, status } : f)));
    toast.success(`Feedback marked as ${status}`);
  };

  if (isAdmin === null || loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">Loading...</div>;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 text-center">
        <Shield className="w-16 h-16 text-destructive/40 mb-4" />
        <h1 className="text-xl font-bold text-foreground mb-2">Access Denied</h1>
        <p className="text-sm text-muted-foreground mb-6">You don't have admin privileges.</p>
        <button onClick={() => navigate("/")} className="text-primary font-semibold text-sm">Go Back</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-30 bg-card/80 backdrop-blur-xl border-b border-border">
        <div className="flex items-center gap-3 px-4 py-4">
          <button onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <Shield className="w-6 h-6 text-primary" />
          <h1 className="text-xl font-bold text-foreground">Admin Panel</h1>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex border-b border-border">
        {([
          { key: "reports", label: "Reports", icon: Flag, count: reports.filter(r => r.status === "pending").length },
          { key: "feedback", label: "Feedback", icon: MessageSquare, count: feedback.filter(f => f.status === "pending").length },
          { key: "users", label: "Users", icon: Users, count: users.length },
        ] as const).map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
              tab === t.key ? "border-primary text-primary" : "border-transparent text-muted-foreground"
            }`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
            {t.count > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold">{t.count}</span>
            )}
          </button>
        ))}
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-3">
        {tab === "reports" && reports.map((report) => (
          <div key={report.id} className="bg-card rounded-2xl p-4 border border-border">
            <div className="flex items-center justify-between mb-2">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                report.status === "pending" ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground"
              }`}>{report.status}</span>
              <span className="text-[10px] text-muted-foreground">{new Date(report.created_at).toLocaleDateString()}</span>
            </div>
            <p className="text-sm font-semibold text-foreground">{report.reason}</p>
            {report.details && <p className="text-xs text-muted-foreground mt-1">{report.details}</p>}
            {report.status === "pending" && (
              <div className="flex gap-2 mt-3">
                <button onClick={() => updateReportStatus(report.id, "reviewed")} className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-semibold">Mark Reviewed</button>
                <button onClick={() => updateReportStatus(report.id, "dismissed")} className="px-3 py-1.5 rounded-lg bg-muted text-muted-foreground text-xs font-semibold">Dismiss</button>
              </div>
            )}
          </div>
        ))}

        {tab === "feedback" && feedback.map((fb) => (
          <div key={fb.id} className="bg-card rounded-2xl p-4 border border-border">
            <div className="flex items-center justify-between mb-2">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                fb.status === "pending" ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground"
              }`}>{fb.status}</span>
              <span className="text-xs text-muted-foreground">{fb.type}</span>
            </div>
            <p className="text-sm font-semibold text-foreground">{fb.subject}</p>
            {fb.details && <p className="text-xs text-muted-foreground mt-1">{fb.details}</p>}
            {fb.status === "pending" && (
              <div className="flex gap-2 mt-3">
                <button onClick={() => updateFeedbackStatus(fb.id, "reviewed")} className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-semibold">Mark Reviewed</button>
                <button onClick={() => updateFeedbackStatus(fb.id, "resolved")} className="px-3 py-1.5 rounded-lg bg-green-500/10 text-green-600 text-xs font-semibold">Resolve</button>
              </div>
            )}
          </div>
        ))}

        {tab === "users" && users.map((u) => (
          <div key={u.id} className="bg-card rounded-2xl p-4 border border-border flex items-center gap-3">
            {u.avatar_url ? (
              <img src={u.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
                {u.display_name?.[0]?.toUpperCase()}
              </div>
            )}
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">{u.display_name || "No name"}</p>
              <p className="text-[10px] text-muted-foreground">
                {u.is_verified ? "✅ Verified" : "Not verified"} • {u.is_profile_complete ? "Complete" : "Incomplete"}
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Admin;
