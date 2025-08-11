"use client";
import React from "react";
import type { ReactNode, HTMLAttributes, ButtonHTMLAttributes } from "react";
const Card = ({
  children,
  className = "",
  ...props
}: {
  children: ReactNode;
  className?: string;
} & HTMLAttributes<HTMLDivElement>) => (
  <div className={`bg-white rounded-lg shadow ${className}`} {...props}>
    {children}
  </div>
);
const CardHeader = ({
  children,
  ...props
}: { children: ReactNode } & HTMLAttributes<HTMLDivElement>) => (
  <div className="border-b px-6 py-4" {...props}>
    {children}
  </div>
);
const CardTitle = ({
  children,
  ...props
}: { children: ReactNode } & HTMLAttributes<HTMLHeadingElement>) => (
  <h2 className="text-xl font-bold" {...props}>
    {children}
  </h2>
);
const CardDescription = ({
  children,
  ...props
}: { children: ReactNode } & HTMLAttributes<HTMLParagraphElement>) => (
  <p className="text-gray-500 text-sm" {...props}>
    {children}
  </p>
);
const CardContent = ({
  children,
  ...props
}: { children: ReactNode } & HTMLAttributes<HTMLDivElement>) => (
  <div className="p-6" {...props}>
    {children}
  </div>
);
const Button = ({
  children,
  className = "",
  ...props
}: {
  children: ReactNode;
  className?: string;
} & ButtonHTMLAttributes<HTMLButtonElement>) => (
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
}: {
  children: ReactNode;
  className?: string;
} & HTMLAttributes<HTMLSpanElement>) => (
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
import {
  CreditCard,
  Download,
  Upload,
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
} from "lucide-react";
import { X } from "lucide-react";

const payments = [
  {
    id: "1",
    type: "Application Fee",
    amount: "₵150",
    dueDate: "2024-02-15",
    status: "pending",
    paidDate: "2024-01-10",
    method: "Credit Card",
  },
  {
    id: "2",
    type: "Tuition Deposit",
    amount: "₵2,000",
    dueDate: "2024-03-01",
    status: "pending",
    method: null,
  },
  {
    id: "3",
    type: "Accommodation Fee",
    amount: "₵800",
    dueDate: "2024-03-15",
    status: "pending",
    method: null,
  },
  {
    id: "4",
    type: "Health Insurance",
    amount: "₵500",
    dueDate: "2024-04-01",
    status: "upcoming",
    method: null,
  },
];

const paymentMethods = [
  { id: "card", name: "Credit/Debit Card", icon: CreditCard },
  { id: "bank", name: "Bank Transfer", icon: DollarSign },
  { id: "check", name: "Check/Money Order", icon: Upload },
];

export default function PaymentsPage() {
  const [showPaymentModal, setShowPaymentModal] = React.useState(false);
  const [selectedPayment, setSelectedPayment] = React.useState<string | null>(
    null
  );
  const totalAmount = payments.reduce((sum, payment) => {
    return (
      sum + Number.parseFloat(payment.amount.replace("₵", "").replace(",", ""))
    );
  }, 0);

  const paidAmount = payments
    .filter((p) => p.status === "paid")
    .reduce((sum, payment) => {
      return (
        sum +
        Number.parseFloat(payment.amount.replace("₵", "").replace(",", ""))
      );
    }, 0);

  const progress = (paidAmount / totalAmount) * 100;

  const getStatusBadge = (status: string) => {
    switch (status) {
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

  const getStatusIcon = (status: string) => {
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Payments</h1>
          <p className="text-muted-foreground">
            Manage your fees and payment history
          </p>
        </div>
        <Badge className="bg-gray-200 text-gray-700">
          {`₵${paidAmount.toLocaleString()} of ₵${totalAmount.toLocaleString()} paid`}
        </Badge>
      </div>

      {/* Payment Summary */}
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

      {/* Payment List */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Schedule</CardTitle>
          <CardDescription>All fees and their payment status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {payments.map((payment) => (
              <div
                key={payment.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-4">
                  {getStatusIcon(payment.status)}
                  <div>
                    <h3 className="font-semibold">{payment.type}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Due: {payment.dueDate}</span>
                      {payment.paidDate && (
                        <span>Paid: {payment.paidDate}</span>
                      )}
                      {payment.method && <span>Method: {payment.method}</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-lg font-bold">{payment.amount}</div>
                    {getStatusBadge(payment.status)}
                  </div>

                  <div className="flex gap-2">
                    {payment.status === "paid" ? (
                      <Button className="px-3 py-1 bg-white text-[#6B0F10] border border-gray-300">
                        <Download className="h-4 w-4 mr-2" />
                        Receipt
                      </Button>
                    ) : (
                      <Button
                        className="px-3 py-1"
                        onClick={() => setShowPaymentModal(true)}
                      >
                        Pay Now
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Payment Popup */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md relative animate-fadein">
            <button
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100"
              onClick={() => setShowPaymentModal(false)}
              aria-label="Close"
            >
              <X className="w-5 h-5 text-gray-700" />
            </button>
            <h2 className="text-xl font-bold mb-4 text-[#6B0F10]">
              Select Payment Method
            </h2>
            <div className="grid grid-cols-1 gap-4 mb-6">
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors w-full"
                  onClick={() => {
                    setSelectedPayment(method.id);
                    setShowPaymentModal(false);
                    // Here you can trigger further payment logic
                  }}
                >
                  <method.icon className="h-8 w-8 text-blue-600" />
                  <span className="font-medium text-lg">{method.name}</span>
                </button>
              ))}
            </div>
            <p className="text-sm text-muted-foreground text-center">
              All payments are processed securely in Ghanaian Cedi (₵).
            </p>
          </div>
          <style jsx>{`
            .animate-fadein {
              animation: fadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }
            @keyframes fadeIn {
              from {
                opacity: 0;
                transform: scale(0.95);
              }
              to {
                opacity: 1;
                transform: scale(1);
              }
            }
          `}</style>
        </div>
      )}

      {/* Upload Proof of Payment */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Proof of Payment</CardTitle>
          <CardDescription>
            If you've made a payment outside the portal, upload your receipt
            here
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Upload Payment Receipt</h3>
            <p className="text-muted-foreground mb-4">
              Drag and drop your receipt here, or click to browse
            </p>
            <Button>Choose File</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
