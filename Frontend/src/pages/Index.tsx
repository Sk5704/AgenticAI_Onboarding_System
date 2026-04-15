import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FileCheck, ScanFace, ShieldCheck, AlertTriangle, ArrowRight, Menu, X } from "lucide-react";
import GradientMesh from "@/components/GradientMesh";
import HowItWorks from "@/components/HowItWorks";

import customerHero from "@/assets/customer-hero.png";

const navLinks = [
  { label: "Blog", to: "/blog" },
  { label: "Business Insights", to: "/insights" },
];

const features = [
  { icon: FileCheck, title: "Document AI Verification", desc: "Automatically extracts and verifies identity documents using AI." },
  { icon: ScanFace, title: "Face Identity Validation", desc: "Biometric face match between uploaded documents and selfie capture." },
  { icon: ShieldCheck, title: "Compliance Automation", desc: "Built-in regulatory checks for KYC and AML compliance." },
  { icon: AlertTriangle, title: "Fraud Risk Detection", desc: "AI analyzes behavioral and identity signals to detect fraud." },
];

const metrics = [
  { value: "< 30 Min", label: "Onboarding Time", desc: "Reduce account opening time drastically." },
  { value: "30%", label: "Cost Reduction", desc: "Automation reduces manual verification workload." },
  { value: "20–30%", label: "Higher Conversion", desc: "Frictionless onboarding improves completion rates." },
];

const LandingPage = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto flex items-center justify-between h-16 px-4 lg:px-8">
          <Link to="/" className="text-3xl font-bold text-foreground tracking-tight">
            Vector<span className="text-accent">X</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 ml-auto mr-10">
            {navLinks.map((l) => (
              <Link key={l.label} to={l.to} className="text-lg text-muted-foreground hover:text-foreground transition-colors">
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:block">
            <Button variant="accent" size="lg" asChild>
              <Link to="/login">Login</Link>
            </Button>
          </div>

          <button className="md:hidden text-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-border bg-background px-4 pb-4 animate-fade-up">
            {navLinks.map((l) => (
              <Link key={l.label} to={l.to} className="block py-3 text-sm text-muted-foreground hover:text-foreground" onClick={() => setMobileOpen(false)}>
                {l.label}
              </Link>
            ))}
            <Button variant="accent" className="w-full mt-2" asChild>
              <Link to="/login">Login</Link>
            </Button>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <GradientMesh />
        <div className="container mx-auto px-4 lg:px-8 py-16 md:py-24 relative">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            <div className="animate-fade-up">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground leading-tight tracking-tight">
                AI-Powered Intelligent{" "}
                <span className="text-gradient">Account Opening</span>
              </h1>
              <p className="mt-6 text-lg text-muted-foreground max-w-xl leading-relaxed">
                Automate KYC verification, compliance checks, and fraud detection using Agentic AI.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-start gap-4">
                <Button variant="hero" size="xl" asChild>
                  <Link to="/onboarding">
                    Open Your Account
                    <ArrowRight size={18} />
                  </Link>
                </Button>
              </div>

              <div className="mt-10 animate-fade-up-delay-2">
                <div className="card-elevated p-1 rounded-xl">
                  <div className="gradient-hero rounded-lg p-4 md:p-6">
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      {["Verified", "Processing", "Approved"].map((s) => (
                        <div key={s} className="bg-background/10 backdrop-blur rounded-lg p-3 text-center">
                          <div className="text-xl md:text-2xl font-bold text-accent-foreground">
                            {s === "Verified" ? "2,847" : s === "Processing" ? "156" : "2,691"}
                          </div>
                          <div className="text-xs text-accent-foreground/70 mt-1">{s}</div>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      {[85, 60, 95, 45, 75, 90, 55, 80, 70, 88].map((h, i) => (
                        <div key={i} className="flex-1 flex flex-col justify-end h-16">
                          <div className="rounded-t bg-accent/80" style={{ height: `${h}%` }} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center lg:justify-end animate-fade-up-delay-1 lg:-mt-24">
              <div className="relative">
                <div className="absolute -inset-4 bg-accent/10 rounded-full blur-3xl" />
                <img src={customerHero} alt="Customer using VectorX banking platform" className="relative w-full max-w-md lg:max-w-lg object-contain drop-shadow-xl" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 md:py-28 bg-secondary/30">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-16 animate-fade-up">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">Intelligent Verification Suite</h2>
            <p className="mt-4 text-muted-foreground text-lg max-w-xl mx-auto">
              End-to-end AI verification covering every step of customer onboarding.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <div key={f.title} className={`card-elevated p-6 animate-fade-up-delay-${Math.min(i, 3)}`}>
                <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center mb-5">
                  <f.icon className="text-accent" size={24} />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <HowItWorks />

      {/* Metrics */}
      <section className="py-20 md:py-28 bg-secondary/30">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">Measurable Impact</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {metrics.map((m) => (
              <div key={m.label} className="card-elevated p-8 text-center">
                <div className="text-5xl md:text-6xl font-extrabold text-gradient mb-3">{m.value}</div>
                <div className="text-lg font-semibold text-foreground mb-2">{m.label}</div>
                <p className="text-sm text-muted-foreground">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="gradient-hero rounded-2xl p-10 md:p-16 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-accent-foreground mb-4">
              Start onboarding customers in minutes
            </h2>
            <p className="text-accent-foreground/70 mb-8 max-w-lg mx-auto">
              Deploy AI-powered account opening and reduce manual processing by 80%.
            </p>
            <Button variant="hero" size="xl" asChild>
              <Link to="/onboarding">
                Open Your Account
                <ArrowRight size={18} />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <div className="text-xl font-bold text-foreground tracking-tight mb-2">
            Vector<span className="text-accent">X</span>
          </div>
          <p className="text-sm text-muted-foreground">AI Banking Onboarding Platform</p>
          <div className="mt-4 text-sm text-muted-foreground">VectorX © 2026</div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
