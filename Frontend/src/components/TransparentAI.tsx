import { FileCheck, ScanFace, ShieldCheck, AlertTriangle, Eye } from "lucide-react";

const checks = [
  { icon: FileCheck, label: "Document Verification", status: "Verified" },
  { icon: ScanFace, label: "Identity Match", status: "Verified" },
  { icon: ShieldCheck, label: "Compliance Cleared", status: "Verified" },
];

const TransparentAI = () => {
  return (
    <section className="py-20 md:py-28 bg-secondary/30">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-16 animate-fade-up">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Transparent AI Decision Engine
          </h2>
          <p className="mt-4 text-muted-foreground text-lg max-w-2xl mx-auto">
            VectorX provides full visibility into the AI decision-making process, so every verification is explainable and auditable.
          </p>
        </div>

        <div className="max-w-2xl mx-auto animate-fade-up-delay-1">
          <div className="card-elevated p-8 md:p-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <Eye className="text-accent" size={20} />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Verification Result</h3>
            </div>

            {/* Check items */}
            <div className="space-y-4 mb-8">
              {checks.map((c, i) => (
                <div
                  key={c.label}
                  className={`flex items-center justify-between p-4 rounded-lg bg-secondary/50 animate-fade-up-delay-${Math.min(i + 1, 3)}`}
                >
                  <div className="flex items-center gap-3">
                    <c.icon className="text-primary" size={20} />
                    <span className="text-sm font-medium text-foreground">{c.label}</span>
                  </div>
                  <span className="text-sm font-semibold text-primary flex items-center gap-1">
                    ✓ {c.status}
                  </span>
                </div>
              ))}
            </div>

            {/* Fraud Risk Score */}
            <div className="p-4 rounded-lg border border-border bg-card">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="text-accent" size={20} />
                  <span className="text-sm font-medium text-foreground">Fraud Risk Score</span>
                </div>
                <span className="text-2xl font-extrabold text-primary">0.18</span>
              </div>
              {/* Risk bar */}
              <div className="h-2.5 rounded-full bg-secondary overflow-hidden mb-2">
                <div
                  className="h-full rounded-full bg-primary animate-progress-fill"
                  style={{ width: "18%" }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Low Risk</span>
                <span>High Risk</span>
              </div>
            </div>

            {/* Explainability note */}
            <p className="mt-6 text-xs text-muted-foreground leading-relaxed text-center">
              Every decision is backed by explainable AI reasoning, giving compliance teams full audit trails and regulatory confidence.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TransparentAI;
