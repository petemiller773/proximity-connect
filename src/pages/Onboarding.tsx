import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Camera, Upload, CheckCircle, ChevronRight, Shield } from "lucide-react";

const Onboarding = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState<"dob" | "photo" | "verify" | "done">("dob");
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
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };

  const handleDobSubmit = async () => {
    if (!dateOfBirth) {
      toast.error("Please enter your date of birth");
      return;
    }
    const age = calculateAge(dateOfBirth);
    if (age < 18) {
      toast.error("You must be 18 or older to use this app");
      return;
    }
    if (!user) return;
    const { error } = await supabase
      .from("profiles")
      .update({ date_of_birth: dateOfBirth })
      .eq("user_id", user.id);
    if (error) {
      toast.error("Failed to save date of birth");
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
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {["dob", "photo", "verify"].map((s, i) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all ${
                step === s
                  ? "w-10 bg-primary"
                  : i < ["dob", "photo", "verify"].indexOf(step)
                  ? "w-6 bg-primary/40"
                  : "w-6 bg-muted"
              }`}
            />
          ))}
        </div>

        {/* Step: Date of Birth */}
        {step === "dob" && (
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Verify Your Age</h1>
            <p className="text-sm text-muted-foreground mb-8">
              You must be 18 or older to use Nearby. This cannot be changed later.
            </p>
            <div className="rounded-2xl bg-surface-warm p-4 mb-4">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Date of Birth
              </label>
              <input
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split("T")[0]}
                className="mt-1 w-full bg-transparent text-foreground font-medium outline-none text-sm"
              />
            </div>
            <button
              onClick={handleDobSubmit}
              disabled={!dateOfBirth}
              className="w-full py-3.5 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-primary/25 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              Continue <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Step: Photo Upload */}
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

        {/* Step: Selfie Verification */}
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
