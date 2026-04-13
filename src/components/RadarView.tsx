import { NearbyPerson } from "@/lib/mockData";

interface RadarViewProps {
  people: NearbyPerson[];
  onPersonTap: (person: NearbyPerson) => void;
}

const RadarView = ({ people, onPersonTap }: RadarViewProps) => {
  return (
    <div className="relative flex items-center justify-center w-full aspect-square max-w-[340px] mx-auto">
      {/* Radar rings */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="absolute w-full h-full rounded-full border border-primary/10" />
        <div className="absolute w-3/4 h-3/4 rounded-full border border-primary/15" />
        <div className="absolute w-1/2 h-1/2 rounded-full border border-primary/20" />
        <div className="absolute w-1/4 h-1/4 rounded-full border border-primary/30" />
      </div>

      {/* Ring distance labels */}
      <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 text-[9px] text-muted-foreground/50">2.5 mi</span>
      <span className="absolute top-[12.5%] left-1/2 -translate-x-1/2 text-[9px] text-muted-foreground/40">1.9 mi</span>
      <span className="absolute top-[25%] left-1/2 -translate-x-1/2 text-[9px] text-muted-foreground/40">1.25 mi</span>

      {/* Pulse animations */}
      <div className="absolute w-full h-full rounded-full bg-primary/5 animate-radar-pulse" />
      <div className="absolute w-full h-full rounded-full bg-primary/5 animate-radar-pulse-delayed" />
      <div className="absolute w-full h-full rounded-full bg-primary/5 animate-radar-pulse-delayed-2" />

      {/* Center dot (you) */}
      <div className="absolute w-4 h-4 rounded-full bg-primary shadow-lg shadow-primary/40 z-10">
        <div className="absolute inset-0 rounded-full bg-primary animate-ping opacity-30" />
      </div>

      {/* Nearby people dots */}
      {people.map((person, i) => {
        const angleRad = (person.angle * Math.PI) / 180;
        const maxRadius = 140;
        const r = person.radius * maxRadius;
        const x = Math.cos(angleRad) * r;
        const y = Math.sin(angleRad) * r;

        return (
          <button
            key={person.id}
            onClick={() => onPersonTap(person)}
            className="absolute z-20 group"
            style={{
              transform: `translate(${x}px, ${y}px)`,
              animationDelay: `${i * 0.4}s`,
            }}
          >
            <div className="animate-float-dot" style={{ animationDelay: `${i * 0.7}s` }}>
              {person.avatar ? (
                <img
                  src={person.avatar}
                  alt={person.name}
                  className="w-11 h-11 rounded-full border-2 border-card shadow-lg object-cover transition-transform group-hover:scale-110 group-active:scale-95"
                />
              ) : (
                <div className="w-11 h-11 rounded-full border-2 border-card shadow-lg bg-primary/20 flex items-center justify-center text-xs font-bold text-primary transition-transform group-hover:scale-110 group-active:scale-95">
                  {person.name[0]?.toUpperCase()}
                </div>
              )}
              {person.isVerified && (
                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-green-500 border border-card flex items-center justify-center">
                  <span className="text-[8px] text-primary-foreground">✓</span>
                </div>
              )}
              <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] font-medium text-muted-foreground whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                {person.name.split(" ")[0]}
              </span>
              <span className="absolute -bottom-9 left-1/2 -translate-x-1/2 text-[8px] text-primary/70 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                {person.distance}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default RadarView;
