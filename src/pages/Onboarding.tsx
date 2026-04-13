import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Camera, Upload, CircleCheck as CheckCircle, ChevronRight, Shield, User } from "lucide-react";

type Step = "profile" | "photo" | "verify" | "done";

const Onboarding = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState<Step>("profile");
  const [displayName, setDisplayName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "other" | "">("");
  const [bio, setBio] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const calculateAge = (dob: string) => {
    const birth = new Date(dob);
    const today = new Date();
    let calculatedAge = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) calculatedAge--;
    return calculatedAge;
  };

  const handleProfileSubmit = async () => {
    if (!displayName.trim()) {
      toast.error("Please enter your name");
      return;
    }
    if (!age || parseInt(age) < 18) {
      toast.error("You must be 18 or older to use this app");
      return;
    }
    if (!gender) {
      toast.error("Please select your gender");
      return;
    }
    if (!user) return;

    const dob = new Date();
    dob.setFullYear(dob.getFullYear() - parseInt(age));

    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: displayName.trim(),
        date_of_birth: dob.toISOString().split("T")[0],
        bio: bio.trim(),
      })
      .eq("user_id", user.id);

    if (error) {
      toast.error("Failed to save profile");
      return;
    }
    setStep("photo");
  };

  const handlePhotoUpload = async (file: File) => {
    if (!user) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Photo must be under 5MB");
      return;
    }
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${user.id}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("avatar-photos")
      .upload(path, file, { upsert: true });

    if (uploadError) {
      toast.error("Failed to upload photo");
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from("avatar-photos")
      .getPublicUrl(path);

    const publicUrl = urlData.publicUrl;
    await supabase
      .from("profiles")
      .update({ avatar_url: publicUrl })
      .eq("user_id", user.id);

    setAvatarUrl(publicUrl);
    setUploading(false);
    setStep("verify");
  };

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 480 },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setShowCamera(true);
    } catch {
      toast.error("Could not access camera. Please allow camera access.");
    }
  }, []);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setShowCamera(false);
  }, []);

  const captureSelfie = useCallback(async () => {
    if (!videoRef.current || !user) return;
    setVerifying(true);

    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext("2d")!.drawImage(videoRef.current, 0, 0);

    const base64 = canvas.toDataURL("image/jpeg", 0.8).split(",")[1];
    stopCamera();

    try {
      const { data, error } = await supabase.functions.invoke("verify-selfie", {
        body: { profilePhotoUrl: avatarUrl, selfieBase64: base64 },
      });

      if (error) throw error;
      setVerificationResult(data);

      if (data.verified) {
        toast.success("Profile verified! ✅");
      } else {
        toast.error(data.details?.reason || "Verification failed. You can try again or skip.");
      }
    } catch (e: any) {
      toast.error("Verification failed. You can skip for now.");
    } finally {
      setVerifying(false);
    }
  }, [avatarUrl, user, stopCamera]);

  const completeOnboarding = async () => {
    if (!user) return;
    await supabase
      .from("profiles")
      .update({ is_profile_complete: true })
      .eq("user_id", user.id);
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-8">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2 mb-8">
          {["profile", "photo", "verify"].map((s, i) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all ${
                step === s
                  ? "w-10 bg-primary"
                  : i < ["profile", "photo", "verify"].indexOf(step)
                  ? "w-6 bg-primary/40"
                  : "w-6 bg-muted"
              }`}
            />
          ))}
        </div>

        {step === "profile" && (
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Create Your Profile</h1>
            <p className="text-sm text-muted-foreground mb-8">
              Tell us a bit about yourself to get started
            </p>

            <div className="space-y-4">
              <div className="rounded-2xl bg-surface-warm p-4">
                <input
                  type="text"
                  placeholder="Your Name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-transparent text-foreground font-medium outline-none placeholder:text-muted-foreground/50 text-sm"
                />
              </div>

              <div className="rounded-2xl bg-surface-warm p-4">
                <input
                  type="number"
                  placeholder="Age"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  min="18"
                  max="120"
                  className="w-full bg-transparent text-foreground font-medium outline-none placeholder:text-muted-foreground/50 text-sm"
                />
              </div>

              <div className="rounded-2xl bg-surface-warm p-4">
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as "male" | "female" | "other" | "")}
                  className="w-full bg-transparent text-foreground font-medium outline-none text-sm appearance-none cursor-pointer"
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="rounded-2xl bg-surface-warm p-4">
                <textarea
                  placeholder="Bio (optional)"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  maxLength={150}
                  rows={3}
                  className="w-full bg-transparent text-foreground font-medium outline-none placeholder:text-muted-foreground/50 text-sm resize-none"
                />
                <p className="text-xs text-muted-foreground mt-1">{bio.length}/150</p>
              </div>

              <button
                onClick={handleProfileSubmit}
                disabled={!displayName.trim() || !age || !gender}
                className="w-full py-3.5 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-primary/25 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                Continue <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {step === "photo" && (
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Camera className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Add a Profile Photo</h1>
            <p className="text-sm text-muted-foreground mb-8">
              Upload a clear photo of yourself. This helps others know you're real.
            </p>

            {avatarUrl ? (
              <div className="mb-6">
                <img
                  src={avatarUrl}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover mx-auto border-4 border-primary/20"
                />
              </div>
            ) : null}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handlePhotoUpload(file);
              }}
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-full py-3.5 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-primary/25 disabled:opacity-50 flex items-center justify-center gap-2 mb-3"
            >
              <Upload className="w-4 h-4" />
              {uploading ? "Uploading..." : avatarUrl ? "Change Photo" : "Upload Photo"}
            </button>

            {avatarUrl && (
              <button
                onClick={() => setStep("verify")}
                className="w-full py-3.5 rounded-2xl bg-surface-warm text-foreground font-semibold text-sm hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                Continue <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {step === "verify" && (
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Verify Your Identity</h1>
            <p className="text-sm text-muted-foreground mb-6">
              Take a live selfie to get a verified badge. This is optional but builds trust.
            </p>

            {showCamera && (
              <div className="mb-4 rounded-2xl overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full rounded-2xl"
                />
              </div>
            )}

            {verificationResult && (
              <div
                className={`rounded-2xl p-4 mb-4 ${
                  verificationResult.verified
                    ? "bg-green-500/10 text-green-700"
                    : "bg-destructive/10 text-destructive"
                }`}
              >
                <p className="text-sm font-medium">
                  {verificationResult.verified
                    ? "✅ Verified! Your profile now has a trust badge."
                    : `❌ ${verificationResult.details?.reason || "Verification failed"}`}
                </p>
              </div>
            )}

            {!showCamera && !verificationResult?.verified && (
              <button
                onClick={startCamera}
                disabled={verifying}
                className="w-full py-3.5 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-primary/25 disabled:opacity-50 flex items-center justify-center gap-2 mb-3"
              >
                <Camera className="w-4 h-4" />
                {verifying ? "Verifying..." : "Take Selfie"}
              </button>
            )}

            {showCamera && (
              <button
                onClick={captureSelfie}
                disabled={verifying}
                className="w-full py-3.5 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-primary/25 disabled:opacity-50 flex items-center justify-center gap-2 mb-3"
              >
                {verifying ? "Analyzing..." : "📸 Capture"}
              </button>
            )}

            <button
              onClick={completeOnboarding}
              className="w-full py-3.5 rounded-2xl bg-surface-warm text-foreground font-semibold text-sm hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              {verificationResult?.verified ? "Continue to App" : "Skip for Now"}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
