import { FileSearch, ScanFace, ShieldCheck, AlertTriangle, Zap, ArrowRight } from "lucide-react";

const steps = [
  {
    icon: FileSearch,
    title: "Document AI Extraction",
    desc: "Extract identity details from uploaded documents using OCR and document validation.",
  },
  {
    icon: ScanFace,
    title: "Identity Verification",
    desc: "Match selfie with ID photo using biometric face recognition.",
  },
  {
    icon: ShieldCheck,
    title: "Compliance Screening",
    desc: "Automatically perform KYC and AML compliance checks.",
  },
  {
    icon: AlertTriangle,
    title: "Fraud Risk Analysis",
    desc: "AI fraud detection model calculates real-time risk score.",
  },
  {
    icon: Zap,
    title: "Instant Account Activation",
    desc: "Approved customers receive account details within minutes.",
  },
];

const HowItWorks = () => {
  return (
    <section className="py-20 md:py-28">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-16 animate-fade-up">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">How VectorX Works</h2>
          <p className="mt-4 text-muted-foreground text-lg max-w-xl mx-auto">
            A seamless AI-powered pipeline from document upload to account activation.
          </p>
        </div>

        {/* Desktop: horizontal flow */}
        <div className="hidden lg:flex items-start justify-between gap-2">
          {steps.map((step, i) => (
            <div key={step.title} className="flex items-start flex-1">
              <div className={`card-elevated p-6 flex flex-col items-center text-center flex-1 animate-fade-up-delay-${Math.min(i, 3)}`}>
                <div className="h-14 w-14 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                  <step.icon className="text-accent" size={28} />
                </div>
                <span className="text-xs font-bold text-accent mb-2">Step {i + 1}</span>
                <h3 className="text-sm font-semibold text-foreground mb-2 leading-snug">{step.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
              </div>
              {i < steps.length - 1 && (
                <div className="flex items-center pt-10 px-1 shrink-0">
                  <ArrowRight className="text-accent/50" size={20} />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Mobile/Tablet: vertical flow */}
        <div className="lg:hidden grid sm:grid-cols-2 gap-4">
          {steps.map((step, i) => (
            <div key={step.title} className={`card-elevated p-6 flex gap-4 items-start animate-fade-up-delay-${Math.min(i, 3)}`}>
              <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                <step.icon className="text-accent" size={24} />
              </div>
              <div>
                <span className="text-xs font-bold text-accent">Step {i + 1}</span>
                <h3 className="text-sm font-semibold text-foreground mt-1 mb-1">{step.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
