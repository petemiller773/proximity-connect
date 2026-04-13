import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-30 bg-card/80 backdrop-blur-xl border-b border-border">
        <div className="flex items-center gap-3 px-4 py-4">
          <button onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-foreground">Privacy Policy</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8 space-y-6 text-sm text-muted-foreground leading-relaxed">
        <p className="text-xs text-muted-foreground">Last updated: April 13, 2026</p>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">1. Information We Collect</h2>
          <p><strong className="text-foreground">Account Information:</strong> Email, name, date of birth, gender, profile photo, and bio.</p>
          <p className="mt-2"><strong className="text-foreground">Location Data:</strong> Real-time GPS coordinates to enable the nearby discovery feature. Location is updated periodically while the app is open.</p>
          <p className="mt-2"><strong className="text-foreground">Usage Data:</strong> How you interact with the app, including connections made, messages sent, and features used.</p>
          <p className="mt-2"><strong className="text-foreground">Device Information:</strong> Browser type, operating system, and device identifiers for security and analytics.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">2. How We Use Your Information</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>To provide the nearby discovery and connection features</li>
            <li>To verify your identity and age through our verification system</li>
            <li>To send notifications about connection requests and messages</li>
            <li>To improve the Service and develop new features</li>
            <li>To enforce our Terms of Service and protect user safety</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">3. Location Privacy</h2>
          <p>Your exact GPS coordinates are stored securely and only used to calculate proximity to other users. Other users see approximate distance (e.g., "0.5 mi away") — they never see your exact coordinates. Location data older than 5 minutes is automatically excluded from discovery results.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">4. Data Sharing</h2>
          <p>We do not sell your personal information. We share data only:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>With other users as part of the Service (profile info, approximate distance)</li>
            <li>With service providers who help us operate the app</li>
            <li>When required by law or to protect safety</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">5. Data Retention</h2>
          <p>Account data is retained while your account is active. Location data is ephemeral and only visible when recently updated. You can delete your account at any time, which removes all associated data.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">6. Your Rights</h2>
          <p>You have the right to access, correct, or delete your personal data. You can control location sharing through your device settings. Contact us to exercise these rights.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">7. Security</h2>
          <p>We use industry-standard encryption and security measures to protect your data. Profile verification adds an additional layer of trust to the community.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">8. Contact</h2>
          <p>For privacy inquiries, please use the Feedback section in the app or email us at privacy@nearbyapp.com.</p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
