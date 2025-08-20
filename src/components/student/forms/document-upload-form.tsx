"use client";

import type React from "react";
import { useState, useCallback } from "react";
import { Upload, CheckCircle, AlertCircle, Download, Trash2 } from "lucide-react";
import { supabaseClient } from "@/lib/supabase/client";

const Card = ({ children, className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`bg-white rounded-lg shadow border ${className}`} {...props}>{children}</div>
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
  <button className={`inline-flex items-center px-4 py-2 rounded border bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 ${className}`} {...props}>
    {children}
  </button>
);
const Badge = ({ children, className = "", ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
  <span className={`inline-block px-2 py-1 rounded text-xs font-semibold bg-gray-200 text-gray-700 ${className}`} {...props}>{children}</span>
);
const Progress = ({ value, className = "" }: { value: number; className?: string; }) => (
  <div className={`w-full bg-gray-200 rounded h-2 overflow-hidden ${className}`}>
    <div className="bg-blue-500 h-2" style={{ width: `${value}%` }} />
  </div>
);

interface DocumentUploadFormProps {
  applicationId: string;
  initialDocuments: any[];
  onPrev: () => void;
}

interface DocumentUI {
  id: string;
  name: string;
  type: string;
  status: "required" | "uploaded" | "verified" | "rejected";
  file?: File;
  uploadDate?: string;
  size?: string;
  storage_path?: string;
}

export function DocumentUploadForm({ applicationId, initialDocuments, onPrev }: DocumentUploadFormProps) {
  const supabase = supabaseClient();

  const [documents, setDocuments] = useState<DocumentUI[]>(() => {
    // Merge template list with DB rows
    const template: DocumentUI[] = [
      { id: "passport",      name: "Passport Copy",            type: "passport",       status: "required" },
      { id: "transcript",    name: "Official Transcript",      type: "transcript",     status: "required" },
      { id: "statement",     name: "Personal Statement",       type: "statement",      status: "required" },
      { id: "recommendation",name: "Letters of Recommendation",type: "recommendation", status: "required" },
      { id: "english-test",  name: "English Proficiency Test", type: "english-test",   status: "required" },
      { id: "financial",     name: "Financial Statement",      type: "financial",      status: "required" },
    ];
    const byType = new Map(initialDocuments.map((d: any) => [d.doc_type, d]));
    return template.map(t => {
      const row = byType.get(t.type);
      if (!row) return t;
      return {
        id: row.id, // DB id
        name: row.name || t.name,
        type: row.doc_type,
        status: (row.status as DocumentUI["status"]) || "uploaded",
        uploadDate: row.uploaded_at?.slice(0,10),
        size: row.size_mb ? `${Number(row.size_mb).toFixed(1)} MB` : undefined,
        storage_path: row.storage_path,
      };
    });
  });

  const uploadedCount = documents.filter(d => d.status !== "required").length;
  const progress = (uploadedCount / documents.length) * 100;

  const getStatusIcon = (status: DocumentUI["status"]) => {
    switch (status) {
      case "required": return <AlertCircle className="h-4 w-4 text-orange-500" />;
      case "uploaded": return <Upload className="h-4 w-4 text-blue-500" />;
      case "verified": return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "rejected": return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
  };
  const getStatusBadge = (status: DocumentUI["status"]) => {
    switch (status) {
      case "required": return <Badge className="bg-red-100 text-red-700">Required</Badge>;
      case "uploaded": return <Badge className="bg-blue-100 text-blue-700">Under Review</Badge>;
      case "verified": return <Badge className="bg-green-100 text-green-700">Verified</Badge>;
      case "rejected": return <Badge className="bg-red-100 text-red-700">Rejected</Badge>;
    }
  };

  const handleFileInputChange = useCallback((docKey: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) void handleFileUpload(docKey, file);
  }, []);

  const handleFileUpload = useCallback(async (docKey: string, file: File) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return alert("Please sign in");

    const path = `${user.id}/${applicationId}/${docKey}-${Date.now()}-${file.name}`;
    const { error: upErr } = await supabase.storage.from('documents').upload(path, file, { upsert: false });
    if (upErr) return alert(upErr.message);

    const { data: row, error: insErr } = await supabase
      .from('documents')
      .insert({
        application_id: applicationId,
        user_id: user.id,
        name: file.name,
        doc_type: docKey,
        status: 'uploaded',
        storage_path: path,
        size_mb: (file.size / (1024*1024)).toFixed(1)
      })
      .select('*')
      .single();

    if (insErr) return alert(insErr.message);

    setDocuments((prev) => prev.map(d => d.type === docKey
      ? { ...d, id: row.id, status: "uploaded", uploadDate: new Date().toISOString().slice(0,10), size: `${(file.size/(1024*1024)).toFixed(1)} MB`, storage_path: path }
      : d
    ));
    alert(`${file.name} has been uploaded successfully.`);
  }, [supabase, applicationId]);

  const handleFileDelete = useCallback(async (doc: DocumentUI) => {
    if (!doc.storage_path || !doc.id) return;
    await supabase.storage.from('documents').remove([doc.storage_path]);
    await supabase.from('documents').delete().eq('id', doc.id);
    setDocuments(prev => prev.map(d => d.type === doc.type
      ? { ...d, id: d.type, status: "required", uploadDate: undefined, size: undefined, storage_path: undefined }
      : d
    ));
    alert('The document has been removed.');
  }, [supabase]);

  const downloadDoc = useCallback(async (doc: DocumentUI) => {
    if (!doc.storage_path) return;
    const { data, error } = await supabase.storage.from('documents').createSignedUrl(doc.storage_path, 60);
    if (error) return alert(error.message);
    if (data?.signedUrl) window.open(data.signedUrl, '_blank');
  }, [supabase]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Document Upload</CardTitle>
        <CardDescription>Upload all required documents to complete your application</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 mx-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Upload Progress</span>
            <span className="text-sm text-muted-foreground">{uploadedCount} of {documents.length} documents</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="space-y-4">
          {documents.map((document) => (
            <Card key={document.type} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getStatusIcon(document.status)}
                  <div>
                    <h4 className="font-medium">{document.name}</h4>
                    {document.uploadDate && (
                      <p className="text-sm text-muted-foreground">
                        Uploaded on {document.uploadDate} {document.size ? `• ${document.size}` : ""}
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
                        id={`file-${document.type}`}
                        className="hidden"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileInputChange(document.type, e)}
                      />
                      <Button
                        onClick={() => document && document.type && document.type !== "" &&
                          window.document.getElementById(`file-${document.type}`)?.click()
                        }
                        className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 text-sm"
                      >
                        <Upload className="h-4 w-4 mr-2" /> Upload
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Button className="bg-gray-200 text-gray-700 px-2 py-1 text-sm" onClick={() => downloadDoc(document)}>
                        <Download className="h-4 w-4 mr-2" /> Download
                      </Button>
                      <Button className="bg-red-100 text-red-700 px-2 py-1 text-sm" onClick={() => handleFileDelete(document)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <h4 className="font-medium mb-2">Upload Guidelines</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Maximum file size: 10MB per document</li>
              <li>• Accepted formats: PDF, DOC, DOCX, JPG, PNG</li>
              <li>• Ensure documents are clear and readable</li>
              <li>• All documents must be in English or include certified translations</li>
            </ul>
          </CardContent>
        </Card>

        <div className="flex justify-between my-2">
          <Button type="button" onClick={onPrev} className="bg-white border text-blue-600 hover:bg-blue-50">Previous</Button>
          <Button className="bg-green-600 hover:bg-green-700">
            <CheckCircle className="h-4 w-4 mr-2" /> Submit Application
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
