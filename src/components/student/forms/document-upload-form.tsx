"use client";

import type React from "react";
import { useState, useCallback } from "react";
import {
  Upload,
  CheckCircle,
  AlertCircle,
  Download,
  Trash2,
} from "lucide-react";

// UI shims for demo: Replace with your own UI library if needed
const Card = ({
  children,
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`bg-white rounded-lg shadow border ${className}`} {...props}>
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
    className={`inline-flex items-center px-4 py-2 rounded border bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 ${className}`}
    {...props}
  >
    {children}
  </button>
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
    <div className="bg-blue-500 h-2" style={{ width: `${value}%` }} />
  </div>
);

// Toast shim (no-op)
const useToast = () => ({
  toast: ({ title, description }: { title: string; description: string }) =>
    alert(`${title}\n${description}`),
});

interface DocumentUploadFormProps {
  onPrev: () => void;
}

interface Document {
  id: string;
  name: string;
  type: string;
  status: "required" | "uploaded" | "verified" | "rejected";
  file?: File;
  uploadDate?: string;
  size?: string;
}

export function DocumentUploadForm({ onPrev }: DocumentUploadFormProps) {
  const { toast } = useToast();
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: "1",
      name: "Passport Copy",
      type: "passport",
      status: "uploaded",
      uploadDate: "2024-01-15",
      size: "2.3 MB",
    },
    {
      id: "2",
      name: "Official Transcript",
      type: "transcript",
      status: "required",
    },
    {
      id: "3",
      name: "Personal Statement",
      type: "statement",
      status: "verified",
      uploadDate: "2024-01-10",
      size: "1.8 MB",
    },
    {
      id: "4",
      name: "Letters of Recommendation",
      type: "recommendation",
      status: "uploaded",
      uploadDate: "2024-01-12",
      size: "3.1 MB",
    },
    {
      id: "5",
      name: "English Proficiency Test",
      type: "english-test",
      status: "required",
    },
    {
      id: "6",
      name: "Financial Statement",
      type: "financial",
      status: "required",
    },
  ]);

  const uploadedCount = documents.filter(
    (doc) => doc.status !== "required"
  ).length;
  const totalCount = documents.length;
  const progress = (uploadedCount / totalCount) * 100;

  const handleFileUpload = useCallback(
    (documentId: string, file: File) => {
      setDocuments((prev) =>
        prev.map((doc) =>
          doc.id === documentId
            ? {
                ...doc,
                status: "uploaded" as const,
                file,
                uploadDate: new Date().toISOString().split("T")[0],
                size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
              }
            : doc
        )
      );

      toast({
        title: "Document uploaded",
        description: `${file.name} has been uploaded successfully.`,
      });
    },
    [toast]
  );

  const handleFileDelete = useCallback(
    (documentId: string) => {
      setDocuments((prev) =>
        prev.map((doc) =>
          doc.id === documentId
            ? {
                ...doc,
                status: "required" as const,
                file: undefined,
                uploadDate: undefined,
                size: undefined,
              }
            : doc
        )
      );

      toast({
        title: "Document removed",
        description: "The document has been removed.",
      });
    },
    [toast]
  );

  const handleFileInputChange = useCallback(
    (documentId: string, event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        handleFileUpload(documentId, file);
      }
    },
    [handleFileUpload]
  );

  const getStatusIcon = (status: Document["status"]) => {
    switch (status) {
      case "required":
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      case "uploaded":
        return <Upload className="h-4 w-4 text-blue-500" />;
      case "verified":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "rejected":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusBadge = (status: Document["status"]) => {
    switch (status) {
      case "required":
        return <Badge className="bg-red-100 text-red-700">Required</Badge>;
      case "uploaded":
        return (
          <Badge className="bg-blue-100 text-blue-700">Under Review</Badge>
        );
      case "verified":
        return <Badge className="bg-green-100 text-green-700">Verified</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-700">Rejected</Badge>;
    }
  };

  const handleSubmit = useCallback(() => {
    const requiredDocs = documents.filter((doc) => doc.status === "required");
    if (requiredDocs.length > 0) {
      toast({
        title: "Missing documents",
        description: `Please upload ${requiredDocs.length} required document(s) before submitting.`,
      });
      return;
    }

    toast({
      title: "Application submitted!",
      description:
        "Your application has been submitted successfully and is now under review.",
    });
  }, [documents, toast]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Document Upload</CardTitle>
        <CardDescription>
          Upload all required documents to complete your application
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Upload Progress</span>
            <span className="text-sm text-muted-foreground">
              {uploadedCount} of {totalCount} documents
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Document List */}
        <div className="space-y-4">
          {documents.map((document) => (
            <Card key={document.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getStatusIcon(document.status)}
                  <div>
                    <h4 className="font-medium">{document.name}</h4>
                    {document.uploadDate && (
                      <p className="text-sm text-muted-foreground">
                        Uploaded on {document.uploadDate} • {document.size}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {getStatusBadge(document.status)}

                  {document.status === "required" ? (
                    <div>
                      <input
                        type="file"
                        id={`file-${document.id}`}
                        className="hidden"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          handleFileInputChange(document.id, e)
                        }
                      />
                      <Button
                        onClick={() =>
                          window.document.getElementById &&
                          window.document
                            .getElementById(`file-${document.id}`)
                            ?.click()
                        }
                        className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 text-sm"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Button className="bg-gray-200 text-gray-700 px-2 py-1 text-sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                      <Button
                        className="bg-red-100 text-red-700 px-2 py-1 text-sm"
                        onClick={() => handleFileDelete(document.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Upload Guidelines */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <h4 className="font-medium mb-2">Upload Guidelines</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Maximum file size: 10MB per document</li>
              <li>• Accepted formats: PDF, DOC, DOCX, JPG, PNG</li>
              <li>• Ensure documents are clear and readable</li>
              <li>
                • All documents must be in English or include certified
                translations
              </li>
            </ul>
          </CardContent>
        </Card>

        <div className="flex justify-between">
          <Button
            type="button"
            onClick={onPrev}
            className="bg-white border text-blue-600 hover:bg-blue-50"
          >
            Previous
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-green-600 hover:bg-green-700"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Submit Application
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
