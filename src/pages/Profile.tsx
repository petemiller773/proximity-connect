import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import { Settings, LogOut, MessageSquare, Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Profile = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [instagram, setInstagram] = useState("");
  const [twitter, setTwitter] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setDisplayName(data.display_name || "");
          setBio(data.bio || "");
          setInstagram(data.instagram || "");
          setTwitter(data.twitter || "");
          setLinkedin(data.linkedin || "");
          setDateOfBirth(data.date_of_birth || "");
        }
        setLoaded(true);
      });
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: displayName,
        bio,
        instagram,
        twitter,
        linkedin,
        date_of_birth: dateOfBirth || null,
      })
      .eq("user_id", user.id);

    if (error) {
      toast.error("Failed to save profile");
    } else {
      toast.success("Profile saved!");
    }
    setSaving(false);
  };

  if (!loaded) return <div className="min-h-screen bg-background" />;

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="pt-14 pb-4 px-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Profile</h1>
        <div className="flex gap-2">
          <button onClick={() => navigate("/safety")} className="w-10 h-10 rounded-full bg-surface-warm flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
            <Shield className="w-5 h-5" />
          </button>
          <button onClick={() => navigate("/feedback")} className="w-10 h-10 rounded-full bg-surface-warm flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
            <MessageSquare className="w-5 h-5" />
          </button>
          <button
            onClick={signOut}
            className="w-10 h-10 rounded-full bg-surface-warm flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="px-6 flex flex-col items-center pt-4">
        <div className="w-24 h-24 rounded-full bg-primary/10 border-4 border-primary/20 flex items-center justify-center overflow-hidden">
          {user?.user_metadata?.avatar_url ? (
            <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <span className="text-4xl">👤</span>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-2">{user?.email}</p>

        <div className="w-full max-w-sm mt-6 space-y-3">
          <div className="rounded-2xl bg-surface-warm p-4">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Name</label>
            <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your name" className="mt-1 w-full bg-transparent text-foreground font-medium outline-none placeholder:text-muted-foreground/50 text-sm" />
          </div>
          <div className="rounded-2xl bg-surface-warm p-4">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Bio</label>
            <textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell people about yourself..." rows={2} className="mt-1 w-full bg-transparent text-foreground font-medium outline-none resize-none placeholder:text-muted-foreground/50 text-sm" />
          </div>
          <div className="rounded-2xl bg-surface-warm p-4">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date of Birth</label>
            <input type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} className="mt-1 w-full bg-transparent text-foreground font-medium outline-none text-sm" />
          </div>
          <div className="rounded-2xl bg-surface-warm p-4">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Instagram</label>
            <input type="text" value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="@yourhandle" className="mt-1 w-full bg-transparent text-foreground font-medium outline-none placeholder:text-muted-foreground/50 text-sm" />
          </div>
          <div className="rounded-2xl bg-surface-warm p-4">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Twitter</label>
            <input type="text" value={twitter} onChange={(e) => setTwitter(e.target.value)} placeholder="@yourhandle" className="mt-1 w-full bg-transparent text-foreground font-medium outline-none placeholder:text-muted-foreground/50 text-sm" />
          </div>
          <div className="rounded-2xl bg-surface-warm p-4">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">LinkedIn</label>
            <input type="text" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} placeholder="your-profile" className="mt-1 w-full bg-transparent text-foreground font-medium outline-none placeholder:text-muted-foreground/50 text-sm" />
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-3.5 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-primary/25 disabled:opacity-50 mt-2"
          >
            {saving ? "Saving..." : "Save Profile"}
          </button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Profile;
