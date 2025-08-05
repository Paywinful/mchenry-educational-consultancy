"use client";

import React, { useState } from "react";
import {
  CheckCircle,
  FileText,
  User,
  GraduationCap,
  Building,
  Upload,
} from "lucide-react";
import { PersonalDetailsForm } from "@/components/student/forms/personal-details-form";
import { AcademicBackgroundForm } from "@/components/student/forms/academic-background-form";
import { InstitutionPreferencesForm } from "@/components/student/forms/institution-preferences-form";
import { DocumentUploadForm } from "@/components/student/forms/document-upload-form";

// UI shims for Card, Badge, Progress
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
  <h2 className="text-xl font-bold flex items-center gap-2" {...props}>
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
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`p-6 ${className}`} {...props}>
    {children}
  </div>
);
const Progress = ({
  value,
  className = "",
}: {
  value: number;
  className?: string;
}) => (
  <div
    className={`w-full bg-gray-200 rounded h-2 overflow-hidden ${className}`}
  >
    <div className="bg-[#6B0F10] h-2" style={{ width: `${value}%` }} />
  </div>
);
const Badge = ({
  children,
  className = "",
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => (
  <span
    className={`inline-block px-2 py-1 rounded text-xs font-semibold bg-gray-200 text-gray-700 ${className}`}
    {...props}
  >
    {children}
  </span>
);

const initialSteps = [
  {
    id: 1,
    title: "Personal Details",
    description: "Basic information about you",
    icon: User,
    completed: false,
  },
  {
    id: 2,
    title: "Academic Background",
    description: "Your educational history",
    icon: GraduationCap,
    completed: false,
  },
  {
    id: 3,
    title: "Institution Preferences",
    description: "Choose your preferred schools",
    icon: Building,
    completed: false,
  },
  {
    id: 4,
    title: "Document Upload",
    description: "Upload required documents",
    icon: Upload,
    completed: false,
  },
];

export default function ApplicationPage() {
  const [steps, setSteps] = useState(initialSteps);
  const [currentStep, setCurrentStep] = useState(1);

  // Calculate completed steps and progress
  const completedSteps = steps.filter((step) => step.completed).length;
  const progress = (completedSteps / steps.length) * 100;

  // Mark a step as completed
  const completeStep = (stepId: number) => {
    setSteps((prev) =>
      prev.map((step) =>
        step.id === stepId ? { ...step, completed: true } : step
      )
    );
  };

  // Mark a step as incomplete (if user goes back)
  const uncompleteStep = (stepId: number) => {
    setSteps((prev) =>
      prev.map((step) =>
        step.id === stepId ? { ...step, completed: false } : step
      )
    );
  };

  // Render the correct form for the current step
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <PersonalDetailsForm
            onNext={() => {
              completeStep(1);
              setCurrentStep(2);
            }}
          />
        );
      case 2:
        return (
          <AcademicBackgroundForm
            onNext={() => {
              completeStep(2);
              setCurrentStep(3);
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
            onNext={() => {
              completeStep(3);
              setCurrentStep(4);
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Application</h1>
          <p className="text-muted-foreground">
            Complete your application step by step
          </p>
        </div>
        <Badge>
          {completedSteps} of {steps.length} completed
        </Badge>
      </div>

      {/* Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Application Progress
          </CardTitle>
          <CardDescription>
            Track your progress through the application process
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm text-muted-foreground">
                {Math.round(progress)}%
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Steps Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {steps.map((step) => (
          <Card
            key={step.id}
            className={`cursor-pointer transition-colors select-none ${
              currentStep === step.id
                ? "ring-2 ring-[#6B0F10] bg-blue-50"
                : step.completed
                ? "bg-green-50"
                : "hover:bg-gray-50"
            }`}
            tabIndex={0}
            aria-current={currentStep === step.id}
            aria-label={step.title}
            onClick={() => setCurrentStep(step.id)}
            onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => {
              if (e.key === "Enter" || e.key === " ") setCurrentStep(step.id);
            }}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-full ${
                    step.completed
                      ? "bg-green-100 text-green-600"
                      : currentStep === step.id
                      ? "bg-blue-100 text-[#6B0F10]"
                      : "bg-gray-100 text-gray-400"
                  }`}
                  aria-label={step.completed ? "Completed" : "Incomplete"}
                >
                  {step.completed ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <step.icon className="h-4 w-4" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{step.title}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {step.description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Current Step Content */}
      <div className="min-h-[500px]">{renderStepContent()}</div>
    </div>
  );
}
