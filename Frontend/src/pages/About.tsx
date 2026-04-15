import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  Clock,
  TrendingDown,
  TrendingUp,
  Mail,
  Phone,
  MapPin,
  Send,
  Bot,
  FileCheck,
  ScanFace,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";

const impacts = [
  { icon: Clock, value: "< 30 Min", label: "Onboarding Time", desc: "Drastically reduce account opening time with AI automation." },
  { icon: TrendingDown, value: "30%", label: "Cost Reduction", desc: "Cut operational costs by automating manual verification workflows." },
  { icon: TrendingUp, value: "20–30%", label: "Higher Conversion", desc: "Frictionless onboarding drives better completion rates." },
];

const agents = [
  { icon: FileCheck, title: "Document Verification Agent", desc: "Extracts and validates identity documents using OCR and AI classification." },
  { icon: ScanFace, title: "Identity Validation Agent", desc: "Performs biometric face matching between documents and live selfie capture." },
  { icon: ShieldCheck, title: "Compliance Screening Agent", desc: "Runs real-time KYC/AML checks against global regulatory databases." },
  { icon: AlertTriangle, title: "Fraud Detection Agent", desc: "Analyzes behavioral signals and identity patterns to flag suspicious activity." },
];

const About = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) return;
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Minimal header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto flex items-center h-16 px-4 lg:px-8">
          <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft size={18} />
            <span className="text-sm font-medium">Back to Home</span>
          </Link>
          <Link to="/" className="ml-auto text-2xl font-bold text-foreground tracking-tight">
            Vector<span className="text-accent">X</span>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground tracking-tight">
            About Vector<span className="text-accent">X</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Building the future of AI-powered banking onboarding.
          </p>
        </div>
      </section>

      {/* Problem */}
      <section className="py-16 md:py-24 bg-secondary/30">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">The Problem</h2>
            <div className="card-elevated p-8 md:p-10 space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                Traditional bank account onboarding is plagued by <strong className="text-foreground">manual KYC processes</strong> that
                require customers to visit branches, submit physical documents, and wait days for verification.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                These outdated systems lead to <strong className="text-foreground">extended onboarding times</strong>, often
                spanning 3 to 7 business days, causing customer drop-offs and lost revenue.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Banks face <strong className="text-foreground">high operational costs</strong> from maintaining large compliance teams,
                duplicating efforts across departments, and dealing with error-prone manual reviews that increase regulatory risk.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center">
                <Bot className="text-accent" size={24} />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">The Solution</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed mb-10 max-w-2xl">
              VectorX deploys <strong className="text-foreground">Agentic AI</strong>—a system of specialized, autonomous AI agents
              that work together to automate the entire account opening pipeline in real time.
            </p>
            <div className="grid sm:grid-cols-2 gap-6">
              {agents.map((a) => (
                <div key={a.title} className="card-elevated p-6">
                  <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                    <a.icon className="text-accent" size={20} />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{a.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{a.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Impact */}
      <section className="py-16 md:py-24 bg-secondary/30">
        <div className="container mx-auto px-4 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground text-center mb-12">Measurable Impact</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {impacts.map((m) => (
              <div key={m.label} className="card-elevated p-8 text-center">
                <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                  <m.icon className="text-accent" size={22} />
                </div>
                <div className="text-4xl md:text-5xl font-extrabold text-gradient mb-2">{m.value}</div>
                <div className="text-lg font-semibold text-foreground mb-1">{m.label}</div>
                <p className="text-sm text-muted-foreground">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground text-center mb-12">Get in Touch</h2>
            <div className="grid md:grid-cols-2 gap-10">
              {/* Contact Info */}
              <div className="space-y-6">
                <p className="text-muted-foreground leading-relaxed">
                  Ready to transform your onboarding experience? Reach out to our team.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                      <Mail className="text-accent" size={18} />
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Email</div>
                      <a href="mailto:contact@vectorx.ai" className="text-foreground font-medium hover:text-accent transition-colors">
                        contact@vectorx.ai
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                      <Phone className="text-accent" size={18} />
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Phone</div>
                      <a href="tel:+919876543210" className="text-foreground font-medium hover:text-accent transition-colors">
                        +91 9876543210
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                      <MapPin className="text-accent" size={18} />
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Location</div>
                      <span className="text-foreground font-medium">Mumbai, India</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <div className="card-elevated p-6 md:p-8">
                {submitted ? (
                  <div className="text-center py-10">
                    <div className="h-14 w-14 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                      <Send className="text-accent" size={24} />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">Message Sent!</h3>
                    <p className="text-sm text-muted-foreground">We'll get back to you shortly.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="name" className="text-sm font-medium text-foreground mb-1.5 block">Name</label>
                      <Input
                        id="name"
                        placeholder="Your name"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        required
                        maxLength={100}
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="text-sm font-medium text-foreground mb-1.5 block">Email</label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        required
                        maxLength={255}
                      />
                    </div>
                    <div>
                      <label htmlFor="message" className="text-sm font-medium text-foreground mb-1.5 block">Message</label>
                      <Textarea
                        id="message"
                        placeholder="Tell us about your needs..."
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        required
                        maxLength={1000}
                        rows={4}
                      />
                    </div>
                    <Button variant="accent" className="w-full" type="submit">
                      Send Message
                    </Button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 lg:px-8 text-center text-sm text-muted-foreground">
          VectorX © 2026
        </div>
      </footer>
    </div>
  );
};

export default About;
