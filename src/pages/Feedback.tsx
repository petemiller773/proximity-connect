import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MessageSquare } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Feedback = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [type, setType] = useState("suggestion");
  const [subject, setSubject] = useState("");
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!user || !subject.trim()) {
      toast.error("Please add a subject");
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.from("feedback").insert({
      user_id: user.id,
      type,
      subject: subject.trim(),
      details: details.trim(),
    });

    if (error) {
      toast.error("Failed to submit feedback");
    } else {
      toast.success("Thanks for your feedback! 🙏");
      navigate(-1);
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex items-center gap-3 px-6 pt-14 pb-4">
        <button onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-foreground">Feedback</h1>
          <p className="text-xs text-muted-foreground">Help us make Nearby better</p>
        </div>
      </div>

      <div className="px-6 space-y-4 mt-4">
        {/* Type selector */}
        <div className="flex gap-2 flex-wrap">
          {[
            { value: "suggestion", icon: "💡", label: "Suggestion" },
            { value: "bug", icon: "🐛", label: "Bug" },
            { value: "complaint", icon: "😤", label: "Complaint" },
            { value: "other", icon: "💬", label: "Other" },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => setType(opt.value)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                type === opt.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-surface-warm text-muted-foreground"
              }`}
            >
              {opt.icon} {opt.label}
            </button>
          ))}
        </div>

        <div className="rounded-2xl bg-surface-warm p-4">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Subject
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="What's on your mind?"
            className="mt-1 w-full bg-transparent text-foreground font-medium outline-none placeholder:text-muted-foreground/50 text-sm"
          />
        </div>

        <div className="rounded-2xl bg-surface-warm p-4">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Details
          </label>
          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="Tell us more..."
            rows={5}
            className="mt-1 w-full bg-transparent text-foreground font-medium outline-none resize-none placeholder:text-muted-foreground/50 text-sm"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={submitting || !subject.trim()}
          className="w-full py-3.5 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-primary/25 disabled:opacity-50"
        >
          {submitting ? "Submitting..." : "Submit Feedback"}
        </button>
      </div>
    </div>
  );
};

export default Feedback;
