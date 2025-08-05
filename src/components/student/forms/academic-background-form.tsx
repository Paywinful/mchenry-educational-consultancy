"use client";

import type React from "react";
import { useState, useCallback } from "react";

const Card = ({
  children,
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`bg-white rounded-lg shadow ${className}`} {...props}>
    {children}
  </div>
);
const CardHeader = ({
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className="border-b px-6 py-4" {...props}>
    {children}
  </div>
);
const CardTitle = ({
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h2 className="text-xl font-bold" {...props}>
    {children}
  </h2>
);
const CardDescription = ({
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className="text-gray-500 text-sm" {...props}>
    {children}
  </p>
);
const CardContent = ({
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className="p-6" {...props}>
    {children}
  </div>
);
const Button = ({
  children,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    className={`inline-flex items-center px-4 py-2 rounded border bg-[#6B0F10] text-white hover:bg-red-700 disabled:opacity-50 ${className}`}
    {...props}
  >
    {children}
  </button>
);
const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input className="border rounded px-3 py-2 w-full" {...props} />
);
const Label = ({
  children,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) => (
  <label className="block font-medium mb-1" {...props}>
    {children}
  </label>
);
// Simple Select components
const Select = ({
  value,
  onValueChange,
  children,
}: {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
}) => (
  <select
    className="border rounded px-3 py-2 w-full"
    value={value}
    onChange={(e) => onValueChange(e.target.value)}
  >
    {children}
  </select>
);
const SelectTrigger = ({ children }: { children: React.ReactNode }) => (
  <>{children}</>
);
const SelectValue = ({ placeholder }: { placeholder: string }) => (
  <option value="">{placeholder}</option>
);
const SelectContent = ({ children }: { children: React.ReactNode }) => (
  <>{children}</>
);
const SelectItem = ({
  value,
  children,
}: {
  value: string;
  children: React.ReactNode;
}) => <option value={value}>{children}</option>;
import { Plus, Trash2 } from "lucide-react";

interface AcademicBackgroundFormProps {
  onNext: () => void;
  onPrev: () => void;
}

interface Education {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startYear: string;
  endYear: string;
  gpa: string;
}

export function AcademicBackgroundForm({
  onNext,
  onPrev,
}: AcademicBackgroundFormProps) {
  const [educationHistory, setEducationHistory] = useState<Education[]>([
    {
      id: "1",
      institution: "State University",
      degree: "bachelor",
      fieldOfStudy: "Computer Science",
      startYear: "2018",
      endYear: "2022",
      gpa: "3.8",
    },
  ]);

  const [testScores, setTestScores] = useState({
    sat: "1450",
    act: "",
    gre: "",
    gmat: "",
    toefl: "105",
    ielts: "",
  });

  const addEducation = useCallback(() => {
    const newEducation: Education = {
      id: Date.now().toString(),
      institution: "",
      degree: "",
      fieldOfStudy: "",
      startYear: "",
      endYear: "",
      gpa: "",
    };
    setEducationHistory((prev) => [...prev, newEducation]);
  }, []);

  const removeEducation = useCallback((id: string) => {
    setEducationHistory((prev) => prev.filter((edu) => edu.id !== id));
  }, []);

  const updateEducation = useCallback(
    (id: string, field: keyof Education, value: string) => {
      setEducationHistory((prev) =>
        prev.map((edu) => (edu.id === id ? { ...edu, [field]: value } : edu))
      );
    },
    []
  );

  const updateTestScore = useCallback((field: string, value: string) => {
    setTestScores((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      console.log("Academic background saved:", {
        educationHistory,
        testScores,
      });
      onNext();
    },
    [educationHistory, testScores, onNext]
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Academic Background</CardTitle>
        <CardDescription>
          Tell us about your educational history and test scores
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Education History */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Education History</h3>
              <Button
                type="button"
                onClick={addEducation}
                className="bg-white border text-[#6B0F10] hover:bg-blue-50 px-2 py-1 text-sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Education
              </Button>
            </div>

            {educationHistory.map((education, index) => (
              <Card key={education.id} className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium">Education {index + 1}</h4>
                  {educationHistory.length > 1 && (
                    <Button
                      type="button"
                      onClick={() => removeEducation(education.id)}
                      className="bg-transparent border-none text-red-500 hover:bg-red-50 px-2 py-1 text-sm"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Institution Name *</Label>
                    <Input
                      value={education.institution}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        updateEducation(
                          education.id,
                          "institution",
                          e.target.value
                        )
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Degree Level *</Label>
                    <Select
                      value={education.degree}
                      onValueChange={(value: string) =>
                        updateEducation(education.id, "degree", value)
                      }
                    >
                      <SelectValue placeholder="Select degree" />
                      <SelectItem value="high-school">High School</SelectItem>
                      <SelectItem value="associate">Associate's</SelectItem>
                      <SelectItem value="bachelor">Bachelor's</SelectItem>
                      <SelectItem value="master">Master's</SelectItem>
                      <SelectItem value="doctorate">Doctorate</SelectItem>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Field of Study *</Label>
                    <Input
                      value={education.fieldOfStudy}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        updateEducation(
                          education.id,
                          "fieldOfStudy",
                          e.target.value
                        )
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>GPA</Label>
                    <Input
                      value={education.gpa}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        updateEducation(education.id, "gpa", e.target.value)
                      }
                      placeholder="e.g., 3.8"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Start Year *</Label>
                    <Input
                      value={education.startYear}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        updateEducation(
                          education.id,
                          "startYear",
                          e.target.value
                        )
                      }
                      placeholder="e.g., 2018"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>End Year *</Label>
                    <Input
                      value={education.endYear}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        updateEducation(education.id, "endYear", e.target.value)
                      }
                      placeholder="e.g., 2022"
                      required
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Test Scores */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Test Scores (Optional)</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sat">SAT Score</Label>
                <Input
                  id="sat"
                  value={testScores.sat}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    updateTestScore("sat", e.target.value)
                  }
                  placeholder="e.g., 1450"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="act">ACT Score</Label>
                <Input
                  id="act"
                  value={testScores.act}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    updateTestScore("act", e.target.value)
                  }
                  placeholder="e.g., 32"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gre">GRE Score</Label>
                <Input
                  id="gre"
                  value={testScores.gre}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    updateTestScore("gre", e.target.value)
                  }
                  placeholder="e.g., 320"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gmat">GMAT Score</Label>
                <Input
                  id="gmat"
                  value={testScores.gmat}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    updateTestScore("gmat", e.target.value)
                  }
                  placeholder="e.g., 650"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="toefl">TOEFL Score</Label>
                <Input
                  id="toefl"
                  value={testScores.toefl}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    updateTestScore("toefl", e.target.value)
                  }
                  placeholder="e.g., 105"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ielts">IELTS Score</Label>
                <Input
                  id="ielts"
                  value={testScores.ielts}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    updateTestScore("ielts", e.target.value)
                  }
                  placeholder="e.g., 7.5"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <Button
              type="button"
              onClick={onPrev}
              className="bg-white border text-[#6B0F10] hover:bg-blue-50"
            >
              Previous
            </Button>
            <Button type="submit">Next: Institution Preferences</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
