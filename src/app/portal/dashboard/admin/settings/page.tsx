/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import type React from "react";
import { useEffect, useRef, useState } from "react";
import { User, Bell, Shield, Mail, Phone, Camera, Save } from "lucide-react";
import { supabaseClient } from "@/lib/supabase/client";
import { toast } from "@/components/toast"; 

const Card = ({ children, className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`bg-white rounded-lg shadow ${className}`} {...props}>{children}</div>
);
const CardHeader = ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className="border-b px-6 py-4" {...props}>{children}</div>
);
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
const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input className="border rounded px-3 py-2 w-full" {...props} />
);
const Label = ({ children, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) => (
  <label className="block font-medium mb-1" {...props}>{children}</label>
);
const Switch = ({ checked, onChange }: { checked: boolean; onChange: (c: boolean) => void }) => (
  <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="accent-blue-600 h-4 w-8 rounded border-gray-300" />
);
const Separator = () => <hr className="my-4 border-gray-200" />;

const FALLBACK = "/placeholder.svg?height=100&width=100";

export default function SettingsPage() {
  const supabase = supabaseClient();
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    avatar: FALLBACK,
    avatarStoragePath: "",
  });
  const [notifications, setNotifications] = useState({
    email: true,
    whatsapp: false,
    applicationUpdates: true,
    paymentReminders: true,
    accommodationUpdates: true,
    generalAnnouncements: false,
  });
  const [security, setSecurity] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  async function resolveAvatarUrl(raw: string | null | undefined): Promise<{ url: string; storagePath: string }> {
    try {
      if (!raw) return { url: FALLBACK, storagePath: "" };
      if (/^https?:\/\//i.test(raw)) return { url: raw, storagePath: raw };

      const parts = String(raw).split("/");
      let bucket = "avatars";
      let path = raw;
      if (parts.length > 1 && (parts[0] === "avatars" || parts[0] === "documents")) {
        bucket = parts[0];
        path = parts.slice(1).join("/");
      }

      if (bucket === "avatars") {
        const { data } = supabase.storage.from(bucket).getPublicUrl(path);
        return { url: data?.publicUrl || FALLBACK, storagePath: `${bucket}/${path}` };
      } else {
        const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, 60 * 60);
        if (error) return { url: FALLBACK, storagePath: `${bucket}/${path}` };
        return { url: data?.signedUrl || FALLBACK, storagePath: `${bucket}/${path}` };
      }
    } catch {
      return { url: FALLBACK, storagePath: "" };
    }
  }

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/profile", { cache: "no-store" });
        if (!res.ok) return;
        const { profile: p } = await res.json();
        const resolved = await resolveAvatarUrl(p?.avatar_url || "");

        setProfile((prev) => ({
          ...prev,
          firstName: p?.first_name || "",
          lastName: p?.last_name || "",
          email: p?.email || "",
          phone: p?.phone || "",
          avatar: resolved.url,
          avatarStoragePath: resolved.storagePath,
        }));

        setNotifications({
          email: !!p?.notify_email,
          whatsapp: !!p?.notify_whatsapp,
          applicationUpdates: !!p?.notify_application_updates,
          paymentReminders: !!p?.notify_payment_reminders,
          accommodationUpdates: !!p?.notify_accommodation_updates,
          generalAnnouncements: !!p?.notify_announcements,
        });
      } catch {
        // silent
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleProfileUpdate(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: profile.firstName,
          last_name: profile.lastName,
          email: profile.email,
          phone: profile.phone,
          avatar_url: profile.avatarStoragePath || null,
          notify_email: notifications.email,
          notify_whatsapp: notifications.whatsapp,
          notify_application_updates: notifications.applicationUpdates,
          notify_payment_reminders: notifications.paymentReminders,
          notify_accommodation_updates: notifications.accommodationUpdates,
          notify_announcements: notifications.generalAnnouncements,
        }),
      });

      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error || "Failed to update profile");
      }
      toast.success("Profile updated");
    } catch (err: any) {
      toast.error(err?.message || "Failed to update profile");
    }
  }

  function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    if (security.newPassword !== security.confirmPassword) {
      toast.warning("New password and confirmation don't match");
      return;
    }
    setSecurity({ currentPassword: "", newPassword: "", confirmPassword: "" });
    toast.info("Password changed (UI only)");
  }

  function handleNotificationUpdate() {
    // reuse the same PUT via the form handler
    handleProfileUpdate(new Event("submit") as any);
    toast.success("Notification preferences saved");
  }

  function triggerChooseFile() {
    fileInputRef.current?.click();
  }

  async function onAvatarSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.warning("Please select an image file");
      e.target.value = "";
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.warning("Max image size is 2MB");
      e.target.value = "";
      return;
    }

    try {
      const { data: userRes } = await supabase.auth.getUser();
      const user = userRes.user;
      if (!user) {
        toast.error("Please sign in again");
        e.target.value = "";
        return;
      }

      const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
      const relative = `${user.id}/avatar-${Date.now()}.${ext}`;
      const bucket = "avatars";

      const up = await supabase.storage.from(bucket).upload(relative, file, { upsert: true });
      if (up.error) throw up.error;

      const storagePath = `${bucket}/${relative}`;
      const save = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatar_url: storagePath }),
      });
      if (!save.ok) {
        const json = await save.json().catch(() => ({}));
        throw new Error(json?.error || "Failed to save avatar path");
      }

      const { data } = supabase.storage.from(bucket).getPublicUrl(relative);
      const publicUrl = data?.publicUrl;

      setProfile((p) => ({
        ...p,
        avatar: publicUrl || p.avatar,
        avatarStoragePath: storagePath,
      }));

      toast.success("Photo updated");
    } catch (err: any) {
      toast.error(err?.message || "Failed to upload photo");
    } finally {
      e.target.value = "";
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Information
          </CardTitle>
          <CardDescription>Update your personal information and profile picture</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileUpdate} className="space-y-6">
            <div className="flex items-center gap-4">
              <img
                src={profile.avatar}
                alt="Profile"
                width={80}
                height={80}
                className="rounded-full object-cover w-20 h-20 border"
                onError={(e) => ((e.currentTarget.src = FALLBACK))}
              />

              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={onAvatarSelected}
                />
                <Button
                  type="button"
                  className="px-3 py-1 bg-white text-[#6B0F10] border border-gray-300"
                  onClick={triggerChooseFile}
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
                  onChange={(e) => setProfile((p) => ({ ...p, firstName: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={profile.lastName}
                  onChange={(e) => setProfile((p) => ({ ...p, lastName: e.target.value }))}
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
                  onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={profile.phone}
                  onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Preferences
          </CardTitle>
          <CardDescription>Choose how you want to receive notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4 mx-6 my-2">
            <h3 className="font-medium">Notification Channels</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4" />
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-muted-foreground">Receive updates via email</p>
                  </div>
                </div>
                <Switch
                  checked={notifications.email}
                  onChange={(c) => setNotifications((n) => ({ ...n, email: c }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4" />
                  <div>
                    <p className="font-medium">WhatsApp Notifications</p>
                    <p className="text-sm text-muted-foreground">Receive updates via WhatsApp</p>
                  </div>
                </div>
                <Switch
                  checked={notifications.whatsapp}
                  onChange={(c) => setNotifications((n) => ({ ...n, whatsapp: c }))}
                />
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4 mx-6 my-2">
            <h3 className="font-medium">Notification Types</h3>
            {[
              ["applicationUpdates", "Application Updates", "Status changes and document requests"],
              ["paymentReminders", "Payment Reminders", "Due dates and payment confirmations"],
              ["accommodationUpdates", "Accommodation Updates", "Matching results and housing information"],
              ["generalAnnouncements", "General Announcements", "News and general updates"],
            ].map(([key, title, desc]) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{title}</p>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                </div>
                <Switch
                  checked={(notifications as any)[key]}
                  onChange={(c) => setNotifications((n) => ({ ...n, [key]: c } as any))}
                />
              </div>
            ))}
          </div>

          <Button className="my-4 mx-2" onClick={handleNotificationUpdate}>
            Save Notification Preferences
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Settings
          </CardTitle>
          <CardDescription>Update your password and security preferences</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={security.currentPassword}
                onChange={(e) => setSecurity((s) => ({ ...s, currentPassword: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={security.newPassword}
                onChange={(e) => setSecurity((s) => ({ ...s, newPassword: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={security.confirmPassword}
                onChange={(e) => setSecurity((s) => ({ ...s, confirmPassword: e.target.value }))}
              />
            </div>
            <Button type="submit">Change Password</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
