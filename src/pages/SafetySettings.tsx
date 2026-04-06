import { useState, useEffect } from "react";
import BottomNav from "@/components/BottomNav";
import { Shield, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const SafetySettings = () => {
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(true);
  const [minAge, setMinAge] = useState(18);
  const [maxAge, setMaxAge] = useState(99);
  const [showToGender, setShowToGender] = useState("everyone");
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("safety_settings")
      .select("*")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setIsVisible(data.is_visible);
          setMinAge(data.min_age_filter);
          setMaxAge(data.max_age_filter);
          setShowToGender(data.show_to_gender);
        }
        setLoaded(true);
      });
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("safety_settings")
      .update({
        is_visible: isVisible,
        min_age_filter: minAge,
        max_age_filter: maxAge,
        show_to_gender: showToGender,
      })
      .eq("user_id", user.id);

    if (error) {
      toast.error("Failed to save settings");
    } else {
      toast.success("Safety settings saved!");
    }
    setSaving(false);
  };

  if (!loaded) return <div className="min-h-screen bg-background" />;

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="pt-14 pb-4 px-6">
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Safety</h1>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Control who can see you and who you see
        </p>
      </div>

      <div className="px-6 space-y-4 mt-4">
        {/* Visibility toggle */}
        <div className="rounded-2xl bg-surface-warm p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isVisible ? (
                <Eye className="w-5 h-5 text-primary" />
              ) : (
                <EyeOff className="w-5 h-5 text-muted-foreground" />
              )}
              <div>
                <p className="font-semibold text-foreground text-sm">Visibility</p>
                <p className="text-xs text-muted-foreground">
                  {isVisible ? "You appear on others' radar" : "You're invisible"}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsVisible(!isVisible)}
              className={`w-12 h-7 rounded-full transition-colors relative ${
                isVisible ? "bg-primary" : "bg-muted"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-card shadow absolute top-1 transition-transform ${
                  isVisible ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Age range */}
        <div className="rounded-2xl bg-surface-warm p-5">
          <p className="font-semibold text-foreground text-sm mb-1">Age Range</p>
          <p className="text-xs text-muted-foreground mb-4">
            Only see and be seen by people in this age range
          </p>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="text-[10px] font-semibold text-muted-foreground uppercase">Min</label>
              <input
                type="number"
                min={18}
                max={maxAge}
                value={minAge}
                onChange={(e) => setMinAge(Math.max(18, parseInt(e.target.value) || 18))}
                className="w-full mt-1 bg-card rounded-xl px-3 py-2.5 text-foreground text-sm font-medium outline-none border border-border"
              />
            </div>
            <span className="text-muted-foreground mt-4">—</span>
            <div className="flex-1">
              <label className="text-[10px] font-semibold text-muted-foreground uppercase">Max</label>
              <input
                type="number"
                min={minAge}
                max={99}
                value={maxAge}
                onChange={(e) => setMaxAge(Math.min(99, parseInt(e.target.value) || 99))}
                className="w-full mt-1 bg-card rounded-xl px-3 py-2.5 text-foreground text-sm font-medium outline-none border border-border"
              />
            </div>
          </div>
        </div>

        {/* Show to gender */}
        <div className="rounded-2xl bg-surface-warm p-5">
          <p className="font-semibold text-foreground text-sm mb-1">Show Me To</p>
          <p className="text-xs text-muted-foreground mb-3">Who can see you on their radar</p>
          <div className="flex gap-2">
            {["everyone", "women", "men"].map((option) => (
              <button
                key={option}
                onClick={() => setShowToGender(option)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors capitalize ${
                  showToGender === option
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-muted-foreground border border-border"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-3.5 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-primary/25 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </div>

      <BottomNav />
    </div>
  );
};

export default SafetySettings;
