import { useEffect, useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  LayoutDashboard, FileText, HelpCircle, LogOut, CheckCircle2, Clock, AlertCircle,
  Upload, ChevronRight, Phone, Menu, X, XCircle, RefreshCw
} from "lucide-react";
import { api } from "@/lib/api";
import { getSession, logout, type UserSession } from "@/lib/mock-auth";
import { toast } from "@/hooks/use-toast";

const statusConfig = {
  not_started: { label: "Not Started", icon: Clock, color: "text-muted-foreground", bg: "bg-muted" },
  in_progress: { label: "In Progress", icon: Clock, color: "text-primary", bg: "bg-primary/10" },
  pending_verification: { label: "Pending Verification", icon: Clock, color: "text-accent", bg: "bg-accent/10" },
  under_review: { label: "Under Review", icon: AlertCircle, color: "text-primary", bg: "bg-primary/10" },
  approved: { label: "Approved", icon: CheckCircle2, color: "text-accent", bg: "bg-accent/10" },
  rejected: { label: "Rejected", icon: XCircle, color: "text-destructive", bg: "bg-destructive/10" },
};

const progressSteps = [
  { key: "documents", label: "Document Upload" },
  { key: "kycStatus", label: "Identity Verification" },
  { key: "complianceStatus", label: "Compliance Check" },
  { key: "riskAssessment", label: "Risk Assessment" },
  { key: "finalApproval", label: "Final Approval" },
];

const documentList = [
  { key: "pan", label: "PAN Card" },
  { key: "aadhaar", label: "Aadhaar Card" },
  { key: "addressProof", label: "Address Proof" },
  { key: "selfie", label: "Selfie" },
];

const docStatusConfig = {
  verified: { label: "Verified", icon: CheckCircle2, color: "text-accent" },
  pending: { label: "Pending", icon: Clock, color: "text-primary" },
  not_uploaded: { label: "Not Uploaded", icon: Upload, color: "text-muted-foreground" },
};

const getStatusConfig = (status?: string) =>
  statusConfig[status as keyof typeof statusConfig] ?? statusConfig.not_started;

const getDocumentStatusConfig = (status?: string) =>
  docStatusConfig[status as keyof typeof docStatusConfig] ?? docStatusConfig.not_uploaded;

