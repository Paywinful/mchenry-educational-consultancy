"use client";

import type React from "react";
import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { Plus, Trash2 } from "lucide-react";

/* UI shims */
const Card = ({ children, className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`bg-white rounded-lg shadow ${className}`} {...props}>{children}</div>
);
const CardHeader = (props: React.HTMLAttributes<HTMLDivElement>) => <div className="border-b px-6 py-4" {...props} />;
const CardTitle = ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h2 className="text-xl font-bold" {...props}>{children}</h2>
);
const CardDescription = ({ children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className="text-gray-500 text-sm" {...props}>{children}</p>
);
const CardContent = ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className="p-6" {...props}>{children}</div>
);
const Button = ({ children, className = "", ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button className={`inline-flex items-center px-4 py-2 rounded border bg-[#6B0F10] text-white hover:bg-red-700 disabled:opacity-50 ${className}`} {...props}>
    {children}
  </button>
);
const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => <input className="border rounded px-3 py-2 w-full" {...props} />;
const Label = ({ children, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) => (
  <label className="block font-medium mb-1" {...props}>{children}</label>
);
const Select = ({ value, onValueChange, children }: { value: string; onValueChange: (v: string) => void; children: React.ReactNode }) => (
  <select className="border rounded px-3 py-2 w-full" value={value} onChange={(e) => onValueChange(e.target.value)}>{children}</select>
);
const SelectValue = ({ placeholder }: { placeholder: string }) => <option value="">{placeholder}</option>;
const SelectItem = ({ value, children }: { value: string; children: React.ReactNode }) => <option value={value}>{children}</option>;
/* /UI shims */

interface AcademicBackgroundFormProps {
  onNext: () => void;
  onPrev: () => void;
  applicationId: string;
  initialEducation: Array<{
    id: string;
    institution: string;
    degree: string | null;
    field_of_study: string | null;
    start_year: string | null;
    end_year: string | null;
    gpa: string | null;
  }>;
  initialTestScores: {
    sat?: string | null; act?: string | null; gre?: string | null; gmat?: string | null; toefl?: string | null; ielts?: string | null;
  } | null;
}

type EducationUI = {
  id?: string;
  clientId: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startYear: string;
  endYear: string;
  gpa: string;
};

export function AcademicBackgroundForm({
  onNext, onPrev, applicationId, initialEducation, initialTestScores,
}: AcademicBackgroundFormProps) {
  const [educationHistory, setEducationHistory] = useState<EducationUI[]>([]);
  const [testScores, setTestScores] = useState({ sat:"", act:"", gre:"", gmat:"", toefl:"", ielts:"" });
  const originalIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (initialEducation?.length) {
      const mapped = initialEducation.map((e) => {
        if (e.id) originalIdsRef.current.add(e.id);
        return {
          id: e.id,
          clientId: `${e.id}-client`,
          institution: e.institution ?? "",
          degree: e.degree ?? "",
          fieldOfStudy: e.field_of_study ?? "",
          startYear: e.start_year ?? "",
          endYear: e.end_year ?? "",
          gpa: e.gpa ?? "",
        };
      });
      setEducationHistory(mapped);
    } else {
      setEducationHistory([{ clientId: `new-${Date.now()}`, institution:"", degree:"", fieldOfStudy:"", startYear:"", endYear:"", gpa:"" }]);
    }
    setTestScores({
      sat: initialTestScores?.sat ?? "", act: initialTestScores?.act ?? "",
      gre: initialTestScores?.gre ?? "", gmat: initialTestScores?.gmat ?? "",
      toefl: initialTestScores?.toefl ?? "", ielts: initialTestScores?.ielts ?? "",
    });
  }, [initialEducation, initialTestScores]);

  const addEducation = useCallback(() => {
    setEducationHistory((prev) => [...prev, { clientId: `new-${Date.now()}`, institution:"", degree:"", fieldOfStudy:"", startYear:"", endYear:"", gpa:"" }]);
  }, []);
  const removeEducation = useCallback((clientId: string) => {
    setEducationHistory((prev) => prev.filter((e) => e.clientId !== clientId));
  }, []);
  const updateEducation = useCallback((clientId: string, field: keyof EducationUI, value: string) => {
    setEducationHistory((prev) => prev.map((e) => (e.clientId === clientId ? { ...e, [field]: value } : e)));
  }, []);
  const updateTestScore = useCallback((field: string, value: string) => {
    setTestScores((prev) => ({ ...prev, [field]: value }));
  }, []);

  const currentIds = useMemo(() => new Set(educationHistory.map((e) => e.id).filter(Boolean) as string[]), [educationHistory]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const inserts = educationHistory.filter((e) => !e.id);
      const updates = educationHistory.filter((e) => e.id);
      const deletes = [...originalIdsRef.current].filter((id) => !currentIds.has(id));

      if (inserts.length) {
        const items = inserts.map((e) => ({
          institution: e.institution, degree: e.degree, field_of_study: e.fieldOfStudy,
          start_year: e.startYear, end_year: e.endYear, gpa: e.gpa,
        }));
        await fetch(`/api/application/${applicationId}/education`, {
          method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items }),
        });
      }
      if (updates.length) {
        const items = updates.map((e) => ({
          id: e.id, institution: e.institution, degree: e.degree, field_of_study: e.fieldOfStudy,
          start_year: e.startYear, end_year: e.endYear, gpa: e.gpa,
        }));
        await fetch(`/api/application/${applicationId}/education`, {
          method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items }),
        });
      }
      if (deletes.length) {
        await fetch(`/api/application/${applicationId}/education`, {
          method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ids: deletes }),
        });
      }

      await fetch(`/api/application/${applicationId}/test-scores`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(testScores),
      });

      onNext();
    } catch (err: any) {
      alert(err?.message || "Failed to save academic background");
    }
  }, [educationHistory, currentIds, testScores, applicationId, onNext]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Academic Background</CardTitle>
        <CardDescription>Educational history & standardized test scores</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Education History</h3>
              <Button type="button" onClick={addEducation} className="bg-white border text-[#6B0F10] hover:bg-blue-50 px-2 py-1 text-sm">
                <Plus className="h-4 w-4 mr-2" /> Add Education
              </Button>
            </div>

            {educationHistory.map((education, index) => (
              <Card key={education.clientId} className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium">Education {index + 1}</h4>
                  {educationHistory.length > 1 && (
                    <Button type="button" onClick={() => removeEducation(education.clientId)} className="bg-transparent border-none text-red-500 hover:bg-red-50 px-2 py-1 text-sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Institution Name *</Label>
                    <Input value={education.institution} onChange={(e) => updateEducation(education.clientId, "institution", e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Degree Level *</Label>
                    <Select value={education.degree} onValueChange={(v) => updateEducation(education.clientId, "degree", v)}>
                      <SelectValue placeholder="Select degree" />
                      <SelectItem value="high-school">High School</SelectItem>
                      <SelectItem value="associate">Associate&apos;s</SelectItem>
                      <SelectItem value="bachelor">Bachelor&apos;s</SelectItem>
                      <SelectItem value="master">Master&apos;s</SelectItem>
                      <SelectItem value="doctorate">Doctorate</SelectItem>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Field of Study *</Label>
                    <Input value={education.fieldOfStudy} onChange={(e) => updateEducation(education.clientId, "fieldOfStudy", e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label>GPA</Label>
                    <Input value={education.gpa} onChange={(e) => updateEducation(education.clientId, "gpa", e.target.value)} placeholder="e.g., 3.8" />
                  </div>
                  <div className="space-y-2">
                    <Label>Start Year *</Label>
                    <Input value={education.startYear} onChange={(e) => updateEducation(education.clientId, "startYear", e.target.value)} placeholder="e.g., 2018" required />
                  </div>
                  <div className="space-y-2">
                    <Label>End Year *</Label>
                    <Input value={education.endYear} onChange={(e) => updateEducation(education.clientId, "endYear", e.target.value)} placeholder="e.g., 2022" required />
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Test Scores (Optional)</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                ["sat", "SAT Score", "e.g., 1450"],
                ["act", "ACT Score", "e.g., 32"],
                ["gre", "GRE Score", "e.g., 320"],
                ["gmat", "GMAT Score", "e.g., 650"],
                ["toefl", "TOEFL Score", "e.g., 105"],
                ["ielts", "IELTS Score", "e.g., 7.5"],
              ].map(([key, label, placeholder]) => (
                <div key={key} className="space-y-2">
                  <Label htmlFor={key}>{label}</Label>
                  <Input id={key} value={(testScores as any)[key]} onChange={(e) => updateTestScore(key, e.target.value)} placeholder={placeholder as string} />
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between">
            <Button type="button" onClick={onPrev} className="bg-white border text-[#6B0F10] hover:bg-blue-50">Previous</Button>
            <Button type="submit">Next: Institution Preferences</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
