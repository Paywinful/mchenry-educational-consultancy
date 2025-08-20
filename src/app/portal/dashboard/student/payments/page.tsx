/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Download,
  CreditCard,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCcw,
  Upload,
  Replace,
  FileCheck2,
} from "lucide-react";
import { supabaseClient } from "@/lib/supabase/client";
import { toast } from "@/components/toast";

/* UI shims */
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
    className={`relative w-full bg-gray-200 rounded ${className}`}
    style={{ height: "8px" }}
  >
    <div
      className="absolute top-0 left-0 h-full bg-blue-600 rounded"
      style={{ width: `${value}%` }}
    />
  </div>
);
/* /UI shims */

type Payment = {
  id: string;
  user_id: string;
  application_id: string | null;
  payment_type: string | null;
  amount_ghs: number | string | null;
  status: "pending" | "paid" | "overdue" | "upcoming";
  due_date: string | null;
  paid_at: string | null;
  method: string | null;
  provider_ref: string | null;
  receipt_url: string | null; // storage path
};

export default function PaymentsPage() {
  const supabase = supabaseClient();

  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [uploadingFor, setUploadingFor] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function load(): Promise<boolean> {
    try {
      setErr(null);
      setLoading(true);

      const res = await fetch("/api/payments/list", {
        cache: "no-store",
        credentials: "include",
      });

      const ct = res.headers.get("content-type") || "";
      const isJson = ct.includes("application/json");
      const payload = isJson ? await res.json() : { errorHtml: await res.text() };

      if (!res.ok) {
        const msg =
          payload?.error ||
          (payload?.errorHtml
            ? "Server returned HTML (likely a 404/error page)."
            : `HTTP ${res.status}`);
        throw new Error(msg);
      }

      setPayments(payload.payments || []);
      return true;
    } catch (e: any) {
      const message = e?.message || "Failed to load payments";
      setErr(message);
      toast.error(message);
      return false;
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  // refresh when tab regains focus (silent to avoid toast spam)
  useEffect(() => {
    const onFocus = () => void load();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  async function handleRefresh() {
    const ok = await load();
    if (ok) toast.success("Payments refreshed");
  }

  const totalAmount = useMemo(
    () =>
      payments.reduce(
        (sum, p) => sum + (p.amount_ghs ? Number(p.amount_ghs) : 0),
        0
      ),
    [payments]
  );

  const paidAmount = useMemo(
    () =>
      payments
        .filter((p) => p.status === "paid")
        .reduce(
          (sum, p) => sum + (p.amount_ghs ? Number(p.amount_ghs) : 0),
          0
        ),
    [payments]
  );

  const progress = totalAmount > 0 ? (paidAmount / totalAmount) * 100 : 0;

  const getStatusBadge = (p: Payment) => {
    if (p.status === "pending" && p.receipt_url) {
      return (
        <Badge className="bg-blue-100 text-blue-700">
          <Clock className="h-3 w-3 mr-1 inline" />
          Awaiting review
        </Badge>
      );
    }
    switch (p.status) {
      case "paid":
        return (
          <Badge className="bg-green-500 text-white">
            <CheckCircle className="h-3 w-3 mr-1" />
            Paid
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-gray-200 text-gray-700">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case "overdue":
        return (
          <Badge className="bg-red-500 text-white">
            <AlertCircle className="h-3 w-3 mr-1" />
            Overdue
          </Badge>
        );
      case "upcoming":
        return (
          <Badge className="border border-gray-400 text-gray-700">
            <Clock className="h-3 w-3 mr-1" />
            Upcoming
          </Badge>
        );
      default:
        return null;
    }
  };

  const getStatusIcon = (status: Payment["status"]) => {
    switch (status) {
      case "paid":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case "overdue":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case "upcoming":
        return <Clock className="h-5 w-5 text-blue-500" />;
      default:
        return null;
    }
  };

  function onChooseFile(paymentId: string) {
    setUploadingFor(paymentId);
    fileInputRef.current?.click();
  }

  async function onFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    const payId = uploadingFor;
    setUploadingFor(null);
    if (fileInputRef.current) fileInputRef.current.value = "";

    if (!file || !payId) return;

    // validate file
    const okTypes = ["application/pdf", "image/jpeg", "image/png"];
    if (!okTypes.includes(file.type)) {
      toast.warning("Please upload a PDF, JPG or PNG");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.warning("Max file size is 10MB");
      return;
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Please sign in");

      const cleanName = file.name.replace(/\s+/g, "_");
      const path = `${user.id}/receipts/${payId}-${Date.now()}-${cleanName}`;

      const { error: upErr } = await supabase.storage
        .from("documents")
        .upload(path, file, { upsert: false });
      if (upErr) throw upErr;

      const { error: updErr } = await supabase
        .from("payments")
        .update({ receipt_url: path, method: "manual" })
        .eq("id", payId);
      if (updErr) throw updErr;

      await load();
      toast.success("Receipt uploaded. Awaiting admin review.");
    } catch (err: any) {
      toast.error(err?.message || "Failed to upload receipt");
    }
  }

  async function viewReceipt(p: Payment) {
    if (!p.receipt_url) return;
    try {
      const { data, error } = await supabase.storage
        .from("documents")
        .createSignedUrl(p.receipt_url, 60);
      if (error) throw error;
      if (data?.signedUrl) {
        window.open(data.signedUrl, "_blank");
        toast.info("Opening receipt…");
      }
    } catch (err: any) {
      toast.error(err?.message || "Could not open receipt");
    }
  }

  return (
    <div className="space-y-6">
      {/* hidden input for uploads */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        className="hidden"
        onChange={onFileSelected}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Payments</h1>
          <p className="text-muted-foreground">Upload your receipts</p>
        </div>

        <div className="flex items-center gap-2">
          <Badge className="bg-gray-200 text-gray-700">
            ₵{paidAmount.toLocaleString()} of ₵{totalAmount.toLocaleString()} paid
          </Badge>
          <Button
            onClick={handleRefresh}
            className="text-[#6B0F10] border ml-2"
            title="Refresh"
          >
            <RefreshCcw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Summary
          </CardTitle>
          <CardDescription>Overview of your payment progress</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  ₵{paidAmount.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Total Paid</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  ₵{(totalAmount - paidAmount).toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Outstanding</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {Math.round(progress)}%
                </div>
                <div className="text-sm text-muted-foreground">Complete</div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Payment Progress</span>
                <span className="text-sm text-muted-foreground">
                  {Math.round(progress)}%
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error banner (also toasted already) */}
      {err && (
        <Card className="border-red-200 bg-red-50">
          <CardContent>
            <p className="text-red-700 text-sm">{err}</p>
          </CardContent>
        </Card>
      )}

      {/* List */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Schedule</CardTitle>
          <CardDescription>All fees and their status</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-gray-500">Loading payments…</p>
          ) : payments.length === 0 ? (
            <p className="text-sm text-gray-500">
              No payments yet. Create an application to generate the ₵250 Application Fee.
            </p>
          ) : (
            <div className="space-y-4">
              {payments.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    {getStatusIcon(p.status)}
                    <div>
                      <h3 className="font-semibold">
                        {p.payment_type || "Payment"}
                      </h3>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        {p.due_date && <span>Due: {p.due_date}</span>}
                        {p.paid_at && (
                          <span>
                            Paid: {new Date(p.paid_at).toLocaleDateString()}
                          </span>
                        )}
                        {p.method && <span>Method: {p.method}</span>}
                        {p.application_id && (
                          <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                            App: {p.application_id.slice(0, 8)}…
                          </span>
                        )}
                        {p.receipt_url && (
                          <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                            Receipt uploaded
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center text-right">
                      <div className="text-lg mx-2 font-bold">
                        ₵{Number(p.amount_ghs ?? 0).toLocaleString()}
                      </div>
                      {getStatusBadge(p)}
                    </div>

                    <div className="flex gap-2">
                      {p.receipt_url ? (
                        <>
                          <Button
                            className="px-3 py-1 bg-white text-[#6B0F10] border border-gray-300"
                            onClick={() => viewReceipt(p)}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            View
                          </Button>
                          {p.status !== "paid" && (
                            <Button
                              className="px-3 py-1"
                              onClick={() => {
                                toast.info("Select a new file to replace the receipt…");
                                onChooseFile(p.id);
                              }}
                              title="Replace receipt"
                            >
                              <Replace className="h-4 w-4 mr-2" />
                              Replace
                            </Button>
                          )}
                        </>
                      ) : p.status === "paid" ? (
                        <Badge className="bg-green-100 text-green-700">
                          <FileCheck2 className="h-3 w-3 mr-1 inline" />
                          Verified
                        </Badge>
                      ) : (
                        <Button
                          className="px-3 py-1"
                          onClick={() => {
                            // toast.info("Choose a PDF, JPG or PNG (max 10MB)");
                            onChooseFile(p.id);
                          }}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Proof
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* How-to box */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <h4 className="font-medium mb-2">Receipt Guidelines</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Max file size: 10MB</li>
            <li>• Accepted: PDF, JPG, PNG</li>
            <li>• Ensure amount, date, and reference are readable</li>
            <li>• After upload, status shows “Awaiting review” until an admin approves</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
