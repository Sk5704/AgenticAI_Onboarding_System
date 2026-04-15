import { useState, useRef, useCallback, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  User, FileText, Camera, CheckCircle2, Upload,
  ArrowRight, ArrowLeft, X, RefreshCw, ShieldCheck, Loader2, Phone
} from "lucide-react";
import { sendOtp, verifyOtp, isLoggedIn, updateSession, initializeSession } from "@/lib/mock-auth";
import { api } from "@/lib/api";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";

const steps = [
  { num: 1, label: "Personal Details", icon: User },
  { num: 2, label: "Verify Phone", icon: ShieldCheck },
  { num: 3, label: "Document Upload", icon: FileText },
  { num: 4, label: "Selfie Verification", icon: Camera },
  { num: 5, label: "Account Activation", icon: CheckCircle2 },
];

interface FormErrors {
  fullName?: string;
  email?: string;
  phone?: string;
  dob?: string;
  address?: string;
}

const OnboardingPage = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({ fullName: "", email: "", phone: "", dob: "", address: "" });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [formTouched, setFormTouched] = useState<Record<string, boolean>>({});
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, File | null>>({ pan: null, aadhaar: null, address: null });
  const [docErrors, setDocErrors] = useState<Record<string, string>>({});
  const [selfieData, setSelfieData] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);
  const [finalStatus, setFinalStatus] = useState<string>("");
  const [riskScore, setRiskScore] = useState<number | null>(null);
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // OTP state
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const next = () => setCurrentStep((s) => Math.min(s + 1, 5));
  const prev = () => setCurrentStep((s) => Math.max(s - 1, 1));

  const derivApplicationId = applicationId || localStorage.getItem('application_id');
  const accountNumber = derivApplicationId ? `VCTX-${derivApplicationId.slice(0, 8).toUpperCase()}` : "VCTX-XXXX";
  const customerId = derivApplicationId ? `CID-${derivApplicationId.slice(0, 6).toUpperCase()}` : "CID-XXXX";
  const statusLabel = finalStatus ? finalStatus.toUpperCase() : "IN REVIEW";

  useEffect(() => {
    if (resendTimer > 0) {
      const t = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [resendTimer]);

  useEffect(() => {
    if (currentStep === 2 && otpSent) otpRefs.current[0]?.focus();
  }, [currentStep, otpSent]);

  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
        setPollingInterval(null);
      }
    };
  }, [pollingInterval]);

  // Personal details validation
  const validateField = (id: string, value: string): string => {
    switch (id) {
      case "fullName":
        if (!value.trim()) return "Full name is required";
        if (value.trim().length < 2) return "Name must be at least 2 characters";
        if (value.trim().length > 100) return "Name must be less than 100 characters";
        return "";
      case "email":
        if (!value.trim()) return "Email is required";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) return "Enter a valid email address";
        return "";
      case "phone":
        if (!value.trim()) return "Phone number is required";
        if (!/^\+?\d{10,15}$/.test(value.replace(/\s/g, ""))) return "Enter a valid phone number (10-15 digits)";
        return "";
      case "dob": {
        if (!value) return "Date of birth is required";
        const age = (Date.now() - new Date(value).getTime()) / (365.25 * 24 * 60 * 60 * 1000);
        if (age < 18) return "You must be at least 18 years old";
        return "";
      }
      case "address":
        if (!value.trim()) return "Address is required";
        if (value.trim().length < 5) return "Enter a complete address";
        return "";
      default:
        return "";
    }
  };

  const validateAllFields = (): boolean => {
    const errors: FormErrors = {};
    let valid = true;
    const fields = ["fullName", "email", "phone", "dob", "address"] as const;
    fields.forEach((id) => {
      const err = validateField(id, formData[id]);
      if (err) { errors[id] = err; valid = false; }
    });
    setFormErrors(errors);
    setFormTouched(Object.fromEntries(fields.map((f) => [f, true])));
    return valid;
  };

  const handleFieldChange = (id: string, value: string) => {
    setFormData((d) => ({ ...d, [id]: value }));
    if (formTouched[id]) {
      setFormErrors((e) => ({ ...e, [id]: validateField(id, value) }));
    }
  };

  const handleFieldBlur = (id: string) => {
    setFormTouched((t) => ({ ...t, [id]: true }));
    setFormErrors((e) => ({ ...e, [id]: validateField(id, formData[id as keyof typeof formData]) }));
  };

  // Document validation
  const validateDocuments = (): boolean => {
    const errors: Record<string, string> = {};
    let valid = true;
    const docs = [
      { key: "pan", label: "PAN Card" },
      { key: "aadhaar", label: "Aadhaar Card" },
      { key: "address", label: "Address Proof" },
    ];
    docs.forEach((doc) => {
      if (!uploadedFiles[doc.key]) {
        errors[doc.key] = `${doc.label} is required`;
        valid = false;
      }
    });
    setDocErrors(errors);
    return valid;
  };

  const uploadDocument = async (docType: string, file: File) => {
    const appId = localStorage.getItem('application_id');
    if (!appId) throw new Error('No application id');

    const formPayload = new FormData();
    formPayload.append('application_id', appId);
    formPayload.append('doc_type', docType);
    formPayload.append('file', file);

    const res = await api.post('/onboarding/upload-document', formPayload, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  };

  const startPolling = (appId: string) => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
    }

    const interval = setInterval(async () => {
      try {
        const res = await api.get(`/onboarding/status/${appId}`);
        const data = res.data;
        console.log('Status:', data.status, 'Progress:', data.progress);
        setProgress(data.progress || 0);
        if (data.status === 'approved' || data.status === 'rejected') {
          clearInterval(interval);
          setPollingInterval(null);
          setFinalStatus(data.status);
          setRiskScore(data.risk_score ?? null);
          setProgress(100);
          if (data.status === 'approved') {
            setCurrentStep(5);
          } else {
            toast({ title: "Application rejected", description: "Please contact support." });
          }
        }
      } catch (err) {
        console.error('Polling error', err);
      }
    }, 2000);

    setPollingInterval(interval);
  };

  const handleSendOtp = async () => {
    if (formData.phone.replace(/\s/g, "").length < 10) {
      setOtpError("Please enter a valid phone number in Step 1");
      return;
    }
    setOtpLoading(true);
    setOtpError("");
    try {
      await sendOtp(formData.phone);
      setOtpSent(true);
      setResendTimer(30);
      toast({ title: "OTP Sent", description: `Code sent to ${formData.phone}` });
    } catch (err) {
      console.error('Failed to send OTP', err);
      setOtpError("Failed to send OTP. Please try again.");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setOtpError("");
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) otpRefs.current[index - 1]?.focus();
  };

  const handleVerifyOtp = async () => {
    const code = otp.join("");
    if (code.length < 6) {
      setOtpError("Enter the full 6-digit OTP");
      return;
    }
    setOtpLoading(true);
    setOtpError("");
    const result = await verifyOtp(formData.phone, code);

    if (result.success) {
      try {
        // Initialize session first
        initializeSession(formData.phone);
        
        // Create application via API
        const createRes = await api.post('/onboarding/create-application', {
          full_name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          dob: formData.dob,
          address: formData.address,
        });
        const appId = createRes.data.application_id;
        localStorage.setItem('application_id', appId);
        setApplicationId(appId);

        updateSession({
          name: formData.fullName,
          applicationId: appId,
          applicationStatus: 'in_progress',
          applicationStep: 2,
        });

        toast({ title: "Phone Verified!", description: "Your application has been created." });
        next();
      } catch (err: unknown) {
        setOtpError("Failed to create application. Please try again.");
        console.error(err);
      }
    } else {
      setOtpError(result.error || "Verification failed");
      setOtp(["", "", "", "", "", ""]);
      otpRefs.current[0]?.focus();
    }

    setOtpLoading(false);
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    setOtpLoading(true);
    try {
      await sendOtp(formData.phone);
      setResendTimer(30);
      setOtp(["", "", "", "", "", ""]);
      setOtpError("");
      toast({ title: "OTP Resent" });
    } catch (err) {
      console.error('Failed to resend OTP', err);
      setOtpError("Failed to resend OTP. Please try again.");
    } finally {
      setOtpLoading(false);
    }
  };

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      if (videoRef.current) { videoRef.current.srcObject = stream; setCameraActive(true); }
    } catch { /* Camera not available */ }
  }, []);

  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach((t) => t.stop());
      setCameraActive(false);
    }
  }, []);

  const captureSelfie = useCallback(async () => {
    if (videoRef.current && canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      ctx?.drawImage(videoRef.current, 0, 0);
      const dataUrl = canvasRef.current.toDataURL("image/jpeg");
      setSelfieData(dataUrl);
      stopCamera();

      try {
        const appId = localStorage.getItem('application_id');
        if (!appId) throw new Error('No application id');

        const blob = await (await fetch(dataUrl)).blob();
        const file = new File([blob], 'selfie.jpg', { type: 'image/jpeg' });

        const formData = new FormData();
        formData.append('application_id', appId);
        formData.append('file', file);

        await api.post('/onboarding/upload-selfie', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        toast({ title: "Selfie uploaded", description: "Verification will start shortly" });
      } catch (err) {
        console.error(err);
        toast({ title: "Selfie upload failed", variant: "destructive" });
      }
    }
  }, [stopCamera]);

  const handleFileDrop = (key: string) => async (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      setUploadedFiles((f) => ({ ...f, [key]: file }));
      setDocErrors((e) => ({ ...e, [key]: "" }));
      try {
        const docType = key === 'address' ? 'addressProof' : key;
        await uploadDocument(docType, file);
        toast({ title: "Uploaded", description: `${key} uploaded successfully` });
      } catch (err) {
        setDocErrors((e) => ({ ...e, [key]: "Upload failed" }));
        console.error(err);
      }
    }
  };

  const handleFileSelect = (key: string) => async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFiles((f) => ({ ...f, [key]: file }));
      setDocErrors((err) => ({ ...err, [key]: "" }));
      try {
        const docType = key === 'address' ? 'addressProof' : key;
        await uploadDocument(docType, file);
        toast({ title: "Uploaded", description: `${key} uploaded successfully` });
      } catch (err) {
        setDocErrors((err) => ({ ...err, [key]: "Upload failed" }));
        console.error(err);
      }
    }
  };

  const handleUploadLater = () => {
    updateSession({ applicationStatus: "in_progress", applicationStep: 3 });
    toast({ title: "Progress Saved", description: "You can upload documents later from your dashboard." });
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-secondary/30">
      <header className="bg-background border-b border-border">
        <div className="container mx-auto flex items-center justify-between h-16 px-4 lg:px-8">
          <Link to="/" className="text-xl font-bold text-foreground tracking-tight">
            Vector<span className="text-accent">X</span>
          </Link>
          <span className="text-sm text-muted-foreground hidden sm:block">Customer Onboarding</span>
        </div>
      </header>

      <div className="container mx-auto px-4 lg:px-8 py-8 md:py-12 max-w-3xl">
        {/* Step indicator */}
        <div className="flex items-center justify-between mb-10 overflow-x-auto pb-2">
          {steps.map((s, i) => (
            <div key={s.num} className="flex items-center">
              <div className="flex flex-col items-center min-w-[50px]">
                <div className={`h-9 w-9 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                  currentStep > s.num ? "bg-accent text-accent-foreground" :
                  currentStep === s.num ? "bg-primary text-primary-foreground" :
                  "bg-muted text-muted-foreground"
                }`}>
                  {currentStep > s.num ? <CheckCircle2 size={16} /> : s.num}
                </div>
                <span className={`text-[10px] mt-1.5 text-center whitespace-nowrap ${currentStep >= s.num ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                  {s.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className={`h-0.5 w-4 md:w-10 mx-0.5 ${currentStep > s.num ? "bg-accent" : "bg-border"}`} />
              )}
            </div>
          ))}
        </div>

        <div className="card-elevated p-6 md:p-10">
          {/* Step 1: Personal Details */}
          {currentStep === 1 && (
            <div className="animate-fade-up">
              <h2 className="text-2xl font-bold text-foreground mb-6">Personal Details</h2>
              <div className="grid gap-5">
                {[
                  { id: "fullName", label: "Full Name", type: "text", placeholder: "John Doe" },
                  { id: "email", label: "Email", type: "email", placeholder: "john@example.com" },
                  { id: "phone", label: "Phone Number", type: "tel", placeholder: "+91 98765 43210" },
                  { id: "dob", label: "Date of Birth", type: "date", placeholder: "" },
                  { id: "address", label: "Address", type: "text", placeholder: "123 Main St, Mumbai" },
                ].map((field) => (
                  <div key={field.id}>
                    <Label htmlFor={field.id} className="text-sm font-medium text-foreground mb-1.5 block">
                      {field.label} <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id={field.id}
                      type={field.type}
                      placeholder={field.placeholder}
                      value={formData[field.id as keyof typeof formData]}
                      onChange={(e) => handleFieldChange(field.id, e.target.value)}
                      onBlur={() => handleFieldBlur(field.id)}
                      className={`h-11 ${formErrors[field.id as keyof FormErrors] && formTouched[field.id] ? "border-destructive focus-visible:ring-destructive" : ""}`}
                    />
                    {formErrors[field.id as keyof FormErrors] && formTouched[field.id] && (
                      <p className="text-xs text-destructive mt-1">{formErrors[field.id as keyof FormErrors]}</p>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-8">
                <Button variant="outline" asChild><Link to="/">Cancel</Link></Button>
                <Button variant="accent" onClick={() => {
                  if (validateAllFields()) {
                    next();
                    handleSendOtp();
                  }
                }}>
                  Next <ArrowRight size={16} />
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: OTP Verification */}
          {currentStep === 2 && (
            <div className="animate-fade-up">
              <div className="text-center">
                <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <ShieldCheck className="text-primary" size={28} />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Verify Your Phone</h2>
                <p className="text-sm text-muted-foreground mb-8">
                  Enter the 6-digit code sent to <span className="font-medium text-foreground">{formData.phone}</span>
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
                {otpError && <p className="text-destructive text-xs mb-4">{otpError}</p>}

                <Button variant="accent" size="lg" className="w-full max-w-xs mb-4" onClick={handleVerifyOtp} disabled={otpLoading}>
                  {otpLoading ? <Loader2 size={18} className="animate-spin" /> : "Verify & Continue"}
                </Button>

                <div>
                  <button
                    onClick={handleResendOtp}
                    disabled={resendTimer > 0}
                    className={`text-sm ${resendTimer > 0 ? "text-muted-foreground cursor-not-allowed" : "text-primary hover:underline cursor-pointer"}`}
                  >
                    {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : "Resend OTP"}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mt-4">Demo OTP: <span className="font-mono font-medium text-foreground">123456</span></p>
              </div>

              <div className="flex justify-start mt-8">
                <Button variant="outline" onClick={() => { prev(); setOtpSent(false); setOtp(["","","","","",""]); }}>
                  <ArrowLeft size={16} /> Back
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Document Upload */}
          {currentStep === 3 && (
            <div className="animate-fade-up">
              <h2 className="text-2xl font-bold text-foreground mb-6">Document Upload</h2>
              <div className="grid gap-5">
                {[
                  { key: "pan", label: "PAN Card" },
                  { key: "aadhaar", label: "Aadhaar Card" },
                  { key: "address", label: "Address Proof" },
                ].map((doc) => (
                  <div key={doc.key}>
                    <div
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={handleFileDrop(doc.key)}
                      className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
                        uploadedFiles[doc.key] ? "border-accent bg-accent/5" :
                        docErrors[doc.key] ? "border-destructive bg-destructive/5" :
                        "border-border hover:border-accent/50"
                      }`}
                    >
                      {uploadedFiles[doc.key] ? (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <CheckCircle2 className="text-accent" size={20} />
                            <div className="text-left">
                              <div className="text-sm font-medium text-foreground">{doc.label}</div>
                              <div className="text-xs text-muted-foreground">{uploadedFiles[doc.key]!.name}</div>
                            </div>
                          </div>
                          <button onClick={() => setUploadedFiles((f) => ({ ...f, [doc.key]: null }))} className="text-muted-foreground hover:text-foreground">
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <label className="cursor-pointer block">
                          <Upload className="mx-auto text-muted-foreground mb-2" size={28} />
                          <div className="text-sm font-medium text-foreground">{doc.label} <span className="text-destructive">*</span></div>
                          <div className="text-xs text-muted-foreground mt-1">Drag & drop or click to upload</div>
                          <input type="file" className="hidden" accept="image/*,.pdf" onChange={handleFileSelect(doc.key)} />
                        </label>
                      )}
                    </div>
                    {docErrors[doc.key] && (
                      <p className="text-xs text-destructive mt-1">{docErrors[doc.key]}</p>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-8">
                <Button variant="outline" onClick={handleUploadLater}>
                  Upload Later
                </Button>
                <Button variant="accent" onClick={() => {
                  if (validateDocuments()) {
                    next();
                  } else {
                    toast({ title: "Missing Documents", description: "Please upload all required documents to proceed.", variant: "destructive" });
                  }
                }}>
                  Next <ArrowRight size={16} />
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Selfie */}
          {currentStep === 4 && (
            <div className="animate-fade-up">
              <h2 className="text-2xl font-bold text-foreground mb-6">Selfie Verification</h2>
              <div className="flex flex-col items-center">
                <div className="w-full max-w-sm aspect-[3/4] bg-muted rounded-xl overflow-hidden relative mb-6">
                  {selfieData ? (
                    <img src={selfieData} alt="Selfie" className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <video ref={videoRef} autoPlay playsInline muted className={`w-full h-full object-cover ${cameraActive ? "" : "hidden"}`} />
                      {!cameraActive && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
                          <Camera size={48} />
                          <span className="text-sm mt-3">Camera preview</span>
                        </div>
                      )}
                    </>
                  )}
                  <canvas ref={canvasRef} className="hidden" />
                </div>
                <div className="flex gap-3">
                  {selfieData ? (
                    <Button variant="outline" onClick={() => { setSelfieData(null); startCamera(); }}>
                      <RefreshCw size={16} /> Retake
                    </Button>
                  ) : cameraActive ? (
                    <Button variant="accent" onClick={captureSelfie}>
                      <Camera size={16} /> Capture Selfie
                    </Button>
                  ) : (
                    <Button variant="accent" onClick={startCamera}>
                      <Camera size={16} /> Start Camera
                    </Button>
                  )}
                </div>
              </div>
              <div className="flex justify-between mt-8">
                <Button variant="outline" onClick={() => { stopCamera(); prev(); }}><ArrowLeft size={16} /> Back</Button>
                <Button variant="accent" onClick={() => {
                  stopCamera();
                  const appId = localStorage.getItem('application_id');
                  if (!appId) {
                    toast({ title: "Missing application", description: "Please verify OTP and create application first", variant: "destructive" });
                    return;
                  }

                  updateSession({ applicationStatus: "under_review", applicationStep: 4 });
                  setApplicationId(appId);
                  setCurrentStep(5);
                  setProgress(0);
                  startPolling(appId);
                }}>
                  Submit Application <ArrowRight size={16} />
                </Button>
              </div>
            </div>
          )}

          {/* Step 5: Success */}
          {currentStep === 5 && (
            <div className="animate-fade-up text-center py-6">
              <div className="h-20 w-20 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="text-accent" size={40} />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Application {statusLabel}</h2>
              <p className="text-muted-foreground mb-4">
                {finalStatus ? `Result: ${finalStatus}` : "Your application is being reviewed. This may take a few minutes."}
              </p>
              {!finalStatus && (
                <div className="mb-6">
                  <div className="flex justify-between text-sm text-muted-foreground mb-2">
                    <span>Verification Progress</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} className="w-full" />
                </div>
              )}
              {riskScore !== null && (
                <p className="text-sm text-muted-foreground mb-4">Risk Score: {riskScore}</p>
              )}

              <div className="inline-grid grid-cols-2 gap-6 text-left mb-8">
                <div className="card-elevated p-4">
                  <div className="text-xs text-muted-foreground">Account Number</div>
                  <div className="text-lg font-semibold text-foreground mt-1">{accountNumber}</div>
                </div>
                <div className="card-elevated p-4">
                  <div className="text-xs text-muted-foreground">Customer ID</div>
                  <div className="text-lg font-semibold text-foreground mt-1">{customerId}</div>
                </div>
              </div>
              <div className="flex justify-center gap-3">
                <Button variant="outline" onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
                {finalStatus !== 'approved' && finalStatus !== 'rejected' && (
                  <Button variant="secondary" onClick={() => {
                    const appId = derivApplicationId;
                    if (appId) startPolling(appId);
                  }}>
                    Refresh Status
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
