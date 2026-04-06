import { NearbyPerson } from "@/lib/mockData";
import { X } from "lucide-react";

interface ProfileCardProps {
  person: NearbyPerson;
  onClose: () => void;
}

const ProfileCard = ({ person, onClose }: ProfileCardProps) => {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/30 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-card rounded-t-3xl p-6 pb-10 animate-fade-in-up shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle bar */}
        <div className="w-10 h-1 rounded-full bg-muted mx-auto mb-4" />

        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex flex-col items-center text-center">
          <img
            src={person.avatar}
            alt={person.name}
            className="w-24 h-24 rounded-full object-cover border-4 border-primary/20 shadow-lg mb-4"
          />
          <h2 className="text-xl font-bold text-foreground">{person.name}</h2>
          <span className="text-sm text-primary font-medium mt-1">{person.distance}</span>
          <p className="text-muted-foreground mt-3 text-sm leading-relaxed max-w-xs">
            {person.bio}
          </p>

          {/* Socials */}
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

          <button className="mt-6 w-full max-w-xs py-3.5 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-primary/25">
            Save Contact
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
