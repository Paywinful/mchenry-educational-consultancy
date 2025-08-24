/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { CheckCircle, FileText, User, GraduationCap, Building, Upload, Plus } from "lucide-react";
import { PersonalDetailsForm } from "@/components/student/forms/personal-details-form";
import { AcademicBackgroundForm } from "@/components/student/forms/academic-background-form";
import { InstitutionPreferencesForm } from "@/components/student/forms/institution-preferences-form";
import { DocumentUploadForm } from "@/components/student/forms/document-upload-form";
import { toast } from "@/components/toast";
import { Trash2 } from "lucide-react";



/* UI shims */
const Card = ({ children, className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`bg-white rounded-lg shadow ${className}`} {...props}>{children}</div>
);
const CardHeader = (props: React.HTMLAttributes<HTMLDivElement>) => <div className="border-b px-6 py-4" {...props} />;
const CardTitle = ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h2 className="text-xl font-bold flex items-center gap-2" {...props}>{children}</h2>
);
const CardDescription = ({ children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className="text-gray-500 text-sm" {...props}>{children}</p>
);
const CardContent = ({ children, className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`p-6 ${className}`} {...props}>{children}</div>
);
const Progress = ({ value, className = "" }: { value: number; className?: string }) => (
  <div className={`w-full bg-gray-200 rounded h-2 overflow-hidden ${className}`}>
    <div className="bg-[#6B0F10] h-2" style={{ width: `${value}%` }} />
  </div>
);
const Badge = ({ children, className = "", ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
  <span className={`inline-block px-2 py-1 rounded text-xs font-semibold bg-gray-200 text-gray-700 ${className}`} {...props}>{children}</span>
);
const Button = ({ children, className = "", ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button className={`inline-flex items-center px-3 py-2 rounded border bg-[#6B0F10] text-white hover:bg-red-700 disabled:opacity-50 ${className}`} {...props}>
    {children}
  </button>
);
/* /UI shims */

type ApplicationLite = {
  id: string;
  title?: string | null;
  status: string | null;
  progress: number | null;
  created_at: string;
  updated_at: string;
};

type ApplicationDetails = {
  application: ApplicationLite;
  education: any[];
  testScores: any | null;
  preferences: any | null;
  documents: any[];
};

const initialSteps = [
  { id: 1, title: "Personal Details", description: "Basic information about you", icon: User, completed: false },
  { id: 2, title: "Academic Background", description: "Your educational history", icon: GraduationCap, completed: false },
  { id: 3, title: "Institution Preferences", description: "Choose your schools", icon: Building, completed: false },
  { id: 4, title: "Document Upload", description: "Upload required documents", icon: Upload, completed: false },
];

export default function ApplicationPage() {
  const [steps, setSteps] = useState(initialSteps);
  const [currentStep, setCurrentStep] = useState(1);

  const [apps, setApps] = useState<ApplicationLite[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [details, setDetails] = useState<ApplicationDetails | null>(null);
  const [loadingList, setLoadingList] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // If user has previous apps, keep form hidden until they pick one or click "New Application"
  const [showWizard, setShowWizard] = useState(false);

  const loadApps = useCallback(async () => {
    setLoadingList(true);
    try {
      const res = await fetch("/api/applications", { cache: "no-store" });
      const ct = res.headers.get("content-type") || "";
      const payload = ct.includes("application/json") ? await res.json() : { error: await res.text() };

      if (!res.ok) {
        throw new Error(payload?.error || `Failed to load applications (HTTP ${res.status})`);
      }

      setApps(payload.applications || []);

      if ((payload.applications?.length ?? 0) === 0) {
        setShowWizard(true);
        toast.info("Let’s create your first application.");
      }
    } catch (e: any) {
      toast.error(e?.message || "Could not load applications");
    } finally {
      setLoadingList(false);
    }
  }, []);

  const loadDetails = useCallback(async (id: string) => {
    setLoadingDetails(true);
    try {
      const res = await fetch(`/api/application/${id}`, { cache: "no-store" });
      const ct = res.headers.get("content-type") || "";
      const payload = ct.includes("application/json") ? await res.json() : { error: await res.text() };

      if (!res.ok) {
        throw new Error(payload?.error || `Failed to load application (HTTP ${res.status})`);
      }

      if (payload?.application) setDetails(payload as ApplicationDetails);
    } catch (e: any) {
      toast.error(e?.message || "Could not load this application");
    } finally {
      setLoadingDetails(false);
    }
  }, []);

  // inside component:
const deleteApplication = useCallback(async (id: string) => {
  const yes = window.confirm("Delete this application? This will also remove any payments tied to it.");
  if (!yes) return;

  try {
    const res = await fetch(`/api/application/${id}`, { method: "DELETE" });
    const ct = res.headers.get("content-type") || "";
    const json = ct.includes("application/json") ? await res.json() : { error: await res.text() };
    if (!res.ok) throw new Error(json?.error || `Delete failed (HTTP ${res.status})`);

    // remove from local list
    setApps((prev) => prev.filter((a) => a.id !== id));

    // clear selection if it was this one
    setSelectedId((cur) => (cur === id ? null : cur));

    // hide wizard if none left
    setShowWizard((prev) => {
      const left = apps.filter((a) => a.id !== id).length;
      return left > 0 ? prev : false;
    });

    toast.success("Application deleted");
  } catch (e: any) {
    toast.error(e?.message || "Could not delete application");
  }
}, [apps]);

  useEffect(() => { loadApps(); }, [loadApps]);
  useEffect(() => { if (selectedId) loadDetails(selectedId); }, [selectedId, loadDetails]);

  const completedSteps = steps.filter((s) => s.completed).length;
  const progressPct = useMemo(() => (completedSteps / steps.length) * 100, [completedSteps, steps.length]);

  const completeStep = (id: number) =>
    setSteps((prev) => prev.map((s) => (s.id === id ? { ...s, completed: true } : s)));
  const uncompleteStep = (id: number) =>
    setSteps((prev) => prev.map((s) => (s.id === id ? { ...s, completed: false } : s)));

  const createApplication = useCallback(async () => {
    try {
      const res = await fetch("/api/applications", { method: "POST" });
      const ct = res.headers.get("content-type") || "";
      const json = ct.includes("application/json") ? await res.json() : { error: await res.text() };

      if (!res.ok) {
        throw new Error(json?.error || `Failed to start application (HTTP ${res.status})`);
      }

      if (json?.application?.id) {
        await loadApps();
        setSelectedId(json.application.id);
        setSteps(initialSteps);
        setCurrentStep(1);
        setShowWizard(true);
        toast.success("New application started.");
      } else {
        toast.warning("Couldn’t get the new application id.");
      }
    } catch (e: any) {
      toast.error(e?.message || "Could not create a new application");
    }
  }, [loadApps]);

  const fmt = (iso: string) => new Date(iso).toLocaleDateString();

  const renderStepContent = () => {
    if (!selectedId) {
      return (
        <Card>
          <CardContent>
            <p className="text-sm text-gray-600">
              Select an application from the list above, or create a new one.
            </p>
          </CardContent>
        </Card>
      );
    }

    switch (currentStep) {
      case 1:
        return (
          <PersonalDetailsForm
            onNext={() => {
              completeStep(1);
              setCurrentStep(2);
              toast.success("Personal details saved");
            }}
          />
        );
      case 2:
        return (
          <AcademicBackgroundForm
            applicationId={selectedId}
            initialEducation={details?.education ?? []}
            initialTestScores={details?.testScores ?? null}
            onNext={() => {
              completeStep(2);
              setCurrentStep(3);
              toast.success("Academic background saved");
            }}
            onPrev={() => {
              setCurrentStep(1);
              uncompleteStep(2);
            }}
          />
        );
      case 3:
        return (
          <InstitutionPreferencesForm
            applicationId={selectedId}
            initialPreferences={details?.preferences ?? null}
            onNext={() => {
              completeStep(3);
              setCurrentStep(4);
              toast.success("Preferences saved");
            }}
            onPrev={() => {
              setCurrentStep(2);
              uncompleteStep(3);
            }}
          />
        );
      case 4:
        return (
          <DocumentUploadForm
            applicationId={selectedId}
            initialDocuments={details?.documents ?? []}
            onPrev={() => {
              setCurrentStep(3);
              uncompleteStep(4);
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Applications list (top) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            My Applications
          </CardTitle>
          <CardDescription>View and edit all your submissions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button className="w-full justify-center gap-2" onClick={createApplication}>
            <Plus className="h-4 w-4" /> New Application
          </Button>

          {loadingList ? (
            <p className="text-sm text-gray-500">Loading applications…</p>
          ) : apps.length === 0 ? (
            <p className="text-sm text-gray-500">No applications yet.</p>
          ) : (
            <div className="space-y-2">
              {apps.map((a) => {
  const active = selectedId === a.id;
  return (
    <div key={a.id} className="flex items-stretch gap-2">
      <button
        className={`flex-1 text-left p-3 rounded border transition ${
          active ? "border-[#6B0F10] bg-blue-50" : "border-gray-200 hover:bg-gray-50"
        }`}
        onClick={() => {
          setSelectedId(a.id);
          setShowWizard(true);
          toast.info("Opened application");
        }}
      >
        <div className="flex items-center justify-between">
          <div className="font-semibold truncate">
            {a.title?.trim() || `Application • ${fmt(a.created_at)}`}
          </div>
          <Badge>{a.status || "in_progress"}</Badge>
        </div>
        <div className="text-xs text-gray-500 mt-1">
          Updated {fmt(a.updated_at)}
        </div>
      </button>

      <button
        aria-label="Delete application"
        className="px-3 py-2 rounded border bg-white text-red-600 hover:bg-red-50"
        onClick={() => deleteApplication(a.id)}
        title="Delete"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
})}

            </div>
          )}
        </CardContent>
      </Card>

      {/* Wizard (under) */}
      {showWizard && (
        <>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Application</h1>
              <p className="text-muted-foreground">Complete your application step by step</p>
            </div>
            <Badge>
              {steps.filter((s) => s.completed).length} of {steps.length} completed
            </Badge>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Application Progress
              </CardTitle>
              <CardDescription>
                {details?.application?.title?.trim()
                  ? details.application.title
                  : (selectedId ? `Editing application ${selectedId.slice(0, 8)}…` : "No application selected")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Overall Progress</span>
                  <span className="text-sm text-muted-foreground">
                    {Math.round(progressPct)}%
                  </span>
                </div>
                <Progress value={progressPct} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {initialSteps.map((step) => {
              const active = currentStep === step.id;
              const done = steps.find((s) => s.id === step.id)?.completed;
              return (
                <Card
                  key={step.id}
                  className={`cursor-pointer transition-colors select-none ${
                    active
                      ? "ring-2 ring-[#6B0F10] bg-blue-50"
                      : done
                      ? "bg-green-50"
                      : "hover:bg-gray-50"
                  }`}
                  role="button"
                  tabIndex={0}
                  onClick={() => setCurrentStep(step.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") setCurrentStep(step.id);
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-full ${
                          done
                            ? "bg-green-100 text-green-600"
                            : active
                            ? "bg-blue-100 text-[#6B0F10]"
                            : "bg-gray-100 text-gray-400"
                        }`}
                        aria-label={done ? "Completed" : "Incomplete"}
                      >
                        {done ? <CheckCircle className="h-4 w-4" /> : <step.icon className="h-4 w-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{step.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{step.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="min-h-[500px]">
            {loadingDetails && selectedId ? (
              <Card><CardContent>Loading application…</CardContent></Card>
            ) : (
              renderStepContent()
            )}
          </div>
        </>
      )}
    </div>
  );
}
