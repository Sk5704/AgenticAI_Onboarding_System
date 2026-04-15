import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, Calendar } from "lucide-react";

const blogPosts = [
  {
    id: 1,
    title: "Why Agentic AI is the Future of Banking Automation",
    description:
      "Explore how autonomous AI agents are transforming banking workflows, from customer onboarding to compliance, by making intelligent decisions without human intervention.",
    date: "Mar 5, 2026",
    tag: "Agentic AI",
  },
  {
    id: 2,
    title: "The Limitations of Traditional KYC Systems",
    description:
      "Manual KYC processes are slow, error-prone, and expensive. Learn why legacy verification methods are holding banks back and what the alternative looks like.",
    date: "Feb 22, 2026",
    tag: "KYC",
  },
  {
    id: 3,
    title: "How AI Agents Can Reduce Fraud in Financial Systems",
    description:
      "Fraud detection powered by AI agents analyzes behavioral patterns and identity signals in real time, catching threats that rule-based systems miss.",
    date: "Feb 10, 2026",
    tag: "Fraud Detection",
  },
  {
    id: 4,
    title: "Multi-Agent Systems in Fintech",
    description:
      "Discover how multiple specialized AI agents collaborate to handle document verification, compliance screening, and risk assessment simultaneously.",
    date: "Jan 28, 2026",
    tag: "Fintech",
  },
];

const Blog = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto flex items-center justify-between h-16 px-4 lg:px-8">
          <Link to="/" className="text-3xl font-bold text-foreground tracking-tight">
            Vector<span className="text-accent">X</span>
          </Link>
          <Button variant="outline" size="sm" asChild>
            <Link to="/">
              <ArrowLeft size={16} />
              Back to Home
            </Link>
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 lg:px-8 text-center animate-fade-up">
          <h1 className="text-4xl md:text-5xl font-extrabold text-foreground tracking-tight">
            Vector<span className="text-accent">X</span> Blog
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
            Insights on AI in banking, fintech automation, and the future of agentic intelligence.
          </p>
        </div>
      </section>

      {/* Blog Cards */}
      <section className="pb-20 md:pb-28">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid md:grid-cols-2 gap-6">
            {blogPosts.map((post, i) => (
              <div
                key={post.id}
                className={`card-elevated p-6 md:p-8 flex flex-col justify-between animate-fade-up-delay-${Math.min(i, 3)}`}
              >
                <div>
                  <span className="inline-block text-xs font-semibold tracking-wide uppercase text-accent bg-accent/10 px-3 py-1 rounded-full mb-4">
                    {post.tag}
                  </span>
                  <h2 className="text-xl md:text-2xl font-bold text-foreground leading-snug mb-3">
                    {post.title}
                  </h2>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                    {post.description}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar size={14} />
                    {post.date}
                  </div>
                  <Button variant="ghost" size="sm" className="text-accent hover:text-accent/80">
                    Read More <ArrowRight size={14} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-10 text-center text-sm text-muted-foreground">
        VectorX © 2026
      </footer>
    </div>
  );
};

export default Blog;