const UserDashboard = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileNav, setMobileNav] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const refreshStatus = useCallback(async () => {
    if (!session?.applicationId || refreshing) return;

    setRefreshing(true);
    try {
      const res = await api.get(`/onboarding/status/${session.applicationId}`);
      const data = res.data;

      const updatedSession: UserSession = {
        ...session,
        applicationStatus: data.status || session.applicationStatus,
        applicationStep: data.step || session.applicationStep,
        documents: {
          pan: data.documents?.pan || session.documents.pan,
          aadhaar: data.documents?.aadhaar || session.documents.aadhaar,
          addressProof: data.documents?.addressProof || session.documents.addressProof,
          selfie: data.documents?.selfie || session.documents.selfie,
        },
        kycStatus: data.kyc_status || session.kycStatus,
        complianceStatus: data.compliance_status || session.complianceStatus,
        riskAssessment: data.risk_assessment || session.riskAssessment,
        finalApproval: data.final_approval || session.finalApproval,
      };

      setSession(updatedSession);
      toast({ title: "Status Updated", description: "Dashboard refreshed successfully" });
    } catch (err) {
      console.error('Failed to refresh status', err);
      toast({ title: "Refresh Failed", description: "Could not update status. Please try again.", variant: "destructive" });
    } finally {
      setRefreshing(false);
    }
  }, [refreshing, session]);

  // Auto-refresh status every 30 seconds
  useEffect(() => {
    if (!session?.applicationId) return;

    const interval = setInterval(() => {
      refreshStatus();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [session?.applicationId, refreshStatus]);

  useEffect(() => {
    const localSession = getSession();
    if (!localSession) {
      navigate("/login", { replace: true });
      return;
    }

    const appId = localSession.applicationId || localStorage.getItem('application_id');

    const fetchStatus = async () => {
      try {
        if (!appId) {
          setSession(localSession);
          setLoading(false);
          return;
        }

        const res = await api.get(`/onboarding/status/${appId}`);
        const data = res.data;

        const updatedSession: UserSession = {
          userId: appId,
          phone: localSession.phone,
          name: localSession.name,
          applicationId: appId,
          applicationStatus: data.status || localSession.applicationStatus,
          applicationStep: data.step || localSession.applicationStep,
          documents: {
            pan: data.documents?.pan || 'pending',
            aadhaar: data.documents?.aadhaar || 'pending',
            addressProof: data.documents?.addressProof || 'pending',
            selfie: data.documents?.selfie || 'pending',
          },
          kycStatus: data.kyc_status || 'pending',
          complianceStatus: data.compliance_status || 'pending',
          riskAssessment: data.risk_assessment || 'pending',
          finalApproval: data.final_approval || 'pending',
        };

        localStorage.setItem('application_id', appId);
        localStorage.setItem('phone', localSession.phone);
        if (localSession.name) localStorage.setItem('name', localSession.name);

        setSession(updatedSession);
      } catch (err) {
        console.error('Failed to fetch onboarding status', err);
        setSession(localSession);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, [navigate]);

  const handleLogout = () => {
    logout();
    toast({ title: "Logged out", description: "You have been logged out successfully" });
    navigate("/login", { replace: true });
  };

  const getDocAllUploaded = () => {
    if (!session) return false;
    return Object.values(session.documents).every((s) => s === "verified");
  };

  const getStepStatus = (key: string): "completed" | "pending" | "active" => {
    if (!session) return "pending";

    // Use backend data directly for progress steps
    switch (key) {
      case "documents": {
        const allDocsUploaded = getDocAllUploaded();
        return allDocsUploaded ? "completed" : (Object.values(session.documents).some(s => s !== "not_uploaded") ? "active" : "pending");
      }
      case "kycStatus":
        return session.kycStatus === "completed" ? "completed" :
               getDocAllUploaded() ? "active" : "pending";
      case "complianceStatus":
        return session.complianceStatus === "completed" ? "completed" :
               session.kycStatus === "completed" ? "active" : "pending";
      case "riskAssessment":
        return session.riskAssessment === "completed" ? "completed" :
               session.complianceStatus === "completed" ? "active" : "pending";
      case "finalApproval":
        return session.finalApproval === "completed" ? "completed" :
               session.riskAssessment === "completed" ? "active" : "pending";
      default:
        return "pending";
    }
  };

  const handleContactSupport = async () => {
    try {
      await api.post('/support/contact', {
        application_id: session?.applicationId,
        phone: session?.phone,
        message: 'User requested support from dashboard',
      });
      toast({ title: "Support Request Sent", description: "Our team will contact you shortly." });
    } catch (err) {
      console.error('Support request failed', err);
      toast({ title: "Error", description: "Failed to send support request. Please try again.", variant: "destructive" });
    }
  };

  const handleUploadDocument = async (docKey: string) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,.pdf';
    input.onchange = async (e: Event) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      if (!file || !session?.applicationId) return;

      try {
        const formData = new FormData();
        formData.append('application_id', session.applicationId);
        formData.append('doc_type', docKey === 'addressProof' ? 'addressProof' : docKey);
        formData.append('file', file);

        await api.post('/onboarding/upload-document', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        toast({ title: "Document Uploaded", description: `${file.name} uploaded successfully` });

        // Refresh status immediately after upload
        await refreshStatus();
      } catch (err) {
        console.error('Upload failed', err);
        toast({ title: "Upload Failed", description: "Please try again.", variant: "destructive" });
      }
    };
    input.click();
  };

  const status = getStatusConfig(session?.applicationStatus);

  const sideLinks = [
    { icon: LayoutDashboard, label: "Dashboard", active: true },
    { icon: HelpCircle, label: "Support", onClick: handleContactSupport },
  ];

  return (
    <div className="min-h-screen bg-secondary/30 flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-60 bg-background border-r border-border flex flex-col transition-transform lg:translate-x-0 ${mobileNav ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center justify-between h-16 px-5 border-b border-border">
          <Link to="/" className="text-xl font-bold text-foreground tracking-tight">
            Vector<span className="text-accent">X</span>
          </Link>
          <button className="lg:hidden text-muted-foreground" onClick={() => setMobileNav(false)}><X size={20} /></button>
        </div>
        <nav className="flex-1 py-4 px-3 space-y-1">
          {sideLinks.map((item) => (
            <button
              key={item.label}
              onClick={item.onClick}
              className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                item.active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-border">
          <button onClick={handleLogout} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors">
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {mobileNav && <div className="fixed inset-0 z-30 bg-foreground/20 lg:hidden" onClick={() => setMobileNav(false)} />}

      {/* Main */}
      <div className="flex-1 lg:ml-60 flex flex-col min-h-screen">
        <header className="sticky top-0 z-20 bg-background border-b border-border h-16 flex items-center px-4 lg:px-8 gap-4">
          <button className="lg:hidden text-foreground" onClick={() => setMobileNav(true)}><Menu size={20} /></button>
          <h1 className="text-lg font-semibold text-foreground">My Dashboard</h1>
          <div className="ml-auto flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={refreshStatus} disabled={refreshing} className="hidden sm:flex">
              <RefreshCw size={14} className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
            {session && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone size={14} />
                {session.phone}
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8 space-y-6">
          {loading ? (
            <div className="space-y-6">
              <Skeleton className="h-32 w-full rounded-xl" />
              <Skeleton className="h-48 w-full rounded-xl" />
              <Skeleton className="h-40 w-full rounded-xl" />
            </div>
          ) : session ? (
            <>
              {/* Application Status */}
              <div className="card-elevated p-6">
                <h2 className="text-sm font-medium text-muted-foreground mb-3">Application Status</h2>
                <div className="flex items-center gap-4">
                  <div className={`h-14 w-14 rounded-xl ${status.bg} flex items-center justify-center`}>
                    <status.icon className={status.color} size={28} />
                  </div>
                  <div>
                    <div className={`text-xl font-bold ${status.color}`}>{status.label}</div>
                    <div className="text-sm text-muted-foreground mt-0.5">Application ID: {session.userId}</div>
                  </div>
                </div>
              </div>

              {/* Progress Tracker */}
              <div className="card-elevated p-6">
                <h2 className="text-sm font-medium text-muted-foreground mb-5">Verification Progress</h2>
                <div className="space-y-0">
                  {progressSteps.map((step, i) => {
                    const stepStatus = getStepStatus(step.key);
                    return (
                      <div key={step.key} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 transition-all ${
                            stepStatus === "completed" ? "bg-accent text-accent-foreground" :
                            stepStatus === "active" ? "bg-primary text-primary-foreground animate-pulse" :
                            "bg-muted text-muted-foreground"
                          }`}>
                            {stepStatus === "completed" ? <CheckCircle2 size={16} /> : <span className="text-xs font-bold">{i + 1}</span>}
                          </div>
                          {i < progressSteps.length - 1 && (
                            <div className={`w-0.5 h-8 ${stepStatus === "completed" ? "bg-accent" : "bg-border"}`} />
                          )}
                        </div>
                        <div className="pb-6">
                          <div className={`text-sm font-medium ${stepStatus === "completed" ? "text-foreground" : stepStatus === "active" ? "text-primary" : "text-muted-foreground"}`}>
                            {step.label}
                          </div>
                          {stepStatus === "completed" && <span className="text-xs text-accent">✓ Completed</span>}
                          {stepStatus === "active" && <span className="text-xs text-primary">In Progress</span>}
                          {stepStatus === "pending" && <span className="text-xs text-muted-foreground">Pending</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Documents */}
              <div className="card-elevated p-6">
                <h2 className="text-sm font-medium text-muted-foreground mb-4">Uploaded Documents</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {documentList.map((doc) => {
                    const docStatus = session.documents[doc.key as keyof typeof session.documents];
                    const config = getDocumentStatusConfig(docStatus);
                    return (
                      <div key={doc.key} className="flex items-center justify-between p-4 rounded-xl border border-border">
                        <div className="flex items-center gap-3">
                          <config.icon className={config.color} size={18} />
                          <div>
                            <div className="text-sm font-medium text-foreground">{doc.label}</div>
                            <div className={`text-xs ${config.color}`}>{config.label}</div>
                          </div>
                        </div>
                        {docStatus === "not_uploaded" && (
                          <Button variant="ghost" size="sm" className="text-xs" onClick={() => handleUploadDocument(doc.key)}>
                            <Upload size={14} />
                          </Button>
                        )}
                        {docStatus === "pending" && (
                          <div className="text-xs text-primary">Verifying...</div>
                        )}
                        {docStatus === "verified" && (
                          <div className="text-xs text-accent">✓ Verified</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="outline" size="lg" onClick={refreshStatus} disabled={refreshing} className="sm:hidden">
                  <RefreshCw size={16} className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                  {refreshing ? 'Refreshing...' : 'Refresh Status'}
                </Button>
                <Button variant="outline" size="lg" onClick={handleContactSupport}>
                  <HelpCircle size={16} /> Contact Support
                </Button>
              </div>
            </>
          ) : null}
        </main>
      </div>
    </div>
  );
};

export default UserDashboard;
