import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { TrendingUp, Globe, BarChart3, ArrowRight, ArrowLeft } from "lucide-react";

const insights = [
  {
    icon: TrendingUp,
    title: "Global Market Trends Q1 2026",
    summary: "How shifting interest rates and emerging market dynamics are creating new investment opportunities for businesses.",
    tag: "Markets",
  },
  {
    icon: Globe,
    title: "Cross-Border Payment Strategies",
    summary: "Optimize your international transactions with AI-driven currency hedging and real-time compliance monitoring.",
    tag: "Payments",
  },
  {
    icon: BarChart3,
    title: "Cash Flow Optimization with AI",
    summary: "Leverage predictive analytics to manage working capital, forecast revenue cycles, and reduce idle cash.",
    tag: "Finance",
  },
  {
    icon: TrendingUp,
    title: "Regulatory Changes Impacting SMEs",
    summary: "Key compliance updates for 2026 that every business owner should prepare for across APAC and EMEA regions.",
    tag: "Compliance",
  },
];

const BusinessInsights = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto flex items-center justify-between h-16 px-4 lg:px-8">
          <Link to="/" className="text-xl font-bold text-foreground tracking-tight">
            Vector<span className="text-accent">X</span>
          </Link>
          <Button variant="outline" size="sm" asChild>
            <Link to="/"><ArrowLeft size={14} /> Back</Link>
          </Button>
        </div>
      </header>

      <section className="container mx-auto px-4 lg:px-8 py-16 max-w-4xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-medium mb-4">
            <Globe size={14} /> For Business Professionals
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">Business Insights</h1>
          <p className="mt-4 text-muted-foreground text-lg max-w-xl mx-auto">
            AI-curated financial intelligence based on global market activities to help you make smarter decisions with your money.
          </p>
        </div>

        <div className="grid gap-6">
          {insights.map((item) => (
            <div key={item.title} className="card-elevated p-6 flex gap-5 items-start hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                <item.icon className="text-accent" size={22} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">{item.tag}</span>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.summary}</p>
                <button className="text-sm text-primary hover:underline mt-3 inline-flex items-center gap-1">
                  Read more <ArrowRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default BusinessInsights;
