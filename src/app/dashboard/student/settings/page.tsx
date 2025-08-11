"use client";

import type React from "react";

import { useState } from "react";
// Local UI shims
import type {
  ReactNode,
  HTMLAttributes,
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  LabelHTMLAttributes,
} from "react";
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
const Input = (props: InputHTMLAttributes<HTMLInputElement>) => (
  <input className="border rounded px-3 py-2 w-full" {...props} />
);
const Label = ({
  children,
  ...props
}: { children: ReactNode } & LabelHTMLAttributes<HTMLLabelElement>) => (
  <label className="block font-medium mb-1" {...props}>
    {children}
  </label>
);
const Switch = ({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
}) => (
  <input
    type="checkbox"
    checked={checked}
    onChange={(e) => onChange(e.target.checked)}
    className="accent-blue-600 h-4 w-8 rounded border-gray-300"
  />
);
const Separator = () => <hr className="my-4 border-gray-200" />;
const Avatar = ({ src, alt }: { src: string; alt?: string }) => (
  <img
    src={src}
    alt={alt || "avatar"}
    className="rounded-full w-20 h-20 object-cover"
  />
);
const AvatarFallback = ({ children }: { children: ReactNode }) => (
  <div className="rounded-full w-20 h-20 bg-gray-200 flex items-center justify-center text-xl">
    {children}
  </div>
);
const AvatarImage = ({ src, alt }: { src: string; alt?: string }) => (
  <img
    src={src}
    alt={alt || "avatar"}
    className="rounded-full w-20 h-20 object-cover"
  />
);
import { User, Bell, Shield, Mail, Phone, Camera, Save } from "lucide-react";
// Toast shim (no-op)
const toast = ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => {
  // You can implement a real toast here if needed
  alert(`${title}\n${description}`);
};

export default function SettingsPage() {
  // const { toast } = useToast();
  const [profile, setProfile] = useState({
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@email.com",
    phone: "+1234567890",
    avatar: "/placeholder.svg?height=100&width=100",
  });

  const [notifications, setNotifications] = useState({
    email: true,
    whatsapp: false,
    applicationUpdates: true,
    paymentReminders: true,
    accommodationUpdates: true,
    generalAnnouncements: false,
  });

  const [security, setSecurity] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Profile updated",
      description: "Your profile information has been saved successfully.",
    });
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (security.newPassword !== security.confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "New password and confirmation don't match.",
        // variant: "destructive", // Not supported in toast shim
      });
      return;
    }
    toast({
      title: "Password changed",
      description: "Your password has been updated successfully.",
    });
    setSecurity({ currentPassword: "", newPassword: "", confirmPassword: "" });
  };

  const handleNotificationUpdate = () => {
    toast({
      title: "Notification preferences saved",
      description: "Your notification settings have been updated.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Information
          </CardTitle>
          <CardDescription>
            Update your personal information and profile picture
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileUpdate} className="space-y-6">
            {/* Avatar */}
            <div className="flex items-center gap-4">
              <Avatar
                src={profile.avatar || "/placeholder.svg"}
                alt="Profile"
              />
              <div>
                <Button
                  type="button"
                  className="px-3 py-1 bg-white text-[#6B0F10] border border-gray-300"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Change Photo
                </Button>
                <p className="text-sm text-muted-foreground mt-1">
                  JPG, PNG or GIF. Max size 2MB.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={profile.firstName}
                  onChange={(e) =>
                    setProfile((prev) => ({
                      ...prev,
                      firstName: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={profile.lastName}
                  onChange={(e) =>
                    setProfile((prev) => ({
                      ...prev,
                      lastName: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  onChange={(e) =>
                    setProfile((prev) => ({ ...prev, email: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={profile.phone}
                  onChange={(e) =>
                    setProfile((prev) => ({ ...prev, phone: e.target.value }))
                  }
                />
              </div>
            </div>

            <Button type="submit">
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Preferences
          </CardTitle>
          <CardDescription>
            Choose how you want to receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Notification Channels */}
          <div className="space-y-4">
            <h3 className="font-medium">Notification Channels</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4" />
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-muted-foreground">
                      Receive updates via email
                    </p>
                  </div>
                </div>
                <Switch
                  checked={notifications.email}
                  onChange={(checked: boolean) =>
                    setNotifications((prev) => ({ ...prev, email: checked }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4" />
                  <div>
                    <p className="font-medium">WhatsApp Notifications</p>
                    <p className="text-sm text-muted-foreground">
                      Receive updates via WhatsApp
                    </p>
                  </div>
                </div>
                <Switch
                  checked={notifications.whatsapp}
                  onChange={(checked: boolean) =>
                    setNotifications((prev) => ({ ...prev, whatsapp: checked }))
                  }
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Notification Types */}
          <div className="space-y-4">
            <h3 className="font-medium">Notification Types</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Application Updates</p>
                  <p className="text-sm text-muted-foreground">
                    Status changes and document requests
                  </p>
                </div>
                <Switch
                  checked={notifications.applicationUpdates}
                  onChange={(checked: boolean) =>
                    setNotifications((prev) => ({
                      ...prev,
                      applicationUpdates: checked,
                    }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Payment Reminders</p>
                  <p className="text-sm text-muted-foreground">
                    Due dates and payment confirmations
                  </p>
                </div>
                <Switch
                  checked={notifications.paymentReminders}
                  onChange={(checked: boolean) =>
                    setNotifications((prev) => ({
                      ...prev,
                      paymentReminders: checked,
                    }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Accommodation Updates</p>
                  <p className="text-sm text-muted-foreground">
                    Matching results and housing information
                  </p>
                </div>
                <Switch
                  checked={notifications.accommodationUpdates}
                  onChange={(checked: boolean) =>
                    setNotifications((prev) => ({
                      ...prev,
                      accommodationUpdates: checked,
                    }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">General Announcements</p>
                  <p className="text-sm text-muted-foreground">
                    News and general updates
                  </p>
                </div>
                <Switch
                  checked={notifications.generalAnnouncements}
                  onChange={(checked: boolean) =>
                    setNotifications((prev) => ({
                      ...prev,
                      generalAnnouncements: checked,
                    }))
                  }
                />
              </div>
            </div>
          </div>

          <Button onClick={handleNotificationUpdate}>
            Save Notification Preferences
          </Button>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Settings
          </CardTitle>
          <CardDescription>
            Update your password and security preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={security.currentPassword}
                onChange={(e) =>
                  setSecurity((prev) => ({
                    ...prev,
                    currentPassword: e.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={security.newPassword}
                onChange={(e) =>
                  setSecurity((prev) => ({
                    ...prev,
                    newPassword: e.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={security.confirmPassword}
                onChange={(e) =>
                  setSecurity((prev) => ({
                    ...prev,
                    confirmPassword: e.target.value,
                  }))
                }
              />
            </div>
            <Button type="submit">Change Password</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
