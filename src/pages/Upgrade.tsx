import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check, Zap } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const Upgrade = () => {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<"weekly" | "monthly" | "yearly" | null>(null);
  const [processing, setProcessing] = useState(false);

  const plans = [
    {
      id: "weekly",
      name: "Weekly",
      price: 4.99,
      period: "week",
      features: [
        "Unlimited messages",
        "See who viewed your profile",
        "Advanced filters",
        "Priority support",
      ],
    },
    {
      id: "monthly",
      name: "Monthly",
      price: 12.99,
      period: "month",
      popular: true,
      features: [
        "Everything in Weekly",
        "Verified badge",
        "Rewind feature",
        "VIP support",
      ],
    },
    {
      id: "yearly",
      name: "Yearly",
      price: 59.99,
      period: "year",
      features: [
        "Everything in Monthly",
        "50% savings vs monthly",
        "Priority matching",
        "Exclusive events access",
      ],
    },
  ];

  const handleUpgrade = async (plan: string) => {
    setSelectedPlan(plan as "weekly" | "monthly" | "yearly");
    setProcessing(true);

    setTimeout(() => {
      toast.success(`Upgraded to ${plan} plan!`);
      setProcessing(false);
      navigate("/messages");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-30 bg-card/80 backdrop-blur-xl border-b border-border flex items-center gap-3 px-4 py-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-muted transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="text-xl font-bold text-foreground">Upgrade to Premium</h1>
      </div>

      <div className="max-w-md mx-auto px-4 py-8 pb-20">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Zap className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">Unlimited Messaging</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            You've reached your free message limit. Upgrade now to keep connecting!
          </p>
        </div>

        <div className="space-y-4 mb-8">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-2xl p-4 border-2 transition-all cursor-pointer ${
                selectedPlan === plan.id
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
              onClick={() => handleUpgrade(plan.id)}
            >
              {plan.popular && (
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-full">
                  Most Popular
                </div>
              )}

              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-bold text-foreground text-lg">{plan.name}</h3>
                  <p className="text-xs text-muted-foreground">per {plan.period}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">${plan.price}</p>
                </div>
              </div>

              <div className="space-y-2">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-foreground">{feature}</p>
                  </div>
                ))}
              </div>

              <button
                disabled={processing && selectedPlan === plan.id}
                className={`w-full mt-4 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                  selectedPlan === plan.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground hover:bg-muted/80"
                } disabled:opacity-50`}
              >
                {processing && selectedPlan === plan.id ? "Processing..." : "Select"}
              </button>
            </div>
          ))}
        </div>

        <div className="bg-muted/50 rounded-2xl p-4">
          <p className="text-xs text-muted-foreground text-center">
            Subscription auto-renews. Cancel anytime in settings. By upgrading, you agree to our
            Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Upgrade;
