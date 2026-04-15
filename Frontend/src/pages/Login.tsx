import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Phone, ArrowRight, Loader2, CheckCircle2, ShieldCheck } from "lucide-react";
import { sendOtp, verifyOtp, isLoggedIn, updateSession } from "@/lib/mock-auth";
import { toast } from "@/hooks/use-toast";

type Step = "phone" | "otp" | "success";

const LoginPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (isLoggedIn()) navigate("/dashboard", { replace: true });
  }, [navigate]);

  useEffect(() => {
    if (resendTimer > 0) {
      const t = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [resendTimer]);

  // Auto-focus first OTP input
  useEffect(() => {
    if (step === "otp") otpRefs.current[0]?.focus();
  }, [step]);

  const handleSendOtp = async () => {
    if (phone.length < 10) {
      setError("Please enter a valid phone number");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await sendOtp(phone);
      setStep("otp");
      setResendTimer(30);
      toast({ title: "OTP Sent", description: `Verification code sent to ${phone}` });
    } catch (err) {
      console.error('Failed to send OTP', err);
      setError("Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setError("");
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const code = otp.join("");
    if (code.length < 6) {
      setError("Please enter the complete 6-digit OTP");
      return;
    }
    setLoading(true);
    setError("");
    const result = await verifyOtp(phone, code);
    setLoading(false);
    if (result.success) {
      updateSession({ phone, applicationStatus: "in_progress", applicationStep: 1 });
      localStorage.setItem("phone", phone);
      setStep("success");
      toast({ title: "Verified!", description: "Phone number verified successfully" });
      setTimeout(() => navigate("/onboarding"), 1200);
    } else {
      setError(result.error || "Verification failed");
      setOtp(["", "", "", "", "", ""]);
      otpRefs.current[0]?.focus();
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    setLoading(true);
    setError("");
    try {
      await sendOtp(phone);
      setResendTimer(30);
      setOtp(["", "", "", "", "", ""]);
      toast({ title: "OTP Resent", description: "A new verification code has been sent" });
    } catch (err) {
      console.error('Failed to resend OTP', err);
      setError("Failed to resend OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { label: "Enter Details", active: step === "phone", done: step !== "phone" },
    { label: "Verify OTP", active: step === "otp", done: step === "success" },
    { label: "Success", active: step === "success", done: false },
  ];

  return (
    <div className="min-h-screen bg-secondary/30 flex flex-col">
      <header className="bg-background border-b border-border">
        <div className="container mx-auto flex items-center justify-between h-16 px-4 lg:px-8">
          <Link to="/" className="text-xl font-bold text-foreground tracking-tight">
            Vector<span className="text-accent">X</span>
          </Link>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Step indicator */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {steps.map((s, i) => (
              <div key={s.label} className="flex items-center gap-2">
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  s.done ? "bg-accent/10 text-accent" : s.active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}>
                  {s.done && <CheckCircle2 size={12} />}
                  {s.label}
                </div>
                {i < steps.length - 1 && <div className="w-6 h-px bg-border" />}
              </div>
            ))}
          </div>

          <div className="card-elevated p-8">
            {step === "phone" && (
              <div className="animate-fade-up">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                  <Phone className="text-primary" size={24} />
                </div>
                <h1 className="text-2xl font-bold text-foreground mb-2">Welcome to VectorX</h1>
                <p className="text-sm text-muted-foreground mb-6">Enter your phone number to get started</p>
                <div className="space-y-4">
                  <div>
                    <Input
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={phone}
                      onChange={(e) => { setPhone(e.target.value); setError(""); }}
                      className="h-12 text-base"
                      maxLength={15}
                    />
                    {error && <p className="text-destructive text-xs mt-1.5">{error}</p>}
                  </div>
                  <Button variant="accent" size="lg" className="w-full" onClick={handleSendOtp} disabled={loading}>
                    {loading ? <Loader2 size={18} className="animate-spin" /> : <>Send OTP <ArrowRight size={16} /></>}
                  </Button>
                </div>
              </div>
            )}

            {step === "otp" && (
              <div className="animate-fade-up">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                  <ShieldCheck className="text-primary" size={24} />
                </div>
                <h1 className="text-2xl font-bold text-foreground mb-2">Verify OTP</h1>
                <p className="text-sm text-muted-foreground mb-6">
                  Enter the 6-digit code sent to <span className="font-medium text-foreground">{phone}</span>
                </p>
                <div className="flex justify-center gap-2 mb-4">
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => { otpRefs.current[i] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      className="w-12 h-14 text-center text-xl font-semibold border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                    />
                  ))}
                </div>
                {error && <p className="text-destructive text-xs text-center mb-4">{error}</p>}
                <Button variant="accent" size="lg" className="w-full mb-4" onClick={handleVerifyOtp} disabled={loading}>
                  {loading ? <Loader2 size={18} className="animate-spin" /> : "Verify"}
                </Button>
                <div className="text-center">
                  <button
                    onClick={handleResendOtp}
                    disabled={resendTimer > 0}
                    className={`text-sm ${resendTimer > 0 ? "text-muted-foreground cursor-not-allowed" : "text-primary hover:underline cursor-pointer"}`}
                  >
                    {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : "Resend OTP"}
                  </button>
                </div>
                <button onClick={() => { setStep("phone"); setOtp(["","","","","",""]); setError(""); }} className="text-xs text-muted-foreground hover:text-foreground mt-3 block mx-auto">
                  Change phone number
                </button>
              </div>
            )}

            {step === "success" && (
              <div className="animate-fade-up text-center py-4">
                <div className="h-16 w-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="text-accent" size={32} />
                </div>
                <h1 className="text-2xl font-bold text-foreground mb-2">Verified!</h1>
                <p className="text-sm text-muted-foreground">Redirecting to your dashboard...</p>
                <Loader2 size={20} className="animate-spin text-muted-foreground mx-auto mt-4" />
              </div>
            )}
          </div>

          <p className="text-xs text-muted-foreground text-center mt-6">
            Use OTP <span className="font-mono font-medium text-foreground">123456</span> for demo
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
