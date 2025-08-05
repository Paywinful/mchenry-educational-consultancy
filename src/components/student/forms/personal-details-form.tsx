"use client";

import type React from "react";
import { useState, useCallback } from "react";
import { CalendarIcon } from "lucide-react";

// UI shims for demo: Replace with your own UI library if needed
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
const Textarea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea className="border rounded px-3 py-2 w-full" {...props} />
);
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

interface PersonalDetailsFormProps {
  onNext: () => void;
}

export function PersonalDetailsForm({ onNext }: PersonalDetailsFormProps) {
  const [formData, setFormData] = useState({
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@email.com",
    phone: "+1234567890",
    nationality: "US",
    address: "123 Main St, City, State 12345",
    emergencyContact: "Jane Doe - +1234567891",
  });

  const [dateOfBirth, setDateOfBirth] = useState<string>("1995-06-15");

  const handleInputChange = useCallback((field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      // Save form data
      console.log("Personal details saved:", { ...formData, dateOfBirth });
      onNext();
    },
    [formData, dateOfBirth, onNext]
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal Details</CardTitle>
        <CardDescription>
          Please provide your basic personal information
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleInputChange("firstName", e.target.value)
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleInputChange("lastName", e.target.value)
                }
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleInputChange("email", e.target.value)
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleInputChange("phone", e.target.value)
                }
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date of Birth *</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setDateOfBirth(e.target.value)
                  }
                  required
                />
                <CalendarIcon className="h-5 w-5 text-gray-400" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="nationality">Nationality *</Label>
              <Select
                value={formData.nationality}
                onValueChange={(value) =>
                  handleInputChange("nationality", value)
                }
              >
                <SelectValue placeholder="Select nationality" />
                <SelectItem value="US">United States</SelectItem>
                <SelectItem value="CA">Canada</SelectItem>
                <SelectItem value="UK">United Kingdom</SelectItem>
                <SelectItem value="AU">Australia</SelectItem>
                <SelectItem value="DE">Germany</SelectItem>
                <SelectItem value="FR">France</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Current Address *</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                handleInputChange("address", e.target.value)
              }
              placeholder="Enter your full address"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="emergencyContact">Emergency Contact *</Label>
            <Input
              id="emergencyContact"
              value={formData.emergencyContact}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleInputChange("emergencyContact", e.target.value)
              }
              placeholder="Name and phone number"
              required
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit">Next: Academic Background</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
