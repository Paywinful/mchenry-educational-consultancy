"use client";

import type React from "react";
import { useEffect, useState, useCallback } from "react";
import { Star, MapPin } from "lucide-react";

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
const Label = ({ children, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) => (
  <label className="block font-medium mb-1" {...props}>{children}</label>
);
const Badge = ({ children, className = "", ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
  <span className={`inline-block px-2 py-1 rounded text-xs font-semibold bg-gray-200 text-gray-700 ${className}`} {...props}>{children}</span>
);
const Select = ({ value, onValueChange, children }: { value: string; onValueChange: (v: string) => void; children: React.ReactNode }) => (
  <select className="border rounded px-3 py-2 w-full" value={value} onChange={(e) => onValueChange(e.target.value)}>{children}</select>
);
const SelectValue = ({ placeholder }: { placeholder: string }) => <option value="">{placeholder}</option>;
const SelectItem = ({ value, children }: { value: string; children: React.ReactNode }) => <option value={value}>{children}</option>;
const Checkbox = ({ checked, ...props }: { checked: boolean } & React.InputHTMLAttributes<HTMLInputElement>) => (
  <input type="checkbox" checked={checked} readOnly {...props} className="accent-blue-600 h-4 w-4 rounded border-gray-300" />
);
const Textarea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => <textarea className="border rounded px-3 py-2 w-full" {...props} />;
/* /UI shims */

interface InstitutionPreferencesFormProps {
  onNext: () => void;
  onPrev: () => void;
  applicationId: string;
  initialPreferences: {
    selected_institution_ids: string[] | null;
    preferred_program: string | null;
    degree_level: string | null;
    start_term: string | null;
    additional_info: string | null;
  } | null;
}

const institutions = [
  { id: "1", name: "Harvard University", location: "Cambridge, MA", ranking: 1, tuition: "$54,000", programs: ["Business","Computer Science","Medicine","Law"] },
  { id: "2", name: "Stanford University", location: "Stanford, CA", ranking: 2, tuition: "$56,000", programs: ["Engineering","Computer Science","Business","Medicine"] },
  { id: "3", name: "MIT", location: "Cambridge, MA", ranking: 3, tuition: "$53,000", programs: ["Engineering","Computer Science","Physics","Mathematics"] },
  { id: "4", name: "University of Chicago", location: "Chicago, IL", ranking: 6, tuition: "$59,000", programs: ["Economics","Business","Law","Medicine"] },
];

export function InstitutionPreferencesForm({
  onNext, onPrev, applicationId, initialPreferences,
}: InstitutionPreferencesFormProps) {
  const [institutionType, setInstitutionType] = useState<"shs" | "tertiary">("tertiary");
  const [selectedInstitutions, setSelectedInstitutions] = useState<string[]>([]);
  const [preferredProgram, setPreferredProgram] = useState("");
  const [degreeLevel, setDegreeLevel] = useState("");
  const [startTerm, setStartTerm] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");

  useEffect(() => {
    if (initialPreferences) {
      setSelectedInstitutions(initialPreferences.selected_institution_ids ?? []);
      setPreferredProgram(initialPreferences.preferred_program ?? "");
      setDegreeLevel(initialPreferences.degree_level ?? "");
      setStartTerm(initialPreferences.start_term ?? "");
      setAdditionalInfo(initialPreferences.additional_info ?? "");
    }
  }, [initialPreferences]);

  const toggleInstitution = useCallback((id: string) => {
    setSelectedInstitutions((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch(`/api/application/${applicationId}/institution-prefs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          selected_institution_ids: selectedInstitutions,
          preferred_program: preferredProgram,
          degree_level: degreeLevel,
          start_term: startTerm,
          additional_info: additionalInfo,
        }),
      });
      onNext();
    } catch (err: any) {
      alert(err?.message || "Failed to save preferences");
    }
  }, [applicationId, selectedInstitutions, preferredProgram, degreeLevel, startTerm, additionalInfo, onNext]);

  const shsInstitutions = [
    { id: "shs1", name: "Wesley Girls' High School", location: "Cape Coast", ranking: 1, programs: ["Science","Business","Arts"] },
    { id: "shs2", name: "Presbyterian Boys' Secondary School", location: "Accra", ranking: 2, programs: ["Science","Business","Visual Arts"] },
    { id: "shs3", name: "Achimota School", location: "Accra", ranking: 3, programs: ["Science","Business","General Arts"] },
    { id: "shs4", name: "St. Augustine's College", location: "Cape Coast", ranking: 4, programs: ["Science","Business","Arts"] },
  ];
  const displayedInstitutions = institutionType === "shs" ? shsInstitutions : institutions;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Institution & Program Preferences</CardTitle>
        <CardDescription>Select your preferred institutions and programs</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Institution Type</h3>
            <div className="flex gap-4">
              <Button
                type="button"
                className={`${institutionType === "shs" ? "bg-[#6B0F10] text-white" : "bg-red-400 text-[#6B0F10]"} !px-6 !py-2 !rounded-full border !font-semibold !shadow-none`}
                onClick={() => { setInstitutionType("shs"); setSelectedInstitutions([]); setPreferredProgram(""); setDegreeLevel("shs"); setStartTerm(""); }}
              >
                SHS (Senior High School)
              </Button>
              <Button
                type="button"
                className={`${institutionType === "tertiary" ? "bg-[#6B0F10] text-white" : "bg-red-400 text-[#6B0F10]"} !px-6 !py-2 !rounded-full border !font-semibold !shadow-none`}
                onClick={() => { setInstitutionType("tertiary"); }}
              >
                Tertiary
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Program Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Preferred Program *</Label>
                <Select value={preferredProgram} onValueChange={setPreferredProgram}>
                  <SelectValue placeholder="Select program" />
                  {institutionType === "shs" ? (
                    <>
                      <SelectItem value="Science">Science</SelectItem>
                      <SelectItem value="Business">Business</SelectItem>
                      <SelectItem value="Arts">Arts</SelectItem>
                      <SelectItem value="Visual Arts">Visual Arts</SelectItem>
                      <SelectItem value="General Arts">General Arts</SelectItem>
                    </>
                  ) : (
                    <>
                      <SelectItem value="Computer Science">Computer Science</SelectItem>
                      <SelectItem value="Business">Business Administration</SelectItem>
                      <SelectItem value="Engineering">Engineering</SelectItem>
                      <SelectItem value="Medicine">Medicine</SelectItem>
                      <SelectItem value="Law">Law</SelectItem>
                      <SelectItem value="Economics">Economics</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </>
                  )}
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Degree Level *</Label>
                <Select value={degreeLevel} onValueChange={setDegreeLevel}>
                  <SelectValue placeholder="Select degree level" />
                  {institutionType === "shs" ? (
                    <SelectItem value="shs">SHS Certificate</SelectItem>
                  ) : (
                    <>
                      <SelectItem value="bachelor">Bachelor&apos;s</SelectItem>
                      <SelectItem value="master">Master&apos;s</SelectItem>
                      <SelectItem value="doctorate">Doctorate</SelectItem>
                    </>
                  )}
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Preferred Start Term *</Label>
                <Select value={startTerm} onValueChange={setStartTerm}>
                  <SelectValue placeholder="Select start term" />
                  {institutionType === "shs" ? (
                    <>
                      <SelectItem value="2025">2025</SelectItem>
                      <SelectItem value="2026">2026</SelectItem>
                    </>
                  ) : (
                    <>
                      <SelectItem value="fall-2024">Fall 2024</SelectItem>
                      <SelectItem value="spring-2025">Spring 2025</SelectItem>
                      <SelectItem value="summer-2025">Summer 2025</SelectItem>
                      <SelectItem value="fall-2025">Fall 2025</SelectItem>
                    </>
                  )}
                </Select>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Select Institutions</h3>
              <Badge className="bg-gray-100 text-gray-700">{selectedInstitutions.length} selected</Badge>
            </div>
            <p className="text-sm text-muted-foreground">Choose up to 5 institutions you&apos;d like to apply to</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {displayedInstitutions.map((inst) => (
                <Card
                  key={inst.id}
                  className={`cursor-pointer transition-colors ${selectedInstitutions.includes(inst.id) ? "ring-2 ring-[#6B0F10] bg-blue-50" : "hover:bg-gray-50"}`}
                  onClick={() => toggleInstitution(inst.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Checkbox checked={selectedInstitutions.includes(inst.id)} readOnly />
                        <div>
                          <h4 className="font-semibold">{inst.name}</h4>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            {inst.location}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" /> #{inst.ranking}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {inst.programs.slice(0, 3).map((p: string) => (
                        <Badge key={p} className="text-xs border border-gray-300 bg-white">{p}</Badge>
                      ))}
                      {inst.programs.length > 3 && (
                        <Badge className="text-xs border border-gray-300 bg-white">+{inst.programs.length - 3} more</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Additional Information</h3>
            <div className="space-y-2">
              <Label htmlFor="additionalInfo">Any specific requirements or preferences? (Optional)</Label>
              <Textarea
                id="additionalInfo"
                value={additionalInfo}
                onChange={(e) => setAdditionalInfo(e.target.value)}
                placeholder="Tell us about any specific requirements, research interests, or other preferences..."
                rows={4}
              />
            </div>
          </div>

          <div className="flex justify-between">
            <Button type="button" onClick={onPrev} className="bg-white border text-[#6B0F10] hover:bg-blue-50">Previous</Button>
            <Button type="submit">Next: Document Upload</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
