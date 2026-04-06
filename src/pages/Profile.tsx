import BottomNav from "@/components/BottomNav";
import { Settings } from "lucide-react";

const Profile = () => {
  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="pt-14 pb-4 px-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Profile</h1>
        <button className="w-10 h-10 rounded-full bg-surface-warm flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
          <Settings className="w-5 h-5" />
        </button>
      </div>

      <div className="px-6 flex flex-col items-center pt-6">
        <div className="w-28 h-28 rounded-full bg-primary/10 border-4 border-primary/20 flex items-center justify-center text-4xl">
          👤
        </div>
        <h2 className="text-xl font-bold text-foreground mt-4">You</h2>
        <p className="text-sm text-muted-foreground mt-1">Set up your profile to connect</p>

        <div className="w-full max-w-sm mt-8 space-y-4">
          <div className="rounded-2xl bg-surface-warm p-4">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Name</label>
            <input
              type="text"
              placeholder="Your name"
              className="mt-1 w-full bg-transparent text-foreground font-medium outline-none placeholder:text-muted-foreground/50"
            />
          </div>
          <div className="rounded-2xl bg-surface-warm p-4">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Bio</label>
            <textarea
              placeholder="Tell people about yourself..."
              rows={2}
              className="mt-1 w-full bg-transparent text-foreground font-medium outline-none resize-none placeholder:text-muted-foreground/50"
            />
          </div>
          <div className="rounded-2xl bg-surface-warm p-4">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Instagram</label>
            <input
              type="text"
              placeholder="@yourhandle"
              className="mt-1 w-full bg-transparent text-foreground font-medium outline-none placeholder:text-muted-foreground/50"
            />
          </div>
          <div className="rounded-2xl bg-surface-warm p-4">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Twitter</label>
            <input
              type="text"
              placeholder="@yourhandle"
              className="mt-1 w-full bg-transparent text-foreground font-medium outline-none placeholder:text-muted-foreground/50"
            />
          </div>

          <button className="w-full py-3.5 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-primary/25 mt-2">
            Save Profile
          </button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Profile;
