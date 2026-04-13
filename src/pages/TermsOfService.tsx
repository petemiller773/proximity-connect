import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const TermsOfService = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-30 bg-card/80 backdrop-blur-xl border-b border-border">
        <div className="flex items-center gap-3 px-4 py-4">
          <button onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-foreground">Terms of Service</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8 space-y-6 text-sm text-muted-foreground leading-relaxed">
        <p className="text-xs text-muted-foreground">Last updated: April 13, 2026</p>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">1. Acceptance of Terms</h2>
          <p>By accessing or using the Nearby app ("Service"), you agree to be bound by these Terms of Service. If you do not agree, do not use the Service.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">2. Eligibility</h2>
          <p>You must be at least 18 years of age to use this Service. By using the Service, you represent and warrant that you are at least 18 years old. We verify age during the onboarding process and reserve the right to terminate accounts that violate this requirement.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">3. Account Registration</h2>
          <p>You must provide accurate, current, and complete information during registration. You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">4. User Conduct</h2>
          <p>You agree not to:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Use the Service for any unlawful purpose</li>
            <li>Harass, bully, or intimidate other users</li>
            <li>Impersonate another person or entity</li>
            <li>Upload content that is obscene, offensive, or violates others' rights</li>
            <li>Attempt to gain unauthorized access to other accounts</li>
            <li>Use bots, scripts, or automated methods to access the Service</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">5. Location Data</h2>
          <p>The Service uses your device's GPS to show nearby users. By using the Service, you consent to the collection and use of your location data as described in our Privacy Policy. You can disable location sharing at any time through your device settings, but this will limit the Service's functionality.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">6. Messaging & Communication</h2>
          <p>Free accounts include a limited number of messages per connection. Premium subscriptions unlock additional messaging capabilities. We reserve the right to monitor messages for compliance with our community guidelines.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">7. Subscriptions & Payments</h2>
          <p>Premium features are available through paid subscriptions. Subscriptions auto-renew unless cancelled. Refunds are subject to our refund policy and applicable law.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">8. Termination</h2>
          <p>We reserve the right to suspend or terminate your account at any time for violations of these terms or for any other reason at our sole discretion.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">9. Disclaimer</h2>
          <p>The Service is provided "as is" without warranties of any kind. We do not guarantee the accuracy of user profiles or the safety of in-person meetings with users discovered through the Service.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">10. Contact</h2>
          <p>For questions about these terms, please use the Feedback section in the app or email us at support@nearbyapp.com.</p>
        </section>
      </div>
    </div>
  );
};

export default TermsOfService;
