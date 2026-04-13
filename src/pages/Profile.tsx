import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import { LogOut, MessageSquare, Shield, Camera, Sun, Moon, Monitor, ChevronRight } from "lucide-react";
import { CircleCheck as CheckCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useTheme } from "@/contexts/ThemeContext";

const Profile = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [instagram, setInstagram] = useState("");
  const [twitter, setTwitter] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [interests, setInterests] = useState<string[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const [profileRes, roleRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("user_id", user.id).single(),
        supabase.rpc("has_role", { _user_id: user.id, _role: "admin" }),
      ]);
      if (profileRes.data) {
        setDisplayName(profileRes.data.display_name || "");
        setBio(profileRes.data.bio || "");
        setInstagram(profileRes.data.instagram || "");
        setTwitter(profileRes.data.twitter || "");
        setLinkedin(profileRes.data.linkedin || "");
        setDateOfBirth(profileRes.data.date_of_birth || "");
        setAvatarUrl(profileRes.data.avatar_url || "");
        setIsVerified(profileRes.data.is_verified || false);
        setInterests((profileRes.data as any).interests || []);
      }
      setIsAdmin(!!roleRes.data);
      setLoaded(true);
    };
    load();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      display_name: displayName, bio, instagram, twitter, linkedin,
    }).eq("user_id", user.id);
    if (error) toast.error("Failed to save");
    else toast.success("Profile saved!");
    setSaving(false);
  };

  const handlePhotoUpload = async (file: File) => {
    if (!user) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("Photo must be under 5MB"); return; }
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${user.id}/avatar.${ext}`;
    const { error: uploadError } = await supabase.storage.from("avatar-photos").upload(path, file, { upsert: true });
    if (uploadError) { toast.error("Failed to upload photo"); setUploading(false); return; }
    const { data: urlData } = supabase.storage.from("avatar-photos").getPublicUrl(path);
    await supabase.from("profiles").update({ avatar_url: urlData.publicUrl }).eq("user_id", user.id);
    setAvatarUrl(urlData.publicUrl);
    setUploading(false);
    toast.success("Photo updated!");
  };

  if (!loaded) return <div className="min-h-screen bg-background" />;

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="pt-14 pb-4 px-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Profile</h1>
        <div className="flex gap-2">
          {isAdmin && (
            <button onClick={() => navigate("/admin")} className="w-10 h-10 rounded-full bg-surface-warm flex items-center justify-center text-primary hover:text-foreground transition-colors">
              <Shield className="w-5 h-5" />
            </button>
          )}
          <button onClick={() => navigate("/safety")} className="w-10 h-10 rounded-full bg-surface-warm flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
            <Shield className="w-5 h-5" />
          </button>
          <button onClick={() => navigate("/feedback")} className="w-10 h-10 rounded-full bg-surface-warm flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
            <MessageSquare className="w-5 h-5" />
          </button>
          <button onClick={signOut} className="w-10 h-10 rounded-full bg-surface-warm flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="px-6 flex flex-col items-center pt-4">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-primary/10 border-4 border-primary/20 flex items-center justify-center overflow-hidden cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            {avatarUrl ? <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" /> : <Camera className="w-8 h-8 text-muted-foreground" />}
            {uploading && <div className="absolute inset-0 bg-background/60 flex items-center justify-center rounded-full"><span className="text-xs font-medium text-foreground">...</span></div>}
          </div>
          {isVerified && (
            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-green-500 flex items-center justify-center border-2 border-background">
              <CheckCircle className="w-4 h-4 text-primary-foreground" />
            </div>
          )}
          <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) handlePhotoUpload(file); }} />
        </div>
        <p className="text-xs text-muted-foreground mt-2">{user?.email}</p>
        {isVerified && <span className="text-xs font-medium text-green-600 mt-1 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Verified</span>}

        {/* Interests */}
        {interests.length > 0 && (
          <div className="flex flex-wrap gap-1.5 justify-center mt-3 max-w-sm">
            {interests.map((i) => (
              <span key={i} className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-semibold">{i}</span>
            ))}
          </div>
        )}

        <div className="w-full max-w-sm mt-6 space-y-3">
          {/* Theme toggle */}
          <div className="rounded-2xl bg-surface-warm p-4">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Theme</label>
            <div className="flex gap-2 mt-2">
              {([
                { value: "light" as const, icon: Sun, label: "Light" },
                { value: "dark" as const, icon: Moon, label: "Dark" },
                { value: "system" as const, icon: Monitor, label: "System" },
              ]).map((t) => (
                <button key={t.value} onClick={() => setTheme(t.value)} className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${theme === t.value ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground"}`}>
                  <t.icon className="w-3.5 h-3.5" /> {t.label}
                </button>
              ))}
            </div>
          </div>

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
            <p className="mt-1 text-foreground font-medium text-sm">{dateOfBirth ? new Date(dateOfBirth).toLocaleDateString() : "Not set"}</p>
            <p className="text-xs text-muted-foreground mt-1">Cannot be changed after setup</p>
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

          <button onClick={handleSave} disabled={saving} className="w-full py-3.5 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-primary/25 disabled:opacity-50 mt-2">
            {saving ? "Saving..." : "Save Profile"}
          </button>

          {/* Legal links */}
          <div className="flex gap-3 justify-center pt-4">
            <button onClick={() => navigate("/terms")} className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1">
              Terms <ChevronRight className="w-3 h-3" />
            </button>
            <button onClick={() => navigate("/privacy")} className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1">
              Privacy <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Profile;
